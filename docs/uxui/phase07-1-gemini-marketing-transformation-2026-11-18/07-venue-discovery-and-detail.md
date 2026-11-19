# Phase 07.1 — Venue Discovery, Curated Directory, and Modal Details

## 1. Directory Purpose & Honest Editorial Positioning

The `/venues` experience in KoupReng serves as a **curated editorial celebration directory** of Cambodia’s most distinguished wedding banquet halls, colonial ballrooms, and luxury hotel venues.

### Truthful Boundaries (No Invented Inventory)
- **Editorial Guide:** Venues are presented as an inspirational and logistical planning companion for couples selecting an invitation aesthetic that harmonizes with their venue.
- **No Fabricated Booking Engine:** The interface explicitly clarifies that KoupReng provides invitations, RSVP management, and banquet seat planning, but does **not** take direct venue hall bookings or claim unauthorized commercial partnerships.
- **Accurate Logistics:** Each venue entry includes authentic Phnom Penh / Siem Reap address details, hall capacity tiers, aesthetic pairing suggestions, and direct venue contact information.

---

## 2. Technical Refactoring & Architecture

### Elimination of Inline `<style>` Blocks
In earlier iterations, `VenuesFeature.jsx` contained a 338-line `<style>` tag injecting light-mode-only hex colors (`#fffcf7`, `#222`, `#B0926A`) directly into the DOM head.
- **Extracted Stylesheet:** Created `apps/frontend-user/src/features/marketing/VenuesFeature.css`.
- **CSS Modularity:** Loaded cleanly via React import (`import './VenuesFeature.css'`), emitted by Vite as an optimized dedicated bundle chunk (`VenuesPage-*.css`, ~8.38 kB).
- **Zero DOM Pollution:** Completely removed dynamic `<style>` injection.

### Dark Mode & Token Integration
- All styles now leverage semantic design tokens (`--ui-theme-*`) with fallback mappings.
- Dedicated dark mode rules under `:root[data-color-mode="dark"]` ensure deep obsidian surfaces (`#161311`), warm parchment text (`#F7F3EE`), gold borders (`rgba(212,175,55,0.3)`), and high-contrast badges.

---

## 3. Venue Features & Interaction Matrix

### Filtering & Search
- **Search Input:** Real-time search across venue names, hall titles, and districts with debounced filtering.
- **District / Region Chips:** Quick filters for Phnom Penh, Siem Reap, Sihanoukville.
- **Guest Capacity Filters:** Intimate (< 200 guests), Grand (200 – 600 guests), Royal Banquet (> 600 guests).
- **Empty State:** When no venues match a search, an elegant empty state provides a clear "Reset filters" action.

### Card Rendering & Performance
- **Image Optimization:** All venue photography uses native `loading="lazy"` and `decoding="async"`.
- **Preload Integration:** Added `/venues` to the font preloader in `index.html` to guarantee instant font rendering for Khmer headings.
- **Card Hover & Focus:** Smooth 200ms elevation lift with gold border accentuation, fully navigable via Tab and keyboard Enter/Space.

### Modal Deep-Linking & Accessibility
- **Dialog Semantics:** Clicking any venue card opens a detailed modal overlay (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="venue-dialog-title"`).
- **Keyboard & Focus Trap:**
  - Focus is immediately shifted into the modal on open.
  - Tab cycle is trapped within modal interactive elements.
  - Pressing `Escape` closes the modal and returns focus cleanly to the activating card.
- **Detail View Contents:**
  - High-resolution gallery preview.
  - Ballroom capacity breakdown (Banquet style vs. Cocktail style).
  - Recommended KoupReng invitation template pairings (e.g., pairing Royal Khmer Gold with Raffles Le Royal, or Botanical Minimal with Plantation Urban Resort).
  - Direct venue contact phone and map link.
