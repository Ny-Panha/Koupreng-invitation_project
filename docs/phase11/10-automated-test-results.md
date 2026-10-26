# Executed quality gates - 26 October 2026

Source implementation: `a1fe5ba271adb2fc0680f911bf868501d7d150af`. Evidence is sanitized in `evidence/test-summary.json`; raw local logs are ignored and excluded from distribution because HTTP debug output can contain fictional credentials. Results below are actual local execution, not historical Phase 10 totals.

| Scope | Result | Execution |
|---|---|---|
| User frontend | 137 files, 969 passed | 65.09 s final full run |
| Earlier wording placement/preview checks | 4 files, 66 passed | 11.42 s; followed by final full run |
| Admin | 21 files, 121 passed | 45.22 s |
| Worker | 74 passed, one Starlette/AnyIO deprecation warning | 1.54 s |
| Backend | 638 discovered: 634 passed, four skipped, zero failures/errors | Maven verify + dependency analysis, 5m57s |
| Phase 11 browser | 94 unique passed, two explicit touch-injection skips across runs | Final sweep 93 pass/one hit-area failure/two skips; affected rerun 22 pass/two skips |
| Controlled original-main captures | two passed | 6.7 s |
| Phase 8 browser regression | 45 passed, four reference-server skips | 3.1 min |
| Phase 9 regression | 51 unique cases passed across initial run and affected reruns | Initial 47 pass/four fail; affected six pass (two overlap) |
| Phase 10 regression | 61 unique passes/two touch-injection skips across runs | Initial 52 pass/nine fail/two skip; template rerun 35 pass/one page-closed error, isolated recovery one pass |
| CI critical routes and route smoke | 56 passed | 27.9 s, desktop/mobile Chromium |
| Final map hit-area component checks | 33 passed | 4.38 s |
| Repository policy/config/NVD unit checks | 16 passed | 2.163 s |

The final Phase 11 matrix includes 72 template/language cases, each iterating eight widths: 576 viewport states. Other cases cover locale persistence/reload, iframe identity, RSVP retention and token stability, draft blocking, preset confirmation/undo, family/monogram editing, Premium UI, pointer/keyboard map operations, export/reopen and Chromium native touch/cancellation. Tests use route fixtures; the 14 real HTTP/MySQL collaboration journeys independently validate server authority, persistence, expiry, revocation, race conflicts and private tokens.

Commands run from repository root unless a working directory is specified:

```powershell
npm --prefix apps/frontend-user test -- --maxWorkers=2
npm --prefix apps/frontend-user test -- --maxWorkers=2 src/features/invitations/InvitationForm.test.jsx src/features/templates/shared/invitationFeatures.test.jsx src/features/templates/shared/localizedContent.test.js src/features/templates/experience/TemplateExperience.security.test.jsx
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin test -- --maxWorkers=2
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-admin run build
# Worker used the existing isolated Python environment (Python 3.14), not default Python 3.15.
& 'D:\Koupreng-invitation_project\.cache\security-main-merge-20261026\python-env\Scripts\python.exe' -m pytest apps/telegram-bot/tests -q
# Same interpreter: -m ruff check apps/telegram-bot
# Same interpreter: -m bandit -q -r apps/telegram-bot/main.py apps/telegram-bot/start.py
$env:JAVA_HOME='C:\Program Files\Java\jdk-25'
$env:RUN_PHASE7_MYSQL='true'
$env:RUN_FLYWAY_INTEGRATION='true'
$env:FLYWAY_TEST_DB_URL='jdbc:mysql://127.0.0.1:3416/phase7_disposable?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC'
$env:FLYWAY_TEST_DB_USERNAME='phase11'
$env:FLYWAY_TEST_DB_PASSWORD=[IO.File]::ReadAllText((Join-Path (Get-Location) '.cache\phase11\mysql-password.txt'))
.\apps\backend\mvnw.cmd -f apps/backend/pom.xml verify dependency:analyze
npm --prefix apps/frontend-user run analyze:knip
npm --prefix apps/frontend-admin run analyze:knip
npm --prefix apps/frontend-user audit --json
npm --prefix apps/frontend-admin audit --json
node scripts/sync-design-tokens.cjs --check
node scripts/generate-openapi-manifest.cjs
python scripts/validate-agent-routing.py
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly
node --test scripts/qa/repository-policy.test.mjs scripts/qa/config-regression.test.mjs scripts/qa/nvd-feed.test.mjs
# In apps/frontend-user:
node node_modules/@playwright/test/cli.js test tests/e2e/critical-routes.spec.js tests/e2e/route-smoke.spec.js --workers=2
node node_modules/@playwright/test/cli.js test --config playwright.phase11.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase11.config.js phase11-bilingual.spec.js phase11-features.spec.js
node node_modules/@playwright/test/cli.js test --config playwright.phase11-baseline.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase8.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase9.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase9.config.js --grep 'khmer-golden-canva-inspired-wedding|free video notice'
# Phase 10 production build used --outDir ../../.cache/phase10/browser-dist and VITE_PUBLIC_APP_URL=http://127.0.0.1:4310
node node_modules/@playwright/test/cli.js test --config playwright.phase10.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase10.config.js phase10-templates.spec.js
node node_modules/@playwright/test/cli.js test --config playwright.phase10.config.js --project webkit --grep withjoy-modern-portal
```

