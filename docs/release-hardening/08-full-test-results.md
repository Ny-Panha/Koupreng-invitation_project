# Full local verification evidence

Executed in the original main checkout on 29?30 October 2026. Exit codes, elapsed wall times and raw command output are retained in ignored `.cache/release-hardening/<name>.json` / `.log`. Suite totals overlap and must not be added as unique tests. Node 22.23.4 and Java 25.0.1 were used for final checks; local worker Python is 3.14.9 versus CI 3.13.

## Module, database and security checks

| Command (repository root unless stated) | Result | Counts / elapsed wall time |
| --- | --- | --- |
| `npm --prefix apps/frontend-user test -- --maxWorkers=2` | PASS, exit 0 | **1,194 passed, 162 files**, 83.27 s (`user-final-1194`) |
| `npm --prefix apps/frontend-admin test` | PASS, exit 0 | **128 passed, 22 files**, 40.54 s (`admin-unit-final`); admin product source unchanged |
| `npm --prefix apps/frontend-user run lint` | PASS, exit 0 | 77.32 s (`lint-source-final`) |
| `npm --prefix apps/frontend-admin run lint` | PASS, exit 0 | 22.06 s (`admin-lint`) |
| `npm --prefix apps/frontend-user run build` | PASS, exit 0 | 10.55 s (`build-repaired-final`) |
| `npm --prefix apps/frontend-admin run build` | PASS, exit 0 | 15.15 s (`admin-build-final`) |
| Both frontends: `run analyze:knip` and `run analyze:deps` | PASS, exit 0 | 21.76 s combined (`frontend-analysis`); final Knip plus repository policy rerun also passed in 63.34 s |
| Backend directory: `mvnw.cmd --batch-mode verify dependency:analyze` | PASS, exit 0 | **658 discovered: 582 passed, 76 skipped, 0 failure/error**, 641.59 s; SpotBugs, PMD, ArchUnit, JaCoCo. Includes the report-output path override recorded in the raw receipt. Dependency usage emits starter/transitive warnings; it does not report a failed gate. |
| Backend: `mvnw.cmd --batch-mode "-Dtest=*MySqlTests,FreshDatabaseMigrationTests" test` | PASS, exit 0 | **78 discovered: 51 passed, 27 skipped**, 146.68 s (`mysql-remediated-final`), `RUN_FLYWAY_INTEGRATION=true` |
| Backend: `mvnw.cmd --batch-mode "-Dtest=Phase7CollaborationMySqlTests,Phase9MediaMySqlTests" test` | PASS, exit 0 | **23 discovered: 22 passed, 1 skipped**, 93.50 s (`mysql-http-remediated-final`), `RUN_PHASE7_MYSQL=true` |
| Backend: `mvnw.cmd --batch-mode -Dtest=RsvpSummaryPerformanceMySqlTests test` | PASS, exit 0 | **1 passed**, 258.35 s (`mysql-performance`), `RUN_RSVP_PERFORMANCE=true`; 0?100,000 guest records |
| Backend documentation/disabled documentation/architecture selection | PASS, exit 0 | **20 tests**, 61.14 s (`openapi-remediation`), also covered by final full backend suite |
| Backend: `mvnw.cmd --batch-mode --update-snapshots -Pdependency-security -DskipTests verify` | PASS, exit 0 | Current official NVD refresh and unchanged CVSS 8 gate; 514.32 s (`java-audit-remediated`) |
| Both frontends: `npm audit --audit-level=high` | PASS, exit 0 | Zero known vulnerabilities, 3.11 s combined (`node-audits`) |
| Worker: `.venv/Scripts/python.exe -m pytest -q` | PASS, exit 0 | **74 passed**, one deprecation warning; 12.32 s (`worker-baseline`) |
| Worker: `python -m ruff check .`, `-m bandit -q -r main.py start.py`, `-m compileall -q main.py start.py tests`, `-m pip_audit -r requirements.txt` | PASS, exit 0 | No known runtime requirement vulnerabilities; 25.06 s combined (`worker-security`) |
| `node --test scripts/qa/*.test.mjs` | PASS, exit 0 | **18 passed**, 8.85 s standalone; final combined analysis rerun also passes |
| Skills integrity and `python scripts/validate-agent-routing.py` | PASS, exit 0 | 59 bundled skill directories, zero integrity issues; routing/reference validation passed (`repository-policy`) |
| Compose interpolation, four YAML files, tracked shell syntax, browser-smoke syntax | PASS, exit 0 | Isolated synthetic Compose environment; no production services changed. Docker image execution is deferred to CI because the local Linux engine is unavailable. |

The final strengthened public-package policy test also passed over real HTTP/MySQL (`package-policy-final`, 1 passed, exit 0, 42.53 s), rejecting missing/null fields and implicit zero prices.

