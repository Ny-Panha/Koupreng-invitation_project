# 03 — Full Marketing Route & State Matrix

## 1. Route Inventory & State Coverage

Every route owned by Phase 07 was validated across the complete state matrix:

| Route Path | Default State | Loading State | Empty State | Error / Failure State | Dark Mode State | Responsive Viewports |
|---|---|---|---|---|---|---|
| `/` (Home) | Rich editorial narrative with hero, featured templates, folio showcase, guest demo, 3-step timeline, packages teaser, 5-item FAQ, and final CTA | Defer real invitation frame; skeleton cards for template catalog | Handled by catalog fallback with "Try again" action | Graceful offline demo fallback labeled as demo | Full `:root[data-color-mode="dark"]` with obsidian/gold palette | 320, 360, 390, 768, 1024, 1440, 1920px + short landscape (844x390, 820x430) |
| `/contact` | Two-column desktop / stacked mobile form with name, email, phone, topic, message | Disables fieldset with `aria-busy="true"` and animated spinner | Initial empty form with accessible placeholders and hints | First invalid field focused with `aria-invalid="true"` and `aria-describedby` error text; draft preserved across 429/500 retries | High-contrast inputs with gold focus rings | 320px to 1920px |
| `/venues` | 4 curated Cambodian wedding venues in responsive grid with photo, tags, and meta | Skeleton/cached list | Search filter empty state with "Clear search" action | Image fallbacks; zero layout shift | Obsidian surface cards with champagne tag accents | 320px to 1920px |
| `/venues/:id` | Deep-linked modal dialog over backdrop blur with venue photo, tags, meta grid, and contact CTA | Modal scale-in transition (220ms) | Invalid ID gracefully closes or displays fallback | Error boundary protected | Dark modal surface with gold highlights | 320px to 1920px; full-height scroll on small screens |
| `/about` | Redirects to `/contact` | N/A (instant redirect) | N/A | N/A | N/A | N/A |
| `/help` | Redirects to `/contact` | N/A (instant redirect) | N/A | N/A | N/A | N/A |
| `*` (404) | Accessible error recovery page (`NotFoundFeature`) with brand logo, 404 title, and "Back to home" link | N/A | N/A | Displays clear guidance and navigation recovery | Full `:root[data-color-mode="dark"]` contrast verified by automated Axe | 320px to 1920px |

---

## 2. Journey & Interaction Contracts

### Journey 1: First-Time Visitor Discovery
1. **Entry:** Lands on `/`.
2. **First Viewport:** Sees brand logo, tagline, one H1, and two clear buttons: "Create invitation" (`/app/events/new`) and "Explore templates" (`/templates`).
3. **Interactive Trial:** Clicks "Try the invitation" -> opens interactive phone frame or modal dialog with live Khmer Floral Gold preview (`/templates/khmer-floral-gold?embed=demo`).
4. **Dismissal:** Presses `Escape` or close button -> dialog unmounts, focus returns cleanly to trigger button.

### Journey 2: Contact & Inquiry
1. **Entry:** Lands on `/contact` (or redirects from `/about` / `/help`).
2. **Drafting:** Enters name, email, optional phone/telegram, topic, and message.
3. **Validation:** Empty submit highlights first missing field with `aria-invalid="true"` and announces descriptive error via `aria-describedby`.
4. **Submission:** Sends payload to `/v1/contact`. On `SMTP_ACCEPTED`, reveals polite confirmation banner with focus shifted to acknowledgment container.
5. **Retry:** If rate-limited (HTTP 429) or network error, typed draft is preserved 100% intact.

### Journey 3: Venue Exploration
1. **Entry:** Navigates to `/venues`.
2. **Filtering:** Types "Sen Sok" -> grid immediately filters to matching venues. Typing gibberish displays accessible `EmptyState` with a "Clear search" button.
3. **Detail Inspection:** Clicks "View details" on Koh Pich Theatre -> URL deep links to `/venues/1`, modal dialog opens via React portal, backdrop blurs, body scrolling is locked, and focus moves to first focusable control.
4. **Close:** Presses `Escape` -> modal closes, URL reverts to `/venues`, body scrolling is unlocked, and focus returns to the initiating card button.
