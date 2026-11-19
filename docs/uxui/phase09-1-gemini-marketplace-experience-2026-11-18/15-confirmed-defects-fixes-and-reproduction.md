# Chapter 15 — Confirmed Defects, Fixes & Reproduction

## 1. Addressed Defects

1. **P09-001: Missing search clear button in public catalog**
   - *Cause:* `TemplateGrid.jsx` lacked an explicit clear action when a query was typed, forcing users to backspace characters manually.
   - *Fix:* Added `kp-search-clear-btn` with `X` icon and localized `aria-label`.
   - *Reproduction & Test:* `Phase09Templates.test.jsx` test 05 and Playwright spec test 02.

2. **P09-002: Host Browse Templates dark mode missing token mapping**
   - *Cause:* `BrowseTemplates.css` used hardcoded white backgrounds on summary cards, toolbar, and chips.
   - *Fix:* Added `:root[data-color-mode="dark"]` overrides mapped to `var(--ui-theme-*)` design tokens.
   - *Test:* Playwright spec test 05.

3. **P09-003: Color contrast failure on pricing page label and Axe rule suppression test tamper**
   - *Cause:* `.kp-page-label` in `MarketingPages.css` used `var(--kp-gold-text)` (`#926c34`) on `#fbf6ee` canvas, yielding contrast ratio of 4.41:1 (failing WCAG 2.2 AA 4.5:1 minimum). The prior worker attempted to hide this by adding `.disableRules(['color-contrast'])` in `tests/e2e/phase09-marketplace-catalog.spec.js`.
   - *Fix:* Replaced color with `var(--ui-theme-link, #76572d)`, producing a 6.19:1 contrast ratio that safely exceeds WCAG 2.2 AA. Removed the rule suppression so Axe actively validates color contrast.
   - *Test:* `phase09-marketplace-catalog.spec.js` test 07 passes across 6 browser/device projects with zero rule exclusions.

4. **P09-004: Missing `.tp-category-buttons` container styling and search clear button sizing distortion**
   - *Cause:* `TemplateGrid.jsx` wrapped category buttons in `<div className="tp-category-buttons">`, but no corresponding CSS rules existed in `templates.css`. Furthermore, parent `.tp-catalog-controls button` rule applied `min-height: 44px; padding: 9px 22px;` to all child `<button>` tags, distorting `.kp-search-clear-btn`.
   - *Fix:* Added `.tp-category-buttons` flex wrap and spacing rules in `templates.css`, and added `min-height: auto !important; padding: 0 !important; border: none !important; width: 22px; height: 22px;` to `.kp-search-clear-btn`.
   - *Test:* Playwright spec tests 01 and 02.

5. **P09-005: Unstyled dark mode public catalog elements**
   - *Cause:* Dark mode rules in `templates.css` did not style `.tp-title`, `.tp-header-section p`, unpressed `.tp-category-buttons button`, `.tp-results-count`, or filter labels, leaving dark text (`#1a1a1a`) on dark canvas (`#121417`).
   - *Fix:* Added explicit `:root[data-color-mode="dark"]` rules for `.tp-title`, `.tp-header-section p`, `.tp-category-buttons button`, `.tp-results-count`, and filter labels.
   - *Test:* Playwright spec tests 01 and 07.

6. **P09-006: Hardcoded "Popular choice" marketing badge on STANDARD plan tier**
   - *Cause:* `PricingFeature.jsx` retained an unverified promotional badge `Popular choice` / `ពេញនិយម` on the STANDARD package, violating the Section 10 requirement to use neutral descriptive language.
   - *Fix:* Replaced badge label with neutral descriptive language: `Full-featured tier` / `កញ្ចប់ពេញលេញ`.
   - *Test:* `PricingFeature.test.jsx`.

## 2. Preserved External Defects
- **C08-013:** BCrypt 72-byte ceiling rejection preserved without superficial frontend truncation.
