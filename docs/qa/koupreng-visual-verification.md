# Koupreng visual verification

## Evidence scope

Branch: `feature/premium-ux-overhaul`, starting from local HEAD `585e9217`. Current work integrates the inherited unfinished UI changes without resetting newer local features. Verification dates: October 20-21, 2026 (Asia/Bangkok).

Screenshots are real Chromium renders with browser-only contract responses from `tests/e2e/support/{uxFixtures,studioFixtures,overhaulFixtures}.js`. Production components continue calling their real service modules. Fixture host/event IDs, QR URLs and payment orders are synthetic. A rendered fixture page is not a claim of real provider delivery or payment activation.

## Completed checks

| Command | Observed result |
|---|---|
| `npm --prefix apps/frontend-user test -- --maxWorkers=4` | 101 files / 542 tests passed; exit 0; 108.01 s. Happy DOM font/map warnings and worker shutdown timeout notices remain environment noise. |
| `.\mvnw.cmd test '-Dstyle.color=never'` from `apps/backend` | 539 tests run: 508 passed, 31 skipped, 0 failures/errors; BUILD SUCCESS; 1:33. This includes architecture and H2 integration checks. |
| `npm --prefix apps/frontend-user run lint` | Passed after excluding generated Playwright result/report directories from traversal. |
| `npm --prefix apps/frontend-user run build` | Passed. The pre-existing missing golden-template SVG warning remains documented below. |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | Passed: 0 missing/checksum errors. |
| `python scripts/validate-agent-routing.py` | Passed: 58 valid skills, 0 errors; existing duplicate React skill-name notice. |
| Broad route capture with `UX_ALL=1`, `UX_WIDTHS=390,1440` | 64 concrete routes, 256 renders in Khmer/English, 0 navigation failures and 0 uncaught page errors. |
| Core follow-up capture | 32 renders; 0 uncaught page errors, 0 clipped essential controls, 0 console errors and 0 failed requests. |

The completion section records the final browser suite and geometry refresh. Overlapping runs must not be summed into one inflated pass count.

## Browser scenarios and measurements

`premium-workspace.spec.js` checks featured single-event presentation/search, desktop/sidebar/mobile disclosure, keyboard recovery, explicit event switching, a real-state preparation checklist without empty metrics, one guest-add action, modal focus restoration, the actual publishing route, QR PNG download/decoding, wish-delete confirmation, the iPhone viewport through fit/manual zoom/desktop/reset, an unobtrusive support launcher, and the actual `checkedIn` backend field.

Existing suites additionally check event denial/refresh/legacy routing, form creation with the returned event ID, public/admin authentication boundaries, personalized public tickets before RSVP, serialized autosave/undo/failure recovery, palette/font/media persistence, all four ticket layouts with 1200 x 1800 and 1800 x 2700 PNG exports and QR decoding, public invitation opening/focus/RSVP error recovery, packages, pending checkout and payment status.

Responsive checks cover 320, 375, 390, 430, 768, 1024, 1440 and 1920 CSS pixels for studio/tickets and packages/event creation, plus the existing workspace matrix. Reduced-motion mode is used for stable geometry captures. A separate animated invitation test retains normal motion. The 200% check uses a 720 CSS-pixel viewport at device scale 2; native browser zoom and native Safari remain manual checks.

The broad inventory initially flagged 10 rows with off-screen controls: intentional RSVP/check-in table scrolling and template-category scrolling, plus check-in/media outer containers using viewport width beside the sidebar. The outer container defect was fixed. The final metric distinguishes controls inside the actual `.k-responsive-table-container`, `.guest-table-wrap`, `.rsvp-table-wrapper`, `.tb-categories` and preview scroll regions. Those scroll regions are recorded separately, not claimed to be page overflow.

Color calculation against white: suggested gold `#967037` was 4.497:1, so action gold is `#926C34` at 4.755:1. Dark gold `#76572D` is 6.622:1; teal `#0F766E` is 5.473:1. These calculations verify those pairs, not every legacy template color or accessibility certification.

## Visual evidence

