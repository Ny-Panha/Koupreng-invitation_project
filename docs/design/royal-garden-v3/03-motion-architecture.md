# Motion architecture

RoyalGardenEntranceScene composes CoverBackground, RoyalGardenRoyalArch, live names/date, RoyalGardenGuestFrame and RoyalGardenMotionLayer. Artwork is independent of canonical event identity. Existing RoyalGardenIntro continues to render the older calligraphy/oval/minimal sequence and optional portrait follow-up.

RoyalGardenInformationScene owns a fixed background at z-index 0, motion at 1 and ordinary content at 2. It uses no scrolling transform on an ancestor and no nested scrolling document. Individual sections animate once when IntersectionObserver reports entry, using the Web Animations API. Content is visible before observation and remains visible if animation support is absent. Decoration is pointer-transparent and hidden from assistive technology.

`royalGardenPresentation` validates assets, geometry, opacity, motion presets and film options. `useRoyalMotionBudget` follows viewport width, visibility and Save-Data. Particle counts are off=0, subtle=6, balanced=12, cinematic=16 mobile/18 desktop. Optional butterfly count is at most one. Motions use opacity and transforms; there are no continuous large blurred filters or render-loop state updates.

Reduced motion and Save-Data suppress decorative flights. Hidden tabs pause them. Inactive information scenes unmount their effect layers; the cover video and entrance effects pause while the film is active. Frame/lettering motion supports still rendering. Information section animation does not hide content or require a successful timer. The lettering highlight animates the existing image's opacity and position, avoiding a second image request for a CSS mask.
