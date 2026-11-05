# Batch 11 test results

Date: 2026-11-05, ICT. Working tree started clean on `main`. Local and fetched remote HEAD both resolved to `b57b9edc58a954de650ff42e7e9ee6d042b57e33`. No feature branch, pull request, destructive reset, force push or deployment was used.

## Environment

Windows PowerShell; Node/npm and local Playwright Chromium; Java 25.0.1; Maven via the checked-in wrapper; Spring Boot 4.1.1 from the actual POM. `docker info --format '{{.ServerVersion}}'` failed because the Docker Desktop Linux engine pipe did not exist. `MySQL80` was running, so the existing disposable loopback-schema harness supplied real MySQL integration instead. No production schema was used. Every owned test schema was dropped by the harness.

Vitest emits existing happy-dom iframe/font-loading and connection-refused diagnostics for disabled external resources. The passing totals below are actual exit-zero results; these diagnostics are not provider/device verification. Maven emitted repository metadata HTTP 401 warnings for optional upstream feeds, then completed successfully using available dependencies.

## Git baseline commands

```powershell
git status --short
git branch --show-current
git fetch origin main
git rev-parse HEAD
git rev-parse origin/main
git log -5 --oneline
```

Result: clean `main`, identical local/remote SHA above. Commit/push verification is recorded in the final delivery report; the ending SHA is the commit containing this file.

## Frontend and repository gates

| Exact command | Result |
|---|---|
| `npm --prefix apps/frontend-user run lint` | Passed, exit 0 |
| `npm --prefix apps/frontend-user run build` | Passed, exit 0; build log `.cache/batch11/user-build.log` |
| `npm --prefix apps/frontend-user run test -- --maxWorkers=2` | 186 files, **1,322 passed**, 0 failed/skipped; final run 181.88s |
| `npm --prefix apps/frontend-admin run lint` | Passed, exit 0 |
| `npm --prefix apps/frontend-admin run build` | Passed, exit 0; `.cache/batch11/admin-build-final.log` |
| `npm --prefix apps/frontend-admin run test -- --maxWorkers=2` | 32 files, **189 passed**, 0 failed/skipped; final run 19.68s |
| `node scripts/sync-design-tokens.cjs --check` | Passed; verified both application token exports |
| `python scripts/validate-agent-routing.py` | Passed; 0 errors, 58 skills validated. Existing duplicate skill-name warning retained |

The baseline suites passed 1,311 customer tests and 175 admin tests before the new regression coverage. Targeted checks were also run for redirect identity, copy-only delivery, notification status/unsupported URL, diagnostic privacy, monitor replay/reconnection and route inventory. The machine-readable summary records their final evidence without publishing raw credentials or personalized browser URLs.

## Backend gates

```powershell
.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test -B
python scripts/qa/run-studio-access-mysql.py --tests Phase7CollaborationMySqlTests,PaymentEvidenceIntegrityMySqlTests,EntitlementIntegrityMySqlTests,SubscriptionIntegrityMySqlTests --label batch11-real-mysql-final
python scripts/qa/run-studio-access-mysql.py --tests Phase7CollaborationMySqlTests --browser --label batch11-browser-live-verified
```

| Scope | Result | Evidence |
|---|---|---|
| Full default Maven suite | **669 tests, 0 failures/errors, 78 skips**, BUILD SUCCESS; 2m55s | Surefire reports. Mix of unit, security/controller and H2-backed tests; environment-gated MySQL tests are explicitly skipped in this command |
| Disposable MySQL integrity run | **35 passed, 0 failures/errors/skips** | 20 collaboration/journey + 4 payment evidence + 5 entitlement + 6 subscription tests; `.cache/next-studio-ux/batch11-real-mysql-final.json` |
| Disposable MySQL with real browser | **21 passed, 0 failures/errors/skips**, including one live Chromium journey | `.cache/next-studio-ux/batch11-browser-live-verified.json`; real browser **1 passed**, 0 failed/skipped, 9.80s in `.cache/batch11/live-playwright.json` |

The 21-test live run overlaps the 20 collaboration tests in the 35-test run; these counts must not be added as unique tests. The live journey uses real HTTP/JWT/JPA/MySQL and built apps. It does not intercept browser API calls. Fixture-driven browser suites below are a separate evidence tier.

## Browser regression commands

```powershell
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/batch11-route-coverage.spec.js tests/e2e/batch11-legacy-redirects.spec.js tests/e2e/batch11-payment-journey.spec.js tests/e2e/batch11-auth-boundaries.spec.js tests/e2e/batch11-admin-integration.spec.js tests/e2e/batch8-delivery-qr-checkin-wishes.spec.js tests/e2e/batch10-admin-observability.spec.js tests/e2e/phase2-payment.spec.js tests/e2e/marketing-pages.spec.js tests/e2e/invitation-publishing-address.spec.js --workers=2 --reporter=json
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/batch11-admin-integration.spec.js --workers=2 --reporter=json
```

