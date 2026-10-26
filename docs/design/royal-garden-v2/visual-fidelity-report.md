# Royal Garden V2 visual fidelity report

The implementation reconstructs the reference composition with original vector art and live editable text. It does not claim pixel identity or a numerical similarity score.

## Evidence

- [Information comparison](evidence/comparison-information.jpg)
- [Countdown comparison](evidence/comparison-countdown.jpg)
- [Timeline comparison](evidence/comparison-timeline.jpg)
- [Gallery comparison](evidence/comparison-gallery.jpg)
- [Opening/portrait comparison](evidence/comparison-intro.jpg)
- [Desktop Studio](evidence/desktop-chromium-studio-intro.png)
- [Mobile Studio](evidence/mobile-chromium-studio-intro.png)
- [Supplied sample information](evidence/supplied-sample-main-512.png), [nine ceremonies](evidence/supplied-sample-program-512.png), [closing wording](evidence/supplied-sample-closing-512.png), [sample countdown](evidence/supplied-sample-countdown-512.png)

The left sides are reduced excerpts of the user-supplied reference, used for review; the right sides are synthetic QA invitations. Names, event date, program length and photos differ intentionally. The catalog demo now uses the user's subsequent sample wording and the valid date 31 December 2026; the reference recording uses another sample event.

Individual screenshots cover cover/oval, title, first/later portrait, information/names/date, countdown, program, venue, gallery, wishes boundary and bottom navigation. Captures at all eight requested widths exist for all four browser projects. Studio captures include desktop and mobile. The long-program fixture intentionally exercises growing row heights; it is not a copy of the reference schedule.

## Matched structural features

| Surface | Verified implementation |
| --- | --- |
| Opening | Centered ivory petal/ring oval; gold text; particles; explicit title/photo/content sequence |
| Portrait sequence | Cover crop, configurable focal point, one-second crossfades, optional 5.5% zoom, lower Save the Date/name/date overlays |
| Paper | Warm ivory with transparent floral/diamond repeat; independently editable pattern opacity and scale |
| Information | Centered Khmer heading, family columns, live paragraph, names/union symbol, oversized canonical Khmer day |
| Countdown | Four circular rings with endpoints/diamonds and a real calendar-export action |
| Program | Alternating time/description blocks and continuous scalable curved path; no fixed text positions or fixed item count |
| Venue | Thin gold frame, owner sketch at its original ratio, existing diagram support, interactive map or information fallback |
| Gallery | Active portrait **65%** of carousel width versus approximately **64%** in the supplied screenshot; darkened side images, arrows and counter |
| Controls | Upper-left locale selector, configured music control, green five-icon bottom bar and safe-area padding |

## Measurable remaining differences

- The reference recording is 1088×1920. Template content caps at 680 CSS pixels on desktop; the original reference is a phone view, so wide-screen margins are a product choice, not a matched source scene.
- Source photographs are unavailable as licensed standalone demo media. Two documented local Pexels portraits are used instead of the reference's four portraits. Owner images and order are editable.
- Four owner slides use 2.4s ornament + 4.2s title + 4×4.3s portraits + 0.7s content reveal (about **24.5s after the opening gesture**). The source clip is **27.32s** including its initial cover/gesture. Timing is close in structure, not frame-aligned.
- Moul/Battambang approximate the reference's Khmer display/body lettering; the exact calligraphic face and carved frame are not identified. The original SVG oval is flatter than the reference's photographic/plaster relief.
- Ornament text is **#86602d**, darker than decorative gold **#c7984d**. On the default ivory **#f1ede6**, these have approximately **4.83:1** and **2.24:1** contrast respectively. Readable text uses the darker value; the paler reference-like gold remains on decoration.
- At 512px, countdown ring cells are about **81px**, with the outer decorative stroke extending beyond them. The reference circles are estimated around **77–80px** after scaling. Exact endpoint/path geometry differs.
- The original pattern is a new floral/diamond abstraction. It preserves repetition/fine strokes/transparency, but it is not an exact trace of the supplied artwork.
- The supplied map is not reproduced as a verified street diagram. Owner map artwork is needed for that composition. No fabricated route is generated.
- Public blessing cards cannot be truthfully populated from private RSVP messages. That surface remains an explanatory private-wishes state until a moderated public API exists.
- Desktop/mobile Studio retain the established product layout. The intro editor and workflow density are refined; this is not an unrelated wholesale redesign.

All reviewed responsive captures fit horizontally. Axe found no violations in the final tested invitation surface across the four browser projects. This automated result does not replace full manual assistive-technology testing or guarantee accessible owner-selected palettes.
