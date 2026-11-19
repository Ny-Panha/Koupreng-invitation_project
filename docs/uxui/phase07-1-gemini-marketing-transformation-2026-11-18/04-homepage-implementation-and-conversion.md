# 04 — Homepage Implementation & Conversion Architecture

## 1. Section Breakdown & Narrative Structure

The transformed homepage (`apps/frontend-user/src/features/marketing/HomeFeature.jsx`) follows a calibrated 7-stage editorial progression:

```
[Header Navigation] -> Floating frosted-glass chrome
        ↓
[1. Hero Section] -> Single H1, dual CTAs, live phone preview frame
        ↓
[2. Featured Collection] -> 3 artisan template cards from actual catalog
        ↓
[3. Folio Showcase] -> Interactive 3-stage Silk Heritage reveal (Arrival, Story, Details)
        ↓
[4. RSVP Management Demo] -> Interactive guest table with response status filters
        ↓
[5. 3-Step Journey & Metrics] -> Verified milestone progression and design stats
        ↓
[6. Packages Teaser & FAQ] -> Real package preview, pricing factors, and 5 accordion questions
        ↓
[7. Final Conversion & Help] -> Clear route decision to create or browse, plus support inquiry
        ↓
[Footer] -> 3-column navigation and Cambodian cultural attribution
```

---

## 2. Component Implementation Details

### A. LandingHero (`LandingHero.jsx` & `LandingHero.css`)
- **Semantic Heading:** Exactly one `<h1>` with bilingual rendering:
  - Khmer: `សំបុត្រអញ្ជើញដែលបង្ហាញ\nរឿងរ៉ាវរបស់អ្នក។`
  - English: `Invitations crafted\naround your story.`
- **Primary CTA:** Link to `/app/events/new` ("Create invitation" / "បង្កើតសន្លឹកការ") styled as a solid evergreen rounded pill with >= 52px height and hover elevation.
- **Secondary CTA:** Link to `/templates` ("Explore templates" / "មើលគំរូសំបុត្រអញ្ជើញ") with comfortable tap area and trailing arrow icon.
- **Trust Highlights:** Three verified capability pills:
  1. Instant Telegram & Messenger sharing
  2. Real-time guest RSVP tracking
  3. 10+ authentic Cambodian designs
- **Live Preview (`InvitationDemo.jsx`):** Renders a luxury 2.5D phone frame mockup (`PhoneFrame`) with perspective tilt on desktop. Defers the heavy template iframe until the user triggers "Try the invitation", preventing initial load blocking.

### B. Template Collection (`TemplateGrid.jsx` with `featured={true}`)
- Injects 3 curated templates from the live template catalog (`FEATURED_TEMPLATE_CODES`).
- Emits `.kp-design-card` with high-resolution WebP posters, category badges, and direct links to `/templates/:id`.
- Offline handling: If the template catalog service fails, gracefully falls back to cached local definitions labeled as demo designs with a retry button.

### C. Folio Showcase (`InvitationShowcase.jsx`)
- Demonstrates the tactile experience of opening a Khmer ceremonial wedding invitation.
- Three interactive preview tabs:
  1. *The arrival:* Closed burgundy folio with gold foil monogram.
  2. *Your story:* Open spread displaying couple portraits, names, and wedding date.
  3. *The details:* Event timeline, venue map link, and RSVP instructions.
- Includes clear disclosure: "Illustration only · Explore the working design in the full demo", with link to `/templates/silk-heritage`.

### D. Guest Response Management (`LandingProduct.jsx`)
- Educates hosts on how RSVPs are collected without making unsubstantiated claims about platform volume.
- Interactive status filter buttons: `ALL`, `ATTENDING`, `PENDING`.
- Filter "Pending" renders a single row as asserted by automated tests.
- Accessible `<table>` with `<caption className="sr-only">Illustrative guest response data</caption>`.

### E. 3-Step Journey & Metrics (`LandingStory.jsx`)
- Step 1: Choose a design (`/templates`)
- Step 2: Make it yours (`/templates/browse`)
- Step 3: Share & follow replies (`/templates/browse`)
- Metrics Ribbon with `NumberTicker`:
  - 10 Artisan wedding themes (factual count of available template renderers)
  - 100% Khmer & English ready (source-verified dual language system)
  - 7 Adaptive viewports (320px, 390px, 768px, 1024px, 1440px, short landscape)

### F. Packages Preview & FAQ (`LandingConversion.jsx`)
- Teaser cards for packages and access rules, pointing to `/pricing`.
- Exactly 5 `<details>` FAQ accordions answering common customer questions (preview access, customization, RSVP workflow, premium activation, and payment verification).
- Final conversion banner with clear dual paths: `/templates` and `/app/events/new`.

---

## 3. Strict Compliance Checks
- Zero inline `<style>` tags rendered anywhere on the homepage.
- Exactly one `<h1>` heading in the DOM.
- Exactly one `<footer>` element.
- All links start with `/` or `#`.
