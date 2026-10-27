# Royal Garden V2 — golden calligraphy opening

Engineering review, 27 October 2026. Review the [comparison gallery](review.html) and [QA record](qa.md).

Phase 12 was completed first on `main`: source commit `27bf32c81f916b065c35ff9851ff325c70e186f8`, report/package commit `556101b4ac1cc79ecb95dbfc733afdbcd0a6c92c`. The golden opening is a separate change on `feature/royal-garden-golden-calligraphy`, based on that verified current main. No worktree was created. [PR #72](https://github.com/Ny-Panha/Koupreng-invitation_project/pull/72) was inspected: its Royal Garden implementation was already present on main, so no duplicate merge was needed. This branch is for a new draft PR; it must not be merged automatically.

## Result and choreography

The supplied transparent gold calligraphy is an independent foreground image, with `object-fit: contain`, responsive width, safe-area spacing and a restrained gold shadow. The existing `CoverBackground` continues to render owner images/videos underneath the palette wash. The template's cover asset remains `ivory.svg`.

The existing scene state machine and timings remain intact. On the cover, the patterned backdrop fades in and the artwork appears. Opening starts the 2.4-second ornament scene, with a masked light sweep across the lettering. Gentle motion tilts/translates the complete flattened image around the butterfly's corner; no separate wings are invented. During the 4.2-second title scene, the artwork scales back and dissolves, while real names/date appear and the first portrait fades in behind it. Portraits follow the saved order and duration, followed by the existing 0.7-second invitation reveal. The last portrait is retained during this reveal to avoid a cover flash.

Skip, slideshow pause, hidden-tab timing, keyboard focus transfer and user-gesture audio behavior remain in place. System/configured reduced motion and data-saving preference bypass the animated sequence after Open. The cover itself also suppresses decorative motion under reduced motion. Still mode removes the decorative effects. The hosted ticket action is hidden while the intro exists and returns with invitation content; this prevents it covering the mobile Open button or portrait text.

## Additive saved-data contract

All settings live inside the existing `cinematicIntro` version-1 object. Existing adapters already normalize and preserve this object, so no duplicate serializer, new endpoint or database migration was introduced.

| Field | Allowed/default behavior |
| --- | --- |
| `style` | New default `golden-calligraphy`; explicit `oval` and `minimal` stay supported |
| `artworkSrc` | Missing/undefined inherits bundled art; empty string or null means explicitly cleared; a safe owner URL overrides the default |
| `artworkAlt` | Editable description, bounded to 300 characters |
| `artworkScale` | 0.65–1.2; default 1 |
| `artworkPosition` | `upper`, `center`, `lower`; default center |
| `animationPreset` | `gentle`, `shimmer`, `still`; default gentle |
| `palette` | `ivory-royal`, `emerald-gold`, `burgundy-romance`; default ivory |

The editor reuses signature-validated JPEG/PNG/WebP selection and the existing recursive inline-media upload/save pipeline. Removing art invalidates any in-flight file read, so a late FileReader callback cannot resurrect it. Restore Default removes the owner override; a subsequent normalization does not reinterpret that as an explicit clear. Unsafe executable/SVG artwork values fail closed. A failed artwork request falls back to the invitation title and opening controls.

Names and date remain canonical event text. Existing authored headings/subtitles remain editable for legacy styles and for the cleared-artwork fallback, including English. The raster's fixed Save the Date wording is not repeated in the golden portrait overlay. Slides, gallery and music fields retain their existing contracts.

## Artwork and performance

The original owner-supplied file was inspected as RGBA with a transparent corner and an alpha range of 0–255. Its original 3840×2160, 5,949,486-byte file remains untouched outside the repository. Official libwebp 1.6.0 CLI encoding (`-q 90 -alpha_q 100 -m 6 -sharp_yuv`) produced:

| Asset | Dimensions | Bytes | Reduction from original |
| --- | --- | ---: | ---: |
| `golden-calligraphy.webp` | 1600×900 | 657,920 | 88.9% |
| `golden-calligraphy-960.webp` | 960×540 | 275,214 | 95.4% |

The image uses responsive `srcset`, high fetch priority and asynchronous decoding. The sweep mask reuses the image's selected `currentSrc`, avoiding an additional larger-image request on mobile. Owner artwork uses its own source without the bundled srcset. The existing next-portrait decode respects data-saving mode. No runtime library or font was added.

SHA-256:

```text
original: 3367FEB43D8E3F1760A29937098540D58BF8D6FEDC1008036B828225FF179A3F
1600px:   4844AF25CD5473EBA97925F5D075F3C28883640F769DF28B52FDAD09F380379B
960px:    972AD7BCFA4A4D29E29365A6C5B2C3F36AF2136E90C7E0EF7AEE09BAA876736E
```

The final production build reports main JS 452.05 kB / 131.53 kB gzip, Studio edit chunk 201.28 / 53.22 kB, and Royal Garden JS 27.33 / 9.77 kB plus CSS 25.86 / 5.88 kB. Main remains effectively unchanged from Phase 12; the Studio edit chunk grows about 4.82 kB raw / 1.03 kB gzip. Artwork is fetched only when the opening renders.

## Review limits

Automated browsers exercise real production frontend code with deterministic API fixtures. Upload/save/reload/publish tests verify frontend payloads and rendering, not a live production storage provider. Full backend/admin/worker verification belongs to the preceding [Phase 12 package](../../phase12/11-final-engineering-report.md). Physical iOS/Android devices, assistive-technology listening and final native Khmer editorial approval remain human review items. No production deployment, payment operation or automatic merge was performed.
