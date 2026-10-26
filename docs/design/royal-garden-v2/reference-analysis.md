# Royal Garden V2 reference analysis

Reviewed 26 October 2026. Starting commit: `be949921` (`origin/main`). PR [#53](https://github.com/Ny-Panha/Koupreng-invitation_project/pull/53) is an unmerged draft, head `55bbb154`, conflicting with current main. Integration uses a fresh branch and selectively ports its template folder; it does not merge the older branch's history or overwrite current Studio work.

## Verified sources

- Supplied `IMG_0204.MP4`: 21,317,041 bytes, H.264, 1088×1920, 17:30 aspect ratio, 27.32 seconds, approximately 29.55 fps, AAC audio. This matches the requested new recording duration. The separately named `ScreenRecording_10-26-2026 15-35-36_1.mp4` and original 23 October recording were not found in the supplied directory; no analysis of those missing files is claimed.
- Seven supplied JPEGs in `Downloads/inspred`: invitation information, countdown/program, later program, venue, gallery, wishes, navigation. Browser chrome in screenshots is excluded from layout measurements.
- Font archive `All_Khmer_Fonts_9_26_15_5e8b453cfa.zip` exists. Its entries include Moul-family/Khmer fonts and license files. A collection-level license does not establish rights for every included face. Production uses the repository's individually documented OFL faces.
- FFmpeg 7.1 extracted frames at **0, 2, 4, 7, 10, 13, 16, 19, 22, 25, 27 seconds**. Metadata and the contact sheet were kept under `.cache/royal-garden/reference`; selected comparison sheets are in `evidence/`. The private source video is not committed.

## Composition and timing

| Source | Observation | Implementation decision |
| --- | --- | --- |
| Video 0s | Pale ivory field; centered carved oval occupies roughly 55–60% viewport width, lower-middle of screen; language control at upper left | Original SVG oval, warm ivory shared cover, 60% width, centered at approximately 62% viewport height; shared cover upload precedence retained |
| Video 2s | Fine floating highlights; gold Khmer lettering inside oval | Fourteen small CSS particles; live Unicode Moul text, no text-bearing raster artwork |
| Video 4–7s | Frame recedes; lettering remains; invitation subtitle and couple names appear below | 2.4s ornament reveal, 4.2s title scene, opacity/position transitions |
| Video 10s | Full-viewport portrait; subdued lower scrim and Save the Date typography | Owner-managed image slides with focal points, 0.3 default lower gradient and live text |
| Video 13s | Two portraits visibly crossfade | One-second opacity crossfade; next image decoded in advance |
| Video 16, 19, 22, 25s | Successive portraits with gentle crop/zoom; text remains in lower 10–20% | 4.3s default slide duration, optional 5.5% zoom, lower/center text placement |
| Video 27s | Invitation paper content; floating navigation | 0.7s reveal into shared invitation sections; skip at every active scene |

Total timing depends on owner-selected slide count; the available two licensed demo portraits do not pretend to reproduce the reference's four photographs. Four owner slides take approximately 24.5 seconds after the opening gesture.

## Screenshot geometry

Measurements below are proportional estimates from the supplied rasters, not claims of source CSS values. The 512px comparison is the primary reconstruction surface.

| Reference | Geometry and treatment | Reconstructed surface |
| --- | --- | --- |
| `photo_1` | Centered ceremonial title around 70% canvas width; two family columns; generous centered invitation paragraph; names flanking a union symbol; oversized gold day with ruled weekday/time | Family and invitation sections; responsive grid, Moul headings and Battambang body, canonical date split into month/day/weekday/time/year |
| `photo_2` | Four rings around 15% width each, separated by diamonds; ornament endpoints; embossed gold action; schedule starts below generous spacing | Shared countdown and calendar action, template-scoped ring/diamond styling |
| `photo_2`/`photo_3` | Narrow central serpentine path, alternating time/description blocks; about 75–100px separation at 512px | Shared multi-day program with per-row scalable SVG segments; row height grows with authored text |
| `photo_4` | Map frame about 90% width, 4:3 ratio, thin gold border and rounded corners; large centered gold CTA | Owner sketch at natural proportions, existing illustrated-map editor, interactive map, or venue information; validated Google directions link |
| `photo_5` | Active portrait around 64% width, side photographs darkened, rounded 3:4 image, arrows at active edges, counter beneath | Keyboard/touch carousel loading active and adjacent images; accessible modal enlargement |
| `photo_6` | Warm cream cards, thin gold outline, large radius, name separator and timestamp | No public wishes API exists. Private RSVP wishes remain private; public feed is explicitly unavailable |
| `photo_7` | Deep green bottom bar with five gold icons and Khmer labels | Five real section anchors; active-state tracking and safe-area padding |

## Scoped visual system

Warm ivory `#f1ede6`, ornament gold `#c7984d`, pale gold `#f0ddb0`, readable brass text `#86602d`, brown ink `#4b361e`, deep green `#193b28`. Gold text is darker than the reference where necessary for contrast. Moul display/numerals, Battambang body, Cormorant Garamond English display. Main content is capped at 680px, with 24px side insets and 60–80px section spacing. Original floral/diamond SVG repeats in a 180×210px tile, with independent opacity and scale controls.

## Owner-supplied sample wording

The user subsequently supplied the sample families, groom កឿង វីរៈ, bride ឡុង សុម៉ាលី, nine ceremonies, thanks and apology wording. These are used in the catalog demonstration only. The impossible date “៣២ ខែធ្នូ” is corrected to **Thursday, 31 December 2026 at 17:00**, preserving the supplied weekday. All displayed dates and the countdown derive from this valid canonical date; it intentionally differs from the recording's sample date.
