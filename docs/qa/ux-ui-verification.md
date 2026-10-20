# Koupreng UX/UI verification

Local branch: `feature/event-first-workspaces`. This follow-up replaces the six-step onboarding with a single form, redesigns subscription packages/history/checkout presentation and fixes route-audit findings. It does not change backend production behavior or schema.

## Results

| Command / scope | Actual result |
|---|---|
| `npm --prefix apps/frontend-user test` | **531 passed**, 98 files, 20.87 s |
| `npm --prefix apps/frontend-admin test` | **80 passed**, 16 files, 11.51 s |
| `.\mvnw.cmd test '-Dstyle.color=never'` from `apps/backend` | **527 run: 497 passed, 30 skipped, 0 failures/errors**; BUILD SUCCESS, 1:09 |
| Targeted backend auth/payment/subscription/draft/architecture run | **171 run: 163 passed, 8 environment-gated skips**, 0 failures/errors; 1:12 |
| User `test:e2e -- ux-ui-redesign.spec.js critical-routes.spec.js silk-heritage.spec.js --workers=2`, with disposable `UX_LIVE_BACKEND` | **58 passed**, 2.7 min, desktop and mobile Chromium; stable final application build |
| Final geometry/modal evidence: `test:e2e -- ux-ui-redesign.spec.js --grep 'eight widths\|pending payments\|Khmer checkout\|zoom equivalent' --workers=2` | **10 passed**, 1.6 min; additionally asserts the mobile CSS viewport never expands beyond the requested width and captures readable modal viewports |
| Earlier user `test:e2e -- event-workspaces.spec.js critical-routes.spec.js silk-heritage.spec.js route-smoke.spec.js --workers=2` | **92 passed**, 1.7 min; includes event switching/denial/legacy links and user/admin route shells. Overlaps the final 58; counts must not be summed |
| User/admin `npm run lint` | Passed, exit 0 |
| User/admin `npm run build` | Passed, final build durations 1.27 s / 1.24 s |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | Passed: 0 missing files / 0 checksum errors |
| `python scripts/validate-agent-routing.py` | Passed: 58 valid skills / 0 errors |
| `git diff --check` | Passed; normal repository CRLF-to-LF notices only |

The user frontend suite emits Happy DOM external stylesheet/Google Maps iframe loading warnings while its assertions pass. These are retained as environment noise, not represented as successful external-provider calls. Unchanged Telegram code was not retested in this frontend-focused follow-up.

Local raw command output is in the ignored `.cache/ux-ui/` directory: `user-tests-final.log`, `admin-tests.log`, `backend-full-tests.log`, `backend-tests.log`, `browser-final-stable.log`, `regression-browser-tests.log`, lint/build logs and integrity logs. The durable counts and limitations are recorded here; no secrets or bearer tokens are included in retained screenshots or audit files.

To reproduce the rendered inventory, build the user frontend, start its preview on loopback 4183, then run `node scripts/qa/audit-user-route-ui.mjs` from the repository root. It uses the declared contract fixtures and writes screenshots plus measurements. `UX_AUDIT_ROUTES` optionally selects comma-separated route instances and merges refreshed evidence with the existing inventory.

## Browser evidence and provenance

The [route audit](../audit/ux-ui-route-audit.md) includes all actual source route families, nested event modules, dynamic parameters, redirects and protected/public boundaries. [Rendered measurements](ux-ui/rendered-route-audit.json) cover **63 concrete route instances in two configurations: 390 px Khmer and 1440 px English, 126 renders**. The final inventory recorded **0 uncaught page errors and 0 failed requests**. Intended scrollable tables/category strips are distinguished from clipped essential controls.

The package and event form are additionally checked in **both languages at 320, 375, 390, 430, 768, 1024, 1440 and 1920 px**. Profile, overview, guests, gifts, RSVP, seating, check-in and payment status are revisited at 320/768/1440. Checks include root/control bounds, three-card desktop pricing, actual mobile history, header clearance, recommendation selection, validation focus, tab restoration, exact returned event ID and payment modal focus containment. The 200% check uses a 720 CSS-pixel viewport at device scale 2 to exercise equivalent desktop reflow. Native browser zoom and full assistive-technology certification remain manual checks.

