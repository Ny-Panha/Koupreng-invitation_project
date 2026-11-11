# QA regression and verification matrix

Executed from repository root at `2ae3173f`. Results are from this audit, distinct from the 2026-11-10 baseline. No provider, payment or production mutation was run.

| Exact command | Current result / level |
|---|---|
| `npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx` | PASS 2/2, 18.81s; source factory and stored matrix reconcile 111 user leaves. |
| `npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx` | PASS 2/2, 14.94s; source factory and stored matrix reconcile 24 admin leaves. |
| `npm --prefix apps/frontend-user test` | PASS 215 files / 1,487 tests, 49.88s. Happy DOM logged disabled external iframe loading; unit result remains pass. |
| `npm --prefix apps/frontend-admin test` | PASS 34 files / 195 tests, 12.13s. Nonfatal socket/iframe stderr was emitted; this is not a live API test. |
| `npm --prefix apps/frontend-user run lint` | PASS, exit 0. |
| `npm --prefix apps/frontend-admin run lint` | PASS, exit 0. |
| `node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js phase02-foundations.spec.js --project mobile-chromium --output output/playwright/uxui-phase01-2026-11-11/au-browser-results` | FAIL overall: 13 pass, 3 fail, 0 skip, ~1.5m. All six targeted AU checks passed; see [11](11-confirmed-bugs-and-reproduction.md). The runner built both apps. |
| `node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js batch12-route-content.spec.js --project mobile-chromium --output output/playwright/uxui-phase01-2026-11-11/route-browser-results` | PASS 135/135, 2.1m; 390px mobile Chromium, fictional read-only DTOs and route-specific render assertions, not transaction/device proof. |
| `node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js phase02-foundations.spec.js --grep 'AU-00' --project mobile-webkit --project mobile-firefox --output output/playwright/uxui-phase01-2026-11-11/cross-engine-au-results` | PASS 12/12, 24.3s; targeted AU-001–006 in both additional engines. |
| `& apps/backend/mvnw.cmd -f apps/backend/pom.xml -o test '-Dtest=ArchitectureRulesTests,*Payment*Test*,*Auth*Test*,CookieCsrfSecurityTests'` | PASS 154 discovered, 145 passed, 9 skipped, 0 failed/errors; build success, 43.327s. MySQL-specific skipped cases do not prove live concurrency/migrations. |
| `$env:BATCH11_UPDATE_ROUTES='1'; npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx` and admin equivalent | PASS 2/2 each; wrote current source route snapshots to ignored `.cache/batch11/` for inspection. No tracked source edited. |
| `python docs/audits/ultimate-uxui-phase01-2026-11-11/evidence/generate-inventory.py` | PASS; generated 135 source route rows, 62 feature groups, ten dedicated renderer families and 38 keys, plus Phase 02–27 ownership. |
| `python -m pytest apps/telegram-bot/tests -q -p no:cacheprovider` | BLOCKED, exit 1: `C:\Python315\python.exe: No module named pytest`. No packages were installed. |
| `& '.cache/security-main-merge-20261026/python-env/Scripts/python.exe' -m pytest apps/telegram-bot/tests -q -p no:cacheprovider` | PASS 74/74, 0.81s, one inherited Starlette/httpx deprecation warning. This pre-existing isolated Python environment resolved the default interpreter block. |
| `node docs/audits/ultimate-uxui-phase01-2026-11-11/evidence/performance-current.mjs` | PASS three single-sample lab observations; raw JSON in `evidence/performance-current.json`; not field CWV or INP. |
| `node docs/audits/ultimate-uxui-phase01-2026-11-11/evidence/capture-visual-baseline.mjs` | PASS 28 current screenshots (seven representative route groups × 320/390/768/1440px), zero page-error records; fictional fixture, Khmer UI locale and reduced motion. Metadata is in ignored local output. |

Current route-content browser sweep, backend/MySQL tests, Telegram tests, performance runs, physical devices, screen readers, in-app clients, staging/provider transactions and production deployment are recorded in [limitations](15-evidence-index-and-limitations.md) at their true verification level. The two full frontend suites, lint and browser-run build do not establish backend compatibility or all responsive states.

The earlier source-search command using `rg` with `docs/phase13*` and `docs/phase14*` failed on Windows with `os error 123` because that glob was passed as a literal path; it was replaced with valid targeted paths. No source modification resulted. Additional nonmatching `rg` queries returned exit 1 where no search result existed.