- Owner references: all five `BADUI.zip` images were inspected; the untouched input ZIP is intentionally not committed.
- `ux-overhaul/before/`: 32 captures of the inherited partial redesign before this continuation.
- `ux-overhaul/routes/`: 256 captures and `measurements.json`, covering the 64-route inventory.
- `ux-overhaul/after/`: fresh core renders and measurements after the layout/interaction repairs.
- `ux-overhaul/studio-tickets/`: eight-width bilingual studio/designer images and decodable export files from the current suite.
- `ux-overhaul/workflows/`: durable featured-event and iPhone preview screenshots copied from Playwright output.

The root-level images already present in `ux-overhaul/` are earlier retained artifacts, not the source of current pass counts. Historical `docs/qa/studio-tickets`, `docs/qa/ux-ui` and Silk Heritage evidence is preserved; test-generated overwrites are restored rather than silently replacing prior verification history.

## Failures investigated

- Initial inherited JSX had unused imports and orphaned guest-toolbar props; lint findings were repaired.
- The first unit run found one changed human-readable denial string assertion; access denial remains explicit and the module still never mounts without permission.
- Assertions expecting a printed private QR token and the earlier bilingual publish label were updated to the intentional privacy/localization contracts. The returned image and authorized download remain tested.
- Two tests exceeded 5 seconds during an unbounded concurrent unit/browser run. The bounded full rerun passed all 542 assertions; timeouts are not counted as passes.
- ESLint raced Playwright's generated `test-results` directory removal. Generated reports/results are now explicitly ignored; application/test source remains linted.
- The first broad browser run recorded 133 passed / 3 failed / 2 skipped. One failure exposed the legacy `display:none !important` rule that suppressed mobile studio preview; the rule is now scoped to the legacy editor. The other two were 30-second timeouts during concurrent work. The final bounded browser run is reported separately.
- An attempted capture against the previously running 5173 dev server encountered connection refusal after that process disappeared. No existing user process was restarted. A separate owned production preview on 4183 supplied the completed inventory.

## Limits and release gates

P1 release gates remain open: 31 environment-gated backend tests; disposable MySQL 8 fresh/upgrade execution including applicable V37-V39 migrations; real ABA/Telegram reconciliation and trusted alert ingestion; configured email/social providers; physical camera/native sharing and Safari behavior. The real-HTTP browser test is skipped unless `UX_LIVE_BACKEND` points to an explicitly disposable backend. No production database or provider data was modified.

P2: the existing `/templates/cover-khmer-golden-wedding/cover-bg.svg` is missing from the public assets and produces a build warning. It must be supplied from the intended template artwork. Do not replace a teammate's design with unrelated placeholder art. Comprehensive human Khmer copy, screen-reader and native keyboard/zoom review remains manual. Collaboration remains deferred by the earlier product scope.

Performance evidence is limited to the production build: the main entry is approximately 427 kB / 125.38 kB gzip, with existing lazy route/template chunks. No dependencies were added. This is bundle evidence, not a Lighthouse/Core Web Vitals or production latency claim.

## Reproduce and manually review

1. Build the user frontend with `npm --prefix apps/frontend-user run build`. Run a separate loopback preview, for example `npm --prefix apps/frontend-user run preview -- --host 127.0.0.1 --port 4183 --strictPort`.
2. For fixture captures in PowerShell, set `$env:UX_BASE_URL='http://127.0.0.1:4183'`, `$env:UX_PHASE='after'`, `$env:UX_WIDTHS='390,1440'`, then run `node scripts/qa/capture-ux-overhaul.mjs`. `UX_ALL=1` includes the entire inventory; `UX_ROUTES` filters comma-separated paths from that inventory. Set `UX_ALL=1` when selecting non-core routes.
3. Run the browser suites with the exact command in the completion section. Playwright starts its isolated user/admin preview ports. Run lint after generated outputs settle, or use the current ignore configuration. Keep workers bounded on this machine.
4. With the normal configured local stack and a real authorized account, create/save/reopen a draft; switch between events and verify ownership denial; edit invitation/media, test save failure and recovery; review/publish; add/edit a guest; preview/download that guest's ticket; copy/share a permitted link; review delivery, RSVP and check-in. Use configured staging recipients for real provider actions.
5. In the studio choose Preview on mobile. Confirm the iPhone 18 Pro Max chrome, cover/full controls, scroll, fit, zoom, desktop mode and fullscreen. The iframe remains a web renderer: physically verify Safari and safe-area/native browser chrome separately.
6. Check keyboard Tab/Escape in host/module menus, guest/payment/wish dialogs and public ticket dialogs. Verify reduced motion, long Khmer names, native 200% zoom and on-screen keyboards. Ensure the closed support launcher remains below page controls.

