# Report 16: Template Chooser Modal & Entitlement Boundary Audit

> **Target:** `TemplateChooser.jsx`, Template Registry, Paywall & Entitlement Hardening  
> **Auditor:** Codex (Senior Security & Frontend Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Template Registry & Catalog Coverage

`TemplateChooser.jsx` renders live cards for all 10 canonical Cambodian wedding templates:

1. **Khmer Celestial** (`khmer-celestial`) — FREE / Standard Flagship
2. **Silk Heritage** (`silk-heritage`) — ESSENTIAL / Traditional Kbach
3. **Khmer Floral Gold** (`khmer-floral-gold`) — VIP / Floral Romantic
4. **Royal Garden Cinematic** (`royal-garden-cinematic`) — VIP / Cinematic Luxury
5. **Bliss Editorial** (`bliss-editorial`) — ESSENTIAL / Modern Magazine
6. **Emerald Luxe** (`emerald-luxe`) — VIP / Emerald & Gold Prestige
7. **Digital Yes** (`digital-yes`) — FREE / Clean Minimalist
8. **WithJoy Portal** (`withjoy-portal`) — ESSENTIAL / Multi-Event Portal
9. **Canva Khmer** (`canva-khmer`) — FREE / Customizable Layout
10. **Template Boilerplate** (`template-boilerplate`) — Developer Reference

---

## 2. Entitlement Boundary Hardening

A critical commercial requirement is ensuring that unpaid users cannot activate VIP or ESSENTIAL templates without settling payment.

### Audited Security Properties (N13-17 & Phase11_1TemplateIntent.test.jsx)
1. **Never Present Active Select for Unowned VIP:** If the user has not purchased an entitlement for a VIP template, the "Select Template" button is disabled or replaced with an "Upgrade to VIP" / "Purchase" action.
2. **Draft Preservation on Switch (N13-19):** When switching between owned templates, the couple's entered names, schedule items, photos, and custom JSON are 100% retained.
3. **Safe Fallback for Unknown Template IDs (N13-27):** If a damaged or deprecated template ID is passed, `resolveTemplateRenderer` defaults cleanly to `KhmerCelestial` rather than crashing the React tree.
