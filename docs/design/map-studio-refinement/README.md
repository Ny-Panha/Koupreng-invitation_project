# Map Studio and upgrade recommendations refinement

Base: `9d3008f4970cd7666b3049b0394a9796b0f39bba`. Implemented directly on `main`, 29 October 2026.

Map Studio now uses readable, consistently sized tool symbols rather than miniature full-map thumbnails. Landmark artwork is shared with the public renderer. Bilingual search finds tools across categories and filters presets; clearing search retains keyboard focus. Searching does not change the saved map or create history entries. Layer rows also show their element symbol.

Upgrade recommendations now include an original venue-map illustration, a clearer suggested-plan badge and more compact price/benefit cards. The map-specific package page has a concrete title and removes empty description gaps. Recommendations still use verified server eligibility, prices and benefits; the highlighted option is not presented as cheapest or most popular. Checkout, payment activation and role permissions are unchanged.

The visual changes support light/dark themes, Khmer/English, keyboard navigation and responsive layouts. Existing SVG artwork/fonts are reused; no dependencies or external assets were added. The new decorative upgrade illustration is original vector artwork.

## Evidence and checks

- [Desktop editor](evidence/map-desktop.jpg), [mobile tool library](evidence/library-mobile.jpg), [mobile properties](evidence/properties-mobile.jpg)
- [Upgrade recommendations](evidence/upgrade-desktop.jpg), [Khmer dark recommendations](evidence/upgrade-khmer.jpg), [package page](evidence/plans-desktop.jpg)
- [Actual test results and commands](evidence/test-results.json)

Verification covers 108 focused Vitest tests, Studio editing/history/export and purchase regressions, bilingual search and keyboard focus, scoped axe checks, production build/lint, and eight normal visual comparisons. The final search-focus recheck overlaps the broader suites; counts are not additive. See the JSON for pass/skip counts and durations.

Screenshots use fictitious browser API fixtures and example prices. Verification uses Chromium on Windows with mobile emulation, not live bank transactions or real mobile hardware. No backend/database or production deployment changes were made. Public invitation tests retain the check that the editor is not loaded on guest pages.