The focused admin rerun passed **6/6**, 0 skipped, in 20.69s. The final combined browser result and any fallback supplement are recorded in `test-summary.json`. Both standard projects are Chromium: desktop and emulated Pixel 7. Fixture responses are deterministic; no real payment, SMTP delivery or notification broadcast is performed.

Final combined run: **104 passed, 0 failed/skipped/flaky**, 182.50s (`.cache/batch11/playwright-verified.json`). A final fallback supplement passed **2/2**, 0 failed/skipped, using:

```powershell
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/batch11-route-coverage.spec.js --grep 'unknown route fallback' --workers=2 --reporter=json
```

The machine matrix records **30 route-content/fallback smoke patterns**, **22 patterns with selected functional controls**, and **34 legacy alias patterns with destination evidence**. Another 47 rows have destination/container-only evidence; 105 still require dedicated full leaf smoke. These categories overlap and must not be added. All 135 patterns are source reconciled; the historical 87 unfinished modernization rows were not relabelled complete.

After the final screenshot review's customer menu CSS repair, the user build passed again, HostNav unit tests passed **5/5** (1.07s), and the following focused regression passed **20/20**, 0 failures/skips/flaky, 60.25s. It overlaps the combined run and must not be counted as 20 additional unique cases. It adds explicit 44px menu bounds checks and refreshes the delivery screenshots.

```powershell
npm --prefix apps/frontend-user run test -- src/layouts/components/HostNav.test.jsx --maxWorkers=2
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/batch11-legacy-redirects.spec.js tests/e2e/batch8-delivery-qr-checkin-wishes.spec.js --workers=2 --reporter=json
```

Route coverage includes 106 anonymous guard checks (84 customer and 22 admin), selected authorized page content/destinations, 25 customer alias cases (24 patterns, including numeric and local variants of one pattern), ten admin aliases, refresh/history, role/session rejection, pending/verified payment transitions, receipt denial, publishing, QR/check-in, reporting and Batch 8/10 regressions. Guard-only checks are not counted as full authenticated route smoke.

Responsive/Axe evidence covers delivery and notification workflows in both languages at 320, 375, 390, 430, 768, 1024 and 1440 pixels. The new tests keep contrast enabled and wait for fonts/finite page-entry motion before analysis. Physical devices and Safari were not tested.

## Failures encountered and resolved

| Run | Failure | Resolution |
|---|---|---|
| Route extractor first run | Expected 111 rows but found 112 React declarations | Coalesced the workspace layout and its index at the same URL; retained the index component. All 135 documented patterns then reconciled |
| First real MySQL run and isolated repeat | 2 existing policy assertions failed: `Public catalog is missing FREE`; `expected false but was true` for Pro illustrated maps | Verified source policy and reviewed fixture: hidden Free is not a public offer; paid Pro already includes the illustrated map. Corrected stale assertions without changing entitlements or publication policy. Fresh 35-test run passed |
| First cross-feature browser run | 23 passed / 3 failed: hidden template heading on both projects and a contrast failure | Fixed the toolbar's zero-width title and wrapped controls. Kept contrast checking enabled |
| First broad browser run | 102 passed / 2 failed: notification contrast | Darkened feature-local secondary copy and waited for loaded history, fonts and finite animations. Focused admin rerun passed |
| Intermediate admin rerun | 4 passed / 2 failed because an exact empty-state text check omitted its decorative emoji | Used the actual visible empty-state text. Also fixed fixture language initialization so reload preserves the selected language, with explicit `html[lang]` assertions |
| Live harness development | Ambiguous/collapsed title selectors, an assumption about token storage mode, incomplete publish address data, and test-origin CORS rejection | Selected the explicit English field, captured the real login response without depending on storage mode, supplied publication-required venue address, and allowed only the two loopback browser origins in the test profile. The final real browser and all 21 MySQL tests passed |

No failing suite was silently excluded or disabled. The opt-in live test is skipped by default unless the disposable-schema harness explicitly enables it. Test-only failures above were kept separate from product defects.

## Confirmed product defects and regression evidence

