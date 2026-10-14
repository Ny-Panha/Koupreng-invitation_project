# Koupreng Premium Landing V3 — Art Direction & Design Thesis

## 1. Executive Summary & Visual Thesis

Koupreng's digital wedding invitation platform represents a union of Cambodian ceremonial heritage and contemporary editorial restraint. The visual direction of Landing V3 rejects generic SaaS kits (monotonous rounded cards, oversized gradient pills, and hollow marketing clichés) in favor of **Silk & Ink Editorial** — a quiet, warm, and dignified aesthetic inspired by Cambodian fine paper, gold leaf accents, and royal silk fabrics.

### The Core Design Thesis
A wedding invitation is not an enterprise software product; it is an emotionally resonant keepsake. A couple visiting Koupreng needs two immediate reassurances:
1. **Aesthetic Confidence:** "This looks honorable, culturally authentic, and exquisite enough for my family and elders."
2. **Functional Clarity:** "I can see exactly what my guests will experience, how much it costs, and how to start without obstacles."

---

## 2. Bandith Reference Audit: Verified Observations vs. Inferred Deductions

We conducted an automated and visual inspection of `https://bandithcardstore.com/` and `https://bandithcardstore.com/templates` using Playwright in desktop (1440×900) and mobile (390×844) viewports.

### Verified Measurements (Direct Screenshot & DOM Inspection)
- **Document Title:** `"Bandith Card Store - Wedding Invitations Made Simple - Bandith Card Store"`
- **Body Canvas:** `rgb(255, 255, 255)` (`#FFFFFF`) with warm light beige sections `oklab(...)` / `#F7EFE5`.
- **Typography:** Uses `"Google Sans"` as primary font family (`fontSize: 63.75px`, `lineHeight: 82.875px` on desktop H1). *Note: Google Sans does not contain native Khmer glyphs, resulting in fallback rendering.*
- **Header Dimensions:** Height `103px` on desktop (1440px), `81px` on mobile (390px).
- **H1 Copy:** `លិខិតអញ្ជើញ Digital\nសម្រាប់គ្រប់កម្មវិធី` in terracotta brown `rgb(155, 119, 99)`.
- **Primary CTA:** `"ជ្រើសរើស Template"` (dimensions: `193×51px`, `bg: rgb(95, 129, 125)` muted teal, `borderRadius: 12.75px`).
- **Secondary CTA:** `"ស្នើសុំរចនាតាមតម្រូវការ"` (`bg: rgb(155, 119, 99)` warm brown).
- **Hero Centerpiece:** A realistic iPhone device frame showcasing a traditional temple/palace-themed invitation with a gold gate emblem and button `សូមចុចបើកសំបុត្រ`.
- **Feature Pills (Right Column):** 5 stacked cards with colorful icons (Send Link, Music & Gallery, Date display, RSVP, Data Security).
- **Template Catalog (`/templates`):** Square (1:1) cards with traditional gate artwork (`BORAN_Apsara`, `BORAN_Khmer`, etc.) priced at `$98.00`, category filter pills, and search.

### Inferred Observations & Observed Weaknesses
- **Information Architecture:** Bandith splits offerings between Digital E-Invitations, Custom Design (The Signature), Physical Printing, and Gift Store.
- **Visual Flaws in Bandith's Live Rendering:**
  1. Excessive header height (103px) consumes 11.4% of the initial 900px viewport.
  2. Severe white space gaps below the hero; empty product placeholders showing `$0.00` with missing thumbnails.
  3. Lack of bilingual typographic pairing (plain system fallback for Khmer).
  4. Floating carousel arrows positioned over blank whitespace.
- **Architectural Translation to Koupreng:** Koupreng does not clone Bandith's artwork or software stack. We adopt its successful hero clarity (clear device/invitation centerpiece + direct benefit communication), while providing a far more refined, cohesive editorial experience tailored to Koupreng's catalog and audience.

---

## 3. Evaluation of Three Visual Directions