The isolated MySQL 8.0.39 server binds only to 127.0.0.1:3416. All database commands explicitly select its task-owned disposable schemas and synthetic test account. Production data and existing local schemas were not accessed. Report 05 distinguishes actual HTTP/JWT/JPA/MySQL tests from browser DTO replay.

## Browser results and reconciliation

The complete inventory is **1,060 project cases in 84 spec files**, covering desktop Chromium and Pixel 7 mobile Chromium. The full command `npx playwright test --workers=4 --reporter=list,json` completed: **879 passed, 74 failed, 107 skipped**, exit 1, **2,199.53 s**. This failed run is retained and is not described as a clean passing suite. Initial excessive concurrent workloads caused some timeouts; other failures exposed stale contracts and the real Emerald keyboard defect.

All 74 failed cases were mapped to the current inventory, accounting explicitly for three renamed test descriptions. The repair list also included the seven complete specs using the changed shared guest fixture, mobile/desktop ticket export, and evidence-path checks. `npx playwright test --test-list=../../.cache/release-hardening/repair-test-list.txt --output=../../.cache/release-hardening/chromium-repairs --workers=2 --reporter=list,json` completed **125 cases: 96 passed, 21 failed, 8 historical-evidence skips**, exit 1, **539.35 s**. Its remaining defects were corrected and all 21 failures plus the full intent spec were rerun using `remaining-test-list.txt`: **23 passed, zero failed/skipped**, exit 0, **52.67 s**. Native publication confirmation, owner-access DTOs, paged guest data, current schedule editor controls, navigation destinations and localized language selection are asserted. Two-day/story tests additionally reject executed script dialogs and injected script elements.

**Reconciled latest outcomes: 945 passed, 115 explicit skips, zero unresolved failures, all 1,060 cases accounted for.** This is reconciliation across completed executions, not a claim that a second full 1,060-case command ran cleanly. Machine-readable case outcomes, source run and skip annotations: `.cache/release-hardening/reconciled-playwright-results.json`, SHA-256 `0613777db9c221a5390e8a122cdd4b6b84ac3de0a61f2a31e05d377bc972e793`.

The final bounded Firefox/WebKit matrix runs existing critical-routes, route-smoke, guest-workspace, next-studio-ux and package-purchase specs with Desktop Firefox/Desktop Safari devices, retries 0 and two workers: **92 passed, 4 duplicate viewport captures skipped, zero failures**, exit 0, **159.53 s** (`cross-browser-verified`). Earlier cross-browser run: 89 passed, 3 failed, 4 skipped; the three failures first passed a six-case focused rerun and then this complete 96-case matrix. It does not claim full Firefox/WebKit coverage of all 84 specs.

Responsive coverage includes 320/375/390/430/768/1024/1366/1440/1920 px, additional 360/1280 widths where specified, keyboard/Escape/focus return, 200%/400% reflow equivalents, reduced motion, offline/retry, failed save, bilingual content, template persistence, guest/QR/ticket and subscription server-verification states. Physical devices, manual screen readers and live provider settlement are NOT RUN.

## Reporting, accessibility and document validation

`node scripts/qa/admin-reporting-browser.mjs`: PASS, exit 0, **38.85 s**, 40 visits and actual XLSX, full CSV, paged CSV, workbook and three Chromium PDFs. `node scripts/qa/admin-reports-workspace.mjs`: PASS, exit 0, **210.84 s**, 16 viewport/language/theme combinations, 160 visits, **55 axe scans**, five task journeys, six state checks, zero page errors. `python scripts/qa/inspect-admin-reporting-pdfs.py`: PASS, exit 0, **1.24 s**; PDF page counts **5/21/18**, embedded Khmer font, selectable text, repeated headers, A4 bounds, native XLSX integrity, and 12 USD receipt rows totaling 47 USD. These are synthetic backend-generated SQL/POI fixtures replayed through the actual built admin UI. Real MySQL reporting and HTTP authorization coverage are separate. See report 04 for the validation limits.

## Skips: actual classes and reasons

Default backend skips are environment gates, not passing tests. MySQL integrity/migration classes below are subsequently executed by the MySQL selection; Phase 7/9 by real HTTP selection; the benchmark separately. Remaining unexecuted cases are three private demo-provisioning tests and one reviewed-package-config test.

