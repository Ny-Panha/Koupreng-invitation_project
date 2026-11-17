# 09 — guest renderer families and motion review

The [AST registry ledger](evidence/renderer-registry.json) confirms **10 distinct dedicated components and 38 static aliases**. The resolver still prioritizes slug/code/templateCode and Admin preset metadata before colliding numeric IDs. `event-essential` and `koupreng-demo-wedding` remain shared IDs; `DefaultTemplateLayout` remains the fallback. The registry, art, fonts, media, and static aliases were **not changed**. The dynamic backend catalog is `BLOCKED` without a safe isolated dataset.

| Dedicated family | Phase 05 disposition |
| --- | --- |
| `KhmerFloralGoldLayout` | KEEP bespoke welcome/open/skip; timed and media behavior needs Phase 10/16 device review. |
| `RoyalGardenCinematicLayout` | KEEP protected cinematic composition and stage policy; no new global scene. |
| `SilkHeritageLayout` | KEEP family opening and existing skip; no family CSS or artwork change. |
| `TemplateBoilerplateLayout` | KEEP starter identity; existing missing-media fallback appears in captures; inspect timed content variance. |
| `KhmerCelestialLayout` | KEEP family ceremony and media logic. |
| `DigitalYesLayout` | KEEP envelope identity; moving indicator contributes capture jitter. |
| `EmeraldLuxeLayout` | KEEP curtain/card identity; button/text animation timing contributes capture variance. |
| `WithJoyPortalLayout` | KEEP editorial portal; frozen fixture clock removes countdown text drift in current captures. |
| `BlissEditorialLayout` | KEEP editorial identity and RSVP drawer. |
| `CanvaKhmerWeddingTemplate` | KEEP Khmer art; inspect desktop capture variance. |

The shared `TemplateExperience` fallback gate received a visible localized Skip control during both closed and opening states, timer/cinematic cancellation, runtime reduced-motion completion, and video pause. The ordinary gate requests audio on the explicit Open click rather than after a timer loses user activation; the cinematic provider still defers its music callback until video completion and requires device review. Skip is silent. This shared change does **not** imply every dedicated family uses that gate; each dedicated renderer owns its own opening. Unit tests cover shared gate behavior and the browser suite exercises one shared path. Dedicated family captures are `FIXTURE VERIFIED` for initial rendering only. Deep RSVP/map/calendar, media denial, low bandwidth, actual phone audio permission, and 10-family keyboard/gesture certification are `NOT TESTED`.

The four Phase 04 differing families were inspected from their **actual paired PNGs**. Boilerplate showed moving/possibly missing section content at capture time; Digital Yes showed a tiny animated indicator; Emerald showed cover text/button absent at one animation phase; WithJoy showed countdown changes. Because their source was unchanged in Phase 04, timing/nondeterminism is plausible, but artwork parity remains `REVIEW REQUIRED`. The first Phase 05 harness used Playwright's fixed clock and lost performance entries. A `Date`-only wall-clock override plus a warm screenshot and two compositor frames retained those entries and produced painted covers/cards in targeted repeats. The full comparison nevertheless still shows unpainted Silk desktop content and missing Emerald mobile cover action text, despite no family source edit. These are open visibility/paint gates requiring headed-browser and device diagnosis. Both stages also retain bounded fallback responses for 18 template-slug fixture reads, so these are initial fallback renders, not a complete safe backend catalog test. See the final [pair review and harness limits](14-before-after-capture-and-trace-index.md).
