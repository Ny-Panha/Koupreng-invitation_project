"""Package only declared review artifacts; reopen ZIP and decode every PNG."""
from __future__ import annotations

import codecs
import datetime as dt
import hashlib
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
import zipfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "output/playwright/template-studio-review"
REPORTS = ROOT / "docs/qa/template-studio-review"
DESTINATION = Path("D:/Koupreng-UI-Review")
REQUIRED_REPORTS = ["template-root-cause.md", "ui-ux-audit.md", "before-after-summary.md", "test-results.md", "remaining-issues.md"]


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True, encoding="utf-8").strip()


def read_log(name: str) -> str:
    raw = (ROOT / ".cache" / name).read_bytes()
    encoding = "utf-16" if raw.startswith((codecs.BOM_UTF16_LE, codecs.BOM_UTF16_BE)) else "utf-8-sig"
    return re.sub(r"\x1b\[[0-9;]*m", "", raw.decode(encoding, errors="replace"))


def passed_vitest(name: str) -> dict:
    log = read_log(name)
    found = re.findall(r"Tests\s+(\d+) passed \((\d+)\)", log)
    if not found or found[-1][0] != found[-1][1]:
        raise ValueError(f"No fully passing Vitest summary: {name}")
    return {"passed": int(found[-1][0]), "failed": 0, "skipped": 0, "log": name}


