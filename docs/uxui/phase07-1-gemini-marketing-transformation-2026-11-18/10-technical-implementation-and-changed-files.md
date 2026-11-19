# Phase 07.1 — Technical Implementation and Changed Files

## 1. Summary of Source Modifications

All frontend changes were restricted to the marketing domain and associated chrome layout, strictly respecting Phase 06 baseline integrity and preserving backend contracts.

| File Path | Action | Description of Modifications |
|---|---|---|
| `apps/frontend-user/src/shared/i18n/marketingMessages.js` | **Modified** | Corrected corrupted character encoding artifacts (`?` &rarr; `–` for capacities, cleaned ellipsis in search placeholders). |
| `apps/frontend-user/src/features/marketing/VenuesFeature.jsx` | **Modified** | Extracted 338 lines of inline `<style>` into external stylesheet `VenuesFeature.css`; added `loading="lazy"` and `decoding="async"` to all venue imagery; imported `VenuesFeature.css`. |
| `apps/frontend-user/src/features/marketing/VenuesFeature.css` | **Created** | Comprehensive luxury atelier stylesheet for `/venues` directory, search/filter controls, card grids, and modal dialog. Full dark mode support (`:root[data-color-mode="dark"]`). |
| `apps/frontend-user/src/layouts/components/MarketingChrome.css` | **Modified** | Integrated `--ui-theme-*` token fallbacks; styled `.host-skip-link` and `.kp-skip`; implemented dark mode rules for header, mobile native `<dialog>` drawer, language switcher, and footer. |
| `apps/frontend-user/src/features/marketing/MarketingPages.css` | **Modified** | Implemented dark mode rules for contact form, inputs, error states, submit buttons, pricing factor cards, and atelier guidance strips. |
| `apps/frontend-user/src/features/marketing/MarketingFeature.css` | **Modified** | Re-mapped legacy `--kp-*` and `--ui-*` variables to canonical `--ui-theme-*` design tokens; implemented dark mode styles for all homepage sections (hero, highlights, metrics, guest demo, FAQ, help, final CTA). |
| `apps/frontend-user/index.html` | **Modified** | Added `"/venues"` to the font preloader pathname array to ensure instant rendering of Khmer typography. |
| `apps/frontend-user/src/features/marketing/Phase07Marketing.test.jsx` | **Created** | Comprehensive test suite covering single H1, FAQ `<details>` disclosure, zero inline styles, CTA destinations, header accessibility, footer link targets, venue lazy loading/search/modal, and contact form validation/retry. |

---

## 2. Invariant & Architecture Integrity

1. **Zero Backend Changes:** No API endpoints, Java controllers, DTOs, or database entities were modified.
2. **Flyway Migrations Untouched:** No database migrations were created or modified; the 48 historical migrations remain intact.
3. **Renderer Isolation Guaranteed:** The 10 wedding invitation renderer packages remain completely untouched and un-recolored.
4. **Token Cascade Standard:** All color rules flow through canonical design tokens defined in `packages/ui-tokens` and synchronized via `scripts/sync-design-tokens.cjs`.
5. **Phase 06 Navigation Preserved:** Header skip links, back-scroll behavior, mobile drawer focus traps, and language switcher stores continue to function as verified in Phase 06.
