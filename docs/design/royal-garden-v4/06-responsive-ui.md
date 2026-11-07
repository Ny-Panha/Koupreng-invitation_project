# Responsive verification

Chromium checks cover 320×568, 375×667, 390×844, 430×932, 768×1024, 834×1194, 1024×768, 1440×900 and 1920×1080. Each size captures cover and information and verifies no horizontal document overflow, portrait proportions, a usable information viewport, native internal scrolling, and a reachable ending.

The existing portrait-canvas geometry controls both old and new artwork. Nine-slice borders retain corner scale while vertical edges extend. Desktop uses the existing coordinated surrounding backdrop without a phone mockup. New gold artwork has a transparent inner opening; its portrait aperture clips the cover image beneath it. Actual photo focal settings remain editable.

Lightbox uses a stable viewport-sized media region and `object-fit: contain`, so landscape/portrait changes never resize the background document. The shared Modal provides Escape, focus trapping, inert background, scroll lock and focus restoration. Image navigation works with buttons, keyboard arrows and directional touch gestures; vertical gestures and pinch gestures do not turn photos. Failed images have an explicit status and remain navigable.

RSVP uses the existing real form with a scoped royal appearance, 44px controls, native radio buttons, an editable number field and increment/decrement controls. Loading, validation, errors, submission and server confirmation remain in the shared component. Private wishes remain private.

These are automated desktop Chromium viewport checks, not physical-device certification. Native iOS Safari, Android browsers, Firefox and WebKit remain unverified for V4 artwork/motion.
