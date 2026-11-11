# Current template registry and renderer audit

Source: `apps/frontend-user/src/features/templates/registry/templateRegistry.js` at `2ae3173f`. These are **static mappings**; dynamic active templates are fetched from the backend at runtime in `src/app/App.jsx`, so production catalog completeness and authored preview fidelity remain unverified without an isolated API dataset.

| Renderer family | Registered keys / source lines | Current source status | Phase |
|---|---|---|---|
| `KhmerFloralGoldLayout` | `khmer-floral-gold` (line 25), `KHMER_FLORAL_GOLD` (line 26) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `RoyalGardenCinematicLayout` | `royal-garden-cinematic` (line 27), `ROYAL_GARDEN_CINEMATIC` (line 28) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `SilkHeritageLayout` | `silk-heritage` (line 29), `SILK_HERITAGE` (line 30) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `TemplateBoilerplateLayout` | `template-boilerplate` (line 32), `custom-starter` (line 33) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `KhmerCelestialLayout` | `khmer-celestial` (line 36), `KHMER_CELESTIAL` (line 37), `10` (line 38), `royal-khmer-wedding` (line 46), `1` (line 47), `royal-khmer` (line 48), `RUBY_RED` (line 76), `ROYAL_KHMER` (line 77) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `DigitalYesLayout` | `the-digital-yes-wedding` (line 41), `7` (line 42), `digital-yes` (line 43), `GOLD_LUXURY` (line 78) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `EmeraldLuxeLayout` | `emerald-canva-luxe-wedding` (line 51), `emerald_royal_luxe` (line 52), `emerald-royal-luxe` (line 53), `emerald royal luxe` (line 54), `emerald-luxe-wedding` (line 55), `9` (line 56), `2` (line 57), `emerald-luxe` (line 58), `EMERALD_GREEN` (line 75) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `WithJoyPortalLayout` | `withjoy-modern-portal` (line 61), `3` (line 62) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `BlissEditorialLayout` | `bliss-editorial-wedding` (line 65), `4` (line 66) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| `CanvaKhmerWeddingTemplate` | `khmer-golden-canva-inspired-wedding` (line 69), `cover-khmer-golden-wedding` (line 70), `5` (line 71), `CHAMPAGNE` (line 79), `KHMER_GOLDEN` (line 80) | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |
| Shared Event Essential / Koupreng Demo | `event-essential`, `koupreng-demo-wedding` from `resolveTemplateRenderer` | Shared `TemplateExperience` path; verify all generic event types and JSON roundtrip | 10 / 13 / 16 |
| Unknown / dynamic fallback | `DefaultTemplateLayout` when `useFallback` is true | Verify server catalog IDs, preview trust and no paid access from preview | 10 / 25 |

**Count:** 10 dedicated renderer families, 38 static aliases, two explicit shared identifiers and one fallback. Every static key is assigned to a renderer above; dynamic catalog records cannot be enumerated from source alone.

**Important resolution rule:** `getDedicatedTemplateComponent` favors stable slug/code/preset metadata over numeric database IDs. Preserve this ordering: dynamic numeric IDs may collide with legacy `1`–`7` aliases. Unknown serialized blocks and template-specific layout data must survive edit, preview, save and reload. `TemplateExperience.jsx` contains distinct royal/floral/essential branching; do not flatten these into a universal skin.
