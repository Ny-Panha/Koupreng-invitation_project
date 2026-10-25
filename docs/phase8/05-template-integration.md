# Template compatibility

Capabilities extend the existing registry; no parallel rendering architecture was introduced. The same field adapter feeds Studio live messages, saved drafts, preview and public invitation conversion. The matrix below covers all 11 static catalog entries plus Event Essential. Each supported row runs eight rendering scenarios in `eventTemplateMatrix.test.jsx`; the 97th check verifies capability exclusions/aliases.

| Template ID | Name / category | Program | Date / countdown / calendar | Editor | Renderer / tests |
| --- | --- | --- | --- | --- | --- |
| `silk-heritage` | Silk Heritage / wedding | Multi-day | Yes | Guided + advanced; section order | Dedicated, 8 cases |
| `khmer-celestial` | Khmer Celestial / wedding | Multi-day | Yes | Guided + advanced | Dedicated, 8 cases; browser/axe/SQL journey |
| `khmer-royal-lotus` | Khmer Royal Lotus / wedding | Multi-day | Yes | Guided + advanced | Dedicated, 8 cases |
| `the-digital-yes-wedding` | The Digital Yes / wedding | Multi-day | Yes | Guided + advanced | Dedicated, 8 cases |
| `emerald-canva-luxe-wedding` | Emerald Luxe / wedding | Multi-day inside existing flip card | Yes | Guided + advanced | Dedicated, 8 cases |
| `withjoy-modern-portal` | WithJoy Portal / wedding | Multi-day | Yes | Guided + advanced | Dedicated, 8 cases |
| `bliss-editorial-wedding` | Bliss Editorial / wedding | Multi-day | Yes | Guided + advanced | Dedicated, 8 cases |
| `garden-royal-khmer-wedding` | Garden Royal Khmer / wedding | Multi-day | Yes | Guided + advanced | Existing shared engine, 8 cases |
| `royal-khmer-wedding` | Royal Khmer / wedding | Multi-day | Yes | Guided + advanced | Celestial alias, 8 cases |
| `cover-khmer-golden-wedding` | Golden Khmer cover / wedding | Multi-day | Yes | Guided + advanced | Canva alias, 8 cases |
| `khmer-golden-canva-inspired-wedding` | Golden Khmer / wedding | Multi-day | Yes | Guided + advanced | Dedicated Canva, 8 cases |
| `event-essential` | Event Essential / all six event categories | Multi-day for weddings; neutral activities otherwise | Yes, opt-in | Existing guide + advanced; wedding editor reused | Neutral renderer, 8 cases |
| `template-boilerplate`, `custom-starter` | Developer scaffolding | Intentionally unsupported | Intentionally unsupported | Controls excluded | Existing developer renderer retained |

Admin preset aliases use the same components/capabilities; `SILK_HERITAGE` ordering and Garden's numeric-ID collision are explicitly checked. `koupreng-demo-wedding` is a registry-level legacy shared alias, not a separate static catalog design. Unknown or unavailable catalog templates keep the existing unavailable guard. Custom CMS schedule/countdown blocks reuse the same new primitives when applicable.

Fixed layouts retain their established placement. Only Silk's existing section-order support is exposed as reorderable in this change. Registry tests are render/contract proof; responsive pixel inspection is representative, not every skin at every width.
