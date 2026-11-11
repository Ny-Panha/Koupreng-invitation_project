# Renderer isolation and preservation

The registry remains **10 dedicated families / 38 static aliases**, plus shared identifiers `event-essential`, `koupreng-demo-wedding` and the `DefaultTemplateLayout` fallback. No renderer component, registry, ID/slug/code precedence, serializer, invitation media, preview session/origin validation or backend entitlement code changed. Dynamic backend catalog records are unavailable to this fixture and remain **BLOCKED** for live parity.

| Dedicated family | Representative fixture key | Phone/desktop capture |
|---|---|---|
| `KhmerFloralGoldLayout` | `khmer-floral-gold` | 390/1440 |
| `RoyalGardenCinematicLayout` | `royal-garden-cinematic` | 390/1440 |
| `SilkHeritageLayout` | `silk-heritage` | 390/1440 |
| `TemplateBoilerplateLayout` | `template-boilerplate` | 390/1440 |
| `KhmerCelestialLayout` | `khmer-celestial` | 390/1440 |
| `DigitalYesLayout` | `the-digital-yes-wedding` | 390/1440 |
| `EmeraldLuxeLayout` | `emerald-canva-luxe-wedding` | 390/1440 |
| `WithJoyPortalLayout` | `withjoy-modern-portal` | 390/1440 |
| `BlissEditorialLayout` | `bliss-editorial-wedding` | 390/1440 |
| `CanvaKhmerWeddingTemplate` | `khmer-golden-canva-inspired-wedding` | 390/1440 |

Both shared identifiers were captured at 390/1440 with fictional GET mocks where local catalog entries were absent. The fallback is covered by `templateRegistry.test.jsx` source/unit behavior, **not** a public screenshot; it is not claimed visually tested. The capture manifest records `[data-template-renderer]` identity for all 12 fixture identifiers. Authored template CSS, `--ui-*` legacy constants and dedicated assets were preserved. Studio chrome changes remain outside the preview iframe.

Pixel comparison: 15 of the 24 representative renderer screenshots were exact. The other nine had 0.001–2.779% changed pixels. Repeated capture of `template-boilerplate` shifted its 390px difference from 6.323% to 0.001% without source changes, so at least part of the variance is capture timing. Differences in the other dynamic covers/text require human image review before claiming strict pixel parity. No renderer root identity, title/content order or page exception changed in sampled fixtures. Raw [`capture-diff.json`](evidence/capture-diff.json) and ignored images support review.

The 38 aliases are statically reconciled by the [Phase 02 renderer inventory](../phase02-experience-architecture-2026-11-11/README.md) and unchanged registry tests; the 24 screenshot cases cover representative keys, **not** every alias. A backend-connected isolated dataset is needed to verify current production catalog mappings and published parity.
