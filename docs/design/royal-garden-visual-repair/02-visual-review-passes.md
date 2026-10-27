# Visual review and remaining differences

The supplied LEFT crops are the primary composition reference. Blue/gold source art, real owner media and editable content intentionally differ from the maroon reference. No literal pixel-identity score is claimed. [Measured baseline](reference-vs-current.md) and [final browser geometry](final-geometry.json) provide coordinates rather than a color-based similarity claim.

## Pass 1: structure

[Cover](evidence/pass-1-cover.png), [film](evidence/pass-1-video.png), [information](evidence/pass-1-information.png), [scrolled information](evidence/pass-1-information-scrolled.png), [measurements](pass-1-geometry.json).

Replaced the short curved photo window with a full-height original-art canvas and a source-shaped portrait aperture. Replaced independently positioned lower text with reserved grid regions and a circular Open action. Rebuilt the player as an immersive scene with compact controls and an intact footer. Rebuilt information into a stationary nine-slice frame and one inner scroll region. This addressed the structural P0 defects before further effects work.

The first capture helper paused playback before the browser's play promise settled, exposing a fallback Play overlay. Subsequent controlled captures wait for real playback, pause, seek to 0.5s and await the seek. This was a capture timing defect, not evidence of successful autoplay.

## Pass 2: typography, spacing and crop

[Cover](evidence/pass-2-cover.png), [film](evidence/pass-2-video.png), [information](evidence/pass-2-information.png), [scrolled information](evidence/pass-2-information-scrolled.png), [measurements](pass-2-geometry.json).

Compacted the formal family/message/date rhythm so the initial screen includes the monogram, couple names and date rather than large empty gaps. Reserved a 48px control band above the information carving; reduced the top ornament safe-zone excess without allowing text over the gold. Added script-aware Khmer fonts for names/monograms and bounded long guest names. Corrected photo crop and film header spacing while preserving the source aspect ratio.

## Pass 3: ornament, controls and final polish

[Cover](evidence/pass-3-cover.png), [film](evidence/pass-3-video.png), [information](evidence/pass-3-information.png), [scrolled information](evidence/pass-3-information-scrolled.png), [measurements](pass-3-geometry.json).

Inspected complete top/bottom ornament proportions, footer/control separation, dark-control contrast, small-screen action bounds and restrained existing effects. The pass-3 cover still allowed the long Khmer heading too close to the arch sides. The final correction constrains its region to 82% of the composition width, wrapping into two formal lines and adding a restrained contrast vignette. [Final cover](evidence/final-390x844-km-cover.png) shows that correction, which was also reviewed at 320px and 512px.

The final hosted language check exposed a remaining `!hosted` condition and stale RSVP language presentation. The selector is now available in every scene. Browser checks prove that switching locale preserves the same active video node, authorization token, saved JSON and typed private RSVP message. A saved fixed-frame opt-out was also checked through to the last hosted section; its wrapper and film geometry remain usable.

## Final review

[Final Khmer cover](evidence/final-390x844-km-cover.png), [film](evidence/final-390x844-km-video.png), [information top](evidence/final-390x844-km-information.png), [information after scrolling](evidence/final-390x844-km-information-scrolled.png), [reachable ending](evidence/final-390x844-km-ending.png). Equivalent English captures use the `-en-` prefix. The same five scenes are captured at the source-equivalent 512x900 portrait viewport. Production-preview images are actual browser captures; the film is paused at 0.5s for repeatability. Motion timing and playback are checked separately by E2E tests.

P0 review: the couple dominates the portrait; heading stays above faces; the original guest band is proportionally separate from the circular action; film has no nested black player or bulky control rows; the original footer stays below subjects/controls; the continuous information composition moves only inside its gold frame; top/bottom ornaments and navigation remain outside the text viewport; keyboard End and native section navigation reach the final content; language does not reset scenes. The 320/375/390/430/512 cover cases also check horizontal overflow and action/guest geometry in all four browser projects.

## Differences and verification limits

- The supplied blue/gold carvings, transparent guest band, original calligraphy and footer have different shapes from the maroon source. They are preserved rather than repainted or stretched to fake identity. Original top/bottom artwork scales uniformly with width; straight side details repeat where viewport height differs.
- The cover uses an existing repository portrait as a catalog fallback. Actual owner photos and long text change the composition; focal position/zoom and text/artwork mode remain editable. Defaults keep faces clear for the reviewed portrait, not every possible photograph.
- The original guest image includes substantial transparent margins. Its natural 3:1 box is taller than the painted reference band; the painted center and control remain separate. The full name remains accessible when very long visible text is bounded.
- Contain mode preserves the entire video. At the wider 512x900 viewport, narrow side gutters remain because the portrait video and intact 3:1 footer have fixed source ratios. Explicit owner cover mode fills those gutters at the cost of cropping. At 390x844 the portrait spans essentially the full media width.
- Personal Khmer copy remains Khmer in English mode unless an approved English variant exists. Reference names, parents and messages are not hardcoded or fabricated. Private wishes are retained as the real RSVP capability, not a simulated public feed.
- Map-link behavior is tested; screenshots do not certify third-party map tile availability. API fixture save/publish tests are not live customer backend verification. Native Safari protected decoding, physical-device frame rate, editorial Khmer approval and final human visual acceptance remain outside this Windows laboratory evidence.
