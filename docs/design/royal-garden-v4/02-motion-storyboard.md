# Motion storyboard

Historical V4 baseline. The later user-requested direct-film opening replaces the portrait handoff below; see [the responsive refinement](11-direct-video-responsive-refinement.md).

| Action / state | Duration | Visible composition |
| --- | --- | --- |
| Cover waiting | Guest controlled | Owner cover, gold frame, ceremonial title, real guest plaque, open control |
| COVER_EXITING | 360 ms | Cover fades over closed burgundy cloth; exiting cover becomes inert |
| CURTAIN_PREPARING | 420 ms | Closed cloth and gold valance; first portrait underneath, no information DOM |
| CURTAIN_OPENING | 1800 ms standard / 2600 ms gentle | Panels move out from center with a slight fabric slant; valance rises |
| CINEMATIC_MEDIA | Immediate handoff when visible | Existing authorized video provider gets first opportunity to play |
| PHOTO_SLIDESHOW | Existing configured duration, 2–12 seconds per image | Owner-selected focal positions, crossfade / slow zoom, live crest, names and date |
| INVITATION_REVEAL | 700 ms | Montage dissolves before information mounts |
| CONTENT | Guest controlled | Fixed frame, native inner scroll, existing observer reveals, manual collage/lightbox |

The recording's 00:40–01:30 photo browsing is manual, so gallery autoplay is deliberately absent. Recorded scroll delays are not animation durations. Curtains can be disabled. Empty/disabled montage advances to information without an empty timed slideshow. Reduced motion and Save-Data bypass the sequence on the opening gesture.

Reference 00:07, 00:09, 00:12 and 00:16 correspond to closed cloth, opening cloth, first portrait and next portrait; [scene comparisons](09-reference-comparisons.md) show the captured result. CSS panel animations and hook timers both pause on tab visibility changes. Pause/resume in the montage leaves the selected photograph intact.
