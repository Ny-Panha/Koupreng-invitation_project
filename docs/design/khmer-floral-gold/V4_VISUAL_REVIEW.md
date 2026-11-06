# V4 visual and motion review

The original Downloads recording was decoded again: 128.10s, 1284×2252, HEVC/PQ.
Ten frames were tone-mapped with FFmpeg's linearization/Hable/BT.709 pipeline.
Raw HDR brightness is not a reliable CSS color target. Private source frames and
reference comparisons stay local under `output/floral-v4`; none are runtime assets
or committed images. The screenshot grid below contains only project artwork,
licensed demonstration stock and fictional QA content.

## Before/after evidence

The baseline was captured before V4 styling edits. Each project scene was captured
again at the same CSS width and 896px viewport height; full-page detail captures
are provided separately. Clock digits naturally differ between captures. The
comparison sheets use equal scaling of complete before/after viewport shots.

| CSS width | After cover | Welcome | Full details | Nine-scene before/after sheet |
| --- | --- | --- | --- | --- |
| 360 | [Cover](screenshots/v4/after/cover-360.png) | [Welcome](screenshots/v4/after/welcome-360.png) | [Details](screenshots/v4/after/details-360.jpg) | [Compare](screenshots/v4/comparisons/before-after-360.jpg) |
| 390 | [Cover](screenshots/v4/after/cover-390.png) | [Welcome](screenshots/v4/after/welcome-390.png) | [Details](screenshots/v4/after/details-390.jpg) | [Compare](screenshots/v4/comparisons/before-after-390.jpg) |
| 430 | [Cover](screenshots/v4/after/cover-430.png) | [Welcome](screenshots/v4/after/welcome-430.png) | [Details](screenshots/v4/after/details-430.jpg) | [Compare](screenshots/v4/comparisons/before-after-430.jpg) |
| 512 | [Cover](screenshots/v4/after/cover-512.png) | [Welcome](screenshots/v4/after/welcome-512.png) | [Details](screenshots/v4/after/details-512.jpg) | [Compare](screenshots/v4/comparisons/before-after-512.jpg) |
| 768 | [Cover](screenshots/v4/after/cover-768.png) | [Welcome](screenshots/v4/after/welcome-768.png) | [Details](screenshots/v4/after/details-768.jpg) | [Compare](screenshots/v4/comparisons/before-after-768.jpg) |
| 1024 | [Cover](screenshots/v4/after/cover-1024.png) | [Welcome](screenshots/v4/after/welcome-1024.png) | [Details](screenshots/v4/after/details-1024.jpg) | [Compare](screenshots/v4/comparisons/before-after-1024.jpg) |
| 1440 | [Cover](screenshots/v4/after/cover-1440.png) | [Welcome](screenshots/v4/after/welcome-1440.png) | [Details](screenshots/v4/after/details-1440.jpg) | [Compare](screenshots/v4/comparisons/before-after-1440.jpg) |

The seven-width geometry audit reports no document overflow or clipped measured
heading/paragraph text. The invitation canvas follows the viewport through 512px
and remains 560px on larger viewports. This is responsive stationery, not a
full-width desktop reinvention. Geometry checks supplement visual inspection;
they do not certify every possible authored phrase or device font.

## Scene findings and remaining reference differences

