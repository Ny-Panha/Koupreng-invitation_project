# Template experience tiers and renderer preservation

The registry below is static source, not a complete live backend catalog. These art-direction assignments are **PROPOSALS**, not changes to shipped layouts or package entitlements. Keep slug/code/preset precedence over numeric legacy IDs and preserve unknown authored JSON in every editor/preview roundtrip.

| Renderer family | All current static aliases | Art direction / identity contract | Guest essentials and recovery | Phase owner |
|---|---|---|---|---|
| `KhmerFloralGoldLayout` | `khmer-floral-gold`, `KHMER_FLORAL_GOLD` | Khmer Ceremonial Heritage: floral framing, warm gold; quiet reveal | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `RoyalGardenCinematicLayout` | `royal-garden-cinematic`, `ROYAL_GARDEN_CINEMATIC` | Khmer Ceremonial Heritage + Cinematic: garden composition; controlled opening | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `SilkHeritageLayout` | `silk-heritage`, `SILK_HERITAGE` | Khmer Ceremonial Heritage: silk texture and textile rhythm | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `TemplateBoilerplateLayout` | `template-boilerplate`, `custom-starter` | Neutral authoring foundation: starter layout retains authored content | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `KhmerCelestialLayout` | `khmer-celestial`, `KHMER_CELESTIAL`, `10`, `royal-khmer-wedding`, `1`, `royal-khmer`, `RUBY_RED`, `ROYAL_KHMER` | Khmer Ceremonial Heritage + Cinematic: celestial motif and optional scene | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `DigitalYesLayout` | `the-digital-yes-wedding`, `7`, `digital-yes`, `GOLD_LUXURY` | Cinematic Immersive: wax-seal scene with skip and static alternative | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `EmeraldLuxeLayout` | `emerald-canva-luxe-wedding`, `emerald_royal_luxe`, `emerald-royal-luxe`, `emerald royal luxe`, `emerald-luxe-wedding`, `9`, `2`, `emerald-luxe`, `EMERALD_GREEN` | Modern Editorial + Cinematic: emerald velvet composition and optional card reveal | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `WithJoyPortalLayout` | `withjoy-modern-portal`, `3` | Modern International Editorial: portal navigation and timeline | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `BlissEditorialLayout` | `bliss-editorial-wedding`, `4` | Modern International Editorial: asymmetric editorial spread and RSVP | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `CanvaKhmerWeddingTemplate` | `khmer-golden-canva-inspired-wedding`, `cover-khmer-golden-wedding`, `5`, `CHAMPAGNE`, `KHMER_GOLDEN` | Khmer Ceremonial Heritage: Kbach-inspired framing subject to rights/cultural review | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |
| `TemplateExperience` shared | `event-essential`, `koupreng-demo-wedding` | One shared engine with distinct authored/event type styling | same essential guest contract; preserve structured data | 10 / 13 / 16 |
| `DefaultTemplateLayout` fallback | unknown/dynamic key when `useFallback` | honest fallback, no fake premium identity | readable essential content; report unknown catalog mapping | 10 / 25 |

**Count:** 10/10 dedicated families, 38/38 static aliases, 2/2 named shared IDs and 1/1 fallback assigned. Dynamic server catalog count is **NOT TESTED** without an isolated API dataset.

## Capability tiers (design only)

| Tier | Required behavior | Permission and performance gate |
|---|---|---|
| Essential | readable cover/title, event facts, map/directions and RSVP when enabled; actions work without motion | lowest capability baseline; no pricing implication |
| Enhanced | brief reveal, gallery and media controls with static alternative | only after media consent and performance check |
| Cinematic | optional opening, depth, 2.5D/3D and controlled sound | explicit user action, skip/pause, reduced-motion/static path, rights and low-end budget |

A renderer may offer an Enhanced or Cinematic presentation while every guest still gets Essential access. Tier does not confer ownership or purchase rights. Phase 10 must compare current artwork and asset licenses family by family; Phase 16 must validate guest outcomes; Phase 25 must verify admin-authored preview/publish parity. A backend catalog entry without a static alias can use a shared/fallback path only after its published design and entitlement behavior are checked.

## Renderer verification matrix

For each row above, record fixture and real authored data at 320/390/768/1440 and short landscape, Khmer/English content, long names, opening skip/replay, focus order, motion reduction, audio/video consent, media failure, map/calendar, RSVP enabled/disabled/deadline, private/expired token, visual regressions and LCP/CLS. One dedicated renderer passing does not certify the other nine.
