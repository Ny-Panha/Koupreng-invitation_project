# Implementation and saved-data contract

## Cover and responsive canvas

The owner photograph resolves through the existing `CoverBackground` precedence. It fills the complete cover with `object-fit: cover`; `coverX`, `coverY`, and `coverZoom` remain editable. The new transparent frame is above the photograph, followed by live text, guest band and functional button. The former polygon photo cutout is removed. A readiness signal prevents an unframed photograph flashing before the foreground loads; failed art releases the usable photographic fallback.

The complete source is sampled with CSS nine-slice framing. Top and bottom ornaments retain their source width scale: 40.5% and 35.5% source slices correspond to 72cqw and 63.11cqw. Only the straight middle side edges repeat. There is no background extraction, hue change, AI replacement, or stretching of carved corners. The complete untouched 2160×3840 source is in `sources/` and its SHA-256 matches the supplied file.

The default artwork CTA is a real, labelled button with a stable minimum 44px hit area. Its image retains the original 3:1 ratio. The button has no shadow, filter, border, backing gradient, or glow, including hover. Only its image fades/scales, so an animated hit target does not move under pointer or keyboard users. Localized text and the older circular style remain explicit editor choices. Guest text remains authorized live React text; there is no guest identity in presentation settings.

Mobile fills the viewport width where the portrait permits it. Tablet uses a larger portrait canvas; desktop adds a 20px perimeter. Shared canvas variables align language, music, video Skip and information controls. Larger screens have an owner-photo backdrop and restrained existing kbach pattern. `flow-root` prevents collapsed margins from scrolling the outer document during video/section focus.

## Film overlay and soundtrack

Calligraphy and live date share one footer-anchored grid. The original footer has a transparent upper region: its central painted crest starts at source y=602, relative to source width 3840. The anchor accounts for that region rather than treating the transparent image rectangle as the ornament. A 4px line-box gap leaves additional clearance for the date glyphs above the gold. A bounded negative artwork margin uses transparent source padding to bring the lettering and date closer; the complete image retains its aspect ratio and alpha.

The wide film calligraphy replaces the opening calligraphy in the video. A masked gold shimmer follows the supplied artwork's own alpha. Finite fade/reveal and continuous shimmer pause in hidden/reduced/data-saving states. Failed film art can recover when the owner selects another source.

The date uses canonical `resolveEvent`, `formatEventDate`, and `formatNumerals`. It is not a separate Studio date. Optional event time is also canonical. Khmer defaults to locally licensed Moul; English uses the existing Latin display face. Battambang and Kantumruy Pro remain explicit Khmer date options. No personal names or authored paragraphs are automatically translated.

There is one persistent audio element in the Royal Garden root. The catalog default is `/music/Nisai-និស្ស័យ.mp3`; other templates retain their existing defaults. The track is available in the existing picker. Playback starts from the guest's Open gesture, uses the same audio node through cover/video/information and language changes, and never rewinds on toggle. Playing, idle, loading and blocked states have distinct icon/state feedback. A denied play promise exposes retry; a guest pause remains paused after video completion. Saved owner URLs, disabled music and explicit empty music remain unchanged.

The pre-wedding video remains permanently muted. The top right contains the single soundtrack toggle and a separate Skip control. Film pause is available on the video surface; a film Play indicator appears only when paused or keyboard-focused, with Replay when paused and configured. Protected media loading, entitlement checks, failure recovery and the information gate are unchanged. No video/audio is downloaded before interaction in the measured catalog profile.

## Information and closing

The source-proportional gold border remains stationary. One inner scroll area contains all enabled sections. Its lower inset changes from 40cqw to 33cqw, exposing more useful content while staying clear of lower ornaments. Six-pixel inline clearance protects the lower inner corners. Closing/footer padding is reduced. First-heading, final signature, keyboard End and section navigation are browser-tested. The final signature only fades, preventing its reveal animation from moving it below the scroll boundary.

The extra flow-footer image is removed; the original permanent bottom ornament stays. Thank-you and apology use the same semantic letter component, heading, divider and body styles. Empty letters disappear. Existing authored English variants are used when supplied; owner Khmer-only text stays as authored. A small real Koupreng logo/text signature replaces decoration at the end. This is distinct from an owner cover-brand setting or entitlement.

## Presentation persistence

Existing `cinematicIntro` fields remain compatible. The additions are:

| Field | Meaning |
| --- | --- |
| `cinematicIntro.buttonStyle` | `artwork`, `text`, or `circle`; default artwork |
| `informationScene.monogram` | `mode`, optional `asset`, `scale`, `positionY` |
| `informationScene.spacing` | `compact`, `balanced`, `airy` |
| `informationScene.brandStyle` | Koupreng `logo` or `text` signature |
| `informationScene.video.artworkSrc` | Existing upload pipeline; empty stays cleared |
| `informationScene.video.artworkEnabled` | Film lettering visibility |
| `informationScene.video.dateEnabled` | Canonical film date visibility |
| `informationScene.video.dateFont` | `moul`, `battambang`, `kantumruy` |
| `informationScene.video.showTime` | Show canonical event time |

`auto` monogram uses supplied fixed រ ល art only in the catalog. Hosted invitations derive their own initials. Fixed supplied artwork requires an explicit owner selection; uploaded/custom/initials/hidden modes are supported. A deliberately cleared custom upload stays cleared. The known old built-in opaque frame path resolves to the new built-in transparent frame; custom and cleared frame values are preserved.

The same normalizer feeds Studio preview and published rendering. Existing adapters retain these nested settings; existing recursive media replacement uploads temporary data URLs before save. No backend DTO, media entitlement, preview origin, payment, publishing, autosave, conflict, undo or redo contract is replaced.

## Source assets and fonts

All supplied originals are retained. Production derivatives use existing Pillow for full-source resize and WebP compression only, quality 88/method 6. This adds no runtime dependency. `asset-manifest.json` records dimensions, sizes, alpha, origin and hashes. The original button remains in `public/invitations/khmer-celestial/`.

Moul, Koulen and Battambang were rendered beside the supplied lettering in an actual Chromium screenshot. Moul has the closest broad ceremonial forms among the installed licensed fonts. The result is an editable typographic companion, not a claim that a font duplicates the raster calligraphy. Khmer OS Muol Light is not installed and was not downloaded or falsely claimed. Existing OFL files remain beside local fonts.