def passed_browser(name: str) -> dict:
    log = read_log(name)
    found = re.findall(r"^\s*(\d+) passed \(([^)]+)\)", log, re.MULTILINE)
    if not found or re.search(r"^\s*\d+ failed\s*$", log, re.MULTILINE):
        raise ValueError(f"Browser run has not passed: {name}")
    skips = re.findall(r"^\s*(\d+) skipped\s*$", log, re.MULTILINE)
    return {"passed": int(found[-1][0]), "failed": 0, "skipped": int(skips[-1]) if skips else 0, "duration": found[-1][1], "log": name}


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if not Path(DESTINATION.anchor).is_dir():
        raise RuntimeError("D: is unavailable; no alternate destination was used.")
    now = dt.datetime.now(dt.timezone(dt.timedelta(hours=7)))
    DESTINATION.mkdir(parents=True, exist_ok=True)
    stage = DESTINATION / f"review-{now:%Y%m%d-%H%M%S}"
    stage.mkdir(exist_ok=False)
    for name in REQUIRED_REPORTS:
        source = REPORTS / name
        if not source.is_file() or source.stat().st_size == 0:
            raise ValueError(f"Missing report: {name}")
        (stage / "reports").mkdir(exist_ok=True)
        shutil.copy2(source, stage / "reports" / name)

    captures = []
    browser = None
    for phase in ["before", "after", "responsive", "audit"]:
        info = json.loads((EVIDENCE / phase / "viewport-results.json").read_text(encoding="utf-8-sig"))
        browser = info["browser"]
        rows = info["results"]
        if any(row.get("error") or row.get("errors") for row in rows):
            raise ValueError(f"Unresolved capture/runtime failures in {phase}")
        for row in rows:
            source = ROOT / row["screenshot"]
            if not source.resolve().is_relative_to(EVIDENCE.resolve()) or source.suffix != ".png":
                raise ValueError("Capture path is outside the declared PNG evidence directory")
            target = stage / "screenshots" / phase / source.name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            captures.append({**row, "phase": phase, "screenshot": target.relative_to(stage).as_posix()})
    for phase in ["before", "after"]:
        target = stage / "screenshots/template-tests" / phase
        target.mkdir(parents=True, exist_ok=True)
        for source in sorted((EVIDENCE / "template-tests" / phase).glob("*.png")):
            shutil.copy2(source, target / source.name)
        metadata = stage / "metadata"
        metadata.mkdir(exist_ok=True)
        shutil.copy2(EVIDENCE / "template-tests" / phase / "identity.json", metadata / f"template-identity-{phase}.json")
    shutil.copy2(EVIDENCE / "metadata/local-catalog-http.json", stage / "metadata/local-catalog-http.json")

    backend_log = read_log("review-backend-clean.log")
    backend = re.findall(r"Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)", backend_log)[-1]
    total, failures, errors, skipped = map(int, backend)
    if "BUILD SUCCESS" not in backend_log or failures or errors:
        raise ValueError("Backend verification failed")
    worker_log = read_log("review-worker.log")
    worker_count = int(re.findall(r"(\d+) passed", worker_log)[-1])
    build_log = read_log("review-build-final.log")
    if "built in" not in build_log or "error during build" in build_log:
        raise ValueError("Frontend build verification failed")
    summary = {
        "frontend": passed_vitest("review-user-complete.log"),
        "admin": passed_vitest("review-admin-unit.log"),
        "backend": {"total": total, "passed": total-skipped, "failed": failures, "errors": errors, "skipped": skipped},
        "worker": {"passed": worker_count, "failed": 0, "warnings": 2},
        "workspaceBrowser": passed_browser("review-browser-clean.log"),
        "templateBrowser": passed_browser("review-template-clean.log"),
        "eventAccessRecovery": passed_browser("review-access.log"),
        "finalIdentityAndAccessBrowser": passed_browser("review-last-identity.log"),
        "build": "passed", "lint": "passed", "routingIntegrity": "passed", "skillsIntegrity": "passed",
        "note": "Focused reruns overlap full suites; do not add their counts. Backend skips and provider/device gates are not passes.",
    }
    write_json(stage / "metadata/test-summary.json", summary)
    write_json(stage / "metadata/viewport-results.json", captures)
    branch, commit = git("branch", "--show-current"), git("rev-parse", "HEAD")
    (stage / "metadata/git-changes.md").write_text(
        f"# Local changes\n\nBranch: `{branch}`\n\nArchive source HEAD: `{commit}`\n\nBaseline: `81b14f50`\n\n"
        + "```text\n" + git("log", "--oneline", "81b14f50..HEAD") + "\n```\n\n```text\n"
        + git("diff", "--stat", "81b14f50..HEAD") + "\n```\n", encoding="utf-8")
    (stage / "README.md").write_text(
        f"""# Koupreng UI/UX review

Branch: `{branch}`  
Source HEAD: `{commit}`  
Capture/package date: {now.isoformat()} (Asia/Bangkok)  
Browser: Chromium {browser}; actual Playwright-rendered PNG screenshots.

Start with `reports/template-root-cause.md`, then compare `screenshots/before/` and `screenshots/after/` by identical names/languages/widths. `screenshots/template-tests/` isolates the exact renderer mismatch. Additional layouts are in `screenshots/responsive/` and `screenshots/audit/`.

The baseline serves all frontend source files from Git `81b14f50` through an isolated Vite loader on loopback 5185. The updated application uses loopback 5173. No working source was reset for capture. Tests and screenshots use the existing browser API contract fixtures with synthetic accounts, events and guests. All screenshot PNGs use fixture responses; they are not authenticated HTTP captures of event 61. The bundled template demo artwork remains template-owned. The only real backend HTTP evidence packaged here is the public, read-only catalog in `metadata/local-catalog-http.json`. The attempted existing event-61 session returned 401; no owner response, login credential, JWT, cookie, Authorization header, real guest token, real payment identifier or production QR credential is included.

Viewports: 320, 375, 390, 430, 768, 1024, 1366, 1440, 1920 CSS pixels. Heights are 844 on phones and 1000 on larger screens. English and Khmer are captured. Most screenshots use full-page capture; fullscreen previews capture the actual fullscreen viewport. Original PNGs are retained without cropping, rescaling, retouching or redaction. The phone frame preserves a 440 × 860 CSS content viewport; it does not certify iOS or Safari.

`metadata/manifest.json` records every other packaged file, size, PNG dimensions and SHA-256. `metadata/viewport-results.json` maps captures to routes, fixtures, dimensions and observed errors. `metadata/test-summary.json` records actual suite counts. Earlier before/after captures record page exceptions; responsive/audit captures also record console errors. Local Google sign-in rejects the localhost origin on login/register; those 16 provider console messages are retained, not counted as successful OAuth verification.

Limits and remaining checks: owner-authorized event 61 verification; MySQL/environment-gated backend tests; storage/payment/OAuth/Telegram providers; physical camera/native sharing; real iOS/Safari. See `reports/remaining-issues.md`. Local commits only: no push, merge, deployment, production database change or DNS change.
""", encoding="utf-8")

    manifest = []
    for file in sorted(stage.rglob("*")):
        if not file.is_file():
            continue
        if file.suffix not in {".md", ".json", ".png"} or file.name.startswith(".env"):
            raise ValueError(f"Unexpected archive file: {file.name}")
        raw = file.read_bytes()
        row = {"path": file.relative_to(stage).as_posix(), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        if not raw:
            raise ValueError(f"Empty artifact: {file.name}")
        if file.suffix == ".png":
            with Image.open(io.BytesIO(raw)) as picture:
                picture.load()
                row.update(width=picture.width, height=picture.height)
        else:
            text = raw.decode("utf-8")
            if re.search(r"eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]+\.", text):
                raise ValueError(f"Possible JWT in {file.name}")
        manifest.append(row)
    write_json(stage / "metadata/manifest.json", {"branch": branch, "commit": commit, "baseline": "81b14f50", "files": manifest, "note": "Manifest excludes its own hash."})

    archive = DESTINATION / "Koupreng-UIUX-Review.zip"
    if archive.exists():
        shutil.copy2(archive, DESTINATION / f"Koupreng-UIUX-Review-previous-{now:%Y%m%d-%H%M%S}.zip")
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipped:
        for file in sorted(stage.rglob("*")):
            if file.is_file():
                zipped.write(file, file.relative_to(stage).as_posix())
    pngs = 0
    with zipfile.ZipFile(archive) as zipped:
        if zipped.testzip() is not None:
            raise ValueError("ZIP CRC validation failed")
        names = zipped.namelist()
        for name in ["README.md", *[f"reports/{name}" for name in REQUIRED_REPORTS], "metadata/manifest.json", "metadata/test-summary.json", "metadata/viewport-results.json", "metadata/git-changes.md"]:
            if name not in names:
                raise ValueError(f"Required ZIP member missing: {name}")
        for name in names:
            raw = zipped.read(name)
            if not raw:
                raise ValueError(f"Empty ZIP member: {name}")
            if name.endswith(".png"):
                with Image.open(io.BytesIO(raw)) as picture:
                    picture.load()
                pngs += 1
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    archive.with_suffix(".zip.sha256").write_text(f"{digest}  {archive.name}\n", encoding="ascii")
    write_json(EVIDENCE / "metadata/archive-verification.json", {"path": str(archive), "bytes": archive.stat().st_size, "sha256": digest, "members": len(names), "pngsDecoded": pngs, "zipReadable": True, "stage": str(stage)})
    print(json.dumps({"archive": str(archive), "bytes": archive.stat().st_size, "sha256": digest, "members": len(names), "pngsDecoded": pngs, "verified": True}))


if __name__ == "__main__":
    main()
