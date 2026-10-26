# Actual Phase 12 verification

All commands run in the original checkout on local main. Raw logs are private under `.cache/phase12`; the review package contains sanitized summaries, not HTTP logs or credentials. Reruns are not counted as additional unique tests.

| Scope | Verified result |
|---|---|
| User frontend | 143 files, 1,050 passed; lint/build pass |
| Admin frontend | 21 files, 121 passed; lint/build pass |
| Worker | 74 passed; Ruff/Bandit pass; one inherited TestClient deprecation warning |
| Backend | 640 discovered, 636 passed, four explicit opt-in skips, no failures/errors; Maven verify/dependency analysis, SpotBugs/PMD pass |
| Phase 8 browser | 45 passed, four unavailable historical-reference-server skips |
| Phase 9 browser | 51 unique passes: first 50 pass/one loading timeout, affected Firefox case passes isolated |
| Phase 10 browser | 61 passed, two CDP-only native-touch skips |
| Phase 11 browser | 94 unique passes/two CDP skips: first sweep 93 pass/one touch regression, affected rerun 10 pass/two skips |
| Phase 12 browser | 87 passed, zero skipped, 422.58 s; 936 catalogue viewport states plus Studio cases; affected post-touch rerun nine pass |
| Critical routes/smoke | 56 passed across desktop/mobile Chromium |
| Repository policy/config/NVD | 16 passed |
| Tokens/OpenAPI/skills | Two token exports verified; 269 endpoints generated; routing zero errors; 59 bundled skill directories verified |
| Knip/dependency usage | User and admin pass |
| npm audit | User and admin: zero vulnerabilities |
| Gitleaks | Current tracked-tree copy plus intended new text: no leaks; staged/commit-range scans recorded in receipt |

Backend [summary and exact skips](evidence/backend-summary.json) lists five fresh/upgrade MySQL migration cases, 15 collaboration HTTP cases and four media HTTP cases separately. No route fixture is counted as a database test. Skips are three opt-in Phase 6 demo-provisioning tests and one opt-in RSVP performance benchmark. The database is new, native MySQL 8.0.39 on loopback 3420, not an existing production/local application schema.

## Commands

```powershell
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user test -- --maxWorkers=2
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-admin test -- --maxWorkers=2
npm --prefix apps/frontend-admin run build
# Existing isolated Python interpreter:
& '.cache/security-main-merge-20261026/python-env/Scripts/python.exe' -m pytest apps/telegram-bot/tests -q
& '.cache/security-main-merge-20261026/python-env/Scripts/python.exe' -m ruff check apps/telegram-bot
& '.cache/security-main-merge-20261026/python-env/Scripts/python.exe' -m bandit -q -r apps/telegram-bot/main.py apps/telegram-bot/start.py
# JAVA_HOME points to installed JDK 25. Generated disposable DB credentials stay private.
# RUN_PHASE7_MYSQL=true; RUN_FLYWAY_INTEGRATION=true; FLYWAY_TEST_DB_URL is the documented disposable schema.
.\apps\backend\mvnw.cmd -f apps/backend/pom.xml verify dependency:analyze
npm --prefix apps/frontend-user run analyze:knip
npm --prefix apps/frontend-user run analyze:deps
npm --prefix apps/frontend-admin run analyze:knip
npm --prefix apps/frontend-admin run analyze:deps
npm --prefix apps/frontend-user audit --json
npm --prefix apps/frontend-admin audit --json
node scripts/sync-design-tokens.cjs --check
node scripts/generate-openapi-manifest.cjs
python scripts/validate-agent-routing.py
powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly
node --test scripts/qa/repository-policy.test.mjs scripts/qa/config-regression.test.mjs scripts/qa/nvd-feed.test.mjs
# From apps/frontend-user:
node node_modules/@playwright/test/cli.js test --config playwright.phase8.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase9.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase9.config.js --project firefox --grep 'six parent tabs'
node node_modules/@playwright/test/cli.js test --config playwright.phase10.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase11.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase11.config.js phase11-features.spec.js
node node_modules/@playwright/test/cli.js test --config playwright.phase12.config.js
node node_modules/@playwright/test/cli.js test --config playwright.phase12.config.js phase12-studio.spec.js
node node_modules/@playwright/test/cli.js test tests/e2e/critical-routes.spec.js tests/e2e/route-smoke.spec.js --workers=1
```

Phase 10 uses a separate current-source build at `.cache/phase10/browser-dist` with `VITE_PUBLIC_APP_URL=http://127.0.0.1:4310`, as its existing configuration requires. The normal production build and all source edits remain in the requested checkout. `PHASE12_WRITE_MATRIX=true` regenerates the matrix during the component suite.

## Failures, fixes and limits

The first backend attempt had 18 context errors because its opt-in guard accepted only the historical disposable address. A narrow second exact address was added, and the complete suite passed. Initial lint caught component/noncomponent exports; shared labels/navigation were moved into separate modules. The first new unit attempt lacked the happy-dom `confirm` stub; the corrected interaction test passed. A first Chromium monogram attempt used a stale build before new style buttons existed; the full rebuilt sweep passes all engines. A Windows shell text-encoding issue was caught during label review and fixed using a UTF-8 script; explicit Khmer-label regression assertions pass.

The new matrix found WithJoy/Bliss ignoring the canonical hosted RSVP child. That was repaired, with component and all-engine browser retention evidence. Visual review found language/contrast/icon/label defects documented in reports 02–06. Phase 9's isolated Firefox loading timeout showed the route-loading screen rather than a failed six-tab assertion; unchanged isolated execution passed. Phase 11 found native touch cancellation after a CSS scroll change; coarse-pointer devices now start unlocked and explicit drag mode reserves touch gestures. The affected three-engine reruns verify the fix.

Final bundle: main **452.05 kB raw / 131.54 gzip**, Studio **196.46 / 52.19**. Against actual HEAD baseline, main decreases 0.10 kB and Studio increases 2.57 kB raw (0.90 gzip). Against the historical Phase 11 report, the intervening Royal Garden implementation also contributes. No runtime dependency is added. No physical-device CPU, Lighthouse or INP score is claimed.
