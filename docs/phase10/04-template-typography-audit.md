# Typography audit

| Renderer family | Existing direction / resulting safeguards |
|---|---|
| Celestial / Royal Khmer aliases | Moul display, Battambang body, Cormorant English; locally loading Khmer fallback, crisp ornaments and realistic Studio samples |
| Silk Heritage | Existing local Silk faces retained; authored cover titles/subtitles remain in their original language; dress-code name connected |
| Royal Lotus | Existing display/body pairing retained; saved Khmer heading and Latin choice now reach their actual variables |
| Digital Yes | Existing cinematic type identity retained; authored Khmer names get shaping-safe line height and spacing |
| Emerald | Latin display retained for Latin names; Khmer names use the local ceremonial fallback and safe line height |
| WithJoy | Modern Kantumruy for Khmer names; saved font values honored without character spacing |
| Bliss | Editorial Latin preserved; Khmer names use a legible local display fallback |
| Shared garden / golden Khmer | Existing typography and original artwork retained; local Khmer body/fallback faces reduce dependency on external font responses |
| Event Essential | Neutral application stack remains; no wedding font controls are forced onto the event editor |

Battambang 400/700 and Noto Sans Khmer variable faces are bundled with their OFL licenses. Existing Moul, Bayon, Kantumruy, DM Sans and Cormorant assets remain. New Khmer faces total 209,064 bytes of WOFF2. Matching Cinzel, Playfair Display (roman/italic) and Koulen defaults add 279,316 bytes; all new faces total 488,380 bytes. These faces load on demand with font-display:swap, without a bulk preload. Conversion used fonttools 4.67.0 and Brotli 1.2.1 as temporary tooling, not runtime dependencies.

The Studio preview shows real names plus Khmer combining signs, Khmer/Latin digits and an English sample. Unknown saved font names remain selectable and stored; Noto Sans Khmer supplies fallback glyphs. Palette controls remain Celestial-specific; the compatible Silk/Royal Lotus flows expose typography without unsupported palette switches.

Browser tests load the actual face, exercise long Khmer names across all catalog templates, check mobile widths and capture guest renders. Human Khmer editorial judgement, optical hierarchy on physical screens and measured font CLS under real mobile networks remain unverified.

A blocked Google CSS import was reproduced as an actual blank route in Chromium/Firefox. The three blocking imports are removed. Local declarations preserve the same default type families; optional custom font links remain non-blocking. The offline-font browser matrix verifies actual long Khmer names and loads both local body/fallback faces.
