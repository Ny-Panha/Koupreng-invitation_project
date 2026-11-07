# Royal Garden final layout, actions and bilingual agenda

The current implementation incorporates the user's annotated follow-ups to the [direct-film refinement](11-direct-video-responsive-refinement.md) and [guest ornament and motion](12-kbach-guest-and-motion.md).

## Page 1

- Uses the exact existing `/templates/royal-garden/golden-calligraphy.webp` image requested by the user. The original is unchanged; 640px and 1100px WebP derivatives reduce small-screen transfer size.
- The generated gold/ivory kbach guest plaque is narrower and shorter, retaining live guest text in the same composition area.
- `បើកសំបុត្រ` sits above the opening button in Moul with sufficient line height. English uses Cormorant Garamond.
- The photo fills the interior aperture and is clipped inside the lower gold stem. Cover vignettes and outside shadows remain disabled.
- Opening-control motion animates its icon, border and contained sheen while its hit area stays stationary.

## Page 2

The protected pre-wedding film starts from the guest's opening gesture underneath the curtain. No intermediate ornate portrait page is inserted. Curtain timing is shared between the state machine and cloth animation: 2.6 seconds standard, 3.4 seconds gentle. Approximately 20% of the canvas width remains as cloth at each top corner, tapering away before 40% of the height.

The approved crest and Save the Date image/date anchors are retained. The burgundy/gold lower ornament sits closer to the canvas edge. Skip is available at the top, above the curtain; the duplicate bottom skip has been removed. Reduced motion, replay, media authorization and the independent soundtrack remain supported.

## Page 3

The information order and navigation agree: Date → Venue → Program → Photos → Wishes. Formal family/invitation details precede Date; gifts and RSVP remain in the authored document. Saved host section order still takes precedence and the menu follows that order. Navigation updates a `?section=venue` (or countdown/schedule/gallery/wishes section key) route and scrolls the inner reading area. Language changes retain that section and scroll position. An initial section route or legacy section hash is applied only after the invitation opens and cannot bypass the opening gate. Query routing avoids WebKit fragment restoration competing with the inner scroll.

The calendar retains countdown, month navigation and markers for both ceremony days. The duplicate day cards and selected-day ceremony panel are removed. One stepped gold Add to Calendar button sits below the calendar. Its iCalendar download is enabled in the public sample at the user's request; host visibility preferences continue to apply.

The visual location map has no extra legend, caption panel or enlargement controls. One matching gold Open Google Maps button opens the supplied URL: `https://maps.app.goo.gl/GwpoP4BhtsvgtUph9`. That destination is user supplied; this work does not claim the illustrative drawing is a verified survey of that destination.

`របៀបវារៈកម្មវិធី` / Wedding agenda shows two date groups with compact time/icon/ceremony rows. The main day's nine ceremonies are shared with the Khmer Celestial template, preserving that template's existing Khmer display strings. A separate blessing is shown on the previous day. The sample's reception time follows the canonical event time. There is no duplicate Day 1 / Day 2 selector panel. Saved host ceremony data is never replaced by sample content.

Calendar, countdown, agenda and gallery styling uses typography, spacing, fine gold rules and outlines on the existing burgundy canvas; no additional panel backgrounds or outside shadows are introduced. The gallery retains natural photo proportions, keyboard/swipe interaction, thumbnail navigation, and focus restoration.

## Locale corrections

| Khmer | English |
| --- | --- |
| កឿង វីរៈ | Koeurng Vireak |
| ឡុង សុម៉ាលី | Long Somaly |
| ឡេង យ៉ុងស៊ី | Leng Yongsy |
| ឡាំ គីមឡុង | Lam Kimlong |
| ឃុន ស៊ីវខេង | Khun Sievkheng |
| គុយ ដាលី | Kuy Daly |

Family labels, parents, programme rows, closing copy and map labels follow the selected sample language. English calendar/programme numerals use Latin digits. Host-authored translations and entitlement boundaries retain precedence.

## Verification

Commands below were actually executed. npm unit/lint/build commands were run from the repository root; Playwright and the one-file ESLint command were run in `apps/frontend-user`.

| Command | Result |
| --- | --- |
| `npm --prefix apps/frontend-user test -- --maxWorkers=2` | 195 files / 1,391 tests passed, 165.68s |
| `npm --prefix apps/frontend-user test -- src/features/templates/layouts/RoyalGardenCinematic --maxWorkers=2` | Final focused check: 6 files / 78 tests passed, 3.08s |
| `npm --prefix apps/frontend-user run lint` | Passed, exit 0 |
| `npx eslint src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenCinematicLayout.jsx` | Final route edit passed, exit 0 |
| `npm --prefix apps/frontend-user run build` | Final production build passed, 2.11s |
| `npx playwright test --config playwright.royal-garden-v4.config.js royal-garden-polish.spec.js royal-garden-video-footer.spec.js royal-garden-v4.spec.js --grep 'modern guest\|page two retains\|catalog uses\|Pich-Pisey catalog\|curtains directly' --workers=1` | 5 passed, 2.3m; film and frame at 15 sizes, bilingual design flow at 5 sizes |
| `npx playwright test --config playwright.royal-garden-mobile.config.js --workers=1` | Final touch run: Chromium + WebKit, 2 passed, 19.0s; 5 changing viewport sizes per engine |
| `npx playwright test --config playwright.royal-garden-v3.config.js --project=chromium --grep 'catalog:\|hosted:\|unavailable video\|legacy calligraphy\|critical:\|soundtrack:' --workers=1` | 8 passed, 50.1s; authorized video, recovery, saved data, locale, fixed-frame opt-out, music continuity/retry |
| `npx playwright test --config playwright.royal-garden-v4.config.js royal-garden-v33.spec.js --grep 'public demo previews\|calendar export uses' --workers=1` | 2 passed, 6.6s; sample download plus saved host dates/visibility |

The regression run set `ROYAL_EVIDENCE_DIR=../../docs/design/royal-garden-v4/evidence/video-footer/regression` so historical baseline screenshots remain intact. Current raw command output is retained in `evidence/video-footer/checks/`.

Two intermediate mobile runs failed in WebKit: fragment navigation competed with the inner scroll (expected position error <2px; observed 8.45px), and a deferred-scroll attempt still failed (442.67px). The final query-section route removed that competition and passed both engines. Earlier full-button movement also caused two browser stability timeouts; the stationary hit area with internal motion fixed those failures. Those failed runs are retained rather than presented as successful checks.

Happy DOM reports blocked external iframe/font loading during the full unit run; the suite still completed with exit 0. Node printed `NO_COLOR`/`FORCE_COLOR` warnings under PowerShell; the browser commands above completed with exit 0. The full unit suite ran before the last small navigation timing/query adjustment; the final focused tests, route lint, build and both touch-engine flows ran after it.

Final screenshots are under `evidence/video-footer/`, including the `polish/` and `mobile-navigation/` subdirectories. Checks use API fixtures and local production-build preview. The Windows WebKit touch tests exercise viewport changes and hit targets; they do not certify physical iOS Safari video decoding. No production deployment is part of this change.
