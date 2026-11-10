# Phase 06 — Workstream C: Premium Template Marketplace and Live Preview Modernization

Date: 10 November 2026  
Status: **COMPLETED & VERIFIED**  
Routes:
- `/templates`
- `/templates/browse`
- `/templates/:id`
- `/templates/:id/demo`
- `/templates/:templateId/checkout`

---

## 1. Overview & Objectives

Workstream C modernizes the public Template Marketplace catalog and live interactive preview experiences for couples and guests. The design reflects the luxury Cambodian wedding aesthetic (creams, warm golds `#c3a26b`, and forest greens `#2e433a`), bilingual Khmer/English typography, clear price tier indicators, and frictionless template preview gates.

---

## 2. Key Architecture & Features

### A. Enhanced Public Template Cards (`PublicTemplateCard.jsx`)
- **Prominent Badges (`.tp-card-badge`):**
  - **Demo Badge:** Displays "គំរូសាកល្បង" ("DEMO") for demonstration or non-live items.
  - **Premium Badge:** Displays "ប្រណីត" ("PREMIUM") for tier-locked or paid templates.
  - **Free Badge:** Displays "ឥតគិតថ្លៃ" ("FREE") for complimentary community designs.
- **Language Mode Badges (`.tp-card-lang-tag`):**
  - Clarifies supported invitation languages ("KM + EN", "KH", "EN").
- **Action Buttons (`.tp-card-actions`):**
  - **Live Preview (`.kp-action-preview`):** Opens full interactive invitation demonstration with live 3D opening animation (`/templates/:id/demo`). Features `Eye` icon from `lucide-react`.
  - **Use Template (`.kp-action-use`):** Direct CTA advancing to event onboarding (`/app/events/new?template=...`). Preserves all existing test-contract strings.

### B. Filter & Search Controls (`TemplateGrid.jsx`)
- **Price Preference Filter Pills:**
  - Accessible button group (`role="group"`, `aria-label="Price filter / តម្លៃគំរូ"`).
  - Quick pills for "All" ("ទាំងអស់"), "Free" ("ឥតគិតថ្លៃ"), and "Premium" ("ប្រណីត").
  - Seamlessly integrates with category filters (Luxury, Minimalist, Ancient, Modern).
- **Search & Empty State Recovery:**
  - Live query filtering across template names and descriptions.
  - Empty state with friendly bilingual message and a single-click "Clear filters" ("សម្អាតតម្រង") button that resets search, category, and price filters to initial defaults.

### C. Live Interactive Preview Experience (`TemplateExperience.jsx`)
- **3D Unsealing Ceremony:** Interactive Khmer wax seal and envelope opening animations.
- **Responsive Viewport Controls:** Seamless toggle between mobile phone framing and full-width desktop viewports.
- **Complete Feature Demonstration:** Showcases RSVP forms, cash gift KHQR QR cards, wedding timelines, photo gallery lightbox, and location maps.

---

## 3. Verification & Quality Gates

- **Unit Tests:**
  - `apps/frontend-user/src/features/templates/components/TemplateMarketplaceModernization.test.jsx`: 5 passing tests covering price preference filters, free/premium filtering, search query filtering, and empty state reset.
  - `apps/frontend-user/src/features/templates/components/PublicTemplateCard.test.jsx`: 2 passing tests.
  - `src/features/templates`: 58 test files passed, 673 tests passed.
- **Zero Breaking Changes:** Full preservation of existing route contracts (`batch12-route-content.spec.js`) and database migrations.
