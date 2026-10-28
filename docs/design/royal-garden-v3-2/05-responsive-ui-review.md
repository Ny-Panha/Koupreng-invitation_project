# Responsive UI review

Real Chromium screenshots cover 320×568, 375×667, 390×844, 430×932, 768×1024, 834×1194, 1024×768, 1440×900 and 1920×1080. Each viewport captures countdown, calendar, second-day selection, multi-day timeline, dress code, venue, gift QR, RSVP and closing. Khmer captures additionally cover the date section, timeline, dress code, RSVP and closing at 390×844. The Studio capture includes the live phone iframe after editing and saving.

The original gold artwork and royal-blue canvas remain intact. The information scene still has one inner scroll root; browser assertions check stationary frame coordinates and `window.scrollY === 0` while visiting all enabled sections. The calendar uses seven fixed columns with minimum 24×44 date targets inside the narrow 320px frame. Main and secondary dates have different symbols/borders plus explicit accessible labels. Four countdown circles retain stable geometry; long day counts scale their text. Program days share gold headings/dividers and a compact, icon-bearing vertical timeline. Saved times use natural labels, including midnight.

Review corrections made from actual browser failures/screenshots:

- Removed legacy countdown pseudo-elements that could cover month navigation in the embedded preview.
- Retained explicit USD/KHR labels through the actual shared content projection.
- Moved the existing Royal ticket action into a 44px top control, above the content area, so it no longer covers calendar, QR or RSVP controls on short phones. Other templates retain their current ticket treatment.
- Made the existing dress-code switch keyboard-focusable and associated its text fields with visible labels.
- Omitted empty schedule/gallery destinations and maps without valid content; map details/directions remain available without an empty diagram.
- Preserved generous Khmer line-height, no Latin tracking on Khmer, authored words and the existing closing-letter treatment.
- Reduced inherited space between program days after reviewing the large desktop frame, retaining the fine separating rule.

Short viewports show a portion of long sections, using the intentional inner scroll area. This is not a claim that an entire calendar/program fits simultaneously in 320×568. Image enlargement uses the existing accessible modal. Scoped WCAG axe results and browser-engine results are recorded separately in `07-qa-results.md`. Automated WebKit on Windows does not establish native Safari/iOS behavior.

Contact sheets are linked in `08-visual-comparisons.md`; full-resolution originals stay in local `output/playwright/royal-garden-v3-2/` instead of duplicating a large archive in Git.
