# Reference and implementation V2

Reviewed 2026-11-05 against starting main `5e0ad75c` and the earlier Floral
implementation `a082d3d0`. The supplied local recording is
`ScreenRecording_10-31-2026 21-34-11_1.MP4`: 128.10 seconds, 1284×2252,
HEVC Main 10/PQ, approximately 39.2 fps, AAC. FFmpeg decoded fresh chronological
frames; the previous HDR-to-SDR storyboard was also inspected. Raw PQ frame
brightness is not a reliable color comparison. Private video/frames and the
reference subjects have not been copied into the distributed template.

The later user instruction changes the sequence: cover → a separate welcome and
calendar scene that fades in and out → details starting at
**យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ** and continuing through the footer.
The normal welcome lasts 3.2 seconds after cover release; Skip/Continue reaches
details immediately. Reduced motion bypasses this nonessential sequence. A saved,
authorized Premium film can follow the welcome before the details.

## Full recording storyboard and mismatch review

Timestamps are representative inspection points, not scene-duration claims. The
recording includes scrolling, language changes, gallery interaction and a return
to earlier content. Approximate reference dimensions below use a 512px-wide
reading surface; browser chrome and recording overlays are excluded.

| Recording | Scene and starting mismatch | Priority | V2 result and evidence | Remaining difference |
| --- | --- | --- | --- | --- |
| 0–12s; inspected 4s | Tall ornate initials, ceremonial title, about 400×80 guest panel and broad gold opening action. Prior implementation had shallow ornament detail and a plain disappearance. | High | Original nested SVG frame and flourishes, paper grain, sculpted guest frames, press response and cover release. [Cover](screenshots/v2/cover-512.png) | Original frame contour and orchid arrangement differ from the reference's purple/gold botanicals. No competitor ornament was traced. |
| 12–23s; 16s | Centered welcome wording and seven-column calendar. The earlier implementation placed this in the long scroll. | Critical after latest user request | Standalone welcome fade, event-derived date, localized numerals, highlighted day and immediate Skip. [Welcome](screenshots/v2/welcome-512.png) | Exact message length follows saved content. Studio keeps this scene open for editing; guests advance automatically. |
| 23–37s; 28s | Two family columns and diagonal, overlapping torn portraits. Earlier portraits were crops of one main image. | High | Two independent source photographs, torn masks, slight rotations, shadows and names beside each portrait. [Family](screenshots/v2/family-512.png) | User requested a romantic drama-like stock aesthetic. These are stock models in western wedding attire, not the reference subjects or claimed actors. |
| 37–44s; 40s | Narrow tear-off date with gold month bar and paper edge. | Medium | Default centered 158px date card with binding detail; saved date/calendar variants can replace it. [Full scroll](screenshots/v2/invitation-512.png) | An explicitly enabled calendar also appears after portraits so saved settings remain accessible after the welcome. |
| 44–55s; 48s | Full couple photograph fades into four gold countdown boxes. Earlier image and counters were visually flat. | High | Responsive portrait photo, paper gradient, ornate counter detail and tabular numerals. [Photo](screenshots/v2/couplePhoto-512.png), [countdown](screenshots/v2/countdown-512.png) | Replacement photo composition and actual event instant differ. Expired events use the existing celebration-started state. |
| 55–65s; 60s | Alternating ceremony text, curved gold thread/dots, date heading and beveled calendar action. | High after latest user request | Default Floral uses a continuous cubic gold thread with alternating time/text, date-first heading and diamond divider. All saved ceremonies remain present. [Two-ceremony comparison fixture](screenshots/v2/agenda-reference-512.png), [full demo program](screenshots/v2/schedule-512.png) | Reference shows two entries; the Celestial-derived demo has nine. Owner labels, descriptions and multiple days are retained. Original geometry is independently drawn. |
| 65–73s; 68s | Venue address, wide rounded map, fine gold road diagram/roundabout and beveled directions action. | High after latest user request | Rebuilt original 700×520 schematic, fine rounded frame, centered address, 300px SVG gold plaque, safe Google directions and map enlargement. [Comparison fixture](screenshots/v2/map-reference-512.png), [demo venue](screenshots/v2/map-512.png) | Demo diagram is illustrative. Owner images are preserved at their own proportions; no reference business identities or real route is copied. |
| 73–82s; 76s | Peeking photo carousel, count and adjacent images. | High | Twelve licensed images, responsive sources, small thumbnails, carousel plus selectable grid/filmstrip. [Gallery](screenshots/v2/gallery-512.png) | Reference has four photographs. Twelve follows the user's later 10–15-image request. |
| 82–101s; 84s | Dark full-screen photo viewer, arrows and thumbnails. | Medium | Existing accessible Modal, actual image paging, arrows/swipe, Escape, focus restoration and hidden section dock. [Viewer](screenshots/v2/lightbox-desktop-chromium.png) | Original control styling; desktop and mobile Chromium verified, physical Safari unavailable. |
| 101–110s; 104s | Thank-you/apology wording and airy ceremonial headings. | Medium | Authored bilingual closing, gold dividers and varied floral edges. [Closing](screenshots/v2/closing-512.png) | Content comes from the shared Celestial demo adapter or the owner, never reference copy. |
| 110–121s; 112s | Attendance choices, guest name, gold submission and footer. | High for behavior | Demo clearly says responses are not saved. Published RSVP waits for server confirmation and handles failure. [RSVP](screenshots/v2/rsvp-512.png) | Koupreng footer and stock credit replace competitor branding. No unimplemented gift/payment claim. |
| 121–128s; 127s | Return scroll to family content, persistent floating controls. | Low | Registered actual section anchors, active state, language/music controls, safe-area dock and modal coordination. [Recording](screenshots/v2/opening-scroll.webm) | Bespoke working controls in other layouts are preserved rather than overlaid with duplicates. |

