#!/usr/bin/env python3
"""
Seed the four Koupreng private demo accounts into the local MySQL database
and verify their authentication and entitlement resolution across both
backend (port 8080) and frontend proxy (port 5173).

Accounts:
1. FREE:
   Name: Free Demo
   Email: free.demo@koupreng.test
   Password: Kp!n-G20xr0z7k-kczHcjD_CXqqVn5sQHhwLHmqNP8rR60
   Role: USER
   Effective subscription: FREE
   Source: CONFIGURED_FREE_PACKAGE
   Expires: No Free-plan expiry

2. BASIC:
   Name: Daly
   Email: kuydaly123@gmail.com
   Password: Kp!QQnC4SiBflhq-S803V2KbN4oTtmxWeterV9GEPpviFw
   Role: USER
   Effective subscription: BASIC
   Source: DEMO_ADMIN_GRANT
   Expires: 2027-10-24T01:34:49.677854Z

3. PRO:
   Name: Long
   Phone: 012345678
   Password: Kp!L4nn5IenKn0Thpd8SuI3JolVZTJOcJM5hCr25P5wqIc
   Role: USER
   Effective subscription: PRO
   Source: DEMO_ADMIN_GRANT
   Expires: 2027-10-24T01:34:49.955022Z

4. PREMIUM:
   Name: Vireak
   Phone: 060400652
   Password: Kp!B3BD9SPjaVFS7hnwLf1VZ3D5g6_BmNMUWjUeh9vtgFQ
   Role: USER
   Effective subscription: PREMIUM
   Source: DEMO_ADMIN_GRANT
   Expires: 2027-10-24T01:34:50.221025Z
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
import urllib.request

ROOT = Path(__file__).resolve().parents[2]


def parse_env_file(env_file: Path) -> dict[str, str]:
    if not env_file.is_file():
        raise FileNotFoundError(f"Configuration file not found: {env_file}")
    values = {}
    for line in env_file.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, val = line.split("=", 1)
            values[key.strip()] = val.strip().strip('"').strip("'")
    return values


def verify_local_database(values: dict[str, str]) -> tuple[dict[str, str], str, int, str]:
    db_url = values.get("DB_URL", "")
    target = urlparse(db_url.removeprefix("jdbc:"))
    if target.scheme != "mysql" or target.hostname not in ("localhost", "127.0.0.1", "::1"):
        raise ValueError(
            f"Safety check failed: Seed script only accepts a local MySQL database. Target: {target.hostname}"
        )
    database = target.path.lstrip("/")
    if not re.fullmatch(r"[A-Za-z0-9_]+", database) or database in ("mysql", "sys", "information_schema", "performance_schema"):
        raise ValueError(f"Invalid development database name: {database}")
    port = target.port or 3306
    return values, target.hostname, port, database


class MysqlRunner:
    def __init__(self, executable: Path, username: str, password: str, host: str, port: int, database: str):
        self.command = [
            str(executable),
            "--no-defaults",
            "--protocol=tcp",
            "--default-character-set=utf8mb4",
            f"--host={host}",
            f"--port={port}",
            f"--user={username}",
            f"--database={database}",
            "--batch",
            "--raw",
            "--skip-column-names",
        ]
        self.env = {**os.environ, "MYSQL_PWD": password}

    def query(self, sql: str) -> str:
        res = subprocess.run(
            self.command,
            input=sql,
            env=self.env,
            text=True,
            encoding="utf-8",
            capture_output=True,
            timeout=60,
        )
        if res.returncode != 0:
            raise RuntimeError(f"MySQL query error: {res.stderr.strip()}\nSQL was:\n{sql[:500]}")
        return res.stdout.strip()


DEMO_ACCOUNTS = [
    {
        "tier": "FREE",
        "name": "Free Demo",
        "email": "free.demo@koupreng.test",
        "phone": None,
        "identifier": "free.demo@koupreng.test",
        "password": "Kp!n-G20xr0z7k-kczHcjD_CXqqVn5sQHhwLHmqNP8rR60",
        "password_hash": "$2a$10$wxNSmwjWRcBCFHwexcEUf.Y7CBQ5pQBmr6EJnXO4T.5SwhFDegfyq",
        "role": "USER",
        "expected_package": "FREE",
        "expected_source": "CONFIGURED_FREE_PACKAGE",
        "expected_expiry": None,
    },
    {
        "tier": "BASIC",
        "name": "Daly",
        "email": "kuydaly123@gmail.com",
        "phone": None,
        "identifier": "kuydaly123@gmail.com",
        "password": "Kp!QQnC4SiBflhq-S803V2KbN4oTtmxWeterV9GEPpviFw",
        "password_hash": "$2a$10$rD9hHEDuF3mZ.ZLwXuKNGOWBqGk4lDs9qsu4obtgqDX86OcyPvrpy",
        "role": "USER",
        "package_code": "BASIC",
        "order_code": "PHASE6-DEMO-BASIC",
        "start_date": "2026-10-24 01:34:49.677854",
        "end_date": "2027-10-24 01:34:49.677854",
        "expected_package": "BASIC",
        "expected_source": "DEMO_ADMIN_GRANT",
        "expected_expiry": "2027-10-24T01:34:49.677854Z",
    },
    {
        "tier": "PRO",
        "name": "Long",
        "email": None,
        "phone": "012345678",
        "identifier": "012345678",
        "password": "Kp!L4nn5IenKn0Thpd8SuI3JolVZTJOcJM5hCr25P5wqIc",
        "password_hash": "$2a$10$uUt9zOA99tmfYLwDC03zMei8VOtxd9E6hADX0Yam8Is6CKkUlSkKq",
        "role": "USER",
        "package_code": "PRO",
        "order_code": "PHASE6-DEMO-PRO",
        "start_date": "2026-10-24 01:34:49.955022",
        "end_date": "2027-10-24 01:34:49.955022",
        "expected_package": "PRO",
        "expected_source": "DEMO_ADMIN_GRANT",
        "expected_expiry": "2027-10-24T01:34:49.955022Z",
    },
    {
        "tier": "PREMIUM",
        "name": "Vireak",
        "email": None,
        "phone": "060400652",
        "identifier": "060400652",
        "password": "Kp!B3BD9SPjaVFS7hnwLf1VZ3D5g6_BmNMUWjUeh9vtgFQ",
        "password_hash": "$2a$10$sgBQE0P.Mov8uEXOeMm5TuwzgK0sFFpvex17ozYMpelRdvxACk9yy",
        "role": "USER",
        "package_code": "PREMIUM",
        "order_code": "PHASE6-DEMO-PREMIUM",
        "start_date": "2026-10-24 01:34:50.221025",
        "end_date": "2027-10-24 01:34:50.221025",
        "expected_package": "PREMIUM",
        "expected_source": "DEMO_ADMIN_GRANT",
        "expected_expiry": "2027-10-24T01:34:50.221025Z",
    },
]


def sql_literal_json(obj: dict) -> str:
    raw = json.dumps(obj)
    escaped = raw.replace("\\", "\\\\").replace("'", "''")
    return f"'{escaped}'"


BASIC_SNAPSHOT = sql_literal_json({
    "id": 1,
    "revision": 0,
    "code": "BASIC",
    "packageName": "Basic",
    "description": "Starter plan for small invitations.",
    "price": 0.01,
    "currency": "USD",
    "billingInterval": "YEARLY",
    "durationDays": 365,
    "maxInvitations": 1,
    "maxGuests": 3,
    "maxGuestsPerInvitation": 3,
    "maxTeamMembers": 1,
    "featuresJson": json.dumps({"guestImport": True, "qrInvitations": True}),
    "premiumTemplatesEnabled": False,
    "qrInvitationsEnabled": True,
    "qrCheckInEnabled": False,
    "seatingEnabled": False,
    "advancedAnalyticsEnabled": False,
    "customBrandingEnabled": False,
    "teamMembersEnabled": False,
    "aiAssistantEnabled": False,
    "active": True,
    "publicVisible": True,
    "status": "ACTIVE",
    "sortOrder": 10,
})

PRO_SNAPSHOT = sql_literal_json({
    "id": 2,
    "revision": 0,
    "code": "PRO",
    "packageName": "Pro",
    "description": "Premium invitation operations for hosts.",
    "price": 199.00,
    "currency": "USD",
    "billingInterval": "YEARLY",
    "durationDays": 365,
    "maxInvitations": 20,
    "maxGuests": 2000,
    "maxGuestsPerInvitation": 500,
    "maxTeamMembers": 5,
    "featuresJson": json.dumps({"seating": True, "analytics": True, "qrCheckIn": True, "premiumTemplates": True}),
    "premiumTemplatesEnabled": True,
    "qrInvitationsEnabled": True,
    "qrCheckInEnabled": True,
    "seatingEnabled": True,
    "advancedAnalyticsEnabled": True,
    "customBrandingEnabled": True,
    "teamMembersEnabled": True,
    "aiAssistantEnabled": True,
    "active": True,
    "publicVisible": True,
    "status": "ACTIVE",
    "sortOrder": 20,
})

PREMIUM_SNAPSHOT = sql_literal_json({
    "id": 3,
    "revision": 0,
    "code": "PREMIUM",
    "packageName": "Premium",
    "description": "Team foundation for planners and venues.",
    "price": 499.00,
    "currency": "USD",
    "billingInterval": "CUSTOM",
    "durationDays": 365,
    "maxInvitations": 999,
    "maxGuests": 99999,
    "maxGuestsPerInvitation": 5000,
    "maxTeamMembers": 25,
    "featuresJson": json.dumps({"teamMembers": True, "customBranding": True, "advancedAnalytics": True}),
    "premiumTemplatesEnabled": True,
    "qrInvitationsEnabled": True,
    "qrCheckInEnabled": True,
    "seatingEnabled": True,
    "advancedAnalyticsEnabled": True,
    "customBrandingEnabled": True,
    "teamMembersEnabled": True,
    "aiAssistantEnabled": True,
    "active": True,
    "publicVisible": True,
    "status": "ACTIVE",
    "sortOrder": 30,
})


def build_seed_sql() -> str:
    sql_lines = [
        "SET NAMES utf8mb4;",
        "SET SESSION time_zone = '+00:00';",
        "START TRANSACTION;",
    ]

    # 1. FREE Demo Account
    sql_lines.append("""
    INSERT INTO users (full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at, deleted, created_by, last_modified_by)
    VALUES ('Free Demo', 'free.demo@koupreng.test', NULL, '$2a$10$wxNSmwjWRcBCFHwexcEUf.Y7CBQ5pQBmr6EJnXO4T.5SwhFDegfyq', 'USER', 'ACTIVE', 0, NOW(6), NOW(6), 0, 'DEMO_SEED', 'DEMO_SEED')
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      email = VALUES(email),
      phone = VALUES(phone),
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      status = VALUES(status),
      updated_at = NOW(6);

    SET @user_free = (SELECT user_id FROM users WHERE email = 'free.demo@koupreng.test' LIMIT 1);
    UPDATE subscriptions SET is_active = 0, status = 'EXPIRED', updated_at = NOW(6) WHERE user_id = @user_free AND is_active = 1;
    """)

    # 2. BASIC Demo Account (Daly)
    sql_lines.append(f"""
    INSERT INTO users (full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at, deleted, created_by, last_modified_by)
    VALUES ('Daly', 'kuydaly123@gmail.com', NULL, '$2a$10$rD9hHEDuF3mZ.ZLwXuKNGOWBqGk4lDs9qsu4obtgqDX86OcyPvrpy', 'USER', 'ACTIVE', 0, NOW(6), NOW(6), 0, 'DEMO_SEED', 'DEMO_SEED')
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      email = VALUES(email),
      phone = VALUES(phone),
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      status = VALUES(status),
      updated_at = NOW(6);

    SET @user_basic = (SELECT user_id FROM users WHERE email = 'kuydaly123@gmail.com' LIMIT 1);
    SET @pkg_basic = (SELECT package_id FROM packages WHERE code = 'BASIC' LIMIT 1);
    UPDATE subscriptions SET is_active = 0, status = 'EXPIRED', updated_at = NOW(6)
    WHERE (user_id = @user_basic OR order_code = 'PHASE6-DEMO-BASIC') AND is_active = 1;

    SET @basic_snapshot = {BASIC_SNAPSHOT};

    INSERT INTO subscriptions (
      user_id, package_id, start_date, end_date, order_code,
      amount, paid_amount, currency, provider, payment_status,
      confirm_source, confirmed_by, confirmed_at, status, is_active,
      created_at, updated_at, benefits_snapshot
    ) VALUES (
      @user_basic, @pkg_basic, '2026-10-24 01:34:49.677854', '2027-10-24 01:34:49.677854', 'PHASE6-DEMO-BASIC',
      0.00, 0.00, 'USD', 'LOCAL_DEMO', 'NOT_REQUIRED',
      'DEMO_ADMIN_GRANT', 'DEMO_ADMIN_GRANT', '2026-10-24 01:34:49.677854', 'ACTIVE', 1,
      '2026-10-24 01:34:49.677854', NOW(6), @basic_snapshot
    ) ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      package_id = VALUES(package_id),
      start_date = VALUES(start_date),
      end_date = VALUES(end_date),
      amount = VALUES(amount),
      paid_amount = VALUES(paid_amount),
      currency = VALUES(currency),
      provider = VALUES(provider),
      payment_status = VALUES(payment_status),
      confirm_source = VALUES(confirm_source),
      confirmed_by = VALUES(confirmed_by),
      confirmed_at = VALUES(confirmed_at),
      status = VALUES(status),
      is_active = VALUES(is_active),
      updated_at = NOW(6),
      benefits_snapshot = VALUES(benefits_snapshot);
    """)

    # 3. PRO Demo Account (Long)
    sql_lines.append(f"""
    INSERT INTO users (full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at, deleted, created_by, last_modified_by)
    VALUES ('Long', NULL, '012345678', '$2a$10$uUt9zOA99tmfYLwDC03zMei8VOtxd9E6hADX0Yam8Is6CKkUlSkKq', 'USER', 'ACTIVE', 0, NOW(6), NOW(6), 0, 'DEMO_SEED', 'DEMO_SEED')
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      email = VALUES(email),
      phone = VALUES(phone),
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      status = VALUES(status),
      updated_at = NOW(6);

    SET @user_pro = (SELECT user_id FROM users WHERE phone = '012345678' LIMIT 1);
    SET @pkg_pro = (SELECT package_id FROM packages WHERE code = 'PRO' LIMIT 1);
    UPDATE subscriptions SET is_active = 0, status = 'EXPIRED', updated_at = NOW(6)
    WHERE (user_id = @user_pro OR order_code = 'PHASE6-DEMO-PRO') AND is_active = 1;

    SET @pro_snapshot = {PRO_SNAPSHOT};

    INSERT INTO subscriptions (
      user_id, package_id, start_date, end_date, order_code,
      amount, paid_amount, currency, provider, payment_status,
      confirm_source, confirmed_by, confirmed_at, status, is_active,
      created_at, updated_at, benefits_snapshot
    ) VALUES (
      @user_pro, @pkg_pro, '2026-10-24 01:34:49.955022', '2027-10-24 01:34:49.955022', 'PHASE6-DEMO-PRO',
      0.00, 0.00, 'USD', 'LOCAL_DEMO', 'NOT_REQUIRED',
      'DEMO_ADMIN_GRANT', 'DEMO_ADMIN_GRANT', '2026-10-24 01:34:49.955022', 'ACTIVE', 1,
      '2026-10-24 01:34:49.955022', NOW(6), @pro_snapshot
    ) ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      package_id = VALUES(package_id),
      start_date = VALUES(start_date),
      end_date = VALUES(end_date),
      amount = VALUES(amount),
      paid_amount = VALUES(paid_amount),
      currency = VALUES(currency),
      provider = VALUES(provider),
      payment_status = VALUES(payment_status),
      confirm_source = VALUES(confirm_source),
      confirmed_by = VALUES(confirmed_by),
      confirmed_at = VALUES(confirmed_at),
      status = VALUES(status),
      is_active = VALUES(is_active),
      updated_at = NOW(6),
      benefits_snapshot = VALUES(benefits_snapshot);
    """)

    # 4. PREMIUM Demo Account (Vireak)
    sql_lines.append(f"""
    INSERT INTO users (full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at, deleted, created_by, last_modified_by)
    VALUES ('Vireak', NULL, '060400652', '$2a$10$sgBQE0P.Mov8uEXOeMm5TuwzgK0sFFpvex17ozYMpelRdvxACk9yy', 'USER', 'ACTIVE', 0, NOW(6), NOW(6), 0, 'DEMO_SEED', 'DEMO_SEED')
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      email = VALUES(email),
      phone = VALUES(phone),
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      status = VALUES(status),
      updated_at = NOW(6);

    SET @user_premium = (SELECT user_id FROM users WHERE phone = '060400652' LIMIT 1);
    SET @pkg_premium = (SELECT package_id FROM packages WHERE code = 'PREMIUM' LIMIT 1);
    UPDATE subscriptions SET is_active = 0, status = 'EXPIRED', updated_at = NOW(6)
    WHERE (user_id = @user_premium OR order_code = 'PHASE6-DEMO-PREMIUM') AND is_active = 1;

    SET @premium_snapshot = {PREMIUM_SNAPSHOT};

    INSERT INTO subscriptions (
      user_id, package_id, start_date, end_date, order_code,
      amount, paid_amount, currency, provider, payment_status,
      confirm_source, confirmed_by, confirmed_at, status, is_active,
      created_at, updated_at, benefits_snapshot
    ) VALUES (
      @user_premium, @pkg_premium, '2026-10-24 01:34:50.221025', '2027-10-24 01:34:50.221025', 'PHASE6-DEMO-PREMIUM',
      0.00, 0.00, 'USD', 'LOCAL_DEMO', 'NOT_REQUIRED',
      'DEMO_ADMIN_GRANT', 'DEMO_ADMIN_GRANT', '2026-10-24 01:34:50.221025', 'ACTIVE', 1,
      '2026-10-24 01:34:50.221025', NOW(6), @premium_snapshot
    ) ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      package_id = VALUES(package_id),
      start_date = VALUES(start_date),
      end_date = VALUES(end_date),
      amount = VALUES(amount),
      paid_amount = VALUES(paid_amount),
      currency = VALUES(currency),
      provider = VALUES(provider),
      payment_status = VALUES(payment_status),
      confirm_source = VALUES(confirm_source),
      confirmed_by = VALUES(confirmed_by),
      confirmed_at = VALUES(confirmed_at),
      status = VALUES(status),
      is_active = VALUES(is_active),
      updated_at = NOW(6),
      benefits_snapshot = VALUES(benefits_snapshot);
    """)

    sql_lines.append("COMMIT;")
    return "\n".join(sql_lines)


def is_url_reachable(url: str, timeout: float = 2.0) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Koupreng-HealthCheck"}, method="GET")
        with urllib.request.urlopen(req, timeout=timeout):
            return True
    except (HTTPError, URLError):
        return True
    except Exception:
        return False


def verify_target(base_url: str) -> list[dict]:
    results = []
    print(f"\n[*] Testing authentication & entitlements on: {base_url}")

    for account in DEMO_ACCOUNTS:
        tier = account["tier"]
        identifier = account["identifier"]
        password = account["password"]
        print(f"\n--- Testing {tier} account ({identifier}) on {base_url} ---")

        # 1. Login (/api/auth/login with fallback to /api/v1/auth/login)
        login_url = f"{base_url}/api/auth/login"
        payload = json.dumps({"identifier": identifier, "password": password}).encode("utf-8")
        req = urllib.request.Request(
            login_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        token = None
        user = {}
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                token = data.get("accessToken")
                user = data.get("user", {})
                print(f"  [+] Login SUCCESS: user_id={user.get('id')}, full_name='{user.get('fullName')}', role={user.get('role')}")
        except HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"  [-] Login FAILED: HTTP {e.code}: {err_body}")
            results.append({"url": base_url, "tier": tier, "identifier": identifier, "status": "LOGIN_FAILED", "error": err_body})
            continue

        # 2. User Info (/api/auth/me)
        me_url = f"{base_url}/api/auth/me"
        me_req = urllib.request.Request(
            me_url,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="GET",
        )
        try:
            with urllib.request.urlopen(me_req, timeout=10) as resp:
                me_data = json.loads(resp.read().decode("utf-8"))
                assert me_data.get("role") == account["role"], f"Expected role {account['role']}, got {me_data.get('role')}"
                assert me_data.get("fullName") == account["name"], f"Expected name {account['name']}, got {me_data.get('fullName')}"
                print(f"  [+] Profile /auth/me verified: {me_data.get('fullName')} (role={me_data.get('role')})")
        except Exception as e:
            print(f"  [-] /auth/me verification FAILED: {e}")
            results.append({"url": base_url, "tier": tier, "identifier": identifier, "status": "PROFILE_FAILED", "error": str(e)})
            continue

        # 3. Entitlements (/api/v1/me/entitlements)
        ent_url = f"{base_url}/api/v1/me/entitlements"
        ent_req = urllib.request.Request(
            ent_url,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="GET",
        )

        try:
            with urllib.request.urlopen(ent_req, timeout=10) as resp:
                ent_data = json.loads(resp.read().decode("utf-8")).get("data", {})
                pkg_code = ent_data.get("packagePlan", {}).get("code")
                source = ent_data.get("source")
                expires_at = ent_data.get("expiresAt")
                features = ent_data.get("features", [])

                print(f"  [+] Entitlements: package={pkg_code}, source={source}, expiresAt={expires_at}")
                print(f"      Features: {', '.join(features)}")

                # Check expectations
                assert pkg_code == account["expected_package"], f"Expected package {account['expected_package']}, got {pkg_code}"
                assert source == account["expected_source"], f"Expected source {account['expected_source']}, got {source}"
                if account["expected_expiry"] is not None:
                    assert expires_at == account["expected_expiry"], f"Expected expiry {account['expected_expiry']}, got {expires_at}"
                else:
                    assert expires_at is None, f"Expected expiry None, got {expires_at}"

                results.append({
                    "url": base_url,
                    "tier": tier,
                    "name": account["name"],
                    "identifier": identifier,
                    "userId": user.get("id"),
                    "role": user.get("role"),
                    "package": pkg_code,
                    "source": source,
                    "expiresAt": expires_at,
                    "status": "PASS",
                })
        except Exception as e:
            print(f"  [-] Entitlements verification FAILED: {e}")
            results.append({"url": base_url, "tier": tier, "identifier": identifier, "status": "ENTITLEMENTS_FAILED", "error": str(e)})

    return results


def verify_all_urls(target_urls: list[str]) -> list[dict]:
    all_results = []
    for url in target_urls:
        if not is_url_reachable(url):
            print(f"[-] WARNING: Target {url} is not responding. Skipping.")
            all_results.append({"url": url, "status": "UNREACHABLE"})
            continue
        res = verify_target(url)
        all_results.extend(res)
    return all_results


def run_browser_verification() -> bool:
    script_path = ROOT / "scripts" / "qa" / "test_demo_account_browser_login.mjs"
    if not script_path.is_file():
        print(f"[-] Playwright test script not found at {script_path}")
        return False
    print(f"\n[*] Executing Playwright browser UI verification via {script_path.name}...")
    res = subprocess.run(["node", str(script_path)], cwd=str(ROOT))
    return res.returncode == 0


def main():
    parser = argparse.ArgumentParser(description="Seed the 4 private demo accounts into local database and verify ports 8080 & 5173")
    parser.add_argument("--env-file", type=Path, default=ROOT / ".env", help="Path to .env")
    parser.add_argument("--mysql", type=Path, help="Explicit path to mysql binary")
    parser.add_argument("--dry-run", action="store_true", help="Print SQL without executing")
    parser.add_argument("--verify-only", action="store_true", help="Only run API verification")
    parser.add_argument("--ports", type=str, default="8080,5173", help="Comma-separated ports to verify (default: 8080,5173)")
    parser.add_argument("--urls", type=str, help="Explicit comma-separated base URLs to verify")
    parser.add_argument("--browser", action="store_true", help="Execute Playwright browser UI test on port 5173")
    args = parser.parse_args()

    if not args.verify_only:
        values = parse_env_file(args.env_file)
        values, host, port, database = verify_local_database(values)

        executable = args.mysql or shutil.which("mysql")
        if not executable and os.name == "nt":
            executable = Path(os.environ.get("ProgramFiles", "")) / "MySQL/MySQL Server 8.0/bin/mysql.exe"
        if not executable or not Path(executable).is_file():
            raise FileNotFoundError("MySQL client executable not found.")

        runner = MysqlRunner(executable, values["DB_USERNAME"], values.get("DB_PASSWORD", ""), host, port, database)
        sql = build_seed_sql()

        if args.dry_run:
            print(sql)
            return

        print(f"[*] Executing 4 demo accounts seeding transaction against {database}@{host}:{port}...")
        runner.query(sql)
        print("[+] Database seeding committed successfully.")

    # Determine target URLs
    if args.urls:
        target_urls = [u.strip() for u in args.urls.split(",") if u.strip()]
    else:
        ports = [p.strip() for p in args.ports.split(",") if p.strip()]
        target_urls = [f"http://localhost:{p}" for p in ports]

    # Run API verification across all specified ports
    results = verify_all_urls(target_urls)
    print("\n" + "=" * 60)
    print("DEMO ACCOUNTS VERIFICATION SUMMARY")
    print("=" * 60)
    print(json.dumps(results, indent=2))

    all_pass = bool(results) and all(r.get("status") == "PASS" for r in results)

    # Optional browser UI verification
    if args.browser:
        browser_pass = run_browser_verification()
        all_pass = all_pass and browser_pass

    if not all_pass:
        sys.exit(1)


if __name__ == "__main__":
    main()
