---
name: koupreng-premium-ux
description: "Cambodian wedding UX standards, Khmer typography, traditional gold and cream palettes, 3D envelope and wax seal opening animations, and cultural wedding template patterns for Koupreng. Use when designing, building, refactoring, or auditing wedding invitation layouts, guest experience choreography, Khmer font pairing, and responsive invitation viewports."
---

# Koupreng Premium UX & Cambodian Wedding Design Standards

## 1. Cultural Identity & Aesthetic Philosophy

Koupreng's visual identity blends traditional Khmer ceremonial elegance with modern, cinematic digital craft. Every wedding invitation design must reflect warmth, auspicious celebration, and Cambodian cultural heritage:

- **Primary Themes:** Rich golds, ivory, warm cream, ceremonial reds, and royal emerald greens.
- **Khmer Typography:** Clear hierarchy supporting Khmer script with authentic font pairings (e.g. `Moul`, `Preahvihear`, `Siemreap`, `Kantumruy Pro`).
- **Interactive Ceremonial Opening:** 3D animated envelope flap, wax seal break, or sliding door opening transition before revealing the full invitation.

---

## 2. Design Tokens & Palette Specifications

Refer to [`references/design-tokens.md`](references/design-tokens.md) for detailed color hexes, shadow depths, borders, and spacing tokens:
- **Surface Roles:** Base canvas, card background, floating elevation, modal overlays.
- **Accents:** Traditional gold gradient tokens (`#D4AF37`, `#F3E5AB`, `#996515`).
- **Dark Mode Support:** Warm obsidian, charcoal, and muted bronze accents for night viewing.

---

## 3. Khmer Typography Standards

Refer to [`references/khmer-typography.md`](references/khmer-typography.md) for comprehensive font hierarchy and rendering guidelines:
- **Heading 1 / Couple Names:** Display fonts (`Moul`, `Preahvihear`) with appropriate line-height multipliers (minimum 1.6 for Khmer vowel diacritics).
- **Body & Ceremonial Text:** High-readability fonts (`Kantumruy Pro`, `Battambang`) preventing sub-script clipping.
- **Bilingual Consistency:** Dual-rendered Khmer & English sections with balanced typographic scale.

---

## 4. Invitation Opening Choreography

Refer to [`references/invitation-opening-patterns.md`](references/invitation-opening-patterns.md) for motion sequences:
- **Stage 1: Sealed Envelope:** Cover card with personalized guest name, ornamental monogram, and wax seal button.
- **Stage 2: User Gesture:** Unsealing trigger starts configured background audio and triggers smooth CSS/Framer motion unfold.
- **Stage 3: Full Reveal:** Ceremony schedule, map location, dress code, digital envelope QR, and RSVP form.
- **Reduced Motion:** Gracefully falls back to instantaneous reveal with static decorative borders when `prefers-reduced-motion` is active.

