# Asset reuse and new artwork

Original Royal Garden blue/gold frame, guest plaque, calligraphy, monogram, open-button artwork, video footer, calendar, map designer, and audio selection remain available. Existing owner photographs, dates, titles and media override sample content.

The Burgundy Heritage preset uses newly generated gold scrollwork and burgundy velvet, rather than copying imagery from the recording. It retains the original frame as the Royal Blue option. Uploaded custom frames are preserved. A selective SVG filter handles blue portions of the supplied original information border when a custom background is used with burgundy; it is never applied to uploaded photographs.

| Public asset | Size | Purpose |
| --- | --- | --- |
| `templates/royal-garden/v4/burgundy-velvet.webp` | 480 × 1200, 13,010 bytes | One generated velvet panel, mirrored by CSS |
| `templates/royal-garden/v4/heritage-frame.webp` | 1024 × 1536, 281,386 bytes | Original transparent gold scrollwork |
| `templates/royal-garden/v4/heritage-frame-640.webp` | 640 × 960, 163,138 bytes | Responsive gold frame |

Both images were produced with the built-in `image_gen` tool; no API key was needed. Pillow only resized/encoded the outputs to WebP and preserved alpha. Original generated PNGs remain in the Codex generated-images directory. Project references point only to repository assets. [Exact prompts](asset-prompts.md) document the generation.

New small components: `RoyalGardenCurtainReveal` (two-panel presentation only) and `RoyalGardenArtworkPalette` (inline SVG color filter). Existing `RoyalGardenIntro`, `RoyalGardenArtworkFrame`, `RoyalGallery`, layout, scene editor and intro editor were extended. The gallery still consumes the saved gallery array and shared Modal. No new image storage, REST endpoint, payment flow, monogram identity or calendar was added.
