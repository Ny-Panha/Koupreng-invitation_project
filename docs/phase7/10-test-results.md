# Phase 7 test results

Verification used `feat/phase7-guided-collaboration` in `D:/Koupreng-Phase7-worktree`, not the normal checkout. Private command logs remain under `D:/Koupreng-Phase7-private`. Public machine-readable summaries and sanitized evidence are under `D:/Koupreng-UXUI-Phase7`. Counts below describe separate gates; overlapping reruns must not be added together.

## Final local gates

| Gate | Actual result | Evidence |
| --- | --- | --- |
| User Vitest | 757 passed, 126 files, 33.42s | `final-user-current.log` |
| User ESLint / Vite production build | Both passed | `final-user-lint-current.log`, `final-user-build.log` |
| Admin Vitest | 121 passed, 21 files, 29.14s | `final-admin-current.log` |
| Admin ESLint / production build | Both passed; baseline 11 errors/one warning resolved | `final-admin-lint-current.log`, `final-admin-build-current.log` |
| Full backend, native MySQL enabled | 611 discovered, 607 passed, four skips, zero failures/errors; 2:02 | `final-backend-verified.log` |
| Existing opt-in RSVP MySQL benchmark | One passed; 2:05 | `final-rsvp-performance.log` |
| Post-V49 SQL/HTTP/OpenAPI/architecture gate | 35 passed, zero skips/failures/errors; 1:22 | `final-index-and-native.log` |
| Unique backend XML results after these gates | 611 discovered, 608 passed, three deliberate skips, zero failures/errors | `backend-skipped-tests.json` |
| Python worker | 72 passed, two upstream warnings; 2.30s | `final-worker.log` |
| Three-engine accessibility and keyboard/reflow | 72 passed; 4.0 minutes | `final-accessibility-current.log` |
| Firefox preview focus stress check | Ten consecutive passes, no retries; 48.0s | `final-focus-explicit-scroll.log` |
| Actual UI → API → MySQL journeys | Four passed; 39.5s | `final-live-current.log` |
| Inherited Chromium regression journeys | 20 passed; 1.2 minutes | `final-regression-current.log` |
| Current decorated Studio width/edit/preview checks | Ten passed, including 1366px; 22.3s | `final-studio-widths-current.log` |
| Agent routing / pinned skill integrity | 58 routing entries valid, zero errors; 59 skill directories verified | `final-routing.log`, `final-skills.log` |

The three remaining backend skips belong to `Phase6DemoMySqlTests`. Its provisioning guard targets the separate historical Phase 6 demo database. It was deliberately not enabled. The benchmark was a fourth skip in the full run and subsequently passed with its explicit opt-in. Docker was unavailable; native MySQL 8.0.39 on loopback 3416 provided actual fresh-schema, upgrade, JPA and transaction validation.

## Browser scope

The 72-case final matrix contains 42 critical-screen axe scenarios, 12 login/registration axe scenarios and 18 keyboard/reflow scenarios in desktop Chromium, Firefox and WebKit. Publish and import dialogs receive six additional scans inside their parent tests. WCAG A/AA/2.1/2.2 tags run without contrast exclusions or disabled failing controls. Reflow equivalents use 320/640 CSS pixels and increased spacing; a separate check doubles root text size. These are not physical-device or screen-reader tests.

Earlier focused Chromium gates also passed: team consent/revocation UI (three scenarios), paged guests/search/selection/import (four), analytics (two), and guided/publishing behavior (19). Guest and analytics scenarios each captured both languages at all nine requested widths. The final inherited regression gate covers import, seating/geometry/conflict recovery, original program/story, payment pending/verified states, RSVP, expenses, currency reports, narrow gift entry, template identity/switching and premium denial. Its result is recorded in the final report and visual manifest.

`final-live-current.log` uses the actual isolated frontends (4286/4287), backend (8187), native SQL and private fictional accounts. No API interception is installed:

1. Login as a registered Free account and verify the disabled Current plan action and configured Free subscription.
2. Create a Birthday through the UI, wait for the actual guided route, edit and assert the PUT response, reload, confirm publication, submit a token-scoped public RSVP through the API, and reconcile guest/analytics totals and the public page.
3. Create a private invitation code through the UI, accept as the intended account, review event linking, enforce viewer denial, remove through the UI and verify revocation.
4. Login as a test ADMIN, inspect current facts in Khmer/English and open existing Reports.