Application components continue calling their real service modules. Browser contract responses are supplied only inside `tests/e2e/support/uxFixtures.js`; screenshots containing `Audit Host`, event IDs 101/102/103, or `SUB-AUDIT-*` are declared fixtures. No mock account data, invented plan price or forced activation was added to application code. The existing Silk Heritage suite tests public opening, focus/keyboard behavior, a guest token, RSVP API failure, retry and confirmed success.

The live-browser test uses **real HTTP against an independently started backend on loopback 8082 with disposable H2**, without fixture responses. It registers ordinary test users, saves a birthday draft with only a title, verifies the returned server ID, refreshes that exact workspace and repeats the original request to verify the same ID. Actual template compatibility and paid entitlement denial are also exercised by `EventDraftPersistenceTests` against real Spring/JPA/H2. Live H2 evidence is not fresh/upgrade MySQL/Flyway evidence.

Read-only checks against the pre-existing backend on 8080 returned HTTP 200 for public packages (3), active catalog (5) and birthday recommendations (1). Its aggregate health returned 503. No existing Java/frontend process was stopped or reconfigured. A separate Vite development server was started on 5183 with `BACKEND_PORT=8082`; its login rendered and had no pending requests in the diagnostic check. A separate production preview on 4183 was used for the rendered route inventory.

## Retained screenshots

| Surface | Before | After |
|---|---|---|
| Desktop packages | [Original](ux-ui/before-packages-1440.png) | [Khmer](ux-ui/responsive/packages-km-1440.png), [English](ux-ui/responsive/packages-en-1440.png) |
| Mobile packages | [Original](ux-ui/before-packages-390.png) | [Khmer](ux-ui/responsive/packages-km-390.png), [English](ux-ui/responsive/packages-en-390.png) |
| Desktop creation | [Six-step page](ux-ui/before-event-create-1440.png) | [Complete Khmer form](ux-ui/responsive/event-create-km-1440.png), [English](ux-ui/responsive/event-create-en-1440.png) |
| Mobile creation | [Six-step page](ux-ui/before-event-create-390.png) | [Complete Khmer form](ux-ui/responsive/event-create-km-390.png), [English](ux-ui/responsive/event-create-en-390.png) |
| Khmer checkout | — | [Mobile viewport](ux-ui/responsive/subscription-checkout-km-mobile-chromium.png) |
| Pending checkout | — | [Desktop](ux-ui/responsive/subscription-checkout-pending-desktop-chromium.png) |
| Real H2 draft | — | [Desktop](ux-ui/responsive/real-http-draft-desktop-chromium.png), [mobile](ux-ui/responsive/real-http-draft-mobile-chromium.png) |
| Other routes | Initial seating/check-in/payment-status images in `ux-ui/before-*` | 126 linked screenshots in the route audit; all primary-page widths in `ux-ui/responsive/` |

## Failures found and resolved

- Initial running Vite on 5173 returned HTML but did not render an H1 within 30 seconds. The independent 5183 development server later rendered login; the separate preview supplied reproducible audit evidence. No existing process restart was used.
- The first disposable H2 backend launch attempted MySQL Flyway SQL. It failed before verification. Relaunching with explicit `--spring.flyway.enabled=false`, H2 datasource/driver/platform and `create-drop` started successfully. This does not validate V37.
- An unquoted Windows Maven `-Dstyle.color=never` argument was split into an invalid lifecycle phase. The quoted command ran successfully; it was a command invocation error, not a failed backend test.
- The initial browser assertion incorrectly expected mobile history cards at 768 px. The implementation intentionally uses the readable table from 768 px. The assertion now checks the actual responsive contract.
- Audit fixture corrections supplied the actual slug lookup endpoint and correct paid-access/receipt response shapes. The misleading initial neutral demo was a fixture error. Separately, source inspection found and fixed the real host preview's registry-only cold-load fallback.
- One intermediate browser run recorded **15 passed / 1 failed** with `Unable to preload CSS .../Modal-D30wvxe3.css` because assets were rebuilt while the session was open. The final stable run passed **58/58** without a concurrent rebuild. Failed results were not counted as passes.

