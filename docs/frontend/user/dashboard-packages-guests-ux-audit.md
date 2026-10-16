# Koupreng Host Workspace UX/UI Audit — Packages & Guests

**Audit Date:** 2026-10-16  
**Audited Routes:** `/dashboard/packages` & `/dashboard/guests`  
**Application:** `apps/frontend-user`  
**Baseline Evidence:** User-uploaded screenshots (`media_1792115501955_065ae3ba.png`, `media_1792115501956_8c3e56df.png`) + local Playwright before captures (`output/playwright/dashboard-packages-guests-premium/before/`).

---

## 1. Executive Summary

A comprehensive visual, responsive, and behavioral audit was conducted across the host workspace routes `/dashboard/packages` (Subscriptions Control Center) and `/dashboard/guests` (Honored Guests Management). The inspection revealed severe UX/UI breakdowns that degrade the perceived quality from a premium SaaS experience down to an unstyled prototype:

1. **Information Hierarchy & Geometry:** Excessive dead space at the top caused by compounding offsets; clashing banners physically overlapping package cards; low-contrast or near-invisible headings.
2. **Theming & Color Discord:** Hardcoded `dark:` classes (`dark:bg-zinc-900`, `dark:text-zinc-100`) clashing violently with the warm ivory background (`#fbf6ee`) of `HostShell`. When dark mode is active or inherited, cards turn jet black and headings become unreadable white-on-cream text.
3. **Data Entry & Usability Failure on Guests:** An 8-column inline form crammed into the first row of a desktop data table acts as the primary data entry point. On mobile (390px), columns shrink to 20px wide, breaking Khmer words into vertical single-character stacks and rendering the page unusable.
4. **Data Semantic Defects:**
   - **False Delivery State:** `handleCopyLink()` in `GuestsPage.jsx` automatically marked guests as `SENT` upon simple clipboard copy. Copying an invitation link is an intent/share step, not verified delivery.
   - **Inflated RSVP Metrics:** `GuestStats.jsx` treated any truthy `rsvpStatus` string as responded, erroneously counting `PENDING` guests as responded.
5. **Localization Leakage:** Missing translation key `exportBtn` in `messagesDictionary.js` caused the literal string `"exportBtn"` to render on the primary CSV export button.

---

## 2. Root Cause Analysis

### 2.1 Route A: `/dashboard/packages`

| Defect Observed | Visual Symptom | Root Cause in Source Code |
| :--- | :--- | :--- |
| **Excessive Top Space** | ~250px dead space between host navbar and page title | `HostShell.css` applies `padding-top: var(--host-nav-offset)` (104–132px). `SubscriptionPackagesPage.jsx` wraps content in `.enterprise-page`, which defines `margin: 118px auto 64px` in `EnterprisePages.css`. The two offsets compound additively. |
| **Invisible Headings** | Page title `ជ្រើសរើសកញ្ចប់...` is nearly invisible light text on cream background | `SubscriptionPackagesPage.jsx` line 186 specifies `text-slate-900 dark:text-zinc-100`. When `dark` class is triggered, text switches to `#f4f4f5` (near white) while the page canvas remains `#fbf6ee` (warm ivory). |
| **Clashing Banner Overlap** | Active subscription banner (`កញ្ចប់សកម្ម`) physically overlaps the top of package cards | In `SubscriptionPackagesPage.jsx`, `.enterprise-page` flex/grid constraints interact with negative margins / absolute positioning of card badges (`-top-3`) and uncontained margins, causing the active banner to collide into the cards grid. |
| **Jet-Black Cards Discord** | Package cards appear as harsh black rectangles on a delicate cream background | The cards use `bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800`. Under dark theme inheritance, the cards become pitch black (`#18181b`) while `HostShell` remains warm ivory. |
| **Unreadable Subscription History** | Table text and headers are illegible | Dark background container (`dark:bg-zinc-900`) with dark gray body text (`dark:text-zinc-400`, `text-slate-500`) produces a contrast ratio below 2.5:1. |
| **Awkward Bilingual CTAs** | Buttons read `ជាវ / ដំឡើង (Subscribe / Upgrade)` | Hardcoded mixed English strings in parentheses clutter the interface instead of clean, context-aware localized copy (`ជ្រើសកញ្ចប់នេះ` / `Choose Plan`). |

### 2.2 Route B: `/dashboard/guests`