## Geometry, density and motion

The implemented reading canvas is capped at 560px. At 512px its section side
padding is 28px, cover monogram width is 174px, default date card is 158px and
portraits occupy 56% of the inner width at 4:5 with a 32px overlap. These are
inspectable CSS values, not fabricated measurements of the source recording.
Gold nested strokes, grain and individual scene florals add density while the
message/calendar and family headings keep generous vertical spacing. Khmer
display text uses the existing licensed Moul face with body text kept readable.

Cover release uses 350/800/1000/1300ms by motion preset, followed by the 3.2s
welcome fade and the details reveal. Decorative effects use CSS and the existing
stack; no additional motion runtime or smooth-scroll engine was installed.
Opening and idle frame samples are recorded in [FRAME_TIMING_V2.json](FRAME_TIMING_V2.json).
They describe this headless browser workload, not physical-phone performance.

[Before/after scene sheet](screenshots/v2/before-after-scenes.jpg) preserves the
earlier committed captures beside V2. The earlier long-scroll welcome differs
intentionally from the new three-stage flow. [Visual QA](VISUAL_QA_V2.md) links
all seven widths. There is no numerical visual-similarity claim. Remaining
differences are original botanical/frame art, licensed replacement photography,
saved content length and the deliberately changed opening sequence.

## Final schedule/map refinement

The user's later request to match these scenes drove a second direct frame review
at 60s and 68s. The earlier straight icon list and sparse road drawing were the
largest discrepancies. The default Floral program now uses the shared `gold-curve`
style; its actual Studio miniature uses the same renderer. Other explicitly chosen
styles stay selected. Automatic “Day 1” is omitted when a real date is available
and no custom day title exists; authored titles remain visible. The gold thread
scales with each ceremony's actual text height, with connected endpoints and fixed
round nodes. Map variants remain distinct, and spacing reserves room for the
floating dock below the directions button.

The [agenda/map comparison captures](VISUAL_QA_V2.md) use two fictional ceremony
rows to inspect geometry at matching density, in addition to the full nine-row
marketing demo. They are labeled fixtures, not a shortened owner invitation or
proof of a real venue route. These changes substantially align structure and
proportions; they do not establish mathematical 100% visual identity.
