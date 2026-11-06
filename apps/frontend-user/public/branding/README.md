# គូព្រេង — Official Logo Developer Asset Pack

**Revision:** Red/burgundy backdrop behind the Khmer lettering removed. The standalone red heart on the SMS envelope is part of the approved design and remains intact. Transparent backgrounds are preserved.

## Included

- `png/koupreng-logo-4096w-transparent.png` — 4K-wide transparent PNG for high-resolution uses.
- `png/koupreng-logo-2048w-transparent.png` and `png/koupreng-logo-1024w-transparent.png` — smaller transparent PNG versions.
- `png/koupreng-logo-original-transparent.png` — trimmed original raster artwork.
- `webp/` — 21 transparent, quality-92 WebP widths from 64 to 4096px.
- `webp-lossless/` — 512, 1024, 2048, 4096px transparent lossless WebP.
- `preview/` — light/dark visual checks (these JPGs do NOT have transparency).
- `integration/` — React example and a ready-to-use Codex task prompt.
- `manifest.json` — sizes, formats, byte counts, and SHA-256 checksums.

## Recommended use

| Location | Typical size | Use |
|---|---:|---|
| Navbar on mobile | 160-320px visual width | 320w or 640w WebP (for 2× density) |
| Navbar on desktop | 180-260px visual width | 480w or 640w WebP |
| Footer | 220-360px visual width | 512w or 768w WebP |
| Hero / about brand | 500-900px visual width | 1024w or 1920w WebP |
| Social brand graphics | Depends on composition | 2048w PNG / WebP |
| Large export | 4096px width | 4096w PNG or lossless WebP |

The full wordmark is highly detailed and may be unreadable as a 16×16 favicon. Design a *separate simplified brand icon* for favicons instead of shrinking the full wordmark beyond legibility.

## React (Vite) integration

Copy the **`webp/`** folder into `public/assets/brand/koupreng/`. Then import or use the component at `integration/KouprengLogo.tsx`, optionally adjusting its asset base path.

Keep `width: auto; height: auto; object-fit: contain` and set the rendered `width` responsively. Don't put a colored rectangle behind the logo and don't use the preview JPGs in production.

## Notes

- 4096w assets were **upscaled from original raster artwork**, not rendered as a native vector source. The pack does not contain a true SVG.
- All PNGs/WebPs have a true alpha channel. See manifest for dimensions and hashes.
- Verify final Khmer spelling **គូព្រេង** with a human before brand launch; AI-generated decorative Khmer text is not guaranteed typographically accurate.
- Gold artwork is intended to be used over light/dark surfaces with sufficient visual contrast.
