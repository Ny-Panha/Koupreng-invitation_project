# Regal Scroll Gold #8 and wedding music provenance

2026-11-06. Sources were supplied locally by the project owner and inspected before
integration. No generated replacement frame or private reference footage was used.

## Original frame

- Source: `apps/frontend-user/public/templates/khmer-floral-gold/regal_scroll_frame_08_4k.webp`.
- Owner-selected name: **Regal Scroll Gold #8**.
- 4096 × 4096, RGBA, 3,951,330 bytes. Alpha range 0–255; transparent center.
- SHA-256: `1df759c3a61075e483d1fcf1952b65ba7124c4135bac3bec025ed115185c1024`.
- Original preserved locally, unchanged, and excluded from Git. A clean checkout
  contains the optimized runtime derivatives. No deployment was performed.

`python scripts/qa/prepare-regal-scroll.py` reads that exact checksum. Pillow/numpy
remove highly saturated red/lemon-yellow extraction residue, retain the connected
ornament and its adjacent antialiasing, and remove detached flecks. This processing
keeps the square canvas, silhouette, top crest, lower jewel and transparent center.
No geometric crop, rotation, stretch or generated repaint was applied.

| Runtime file | Dimensions | Bytes | Alpha |
| --- | --- | --- | --- |
| `regal-scroll-gold-480.webp` | 480 × 480 | 56,372 | 0–255 |
| `regal-scroll-gold.webp` | 960 × 960 | 158,114 | 0–255 |

Both files live under `apps/frontend-user/public/templates/khmer-floral-gold/`.
The component uses responsive sources, explicit dimensions and `object-fit: contain`.
Browser canvas checks verify zero alpha at the center and corner. Rendered covers
were inspected against ivory; the source/cleaned previews were also viewed against
the image viewer's dark transparent surface. Gold details remain intact, with no
visible red/yellow residue or opaque center in the reviewed captures.

The first processing attempt exposed Pillow's read-only numpy-backed image mask:
it produced empty derivatives. Making the mask writable and asserting a substantial
connected silhouette plus full alpha range corrected this before integration.

## Catalog preview

The public thumbnail is a **capture of the actual rendered opening page**, including
editable React names `វីរៈ`, `&`, `សុមាលី` in the closer staircase composition.
It is not the former schematic SVG. Toolbar controls are hidden only during export.

Reproduction:

```powershell
# Run from apps/frontend-user with the local app on port 4384.
npx playwright test --config=playwright.floral-v5.config.js floral-v5-visual.spec.js --project=chromium --workers=1
# Run from the repository root.
python scripts/qa/prepare-floral-v5-preview.py
```

The export is a 1024 × 1792 local PNG. Optimized runtime variants are 320 × 560,
640 × 1120 and 960 × 1680 WebP. Exact references to the old local `preview.svg`
map to this capture in the public image adapter. Separately uploaded admin previews
keep their own URLs. Original SVG artwork remains available in the repository.

## Wedding song

- Source/runtime file: `apps/frontend-user/public/music/Noly Record - wedding-Song.mp3`.
- Public URL: `/music/Noly%20Record%20-%20wedding-Song.mp3`.
- SHA-256: `599fead49181a2f9c3a39366a0310599fa293c03c9c7cc7e70201161d1550e08`.
- 3,418,413 bytes; MP3, stereo, 48 kHz, approximately 128 kbit/s, duration 213.62 s.
- Fully decoded with the installed imageio-ffmpeg FFmpeg 7.1 binary. Local HTTP
  delivery reports `audio/mpeg`; real browser tests exercise the MP3 itself.

The project owner explicitly confirmed **“Yes — demo and owner music library”**
after being asked about public streaming, commercial invitations and the marketing
demo. Inclusion relies on that owner confirmation; possession of the MP3 alone was
not treated as permission, and no separate license document was supplied/reviewed.

The cleared track is the Floral marketing demo default and a selectable library
entry. Its original encoding is retained. Owner presets stay silent until a song
is selected; explicit No Music remains silent. Other library defaults are preserved.

## Downloaded raster motion textures

All new animated petal, butterfly, heart and star decorations use downloaded
bitmap sources, optimized as transparent WebP. No new SVG drawing is used for
these effects. The layer covers the full invitation background in every scene;
center textures have lower opacity and live content paints above it. It has no
pointer input or accessibility-tree content. There are seventeen reused image
elements (seven lotus petals, four butterflies, three hearts and three stars), nine
unique runtime files including the wind background, and no particle engine or
canvas render loop. Four butterfly colors follow looping curved flutter paths; hearts
drift in multiple directions, rather than sharing a straight rainfall path.

Seven individual photographed lotus-petal cutouts fall vertically in fixed lanes.
Each lane has an independent 24–31-second period and irregular negative delay,
so the petals do not form a diagonal line or sweep horizontally. Matching downloaded
blush rose/hydrangea watercolor borders sway gently at the top and bottom across the
cover, welcome/calendar and wedding details. Their 12/14-second wind cycles use small
rotations/translations with an open ivory center. Reduced motion keeps backgrounds static;
data saving removes the additional moving/large background layers.

| Runtime file | Original source / creator | Reuse license |
| --- | --- | --- |
| `lotus-petal.webp` | [Lotus photograph, PxHere 560219](https://pxhere.com/en/photo/560219). One upright pink petal is traced from the photograph with an antialiased transparent mask; its original veins and pale base are retained. | CC0, explicitly stated on the source page |
| `golden-butterfly.webp` (8,150 bytes) | [Butterfly, Bright, Colored](https://www.publicdomainpictures.net/en/view-image.php?image=432215&picture=butterfly-bright-colored), Victoria Borodinova; upper-left orange butterfly extracted from the human-created PNG sheet | CC0 |
| `pink-butterfly.webp`, `blue-butterfly.webp`, `violet-butterfly.webp` | Pink, blue and violet butterflies extracted from that same downloaded human-created PNG sheet | CC0 |
| `gold-star.webp` (2,424 bytes) | `PNG/star_04.png` in [Kenney Particle Pack](https://kenney.nl/assets/particle-pack); [creator's OpenGameArt distribution](https://opengameart.org/content/particle-pack-80-sprites), Kenney Vleugels | CC0, also included in the downloaded `License.txt` |
| `blush-heart.webp` (1,654 bytes) | `PNG/symbol_01.png` in the same Kenney pack | CC0 |
| `blush-floral-border-top.webp`, `blush-floral-border-bottom.webp` | [Floral Watercolor Flowers Border](https://www.publicdomainpictures.net/en/view-image.php?image=270427&picture=floral-watercolor-flowers-border), Karen Arnold; [free standard download/license](https://www.publicdomainpictures.net/en/free-download.php?id=270427&image=floral-watercolor-flowers-border). Matching hand-painted rose/hydrangea edges cropped from the 1920 × 1881 JPEG, softly desaturated with white paper converted to alpha. | CC0 |

Commercial reuse permission was verified at the primary source, rather than
inferred from search thumbnails. Standard-resolution images and the freely
distributed pack were downloaded without paid access. No identifiable people,
brands or personal content are used in these decorations.

`python scripts/qa/prepare-floral-ambience.py` reproduces the derivatives. It trims
transparent padding, extracts the connected butterfly without adjacent sheet
artwork, converts the Kenney particle luminance into transparent alpha, and tints
the heart/star to blush/champagne. Only source-derived raster pixels are used.
The runtime files and normalized complete Kenney license are under
`public/templates/khmer-floral-gold/effects/`. Downloaded masters remain local.
[Source and runtime checksums](V5_EFFECT_SOURCES.json) identify each exact file.
