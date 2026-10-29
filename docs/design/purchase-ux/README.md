# Map Studio and package purchase UX

Implemented on `main`, based on `18bfb1aa2a075a571c632d5504555edcf990d418`, on 29 October 2026.

Map Studio now has a larger canvas, a floating tool strip, clearer element controls, grouped properties and an expandable typography/color section. Mobile panels, keyboard editing, touch gestures, save/history and exports continue to use the existing implementation.

Upgrade recommendations now show the current plan, verified benefits, readable prices/terms and a clear primary choice. Only server-eligible plans appear. The first eligible catalog option is emphasized without claiming it is cheapest or most popular. The package page preserves the requested feature, selected plan and return destination, and shows plan choices before usage details.

Checkout uses an order summary and an explicit Details → Payment → Activation flow. It has focused validation, required field semantics, a persistent action footer, disabled controls while creating an order and distinct waiting/review/expired/failed/activated states. A manual status check can recover from a temporary error. Resuming an order avoids another purchase; confirmed activation refreshes verified benefits. The bank link remains available if a browser blocks the automatic popup, without a misleading popup warning.

The design applies visual grouping, progressive disclosure, clear action hierarchy, reachable controls, visible system status and error prevention. Khmer/English and light/dark themes are supported. Existing fonts and Lucide icons are reused; no dependency or new external asset was added.

Payment rules remain authoritative on the server. The browser submits only package ID, payer name and the last three account digits. Prices/currencies, duplicate-order checks, payment reconciliation and activation checks are preserved. A paid order under review is not shown as activated. No backend code, database, production configuration or real payment was modified by this change.

## Evidence

- [Map Studio](evidence/map-desktop.jpg), [mobile tools](evidence/map-mobile.jpg), [properties](evidence/properties-mobile.jpg)
- [Upgrade recommendations](evidence/upgrade-desktop.jpg), [Khmer dark recommendations](evidence/upgrade-khmer.jpg), [package choices](evidence/plans-desktop.jpg)
- [Checkout](evidence/checkout-desktop.jpg), [Khmer mobile checkout](evidence/checkout-khmer-mobile.jpg)
- [Waiting](evidence/payment-waiting.jpg), [review](evidence/payment-review.jpg), [activation](evidence/payment-active.jpg), [expired](evidence/payment-expired.jpg), [failed](evidence/payment-failed.jpg)
- [Test results](evidence/test-results.json)

Screenshots use fictitious browser fixtures, including example package prices. They are not private account records or evidence of a live bank transaction.

## Verification

Actual results and command details are recorded in `evidence/test-results.json`. Verification includes the full user Vitest suite, production build, lint, routing/skill integrity, Studio regression, purchase payload/duplicate prevention, transient-error recovery, all payment states, keyboard focus, 200% zoom, scoped axe WCAG checks and normal Playwright screenshot comparisons without snapshot updates.

| Check | Result |
| --- | --- |
| Full user Vitest | 1,189 passed, 162 files, 138.47 seconds |
| Final checkout/access recheck | 21 passed, 2.42 seconds; overlaps the full suite |
| Playwright regression | 64 passed, 12 planned skips, 4.8 minutes |
| Visual comparisons | Eight passed without updating references |
| Scoped axe accessibility | Zero violations in tested screens/states |
| Production build / lint / routing / skill integrity | Passed; build 1.86 seconds |

The browser skips are duplicate explicit viewport/visual runs and two optional live-backend cases. Legacy test expectations were corrected for occupied `auto-fit` columns, the tablet breakpoint and the existing guided Studio destination after event creation.

Map layouts are covered at the existing eight requested viewport sizes. New checkout checks cover 320-pixel short screens, 390-pixel phones, desktop, English/Khmer and light/dark themes. Visual references cover map designer 375/1440, upgrade dialog 375/1440 and checkout 390/1440. Two existing demo calendar references also remain in the comparison set.

Browser verification uses Chromium on Windows and API fixtures. It does not establish Safari/Firefox/hardware compatibility, production Core Web Vitals or live bank settlement. Backend suites were not rerun for this frontend-only change. Guest-renderer tests continue to assert that the designer is not loaded on public invitations. No production deployment was performed.
