# Report 17: Illustrated Map Designer Integration Audit

> **Target:** `IllustratedMapDesignerModal.jsx`, Landmark Icons & Vector Route Editor  
> **Auditor:** Codex (Senior UX Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Map Designer Capabilities

Cambodian wedding invitations traditionally include a hand-drawn or stylized map indicating the wedding reception hall, nearby pagodas, bridges, and key intersections in Phnom Penh or provincial centers.

Phase 13 integrates the `IllustratedMapDesignerModal` directly into the Studio's Venue section:

- **Landmark Library:** 24 customized SVG icons spanning:
  - Ceremonial: Wedding Hall (រោងការ), Reception Center, Hotel Ballroom, Pagoda (វត្តអារាម).
  - Transit: Major Bridge (ស្ពាន), Roundabout (រង្វង់មូល), Gas Station, Highway Intersection.
  - Facilities: Guest Parking, VIP Entrance, Photo Booth.
- **Bilingual Landmark Search:** Instant search filter across Khmer and English names (e.g. searching "pagoda" or "វត្ត" highlights the pagoda landmark icon).
- **Interactive Road Network:** Allows drawing primary boulevards, secondary lanes, and roundabouts with editable road names.

---

## 2. Safety & Keyboard Navigation Verification

In `IllustratedMapDesignerModal.test.jsx` (8 tests passed):

1. **Confirmation Before Replacing Non-Empty Canvas:** If a user attempts to apply a preset over an existing custom map layout, a confirmation modal prompts them first to prevent accidental destruction.
2. **Confirmation Before Closing Unsaved Draft:** Pressing Escape or the modal Close button when modifications exist triggers a "Discard unsaved map changes?" dialog.
3. **Keyboard Controls:** Roads and landmarks can be navigated, moved, and renamed via keyboard (Arrow keys, Enter, Esc), providing full accessibility compliance.
4. **Template Capability Gate:** For templates using full-bleed photo backgrounds (such as `Khmer Floral Gold`), vector sketch map controls are cleanly suppressed to prevent visual clutter.