| ID / severity | Reproduction and root cause | Fix / regression |
|---|---|---|
| B11-01 / P1 | Copy a pending recipient's URL/message; the UI called `markShared` and persisted SENT despite no share | Copy-only code no longer writes delivery state; updated unit tests and Batch 8/11 browser assertions |
| B11-02 / P2 | Legacy delivery deep link with `guestId`/anchor lost selected-recipient context | Explicit operational query allowlist/plain anchors; 10 redirect tests plus browser reload/back/forward |
| B11-03 / P2 | Notification action URL was editable/validated but absent from DTO and dispatch payload | Disabled control with bilingual explanation; component/browser payload checks |
| B11-04 / P1 | Creating a PENDING notification showed “sent successfully” | Toast shows the actual server status and states that creation does not confirm delivery; pending response tests |
| B11-05 / P1 | Encoded guest queries, public token path segments, nested secret containers, API-key headers and session notes could escape diagnostic filtering | Normalized recursive redaction across displayed metadata and the entire export payload; focused adversarial cases preserve safe IDs/metrics |
| B11-06 / P2 | Duplicate SSE request frames were omitted from rows but incremented totals repeatedly | Bounded seen-ID filtering precedes metrics; duplicate-frame regression |
| B11-07 / P2 | A late aborted stream response could overwrite reconnect status; clear retained selected details | Ignore aborted connection reads/responses/errors; clear selected detail state; reconnect/selection regressions |
| B11-08 / P2 | Standalone template toolbar squeezed its heading to zero width | Responsive wrapping, available title space, mobile back-link naming; both fullscreen editor routes checked in desktop/mobile Chromium |
| B11-09 / P2 | Notification secondary copy measured 4.42:1 against cream | Darkened feature-local secondary copy; Axe contrast remains enabled |
| B11-10 / P2 | Screenshot review showed the customer menu beyond the 320px viewport: three flex children formed a horizontal bar | Stack the bars in a fixed 44px button; browser assertions check viewport bounds and touch-target size at every narrow representative width; HostNav unit tests 5/5 |

All remaining boundaries and evidence limitations are listed in [remaining gaps](remaining-gaps.md) and [security boundaries](security-boundaries.md). Raw local logs remain ignored because they can contain disposable credentials or personalized URL details. Only sanitized summaries and fictional-data screenshots are committed.

## Exact changed-file manifest

43 files; production API contracts and migrations are unchanged. Generated prior-batch artifacts were restored.

- `apps/backend/src/test/java/com/koupreng/backend/phase7/Phase7CollaborationMySqlTests.java`
- `apps/frontend-admin/src/app/batch11RouteInventory.test.jsx`
- `apps/frontend-admin/src/features/api-monitor/batch11Monitor.test.js`
- `apps/frontend-admin/src/features/api-monitor/useApiMonitorStream.js`
- `apps/frontend-admin/src/features/api-monitor/useQaSessionRecorder.js`
- `apps/frontend-admin/src/features/notifications/AdminNotificationsFeature.jsx`
- `apps/frontend-admin/src/features/notifications/AdminNotificationsFeature.test.jsx`
- `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx`
- `apps/frontend-admin/src/shared/utils/auditSanitizer.js`
- `apps/frontend-admin/src/shared/utils/auditSanitizer.test.js`
- `apps/frontend-user/playwright.batch11-live.config.js`
- `apps/frontend-user/src/app/batch11RouteInventory.test.jsx`
- `apps/frontend-user/src/app/routes/InvitationScopedRedirect.jsx`
- `apps/frontend-user/src/app/routes/InvitationScopedRedirect.test.jsx`
- `apps/frontend-user/src/features/invitations/InvitationDeliveryManager.jsx`
- `apps/frontend-user/src/features/invitations/InvitationDeliveryManager.test.jsx`
- `apps/frontend-user/src/layouts/components/HostNav.css`
- `apps/frontend-user/tests/e2e/batch11-admin-integration.spec.js`
- `apps/frontend-user/tests/e2e/batch11-auth-boundaries.spec.js`
- `apps/frontend-user/tests/e2e/batch11-legacy-redirects.spec.js`
- `apps/frontend-user/tests/e2e/batch11-live-journey.spec.js`
- `apps/frontend-user/tests/e2e/batch11-payment-journey.spec.js`
- `apps/frontend-user/tests/e2e/batch11-route-coverage.spec.js`
- `apps/frontend-user/tests/e2e/batch8-delivery-qr-checkin-wishes.spec.js`
- `apps/frontend-user/tests/e2e/support/batch11AdminFixtures.js`
- `docs/design/BEFORE_AFTER_UI_AUDIT.md`
- `docs/design/FULL_ROUTE_COVERAGE_MATRIX.md`
- `docs/design/UI_MODERNIZATION_ROADMAP.md`
- `docs/design/UI_MODERNIZATION_VERIFICATION.md`
- `docs/qa/batch11/evidence/delivery-en-1440.png`
- `docs/qa/batch11/evidence/delivery-en-320.png`
- `docs/qa/batch11/evidence/delivery-kh-390.png`
- `docs/qa/batch11/evidence/notifications-en-1440.png`
- `docs/qa/batch11/evidence/notifications-en-320.png`
- `docs/qa/batch11/evidence/notifications-km-390.png`
- `docs/qa/batch11/integrated-journeys.md`
- `docs/qa/batch11/remaining-gaps.md`
- `docs/qa/batch11/route-matrix.json`
- `docs/qa/batch11/security-boundaries.md`
- `docs/qa/batch11/test-results.md`
- `docs/qa/batch11/test-summary.json`
- `scripts/qa/routeInventory.mjs`
- `scripts/qa/run-studio-access-mysql.py`