| Backend class | Default full-suite skips | Gate / execution |
| --- | ---: | --- |
| `AuthIntegrityMySqlTests` | 4 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `GuestMutationIntegrityMySqlTests` | 2 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `EntitlementIntegrityMySqlTests` | 5 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `FreshDatabaseMigrationTests` | 1 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `ManualGiftMySqlTests` | 2 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `GuestBatchMySqlTests` | 6 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `RoyalGardenMapMySqlTests` | 4 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `MediaIntegrityMySqlTests` | 2 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `MigrationUpgradeMySqlTests` | 5 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `PaymentEvidenceIntegrityMySqlTests` | 4 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `Phase6DemoMySqlTests` | 3 | Private demo provisioning: NOT RUN; creates private accounts/artifacts outside this disposable test setup |
| `Phase7CollaborationMySqlTests` | 19 | RUN_PHASE7_MYSQL: 18 run; 1 requires reviewed STUDIO_PACKAGE_CONFIG and remains SKIP |
| `Phase9MediaMySqlTests` | 4 | RUN_PHASE7_MYSQL: all 4 run |
| `ReportingIntegrityMySqlTests` | 1 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `RsvpSummaryPerformanceMySqlTests` | 1 | RUN_RSVP_PERFORMANCE: run separately |
| `SeatingLayoutMySqlTests` | 4 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `SilkHeritageMigrationMySqlTests` | 1 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `SubscriptionIntegrityMySqlTests` | 6 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `RoyalGardenCatalogMySqlTests` | 1 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |
| `TicketMigrationMySqlTests` | 1 | RUN_FLYWAY_INTEGRATION: executed in MySQL selection |

Chromium skip inventory after reconciliation:

| Spec | Count | Actual reason |
| --- | ---: | --- |
| `event-overview-design.spec.js` | 1 | Capture the responsive matrix once |
| `guest-ticket-polish.spec.js` | 2 | Viewport matrix runs once |
| `guest-workspace.spec.js` | 1 | Viewport coverage uses the desktop browser with responsive widths. |
| `khmer-celestial-guest-banner.spec.js` | 2 | Run with a temporary local invitation created through the real API. |
| `map-studio-upgrade-ux.spec.js` | 3 | Explicit viewport sweep covers the layouts.; Explicit 375/1440 viewport checks cover both layouts. |
| `next-studio-ux.spec.js` | 1 | Capture the viewport matrix once |
| `phase10-baseline.spec.js` | 2 | Historical baseline capture is opt-in |
| `phase10-live.spec.js` | 4 | Requires explicit fictional credentials for the owned loopback disposable environment. |
| `phase10-templates.spec.js` | 4 | Retired by V50; inactive exclusion is tested separately |
| `phase11-matrix.spec.js` | 8 | Retired by V50; inactive exclusion is tested separately |
| `phase12-matrix.spec.js` | 8 | Retired by V50; inactive exclusion is tested separately |
| `phase5-live-import.spec.js` | 2 | Requires the isolated Phase 5 MySQL API |
| `phase6-baseline.spec.js` | 2 | Historical reproduction; run only against the Phase 5 baseline. |
| `phase7-evidence.spec.js` | 8 | Retrospective evidence requires the separately supplied 0183def5 static build; current regression runs the after stage. |
| `phase7-live.spec.js` | 8 | Requires explicit credentials for the owned loopback Phase 7 disposable environment. |
| `phase8-live.spec.js` | 2 | Requires explicit private credentials for the owned loopback disposable environment. |
| `phase8-reference.spec.js` | 8 | Requires the preserved Phase 7 preview server. |
| `phase9-global-evidence.spec.js` | 8 | Requires explicit fictional local admin credentials. |
| `phase9-live.spec.js` | 2 | Requires explicit fictional credentials for the owned loopback disposable environment. |
| `project-wide-ui.spec.js` | 24 | Capture once; Golden images use one Windows Chromium renderer |
| `royal-garden-catalog.spec.js` | 2 | Requires the reviewed local Admin registration and backend on 8080 |
| `royal-garden-v32.spec.js` | 1 | Nine viewport evidence runs once; functional cases run in both projects. |
| `royal-garden-v33-performance.spec.js` | 2 | Explicit local comparison requires the archived main preview at port 4273. |
| `royal-garden-v33-visual.spec.js` | 4 | Explicit viewport baseline is shared. |
| `royal-garden-v33.spec.js` | 2 | One explicit eight-viewport sweep covers both pointer layouts.; Explicit viewport sweep is shared. |
| `skeleton-loading.spec.js` | 2 | Responsive matrix captured once; Chromium CDP measurement |
| `ux-ui-redesign.spec.js` | 2 | Requires the explicitly configured disposable backend. |

The eight newly explicit Phase 7 before-stage skips require the original 0183def5 static build. Their current after-stage counterparts all pass on ports 4173/4174. Existing retired-template, historical baseline, opt-in live-account and duplicate-renderer gates remain intact. No security test or assertion was disabled.

Final pinned Gitleaks 8.30.1 tracked-source equivalent: PASS, exit 0, zero findings, 216.36 MB of text scanned, 14.10 s wall time (`gitleaks-final`). A separate directory scan covers the final sanitized report metadata added after the source archive. No new source exclusion was introduced.