No push, merge, production deployment/restart, DNS change, price alteration or artificial payment/entitlement activation was performed.

## Final completion results

| Command / evidence | Final observed result |
|---|---|
| `npm --prefix apps/frontend-user run test:e2e -- premium-workspace.spec.js event-workspaces.spec.js studio-tickets.spec.js critical-routes.spec.js silk-heritage.spec.js route-smoke.spec.js ux-ui-redesign.spec.js --workers=1` | **140 passed, 2 skipped, 0 failed**, 11.2 min. Both skips require the explicitly configured disposable live backend. |
| `npm --prefix apps/frontend-user run test:e2e -- premium-workspace.spec.js --workers=2` after final presentation changes | **20 passed**, 30.4 s, including draft delivery disclosure, the iPhone viewport, support launcher and server check-in value. This overlaps the full browser run. |
| `npm --prefix apps/frontend-user test -- src/features/invitations/InvitationDeliveryManager.test.jsx src/features/qr/qrContract.test.jsx src/features/events/workspace/EventWorkspace.test.jsx --maxWorkers=1` | **3 files / 9 tests passed**, 3.75 s. These overlap the 542-test suite. |
| `python -m pytest apps/telegram-bot/tests -q` | **72 passed**, 1.33 s; 2 existing FastAPI/Starlette deprecation warnings. No worker source changed. |
| Final frontend build and lint | Both exit 0; Vite build **1.08 s**. Entry **426.99 kB / 125.38 kB gzip**. |
| Final `after/measurements.json` | **32 core renders**, 0 uncaught page errors, 0 clipped essential controls, 0 console errors and 0 failed requests. |
| `followup/measurements.json` | **32 additional check-in/media renders**, covering all eight widths and both languages: 0 clipped essential controls, 0 console errors and 0 failed requests. |
| `git diff --check` | Exit 0; normal CRLF-to-LF notices only. |

The 64-case broad inventory remains at `routes/measurements.json`; the 32 final core renders and 32 module follow-ups replace its earlier core/container findings for acceptance. Expected controls within intentional horizontal scroll regions are classified separately. The detailed test runner output is retained locally in ignored `.cache/ux-overhaul-*.log` files.

Current workflow images:

- [iPhone 18 Pro Max on mobile](ux-overhaul/workflows/premium-workspace-iPhone-1-22eb6-wport-when-fitted-or-zoomed-mobile-chromium-iphone-18-pro-max-preview.png)
- [iPhone 18 Pro Max on desktop](ux-overhaul/workflows/premium-workspace-iPhone-1-22eb6-wport-when-fitted-or-zoomed-desktop-chromium-iphone-18-pro-max-preview.png)
- [Featured event on desktop](ux-overhaul/workflows/premium-workspace-single-e-cffb2-d-has-one-management-action-desktop-chromium-featured-event.png)
- [Final unpublished delivery on mobile](ux-overhaul/after/delivery-km-390.png)

Implementation is ready for local review. The MySQL/provider/physical-device gates and missing legacy artwork described above remain open and are not converted into passes by this UI work.

Verified local implementation milestones: `25027ffc` workspace/events/overview, `db87534c` focused studio/iPhone/tickets, and `3a5543dd` guest/delivery/QR/wishes/support flows. The documentation, browser regressions and retained evidence are saved in the following QA commit. These commits remain local.
