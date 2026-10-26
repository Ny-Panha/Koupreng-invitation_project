# Full-Stack Upgrade Verification & Test Record

**Project:** Koupreng E-Invitation Platform
**Date:** 2026-10-25
**Verification Target:** Local Workspace Suite

---

## 1. Verification Execution Matrix

| Subsystem | Exact Command Executed | Result | Metric / Counts |
|---|---|---|---|
| **Backend Tests** | `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test` | **PASS** | Tests run: 624, Failures: 0, Errors: 0, Skipped: 64 (BUILD SUCCESS in 1m 55s) |
| **Backend SpotBugs & PMD** | `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml spotbugs:check pmd:check` | **PASS** | SpotBugs: 0 bugs, 0 errors. PMD 7.17.0: 0 violations. (BUILD SUCCESS in 28s) |
| **Backend Dependencies** | `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml dependency:analyze` | **PASS** | BUILD SUCCESS in 9.3s |
| **Frontend Admin Lint** | `npm --prefix apps/frontend-admin run lint` | **PASS** | 0 lint errors |
| **Frontend Admin Vitest** | `npm --prefix apps/frontend-admin run test` | **PASS** | 21 test files passed, 121 tests passed (100% pass) |
| **Frontend Admin Build** | `npm --prefix apps/frontend-admin run build` | **PASS** | Production bundle generated in 1.21s (0 warnings) |
| **Frontend Admin Audit** | `npm --prefix apps/frontend-admin audit --audit-level=high` | **PASS** | 0 vulnerabilities found |
| **Frontend User Lint** | `npm --prefix apps/frontend-user run lint` | **PASS** | 0 lint errors |
| **Frontend User Vitest** | `npm --prefix apps/frontend-user run test` | **PASS** | 130 test files passed, 896 tests passed (100% pass) |
| **Frontend User Build** | `npm --prefix apps/frontend-user run build` | **PASS** | Production bundle generated in 2.49s (0 warnings) |
| **Frontend User Audit** | `npm --prefix apps/frontend-user audit --audit-level=high` | **PASS** | 0 vulnerabilities found |
| **Frontend Knip Deps** | `npm run analyze:deps` (both user & admin) | **PASS** | Clean dependency graph (0 undeclared dependencies) |
| **Frontend Knip Files** | `npm run analyze:knip` (both user & admin) | **PASS** | Full unused files and binaries inspection passed |
| **Playwright Critical Routes** | `powershell -Command "Set-Location apps/frontend-user; npx playwright test tests/e2e/critical-routes.spec.js --workers=1"` | **PASS** | 12 passed in 18.6s (Desktop Chromium + Mobile Pixel 7 across all 6 critical user/admin journeys) |
| **Playwright Route Smoke** | `powershell -Command "Set-Location apps/frontend-user; npx playwright test tests/e2e/route-smoke.spec.js --workers=1"` | **PASS** | 44 passed in 42.4s (All 22 distinct application routes across Desktop + Mobile) |
| **Telegram Bot Pytest** | `C:\Python314\python.exe -m pytest apps/telegram-bot/tests` | **PASS** | 74 passed, 0 failed in 0.60s (Python 3.14.9 runtime, including Khmer multibyte alert tests) |
| **Telegram Bot Ruff** | `C:\Python314\python.exe -m ruff check apps/telegram-bot` | **PASS** | All checks passed |
| **Telegram Bot Bandit** | `C:\Python314\python.exe -m bandit -q -r apps/telegram-bot/main.py apps/telegram-bot/start.py` | **PASS** | Clean security profile |
| **Telegram Bot Compile** | `C:\Python314\python.exe -m compileall -q apps/telegram-bot/main.py apps/telegram-bot/start.py apps/telegram-bot/tests` | **PASS** | Bytecode compilation verified |
| **Telegram Bot Audit** | `C:\Python314\python.exe -m pip_audit -r apps/telegram-bot/requirements.txt` | **PASS** | No known vulnerabilities found |
| **Telegram Bot Multibyte UTF-8** | `$env:PYTHONUTF8="1"; C:\Python314\python.exe -c "..."` | **PASS** | Multibyte Khmer bank alert parsing verified without UnicodeEncodeError |
| **Repository QA Policy** | `node --test scripts/qa/*.test.mjs` | **PASS** | 16/16 tests passed |
| **Docker Compose Config** | `docker compose config --quiet` | **PASS** | Topology and interpolation verified |
| **YAML Schema Validation** | `C:\Python314\python.exe -c "import yaml; ..."` | **PASS** | ci.yml, compose, prometheus, openapi validated |

---

## 2. Detailed Terminal Output Snapshots

### 2.1 Backend Tests (`mvn test`)
```text
[INFO] Results:
[INFO]
[INFO] Tests run: 624, Failures: 0, Errors: 0, Skipped: 64
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  01:55 min
[INFO] Finished at: 2026-10-25T19:42:14+07:00
```

### 2.2 Backend Static Checks (`mvn spotbugs:check pmd:check`)
```text
[INFO] --- spotbugs:4.10.5.0:check (default-cli) @ backend ---
[INFO] BugInstance size is 0
[INFO] Error size is 0
[INFO] No errors/warnings found
[INFO]
[INFO] --- pmd:3.28.0:check (default-cli) @ backend ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### 2.3 Frontend Audits (`npm audit`)
```text
# User
found 0 vulnerabilities

# Admin
found 0 vulnerabilities
```

### 2.4 Telegram Bot Pytest & pip-audit
```text
======================== 72 passed, 1 warning in 0.88s ========================
All checks passed!
No known vulnerabilities found
```
