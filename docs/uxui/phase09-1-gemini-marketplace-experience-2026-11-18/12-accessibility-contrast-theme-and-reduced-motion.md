# Chapter 12 — Accessibility, Contrast, Theme & Reduced Motion

## 1. WCAG 2.2 AA Audit Findings

- Automated Axe audit executed across 6 browser/device projects on `/templates` and `/pricing`: **0 violations with full rule enforcement (including color-contrast active)**.
- **Color contrast defect fixed (P09-003):** The prior attempt disabled Axe's `color-contrast` rule to hide a 4.41:1 contrast failure on `.kp-page-label` in `/pricing`. This was repaired by updating the foreground color to `var(--ui-theme-link, #76572d)`, yielding a 6.19:1 ratio (>4.5:1 requirement). The rule suppression was removed from `tests/e2e/phase09-marketplace-catalog.spec.js`.
- **Public catalog dark mode contrast (P09-005):** Added explicit dark mode styling for `.tp-title` (`#f1f5f9` on `#121417`, 15.2:1 contrast), `.tp-header-section p`, category buttons, result counts, and filter labels.
- Theme support: Dark mode utilizes obsidian/canvas base (`#121417` / `#0B111A`) with muted bronze/gold accents and high contrast text (`#F1F5F9`).
- `prefers-reduced-motion`: Disables non-essential entrance transitions while immediately rendering critical content, pricing, and CTAs.
- Limitations: Physical screen reader verification (VoiceOver/TalkBack) and Windows forced-colors probe remain external/review gates.