Builds and lint pass for both frontends. SpotBugs and PMD pass without adding suppressions. Maven dependency analysis emits existing scope/usage warnings but exits successfully. Knip passes: real Playwright/visual entry points are registered and six unreferenced modules left by upstream cleanup were removed after caller search; active gift, seating, dashboard and template routes remain covered. Both npm audits reported zero vulnerabilities. Worker Ruff/Bandit pass. Token check validates two exports, OpenAPI manifest contains 269 endpoints, routing reports zero errors and 59 bundled skill directories verify. The staged Gitleaks 8.30.1 scan reports no leaks; final tracked-tree scan is recorded in the release review receipt.

Scoped Axe assertions run on the map canvas/layers and existing Phase 8/9/10 controls, date/program, ticket/video and workspace scenarios. They passed in their test scopes. This is not a full-site accessibility certification. Existing keyboard, reflow and reduced-motion cases remain covered.

Final production bundle: main entry 445.17 kB / 130.63 kB gzip; Studio route 183.58 kB / 48.63 kB gzip. Initial main entry was 444.90 / 130.54 and Studio 169.79 / 44.71. The increases are 0.27 kB main / 13.79 kB Studio raw (0.09 / 3.92 gzip). No new runtime dependency was installed. No invented performance score is reported.

Failures and recovery: original bilingual test reproduced the overwrite; missing Firefox/WebKit and a stopped disposable MySQL instance caused preliminary environment failures and were restored. A private-access test incorrectly expected 403 instead of the existing non-enumerating 404 and was corrected. PMD identified one collapsible conditional; it was simplified and verify passed. The final diagram drag check caught a transparent outline hit target; an editor-only hit rectangle fixed grabbing, and the affected three-engine run passed. Browser checks found the Advanced-mode preset placement issue (fixed with confirmation/undo coverage), stale translated opening-label selectors (updated), the live preview's demo English aliases (fixed with a regression test), and one WebKit closed-page attempt (passed isolated). A wording fixture used an English-only event while expecting the Khmer tab; its setup was corrected to keep English UI and Khmer authoring independent. Default Python 3.15 lacked pytest; the installed isolated environment passed. A mistakenly selected Node test glob ran zero tests and is not counted; the corrected explicit three-file command passed 16.

Exact backend skips are in `evidence/backend-skips.json`: three opt-in Phase 6 demo provisioning cases and one opt-in RSVP performance benchmark. Phase 8's four skips require its historical Phase 7 baseline server. Native touch injection is Chromium CDP only, so Firefox/WebKit touch cases are explicitly skipped; their pointer/keyboard coverage passes.

The final full tracked-tree Gitleaks scan initially found four inherited findings. Three exact fictitious fixture fingerprints were accepted through `.gitleaksignore`; the tracked SQL guest-data dump was privately preserved and untracked. The corrected scan uses the repository root as its working directory so fingerprint paths match CI, and reports no leaks. This is a current-tree scan; Git history was not rewritten or certified.

A raw text diff scan also flags the sensitive dump lines being deleted. It is not counted as a clean introduction scan. The final commit-aware command `gitleaks git . --log-opts=origin/main..HEAD --redact --no-banner` reports no leaks, as does the corrected current-tree scan. The review patch excludes database-dump contents, including removed lines.