| Defect Observed | Visual Symptom | Root Cause in Source Code |
| :--- | :--- | :--- |
| **Leaked i18n Key** | Export button displays raw key `exportBtn` | `GuestFilters.jsx` calls `t ? t("exportBtn") : "ទាញយក CSV"`. Because `useBackendMessages` falls back to the key name when missing from `LOCAL_MESSAGES.guests`, it returns `"exportBtn"`. |
| **Missing Primary CTA** | No obvious `+ Add Guest` button in the toolbar | `GuestFilters.jsx` renders search, two select dropdowns with settings icons, scan check-in, export, and import, but completely omits an `Add Guest` button. |
| **Cramped 8-Column Inline Add Row** | Tiny, cut-off inputs inside the table header | `GuestTable.jsx` forces an editable add form across `colgroup` widths (18%, 13%, 12%, 7%, 11%, 12%, 14%, 13%), giving inputs as little as 40px width. |
| **Mobile Layout Collapse** | Single-letter vertical columns on mobile (390px) | `ResponsiveTable` with `table-fixed` forces 8 columns onto 390px screens without switching to mobile card view, causing text overflow and unreadable squished cells. |
| **False Send Evidence** | Copying link marks guest as `SENT` | `GuestsPage.jsx` lines 138–145 execute `markGuestAsSent(guest)` inside `handleCopyLink()`. Clipboard copy is claimant preparation, not verified transmission. |
| **Inaccurate RSVP Metric** | Pending RSVPs counted as responded | `GuestStats.jsx` line 23 checks `if (g.rsvpStatus || g.sendStatus === SEND_STATUS.responded)`. A non-empty string like `"PENDING"` evaluates to true. |
| **Pale Stat Cards** | Metric labels are washed out and flat | `.pe-summary-card` uses `--brand-text-muted: #7a8799` with font weight 700 on white backgrounds with 0.8125rem font size, creating poor visual weight and low contrast. |

---

## 3. Prioritized Fixes Matrix

### Priority 0: Critical Visual & Behavioral Fixes
- [x] **Remove `EnterprisePages.css` & Compounding Margins:** Remove `enterprise-page` class and isolated offsets from `SubscriptionPackagesPage.jsx`. Adopt standard `HostShell` content container (`dash-main` with consistent padding).
- [x] **Theme Harmony (Ivory / Charcoal / Antique Gold):** Harmonize surface cards, text colors, and borders to use Koupreng soft-luxe tokens (`#FFFFFF` surfaces, `#1F2421` ink headings, `#D4AF37` / `#B98B42` accents, `#FBF6EE` background). Eliminate jarring dark-mode clashes.
- [x] **Fix Layout Overlap:** Eliminate collisions between the active plan banner and package cards by providing clear semantic layout containers with structured CSS grid/flex spacing.
- [x] **Fix Leaked i18n Key:** Add `exportBtn` and complete all missing guest keys in `messagesDictionary.js` for both `km` and `en`.
- [x] **Correct Guest Send Semantics:** Remove automatic `markGuestAsSent()` trigger from `handleCopyLink()`. Retain copy confirmation toast without mutating delivery state.
- [x] **Correct RSVP Metric Calculation:** Update `GuestStats.jsx` to only count confirmed RSVP responses (`ATTENDING`, `NOT_ATTENDING`, `ACCEPTED`, `DECLINED`).

### Priority 1: High-Impact UX & Responsive Modernization
- [x] **Prominent Primary `+ Add Guest` CTA:** Add fully rounded pill button (`dash-btn-primary`) in `GuestFilters` toolbar.
- [x] **Dedicated Add/Edit Guest Drawer/Modal:** Introduce a structured, accessible progressive form modal/drawer for creating and editing guests, eliminating the cramped 8-column inline row as the primary creation path.
- [x] **Mobile Guest Cards (320px–768px):** Implement responsive breakpoint logic that displays elegant guest cards with clear name, group, seats, status badges, and quick-action menu on mobile viewports instead of an unreadable 8-column table.
- [x] **Elevated Summary Metrics:** Redesign stat cards with distinct icon accents, tabular bold numerals, clear denominators, and natural Khmer typography.
- [x] **Natural Khmer Copy:** Replace awkward bilingual button text with native Khmer UX phrasing (`ជ្រើសកញ្ចប់នេះ`, `កញ្ចប់បច្ចុប្បន្ន`, `ទាញយក CSV`).

### Priority 2: Visual Polish & Micro-Interactions
- [x] **Refined Package Cards & Feature Matrix:** Clean typography, SVG checkmarks, hover lift (2px), and clear CTA hierarchy.
- [x] **Readable Subscription History:** Rebuild history section as a clean, high-contrast surface table with order status badges and legible monospace order codes.
- [x] **WCAG 2.2 AA Contrast & Focus:** Ensure all text achieves at least 4.5:1 contrast against its background and interactive elements display visible focus rings (`:focus-visible`).