| Criteria | Concept A: Silk & Ink Editorial (Selected) | Concept B: Heritage Gallery | Concept C: Modern Ceremony |
|---|---|---|---|
| **Palette** | Warm ivory canvas (`#F8F5EE`), deep ink (`#262622`), subtle gold leaf (`#C3A26B`), dark evergreen (`#2E433A`) | Warm parchment (`#F3EFE6`), bronze, deep mahogany, aged gold | Rich dark evergreen hero (`#1E2E27`) transitioning into light paper |
| **Typography** | Kantumruy Pro + Noto Serif Khmer; Cormorant Garamond + DM Sans | Moul + Preahvihear ceremonial headings; Battambang body | Kantumruy Pro bold modern sans; DM Sans |
| **Hero Centerpiece** | Art-directed Silk Heritage wedding folio with interactive tactile unfold | Oversized 3D card framed like a gallery exhibit | Full-bleed cinematic portrait with floating glass invitation |
| **Pros** | Highest readability, warm Cambodian dignity, excellent LCP performance, zero visual clutter | High cultural prestige, museum-like elegance | High drama, cinematic contrast |
| **Cons** | Demands rigorous typographic discipline and subtle micro-details | Heavy visual weight on mobile devices | Dark hero can feel solemn or less wedding-festive if uncontrolled |

### Selected Direction: Concept A — Silk & Ink Editorial
**Rationale:** Silk & Ink Editorial provides the ideal balance of warmth, cultural authority, and digital utility. It presents Koupreng as a distinguished Cambodian design atelier rather than a tech startup. It eliminates the previous design's awkward photo/book clash by integrating the invitation reveal organically into the hero, and it preserves LCP performance by using lightweight CSS framing.

---

## 4. Design Tokens & Proposed Specifications

### Palette Tokens (Public Marketing Scope)
```css
:root {
  --kp-public-bg: #F8F5EE;          /* Warm ivory canvas */
  --kp-public-surface: #FFFFFF;     /* Pure surface for elevated cards */
  --kp-public-surface-warm: #F4EFE6;/* Warm paper accent surface */
  --kp-public-ink: #262622;         /* Primary text and dark headings */
  --kp-public-muted: #695D50;       /* Secondary text and captions */
  --kp-public-gold: #C3A26B;        /* Delicate gold border and micro-accents */
  --kp-public-gold-ink: #77572C;    /* High-contrast accessible gold text (4.8:1+) */
  --kp-public-deep: #2E433A;        /* Deep ceremonial evergreen for anchor sections */
  --kp-public-deep-hover: #22332C;  /* Dark evergreen hover */
  --kp-public-border: #E5DED2;      /* Fine dividers and subtle borders */
}
```

### Typography Scale & Hierarchy
- **Khmer Headlines (H1):** Fluid `clamp(2rem, 4.5vw, 3.25rem)` (32px mobile → 52px desktop). Line-height: `1.45–1.55`. Font: `Kantumruy Pro` / `Noto Serif Khmer`.
- **English Headlines (H1):** Fluid `clamp(2.5rem, 5.5vw, 4rem)` (40px mobile → 64px desktop). Line-height: `1.15`. Font: `Koupreng Editorial` (`Cormorant Garamond`).
- **Body Text:** `16px` desktop / `15px` mobile. Line-height: `1.65–1.75` for Khmer, `1.6` for English.
- **Action Buttons:** Height `48px` desktop, `46px` mobile (minimum hit target `44×44px`). Border radius `6px` (subtle and tailored, never oversized pill buttons).
- **Header Inner Height:** `74px` desktop, `64px` mobile.

---

## 5. Cambodian UX Copywriting Standards

Copy is written directly from the perspective of Khmer couples preparing for their auspicious celebration:

- **Hero H1 (Khmer):** «រាល់ការអញ្ជើញ ចាប់ផ្តើមពីក្តីស្រឡាញ់»
- **Hero H1 (English):** "Every invitation begins with love."
- **Hero Subtitle (Khmer):** «បង្កើតសន្លឹកការឌីជីថលតាមស្ទីលរបស់អ្នក។ ជ្រើសគំរូ បញ្ចូលព័ត៌មានពិធី ហើយចែករំលែកទៅកាន់ភ្ញៀវបានងាយស្រួល។»
- **Hero Subtitle (English):** "Craft a digital wedding invitation that reflects your story. Choose a design, personalize your details, and share seamlessly with your guests."
- **Primary CTA:** «មើលគំរូសន្លឹកការ» ("Explore invitation designs") → `/templates`
- **Secondary CTA:** «ចាប់ផ្តើមបង្កើត» ("Start creating") → `/templates/browse`
- **Feature Badges:**
  - «ភាសាខ្មែរ និងអង់គ្លេស» (Bilingual Khmer & English)
  - «តំណភ្ជាប់ផ្ទាល់ខ្លួន» (Personalized Guest Link)
  - «តាមដាន RSVP» (Real-time RSVP Tracking)
  - «ផែនទី និងកម្មវិធីពិធី» (Venue Map & Program)

