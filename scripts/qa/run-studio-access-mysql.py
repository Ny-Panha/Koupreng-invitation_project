"""Run real HTTP/JWT/JPA Studio security checks in a newly owned MySQL schema.

Reads local connection credentials without printing them. Never runs against the
application schema; CREATE must succeed before this harness owns a schema to DROP.
"""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
from urllib.parse import urlparse
import uuid
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", default=".env")
    parser.add_argument("--tests", default="Phase7CollaborationMySqlTests")
    parser.add_argument("--label", default="real-mysql-security")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9-]+", args.label):
        raise SystemExit("Use a safe report label")
    if not re.fullmatch(r"[A-Za-z0-9_,*]+", args.tests):
        raise SystemExit("Use test class names only")
    root = Path(__file__).resolve().parents[2]
    config = {}
    for line in (root / args.env_file).read_text(encoding="utf-8-sig").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            config[key.strip()] = value.strip().strip('"').strip("'")
    url = urlparse(config["DB_URL"].removeprefix("jdbc:"))
    if url.scheme != "mysql" or url.hostname not in {"localhost", "127.0.0.1"} or (url.port or 3306) != 3306:
        raise SystemExit("This harness requires the existing loopback MySQL server on 3306")
    client = shutil.which("mysql") or "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe"
    if not Path(client).is_file():
        raise SystemExit("MySQL client unavailable")
    schema = "koupreng_studio_" + uuid.uuid4().hex
    if not re.fullmatch(r"koupreng_studio_[a-f0-9]{32}", schema):
        raise SystemExit("Unsafe disposable schema name")
    env = os.environ.copy()
    env["MYSQL_PWD"] = config["DB_PASSWORD"]

    def sql(query):
        subprocess.run([client, "--host=127.0.0.1", "--port=3306", "--user=" + config["DB_USERNAME"], "--batch", "--execute", query],
                       env=env, check=True, capture_output=True)

    sql("CREATE DATABASE `" + schema + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cache = root / ".cache/next-studio-ux"
    cache.mkdir(parents=True, exist_ok=True)
    result_code = 1
    try:
        env.update(RUN_PHASE7_MYSQL="true", RUN_FLYWAY_INTEGRATION="true",
            FLYWAY_TEST_DB_URL=f"jdbc:mysql://127.0.0.1:3306/{schema}?useSSL=false&serverTimezone=Asia/Phnom_Penh&allowPublicKeyRetrieval=true",
            FLYWAY_TEST_DB_USERNAME=config["DB_USERNAME"], FLYWAY_TEST_DB_PASSWORD=config["DB_PASSWORD"],
            STUDIO_PACKAGE_CONFIG=str(root / "docs/next-studio-ux/evidence/baseline-product-policy.json"))
        env.setdefault("MAVEN_OPTS", "-Xmx1536m")
        wrapper = root / "apps/backend/mvnw.cmd"
        command = ["cmd", "/d", "/c", str(wrapper), "-Dtest=" + args.tests, "test"] if os.name == "nt" else [str(root / "apps/backend/mvnw"), "-Dtest=" + args.tests, "test"]
        started = time.time()
        with (cache / (args.label + ".log")).open("w", encoding="utf-8") as log:
            result_code = subprocess.run(command, cwd=root / "apps/backend", env=env, stdout=log, stderr=subprocess.STDOUT).returncode
        reports = []
        for name in args.tests.split(","):
            for file in (root / "apps/backend/target/surefire-reports").glob("TEST-*" + name + ".xml"):
                if file.stat().st_mtime < started:
                    continue  # A compilation failure must never reuse earlier Surefire evidence.
                suite = ET.parse(file).getroot()
                reports.append({key: suite.get(key) for key in ("name", "tests", "failures", "errors", "skipped", "time")})
        (cache / (args.label + ".json")).write_text(json.dumps({"exitCode": result_code, "database": schema, "reports": reports}, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"exitCode": result_code, "reports": reports}))
    finally:
        sql("DROP DATABASE `" + schema + "`")
        print("Owned disposable database removed")
    return result_code


if __name__ == "__main__":
    raise SystemExit(main())
