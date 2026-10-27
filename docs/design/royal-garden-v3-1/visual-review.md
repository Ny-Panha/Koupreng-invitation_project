# Visual review

## Review passes

1. **Structure:** captured the baseline at 13 viewport sizes, then introduced the wide CTA, monogram, film lettering/date, responsive surroundings and matching closing letters. Inspection found names too high on short covers and desktop controls shifted by a collapsed margin.
2. **Crop and spacing:** corrected the short-cover spacing, photographic crop and outer-document margin behavior. Captured again and checked mobile, tablet, desktop, information and closing compositions.
3. **Latest P0 cover/information steering:** replaced the old foreground with the new transparent 4K frame, removed the polygon aperture, reduced the guest band, removed all CTA backing/shadow/filter, raised/narrowed the CTA into the clear opening, and enlarged the inner information area. Inspection caught a hard vignette edge, which was corrected to continue to the bottom.
4. **Latest annotated video steering:** moved the shared overlay to the visible footer crest and tucked the artwork's transparent lower padding. The 375px final screenshot was compared directly with the user's cyan and lower red target bands. The gold lettering now occupies the lower cyan region; the date is in the lower red region, above the crest. No additional changes to video, photograph, monogram or controls followed that positioning steering.

Intermediate geometry and selected mandatory-width screenshots are retained in `evidence/iteration-1`, `iteration-2`, and `iteration-3`. Full before/final matrices are in `evidence/before` and `evidence/after`. See [the gallery](review.html).

## Geometry and visual gates

The baseline below the information pane reserved 40% of canvas width. The repaired lower reserve is 33%, giving 26.25px more content height at 375px and 27.3px at 390px, before unchanged safe-area insets. On larger canvases the gain scales proportionally. The first title and final signature remain inside this one scroll area; the complete top/side/bottom frame stays visible during scrolling.

At 375×667 the default CTA's stable hit box is 161.25×53.75px, x=106.875, y=508.25. Its natural image ratio is 3:1. The guest group ends at y=504.25; the CTA begins 4px later and ends 105px above the canvas bottom. The photographic opening has no polygon clip; the supplied foreground is above the photo. Actual screenshots confirm the button's painted edges clear the lower flowers.

For the latest video annotation, the previous 375px image element started at y≈418.84, with the date line box at y≈514.61. The final positions are recorded in `evidence/after/geometry.json`. Source alpha measurements distinguish the artwork's transparent padding from its visible lettering. The final overlay is anchored to the central footer crest with a 4px line-box clearance, rather than unrelated top percentages. The artwork and date move together when viewport height changes.

The final screenshot matrix includes 320×568, 375×667, 390×844, 430×932, 600×800, 768×1024, 834×1194, 1024×768, 1280×800, 1440×900, 1920×1080, 834×600 and 600×360. Each includes cover, Khmer video, English video, information top, venue, closing and ending. Browser regressions also measure the four mandatory 375/390/768/1440 canvases and validate non-overlap, frame stability, accessible first/last content and zero outer scrolling.

## Limits

The source blue-and-gold art, real editable text and chosen media differ from earlier maroon references. No literal pixel-identity claim is made. The newest frame retains the colored edge fringe already present in the supplied original; it was not re-segmented or regenerated. Very short landscape canvases are necessarily small; the guest band uses safe ellipsis with its complete accessible name. Users can select localized live-text CTA styling when their language or text differs from the fixed bilingual raster artwork.

Final film screenshots seek to 0.5s and resume playback before capture, so the frame can advance slightly while images/fonts settle. This records the actual playing-state controls. Paused/replay controls have separate browser evidence. Native Safari and physical-device motion remain unverified.
