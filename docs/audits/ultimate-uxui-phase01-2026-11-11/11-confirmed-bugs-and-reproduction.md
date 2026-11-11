# Current failures and historical defect reconciliation

Baseline: `2ae3173f`. Current command: `node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js phase02-foundations.spec.js --project mobile-chromium --output output/playwright/uxui-phase01-2026-11-11/au-browser-results`. Result **13 passed / 3 failed / 0 skipped**. Fictional fixtures, mobile Chromium emulator. Fail screenshots and traces remain at the output path.

The six targeted AU tests were also run with `--grep 'AU-00' --project mobile-webkit --project mobile-firefox`; **12/12 passed**. Thus all six AU cases have a current passing targeted assertion in three installed engines. This still does not certify physical Safari/Android or every related state.

| ID | Current status and evidence | Severity / next check |
|---|---|---|
| AU-001 clipped admin mobile preview | **PASS targeted** at current 390px fixture. `AdminTemplateEditFeature.jsx:1666` has an Edit/Preview switch; source no longer has the original fixed combined minimum panes. | Historical P1 **fixed in tested scope**; real phone, short viewport, admin mutation still unverified. |
| AU-002 unnamed preview link | **PASS targeted**. Current `AdminTemplateEditFeature.jsx:1648` has English/Khmer `aria-label`; the later bilingual exact-copy assertion fails because it expects an older Khmer phrase. | Historical P1 **fixed in targeted fixture**. Update stale assertion after agreeing current copy. |
| AU-003 mouse-only divider | **PASS targeted**. `StudioPanelResize.jsx:9–33` has named separator, values, arrows/Home/End and pointer/button alternatives. | Historical P2 **fixed in tested scope**; AT/physical touch unverified. |
| AU-004 guest-note contrast | **PASS targeted** at current fixture; `.guest-note summary` uses `--guest-gold` in `GuestWorkspace.css:138`. | Historical P2 **fixed in tested scope**; broaden theme/state checks. |
| AU-005 admin subtitle/badge contrast | **PASS targeted**; current badge is in `AdminUsersFeature.jsx:323`. | Historical P2 **fixed in tested scope**; broaden actual data/theme checks. |
| AU-006 login footer contrast | **PASS targeted**. | Historical P2 **fixed in tested scope**; widen locale/browser checks. |

Three **current FAILs** are retained separately from historical AU defects:

1. **QA-NEW-01, confirmed stale assertion, P2.** At `/app/events/new` in Khmer, `phase02-foundations.spec.js:196` expects a button named `បន្ទាប់`; current `EventCreatePage.jsx:1038` renders `បន្ត` and the screenshot shows the active fixed-footer action. Expected test behavior: match the current intentional label and activate the visible control. Actual: `getByRole('button', { name: 'បន្ទាប់' }).first()` finds none. A source/copy review must settle final wording before updating the contract. Evidence: `.../phase02-foundations-Khmer--cfd9f-ctive-controls-create-event-mobile-chromium/test-failed-1.png`.
2. **QA-NEW-02, confirmed stale assertion, P2.** Khmer Studio test at `phase02-foundations.spec.js:211` expects `បើកគំរូធៀបក្នុងផ្ទាំងថ្មី`; source `AdminTemplateEditFeature.jsx:1648` supplies `បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី`. The targeted accessible-name test passes; review translation then update exact-copy assertion. Evidence: `.../phase02-foundations-Studio-1369d--usable-in-km-and-dark-mode-mobile-chromium/test-failed-1.png`.
3. **QA-NEW-03, observed responsive risk, P2 pending reproduction.** In the multi-width Studio test, `phase02-foundations.spec.js:159`, after switching to Preview in short landscape, `toBeInViewport({ratio:.95})` reads **0.6689537** for the iframe. The screenshot shows the invitation frame and long scroll content; this ratio alone cannot prove an essential control is unreachable. Repeat with actual frame geometry, scroll range and hit testing at the failing width/height; classify as product bug only if content/actions cannot be reached. Evidence: `.../phase02-foundations-respon-37324--all-sections-across-widths-mobile-chromium/test-failed-1.png` and trace.

No P0 is confirmed. Do not rewrite these three as passes or as three confirmed product outages. The old QA-001/002 failures were reported fixed in `docs/phase02-foundations/`; current label drift and iframe expectation show that test contracts need maintenance after subsequent phases.
