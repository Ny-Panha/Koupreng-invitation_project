# Template asset licenses

## Cinematic marketing landing (2026-10-14)

The public landing reuses the documented Silk Heritage photographs, preview and
woven SVG, Kantumruy Pro and Cormorant Garamond WOFF2 files below. No additional
photograph or font was downloaded. Local CSS family aliases do not alter the font
files. The hero botanical line drawing and invitation framing are original
project SVG/CSS. Photograph subjects are explicitly sample/demo imagery.

Public gallery covers come from the existing catalog/template assets; existing
rights-review limitations for older templates still apply. No competitor art,
logo, photo, text, source or layout was copied.

The Cover Khmer Golden artwork is original project material; no third-party media was downloaded for it.

| Asset | Source | License note |
| --- | --- | --- |
| `public/templates/cover-khmer-golden-wedding/cover-bg.svg` | Original project asset | Generated SVG artwork created for this repository. |
| `public/templates/cover-khmer-golden-wedding/cover-preview.svg` | Original project asset | Generated SVG artwork created for this repository. |

Music licensing and ownership evidence is not present in the repository and remains a release review item; see `docs/qa/known-limitations.md`.

## Silk Heritage (2026-10-13)

No runtime dependency was added. The folio uses React, existing shared media/music
controllers, native HTML dialog, SVG and CSS. No Lottie library, raster texture,
competitor ornament or third-party motion component is needed.

| Files under `public/` | Source / author | License and use |
| --- | --- | --- |
| `templates/silk-heritage/cover.svg`, `preview.svg`, `woven-ornament.svg` | Original project SVG composed for this change | Project material. A geometric woven abstraction, not a reproduction of a sacred or historical ornament. |
| `templates/silk-heritage/portrait.webp` | [Hiển Nguyễn, Pexels 17856348](https://www.pexels.com/photo/portrait-of-a-wedding-couple-17856348/) | [Pexels License](https://www.pexels.com/license/), checked 2026-10-13; allows websites, invitations and templates sold commercially. Demo-only photo; no endorsement claim. |
| `templates/silk-heritage/together.webp` | [Hiển Nguyễn, Pexels 17856349](https://www.pexels.com/photo/newlyweds-holding-hands-and-standing-together-17856349/) | Same Pexels License. Attribution is optional; credit is retained here. Do not resell as a standalone image or redistribute as a stock library. |
| `fonts/silk-heritage/Moul-Regular.woff2` | [Moul Project / Google Fonts](https://github.com/google/fonts/tree/main/ofl/moul) | SIL OFL 1.1; copyright 2020 Moul Project Authors. Full font converted to WOFF2; adjacent `Moul-OFL.txt` retained. |
| `fonts/silk-heritage/KantumruyPro.woff2` | [Kantumruy Pro Project / Google Fonts](https://github.com/google/fonts/tree/main/ofl/kantumruypro) | SIL OFL 1.1; copyright 2022 Kantumruy Pro Project Authors. Variable font converted to WOFF2; adjacent `KantumruyPro-OFL.txt` retained. |
| `fonts/silk-heritage/CormorantGaramond.woff2` | [Cormorant Project / Google Fonts](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond) | SIL OFL 1.1; copyright 2015 Cormorant Project Authors. Weight 600 instantiated, Latin and punctuation subset, converted to WOFF2; adjacent `CormorantGaramond-OFL.txt` retained. No reserved font name is declared in the downloaded notice. |

The font sources and license files were downloaded from the maintained Google
Fonts repository on 2026-10-13. The photos are published static assets, not an
executable package. Pexels' image service supplied 960px compressed WebP variants:
`https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=960&fm=webp&q=80`.
Their sizes are 103,634 and 99,152 bytes. Fonts are 52,296, 76,848 and 24,320 bytes.
Files are served locally; the template does not hotlink photographs or fonts.

Font conversion used temporary `fonttools[woff]` tooling outside application
dependencies. The full legal notices accompany every font. The asset inventory
with sizes and SHA-256 hashes is `docs/qa/silk-heritage/asset-inventory.json`.

Published invitations use host media and stored family details. The demo is
explicitly labeled; it does not turn the models in the stock photographs into
Koupreng customers. Silk Heritage does not load the repository's existing demo
songs. Host-selected music still works through the shared controller; uploaders
must have rights to their selected media. Existing music and photograph licensing
warnings for other templates remain release review items.