| Recording anchor | V4 treatment | Remaining mismatch / intentional difference |
| --- | --- | --- |
| 4s cover | Additional original engraved leaves/rosettes; existing gold plaque replaces the capsule opening action. Preserve ceremonial Khmer typography and separate guest panel. | Watercolor flowers, frame contour, initials and portrait identities remain independent artwork/content. Paper is warmer and brighter than the tone-mapped recording. |
| 16s welcome | Existing distinct calendar/welcome stage retained; timed focus/release and immediate Skip. | Calendar date and authored copy differ. No private recording soundtrack is reused. |
| 28–40s families/portraits | Existing diagonal torn-paper composition retained; bounded scroll entrance where view timelines are supported. | Licensed romantic stock, family wording and photo crops differ; no newly cleared Cambodian ceremonial photograph was supplied/adopted. |
| 48s photo/countdown | Deeper photo-bottom dissolve, countdown overlaps the fade and heading retains a readable paper halo. | Subject framing, timer design/date and photo distribution differ. Owner media remains authoritative. |
| 60s agenda | Preserve original fine curved thread, all saved ceremonies and alternate nodes; progressive thread drawing where supported. | Demo retains its nine authored ceremonies. It is not shortened to the recording's two-row density. |
| 68s venue | Existing detailed original diagram, gold frame/action and safe saved directions; uploaded diagram kept intact. | Fictional illustration/roads/landmarks differ from the recording; no claim of interactive navigation or correct real-world directions. |
| 76s gallery | Peeking carousel, subtle keyed-image fade, loading/error state; fullscreen swipe, arrows, thumbnails, focus restoration and dock coordination. | Twelve licensed romantic photos rather than the reference's four private photos. |
| 104–112s closing/RSVP | Preserve existing ornaments, localized form and subtle official branding; real persisted RSVP and repeated-response behavior verified. | Thank-you text, floral distribution and form styling differ; no reference text/artwork traced. |

No percentage similarity or pixel-perfect reconstruction is claimed. Personal
subjects, original flowers/ornaments, browser chrome, floating recording controls,
HDR exposure and different text lengths prevent a meaningful raw pixel score.
The reference sheets align comparable scene anchors and canvas scale; they cannot
reconstruct content outside a recorded frame or an identical historical scroll.

## Studio evidence

Scrolled viewport captures: [monograms](screenshots/v4/after/studio-monogram.png),
[guest frames](screenshots/v4/after/studio-guest.png),
[dates](screenshots/v4/after/studio-date.png),
[programs](screenshots/v4/after/studio-wedding.png).
The intentionally retained `studio-element-capture.png` reproduces why a very tall
element capture can contain blank space outside the constrained scrollport.
Preview-only sample wording is covered separately by unit tests and the new-owner
live journey; the pictured populated galleries use authored fixture content.

## Motion and performance scope

Existing cover → welcome/calendar → details sequencing remains, including the
optional server-authorized film. None/reduced-motion/data-saving guests take the
static path. Decorative animation pauses when the document is hidden; listeners
and gallery navigation locks are released on unmount. CSS view timelines are an
enhancement; unsupported engines retain readable static portraits/programs.

V4 adds no runtime package, new font, reference footage or large runtime bitmap.
Responsive demo photographs keep 480/960px sources, the main photograph retains
480/960/1280px choices, and below-fold images remain lazy. Film loading remains
protected and gesture-initiated. The official logo uses the prior optimized
central branding system and original transparent artwork.

The recorded pre-V4 branding build's Floral chunk was **25.70 kB / 8.44 kB gzip**;
the V4 build is **26.59 kB / 8.72 kB gzip**. The lazy style editor changes from
**8.14 / 3.15 kB** to **9.27 / 3.59 kB**, chiefly for representative empty-state
previews and browser image normalization. Existing public reference-size assets remain unchanged. These are build
output measurements, not network transfer or LCP claims.

Opening/idle frame samples use the same 512×896 requestAnimationFrame method as
[V2](FRAME_TIMING_V2.json); [V4 raw samples](FRAME_TIMING_V4.json) record their
workload. Neither sample is a physical-device FPS, battery, memory or Core Web
Vitals certification. Physical Android/iPhone/tablet acceptance remains manual.

| Frame interval sample | V2 | Final V4 capture |
| --- | --- | --- |
| Opening median / p95 | 16.7 / 16.7 ms | 16.7 / 16.8 ms |
| Opening maximum | 16.8 ms | 100.1 ms |
| Recorded opening long tasks | None | One, 73 ms |
| Idle median / p95 / maximum | 16.7 / 16.7 / 16.8 ms | 16.7 / 16.8 / 33.4 ms |

The earlier V4 capture measured a 66.7 ms opening maximum and one 55 ms long task.
The recapture waited for the Khmer cover to render before photographing it; source
animation code did not change between these samples. These screenshot-inclusive
samples show timing variability and do not establish that worst-frame performance
improved. A device profiler without screenshot overhead is still needed for a
customer-device performance verdict.