## Significant files

| Files / directory | Change |
|---|---|
| `features/subscriptions/SubscriptionPackagesPage.{jsx,css}` | Responsive comparison, truthful current state, history/actions, checkout and FAQ |
| `features/subscriptions/subscriptionService.js` | Preserve explicit null data |
| `features/events/onboarding/EventCreatePage.{jsx,css}`, `eventCreation.js` | One complete form, conditional validation, recommendation states, premium access, retained request identity and draft handling |
| `features/events/onboarding/{EventFields.jsx,eventFields.js}`, `app/routes/hostRoutes.jsx` | Shared configured fields/map URL and renamed route component; obsolete `EventWizard.jsx` removed |
| `shared/styles/workspace-ui.css`, `styles/index.css` | Shared account tokens and corrected Tailwind reset layer |
| `layouts/{HostShell.css,components/HostNav.jsx}`, `shared/ui/ChatBot.jsx` | Header spacing, inert closed navigation, canonical active link and unobtrusive host support |
| Seating/check-in/payment CSS | Repair narrow-grid sizing and actual QR grid breakpoint |
| Payment status/history/receipt/QR components | Require matching verified responses, display actual currency/amount and retain the retry DTO contract |
| `features/templates/pages/{HostTemplateDemoFeature,TemplateDemoFeature}.jsx`, `experience/TemplateExperience.jsx` | Authoritative cold preview, unavailable recovery, neutral language and legible loading state |
| New/updated component tests and `tests/e2e/{ux-ui-redesign,event-workspaces}.spec.js` | Workflow, security-state, responsive and preview regression coverage |
| Backend `EventDraftPersistenceTests.java` | Real HTTP/JPA title-only draft, missing-title rejection and request replay regression |

Paths in this table are relative to `apps/frontend-user/src` unless otherwise stated. Backend production code, historical migrations and API contracts were not changed.

## Remaining release gates and manual verification

The **30 skipped MySQL tests remain unresolved**, covering auth, guest mutation, entitlement, fresh database, migration upgrade, media, payment evidence, reporting, RSVP performance, Silk Heritage migration and subscription integrity. Execute them against a disposable MySQL 8 database and verify V37 on fresh/upgrade paths before release. Existing live catalog reads are not a substitute. Real ABA/Telegram reconciliation, media/delivery/social integrations, camera/scanner hardware and password-reset delivery need configured staging providers. Event collaboration and staff support grants remain deferred.

Manual review with the normal configured local stack:

1. Open `/app/packages` and `/app/events/new` in Khmer and English. Compare desktop/mobile screenshots; check native 200% zoom, keyboard focus and reduced motion.
2. Change event type through all six options after entering a title/venue. Confirm shared details remain and only appropriate participant labels appear.
3. Change style/language/price, preview a compatible template in a new tab and return. Confirm entered values persist; premium designs show verified access or a purchase path.
4. Submit an incomplete event: focus should move to the first invalid field. Fill required fields and create; confirm navigation uses the returned ID. Separately save a title-only draft, refresh and retry without a duplicate.
5. Within the account's actual quotas, switch between two events through guests/gifts/RSVP. Confirm each module remains under the selected ID and another account cannot access it.
6. Compare package prices, currency, validity, quotas and current subscription to the backend. Reopen an existing pending order instead of starting another. Validate payer name/last3; submitting details must keep access pending until trusted verification.
7. Check pending/review/active/expired/failed/cancelled history and paid receipt states using controlled staging records. Verify keyboard/modal close restores focus.
8. Check seating/check-in input bounds on a real phone; horizontally scroll remaining data tables to reach actions. Exercise camera/scanner hardware and provider operations separately.

No push, merge, production deployment/restart, DNS update, payment transfer or artificial entitlement activation was performed.