These accounts and nonrevenue `DEMO_ADMIN_GRANT` benefits exist only in `phase7_disposable`. No claimant payment was marked PAID. Browser traces are disabled for the credential-bearing live suite; public invitation-code captures are masked.

## Commands

From the worktree root:

```powershell
npm --prefix apps/frontend-user test -- --run
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin test -- --run
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-admin run build
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase7.config.js phase7-keyboard-reflow.spec.js phase7-accessibility.spec.js phase7-auth-accessibility.spec.js --project=desktop-chromium --project=desktop-firefox --project=desktop-webkit --workers=1
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase7-live.config.js
python scripts/validate-agent-routing.py
powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly
```

The live command requires `PHASE7_BROWSER_FIXTURES` pointing to the private fixture file and the explicitly started owned services. Ordinary invocations skip it rather than targeting arbitrary local services. Browser output was redirected to private task-specific directories.

Backend commands ran from `apps/backend`, with `FLYWAY_TEST_DB_URL` explicitly restricted to `jdbc:mysql://127.0.0.1:3416/phase7_disposable?...` and credentials loaded from the private runtime file without printing them:

```powershell
$env:RUN_PHASE7_MYSQL='true'
$env:RUN_FLYWAY_INTEGRATION='true'
.\mvnw.cmd test '-Dkoupreng.test.report-output=D:/Koupreng-Phase7-private/final-admin-reporting'
.\mvnw.cmd test '-Dtest=Phase7CollaborationMySqlTests,MigrationUpgradeMySqlTests,OpenApiIntegrationTests,ArchitectureRulesTests'
$env:RUN_RSVP_PERFORMANCE='true'
$env:RSVP_PERFORMANCE_OUTPUT='D:/Koupreng-Phase7-private/rsvp-performance-phase7.json'
.\mvnw.cmd test '-Dtest=RsvpSummaryPerformanceMySqlTests'
```

Worker command, from `apps/telegram-bot`: `python3.14 -m pytest -q`. The default Python lacks that environment's installed packages; Python 3.14 was used for the worker, and the private virtual environment for SQL evidence tooling.

## Diagnosed failures and corrections

- The baseline ADMIN suite initially had two timing failures under concurrent load; its isolated baseline rerun passed 116 tests. These were recorded before changes.
- Enabling native backend tests exposed an obsolete STAFF→ADMIN assertion and a check-in fixture lacking its required entitlement. Tests now assert ROLE_STAFF and explicitly create a disposable nonrevenue check-in grant. Production authorization was preserved.
- Initial browser assertions referred to the old template-button name and a removed gift modal. Selectors now follow visible accessible labels and the actual inline gift form. A template preservation fixture now includes its authored schedule description.
- A fast live create/edit test reached the new URL before the lazy route replaced the old creation DOM. The old successful creation form now stays disabled until unmount; the test waits for guided navigation and verifies the actual write response.
- Automated scans exposed navigation contrast and visible-name mismatches. Real keyboard repetitions then reproduced Firefox focus loss during preview loading. Explicit scroll focus, modal iframe boundaries and async-content recovery passed the final 72-case matrix and ten Firefox repetitions.
- A visual-capture command using an anchored grep matched no tests because Playwright includes the filename in the matched title. The corrected four-case capture run passed; an empty selection is not counted as verification.

Expected happy-dom diagnostics disable external iframe/font loading; the complete user suite still exits successfully. Real iframe operation was checked separately in browser engines. No unresolved test failure is omitted from the release recommendation.

## Performance evidence

The existing RSVP aggregate benchmark ran 0/100/1,000/10,000/100,000 guest scenarios, ten warmups, 30 iterations, three rounds, concurrency one. The retained optimized summary uses four SQL statements rather than the comparison implementation's seven. At 100,000 records its three p50 measurements were 222.6/331.9/216.3ms and p95 measurements 575.0/561.9/375.1ms. This is validation of an existing optimization, not a new Phase 7 speedup claim. Generated benchmark data was transactionally rolled back.

Phase 7's bounded newest-first guest-page index has separate before/after EXPLAIN evidence: the chosen access path changes from a scope index plus filesort to the covering `idx_guests_invitation_created_id` backward scan. Small disposable query plans and single-concurrency measurements do not establish production capacity or a latency SLA.

External ABA/bank/Telegram/email/OAuth/cloud delivery, production Redis topology, real mobile keyboards, physical Safari and human screen readers were not exercised. They remain staging/manual checks, not passing gates.
