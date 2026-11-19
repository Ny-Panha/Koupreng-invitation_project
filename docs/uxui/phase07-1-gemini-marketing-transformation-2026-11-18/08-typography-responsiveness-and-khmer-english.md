# Phase 07.1 — Bilingual Typography, Responsiveness, and Khmer/English Parity

## 1. Bilingual Editorial Typography System

KoupReng's brand identity harmonizes Cambodia's royal epigraphic tradition with high-fashion international editorial aesthetics.

### Font Hierarchy & Roles

| Role | English / Latin | Khmer Script | Typographic Rationale |
|---|---|---|---|
| **Ceremonial Royal Display** | *Cormorant Garamond* / *Playfair Display* (Weight 600–700) | *Moul* (មូល) / *Moul Pali* | Ceremonial grandeur reserved for major hero titles, wedding invitations, and royal celebration titles. |
| **Editorial Headings (H2–H4)** | *Cinzel* / *Playfair Display* (Weight 500–600) | *Siemreap* / *Bokor* | High-fashion modern elegance for section headers, feature cards, and venue halls. |
| **Atelier Body Text** | *Inter* / *Plus Jakarta Sans* (Weight 400–500) | *Kantumruy Pro* / *Battambang* | Optimal legibility at reading sizes (15px–18px), clear rendering of complex Khmer diacritics. |
| **Interactive & Microcopy** | *Plus Jakarta Sans* (Weight 500–600) | *Kantumruy Pro* (Weight 500–600) | Clean button labels, navigation links, form labels, and badge metadata. |

### Khmer Script Safeguards
1. **Line-Height Expansion:** Khmer text requires a minimum line-height of `1.6` to `1.85` (compared to English `1.4` to `1.5`) to prevent clipping of upper vowel signs (e.g. ី, ឺ, ើ) and lower subscript consonants (ជើង, e.g. ្ក, ្ខ, ្ញ).
2. **Font Preloading:** Local woff2 font files are registered in `index.html` with `<link rel="preload">`, preventing layout shifts (CLS) when switching between English and Khmer.
3. **No Ugly Hyphenation:** Automatic hyphenation is disabled for Khmer (`hyphens: manual`), maintaining whole syllable integrity.

---

## 2. Bilingual Parity Architecture

The marketing experience maintains 100% bilingual parity across all copy:
- **Centralized Dictionary:** Managed in `apps/frontend-user/src/shared/i18n/marketingMessages.js`.
- **Locale Persistence:** Stored in `localStorage` via user preference store, synchronized with `html[lang]` attribute (`en` or `km`).
- **Language Switcher:** Accessible control in the header and mobile drawer allowing instant one-click toggle without full-page reloads.
- **Zero Raw English Fallbacks in Khmer View:** All headings, descriptions, buttons, tooltips, FAQ questions, venue filters, and contact fields have verified Khmer translations.

---

## 3. Responsive Viewport Strategy (320px to 1920px)

The responsive system is fluid, using CSS `clamp()` for typography and container-aware grid layouts:

```css
/* Example fluid typography in MarketingFeature.css */
--hero-title-size: clamp(2rem, 5vw + 1rem, 3.75rem);
--section-title-size: clamp(1.75rem, 3.5vw + 0.5rem, 2.75rem);
```

### Viewport Breakpoint Matrix

| Viewport | Device Class | Layout Adaptation |
|---|---|---|
| **320px – 374px** | Ultra-compact (iPhone SE, Galaxy Fold outer) | Single column layout, horizontal padding reduced to 16px, CTA buttons stack full-width, touch targets strictly &ge; 44px &times; 44px, zero horizontal overflow. |
| **375px – 767px** | Standard Mobile (iPhone 13/14/15, Pixel) | Native `<dialog>` slide-out navigation, hero mockup scales gracefully, venue directory displays single-card stream with quick filter pill bar. |
| **768px – 1023px** | Tablet Portrait (iPad, Surface) | Two-column grid for highlights, metric cards, and venue listings. Header collapses to compact navigation or luxury drawer. |
| **1024px – 1439px** | Desktop / Laptop (MacBook, Ultrabooks) | Full desktop header with centered navigation, side-by-side hero composition (editorial headline on left, 2.5D interactive mobile mockup on right), multi-column footer. |
| **1440px – 1920px+** | Large Desktop & 4K Displays | Centered luxury container capped at `1400px`, generous negative space (80px–120px section padding), crisp SVG divider flourishes. |

### Special Edge Case: Short Landscape Viewports
For mobile devices held in landscape orientation (viewport height < 500px):
- Header height compresses from 72px to 48px.
- Navigation dialog uses internal `overflow-y: auto` to ensure all menu links and language switchers remain reachable.
- Modal dialogs clamp their maximum height to `90vh` with internal scrolling.
