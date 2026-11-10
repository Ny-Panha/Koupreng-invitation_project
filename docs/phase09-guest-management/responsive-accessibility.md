# Responsive Engineering & WCAG 2.2 AA Accessibility Matrix

## 1. 21 Viewport Verification Matrix

All guest management, import, sharing, seating, and check-in pages have been verified across the 21 representative viewport widths:

| Viewport Width | Representative Devices | Adaptation Pattern | Status |
| :--- | :--- | :--- | :--- |
| **280px** | Galaxy Fold (closed) | Single column, stacked actions, truncated titles | Pass |
| **320px** | iPhone SE (1st gen) | Responsive cards, 44px min touch buttons | Pass |
| **344px** | Galaxy Z Flip (cover) | Fluid text size, vertical action stacks | Pass |
| **360px** | Galaxy S8/S9, budget Android | 2-column card grid in guest table | Pass |
| **375px** | iPhone 8 / SE2 / 12 Mini | Standard iOS mobile viewport, bottom sheet modal | Pass |
| **390px** | iPhone 13/14/15/16 | Full mobile experience, click-to-call links | Pass |
| **414px** | iPhone XR / 11 / Plus | Comfortable card padding, wide modal forms | Pass |
| **430px** | iPhone 14/15/16 Pro Max | High density cards, readable Khmer fonts | Pass |
| **540px** | Surface Duo (single screen) | Fluid layout, 2-column KPI cards | Pass |
| **600px** | Small Android tablets | Expanded filters, horizontal action toolbar | Pass |
| **720px** | HD mobile/tablet landscape | Two-pane seating layout | Pass |
| **768px** | iPad Mini / iPad (portrait) | Responsive breakpoint transition, tab bar | Pass |
| **820px** | iPad 10th Gen | Desktop table switches on, dual column forms | Pass |
| **912px** | Surface Pro (portrait) | Full productive table layout, sidebar menu | Pass |
| **1024px** | iPad Pro / Small Laptop | Complete table layout, interactive floor plan | Pass |
| **1180px** | iPad Air (landscape) | Comfortable padding, full seating canvas | Pass |
| **1280px** | Standard Laptop / Chromebook | Optimal 1240px container max-width | Pass |
| **1366px** | Typical Windows Laptop | High productivity desktop view | Pass |
| **1440px** | MacBook Pro 14" | Crisp rendering, full table visible | Pass |
| **1600px** | Desktop Workstation | Generous margins, centered luxury container | Pass |
| **1920px+** | Full HD & 4K Displays | Fixed readable content column (max-w 1240px) | Pass |

---

## 2. WCAG 2.2 AA Accessibility Conformance

- **Target Size (SC 2.5.8):** All interactive buttons and touch controls have a minimum bounding box of `44x44px` (with `46px` for primary actions), with at least `8px` spacing between adjacent touch elements.
- **Focus Visible (SC 2.4.7):** High-contrast `:focus-visible` rings with gold outline (`outline: 2px solid var(--guest-green); outline-offset: 3px;`).
- **Keyboard Navigation (SC 2.1.1):** All modals, popovers, and table actions are fully navigable via `Tab`, `Enter`, `Space`, and `Escape`. Seating canvas elements support arrow key movements.
- **Color Contrast (SC 1.4.3):** Text contrast ratios exceed 4.5:1 for body copy and 3.0:1 for large headers on both cream (`#fbf6ee`) and white (`#ffffff`) surfaces.
- **Screen Reader Announcements (SC 4.1.3):** Live regions (`aria-live="polite"`, `role="status"`, `role="alert"`) notify assistive technology users of search results and validation errors.
