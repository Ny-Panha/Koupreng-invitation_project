# KOUPRENG — PHASE 10.1: Bespoke Template Family Registry & Runtime Architecture

**Execution Date:** 18 November 2026, Asia/Bangkok  
**Role:** Creative Director, Cambodian Wedding Art Director, React 19 Frontend Engineer  
**Audit Reference:** Phase 10.1 Dedicated Invitation Art, Renderer UX/UI & Frontend Execution  
**Status:** VERIFIED — LOCAL  

---

## 1. The "1 Template = 1 Dedicated UI" Doctrine

Koupreng strictly avoids generic CMS block assemblers or cookie-cutter templates. Every wedding design represents a dedicated, culturally resonant Cambodian art piece backed by its own bespoke React layout:

1. **KhmerFloralGoldLayout** (`khmer-floral-gold`): Regal gold scroll, orchid/jasmine motifs, ambient floral music.
2. **RoyalGardenCinematicLayout** (`royal-garden-cinematic`): Royal Palace cinematic entrance, V3.3 interactive calendar.
3. **SilkHeritageLayout** (`silk-heritage`): Cambodian raw silk texture, gold thread borders, traditional script typography.
4. **TemplateBoilerplateLayout** (`template-boilerplate`): Developer blueprint, dynamic multi-day schedule, zero window.alert RSVP.
5. **KhmerCelestialLayout** (`khmer-celestial`): Flagship cinematic starlight, celestial lotus petals, floating constellations.
6. **DigitalYesLayout** (`the-digital-yes-wedding`): 3D wax seal envelope, falling petals, luxury typography.
7. **EmeraldLuxeLayout** (`emerald-canva-luxe-wedding`): Velvet curtain reveal, 3D card flip, deep emerald & metallic gold.
8. **WithJoyPortalLayout** (`withjoy-modern-portal`): Sticky glassmorphism header, horizontal scroll pills, accessible lightbox.
9. **BlissEditorialLayout** (`bliss-editorial-wedding`): High-fashion Vogue editorial spread, monochrome typography, sliding drawer.
10. **CanvaKhmerWeddingTemplate** (`cover-khmer-golden-wedding`): Traditional Kbach vector frames, golden card layout.

## 2. Shared Identities & Fallback

- **EventEssentialLayout** (`event-essential`): Resolved dynamically in `TemplateExperience.jsx` for universal multi-event hosting.
- **DefaultTemplateLayout**: Safe fallback wrapping `LazyDefaultTemplateLayout` to guarantee zero white-screen crashes if unknown slugs are requested.
