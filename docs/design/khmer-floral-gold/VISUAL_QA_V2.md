# Visual QA V2

Reviewed 2026-11-05. Current captures are separate from the original committed
screenshots. Compare [before/after scenes](screenshots/v2/before-after-scenes.jpg)
and the [scene-level reference review](REFERENCE_VS_IMPLEMENTATION_V2.md).

| Viewport width | Cover | Separate welcome | Details through footer |
| --- | --- | --- | --- |
| 360px | [Cover](screenshots/v2/cover-360.png) | [Welcome](screenshots/v2/welcome-360.png) | [Details](screenshots/v2/invitation-360.png) |
| 390px | [Cover](screenshots/v2/cover-390.png) | [Welcome](screenshots/v2/welcome-390.png) | [Details](screenshots/v2/invitation-390.png) |
| 430px | [Cover](screenshots/v2/cover-430.png) | [Welcome](screenshots/v2/welcome-430.png) | [Details](screenshots/v2/invitation-430.png) |
| 512px | [Cover](screenshots/v2/cover-512.png) | [Welcome](screenshots/v2/welcome-512.png) | [Details](screenshots/v2/invitation-512.png) |
| 768px | [Cover](screenshots/v2/cover-768.png) | [Welcome](screenshots/v2/welcome-768.png) | [Details](screenshots/v2/invitation-768.png) |
| 1024px | [Cover](screenshots/v2/cover-1024.png) | [Welcome](screenshots/v2/welcome-1024.png) | [Details](screenshots/v2/invitation-1024.png) |
| 1440px | [Cover](screenshots/v2/cover-1440.png) | [Welcome](screenshots/v2/welcome-1440.png) | [Details](screenshots/v2/invitation-1440.png) |

Captures use a height of 896 CSS pixels; details images are full-page captures.
The 512px scene views cover [family](screenshots/v2/family-512.png),
[couple photo](screenshots/v2/couplePhoto-512.png),
[countdown](screenshots/v2/countdown-512.png),
[program](screenshots/v2/schedule-512.png), [venue](screenshots/v2/map-512.png),
[gallery](screenshots/v2/gallery-512.png), [closing](screenshots/v2/closing-512.png)
and [RSVP](screenshots/v2/rsvp-512.png). The full scroll is the reliable record of
section order; viewport shots include adjacent content where naturally visible.

The [recorded opening/scroll/gallery journey](screenshots/v2/opening-scroll.webm)
shows the actual cover release, welcome fade, details reveal and keyboard viewer.
Opening and idle requestAnimationFrame samples are in
[FRAME_TIMING_V2.json](FRAME_TIMING_V2.json), with explicit workload descriptions.
These are not real-device FPS, mobile memory, low-end hardware or Safari results.

## Interaction checks

- Desktop Chromium and Pixel 7 Chromium check welcome opacity, immediate Skip,
  exact first family heading and no horizontal document overflow at all seven widths.
- Cover/details captures additionally check visible text clipping. All eight
  date/program/guest-frame combinations have rendered captures in this folder.
- Gallery checks count 12, keyboard paging, pointer swipe, focus trap/return and
  Escape. The shared dock hides while the viewer or map dialog is open.
- English details pass the configured axe WCAG A/AA tags; this supplements the
  keyboard and reduced-motion checks and is not a complete WCAG certification.
- Premium video decodes the protected MP4 fixture muted, then supports Skip,
  replay and media-error recovery. Song behavior uses a single native controller.
- Reduced-motion checks bypass welcome/film animation and keep the details usable.

Original watercolor art, SVG ornaments, paper grain and stock photographs remain
visually distinct from the private recording. The user's later romantic stock
photo direction is intentional. No reference faces, drama stills, competitor
branding or source recording frames are shipped. Current source/license/hash
records are in [ASSETS_V2.json](ASSETS_V2.json).

## Schedule and map comparison set

The final `floral-agenda-map-v2.spec.js` captures two fictional ceremonies at the
reference's visual density. It checks alternating text columns, two curve segments,
the actual saved directions URL, a beveled plaque and map-button clearance above
the floating dock. Its English case checks map enlargement and plain/compact
variants. Owner dates and nine-row demo content are not shortened by this fixture.

| Width | Curved agenda | Wide map and gold action |
| --- | --- | --- |
| 360 | [Agenda](screenshots/v2/agenda-reference-360.png) | [Map](screenshots/v2/map-reference-360.png) |
| 390 | [Agenda](screenshots/v2/agenda-reference-390.png) | [Map](screenshots/v2/map-reference-390.png) |
| 430 | [Agenda](screenshots/v2/agenda-reference-430.png) | [Map](screenshots/v2/map-reference-430.png) |
| 512 | [Agenda](screenshots/v2/agenda-reference-512.png) | [Map](screenshots/v2/map-reference-512.png) |
| 768 | [Agenda](screenshots/v2/agenda-reference-768.png) | [Map](screenshots/v2/map-reference-768.png) |
| 1024 | [Agenda](screenshots/v2/agenda-reference-1024.png) | [Map](screenshots/v2/map-reference-1024.png) |
| 1440 | [Agenda](screenshots/v2/agenda-reference-1440.png) | [Map](screenshots/v2/map-reference-1440.png) |

[Studio gallery](screenshots/v2/studio-style-gallery.png) includes actual shared
ornament/calendar/program rendering, not thumbnail mockups. The artwork upload
journey separately verifies heading art, logo and cover image save/public/reopen
and removal without demonstration-media fallback.
