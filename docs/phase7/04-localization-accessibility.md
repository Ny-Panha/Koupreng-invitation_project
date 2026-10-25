# Localization and accessibility

Applied the repository `wcag-audit-patterns` skill, with the existing Koupreng UX/Playwright workflows. UI locale remains `km`/`en`, independent of authored invitation language. New guide, publish, guest, team, analytics and package messages include Khmer and English. Existing public invitation artwork, Khmer fonts and authored program/story text were retained.

The development-only `@axe-core/playwright` 4.14.0 integration follows the [official Playwright workflow](https://playwright.dev/docs/accessibility-testing). Scans use WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags without disabling contrast or excluding failing controls. Tested screens: creation, generic guide, decorated Studio, packages, guests, event team, analytics, login and registration, plus publish/import dialogs. Both languages were scanned in Chromium, Firefox and WebKit: 54 screen scenarios plus six dialog scans, all passing in the final run. Native page/dialog semantics, form labels, live save/error announcements, table captions/headers and keyboard-equivalent data remain available.

The first scans found and led to fixes for:

- Low-contrast active host navigation text (2.74:1 before), now using the existing darker gold family.
- Support-button visible/accessibility-name mismatch.
- Template-switch and Khmer preview-button name mismatches.
- An organization role button whose visible label differed from its accessible label.

Keyboard checks found an iframe boundary problem that ordinary DOM focus traps miss. Shared Modal now uses native focus guards and same-origin iframe boundary/Escape handling. It preserves tab order inside the preview, wraps at its boundaries, closes on Escape and restores the trigger. Focus is recovered when asynchronous content replaces its active control. Firefox also exposed an implicit scroll-container tab stop disappearing when the preview loaded; an explicit named, focusable preview scroll region keeps that focus stable. Cross-origin documents are not inspected; the visible close control remains available. Listeners/observers are released on close. Existing nested-dialog/background-inert tests pass.

`final-accessibility-current.log` records **72 passed**: 54 screen scans and 18 keyboard/reflow scenarios, including the six additional dialog scans inside their parent scenarios. `final-focus-explicit-scroll.log` separately records ten consecutive passing Firefox keyboard-preview repetitions after reproducing the intermittent load/focus loss. The current full user suite passes 757 tests. Earlier failing runs are retained privately and superseded by these checks; no rule exclusion or test retry hides them. Increased spacing, 320/640px reflow equivalents and 200% root text sizing were exercised; representative Khmer/mobile captures were inspected.

Automated checks do not establish complete WCAG conformance. Human screen-reader reading order/pronunciation, physical touch devices, browser chrome zoom and independent Khmer editorial review remain unverified. No screen-reader or production certification is claimed.
