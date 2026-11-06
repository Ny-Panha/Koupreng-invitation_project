# Floral mobile layout, Studio controls and home demo

2026-11-07. Continues `9d9b2d61` on `main`. Frontend changes only; no production deployment.

## Delivered behavior

- The cover distributes its heading, couple frame, guest panel, saved event date/address and compact Open button across the available screen height. The Open button sits above the bottom flowers, without a large unused gap. Landscape uses two columns. Hosted invitations do not reserve space for demo-only footer links.
- Ordinary Khmer headings and demo guest names fit on one line on phones. Longer guest names wrap at a readable minimum without clipping. The heading uses a gentle live-text arch, preserving Khmer subscript clusters and an accessible complete label; Studio can select a straight heading.
- All five couple frames fit their text. Studio offers separate Khmer/English short names for the cover; full names remain in wedding details. Missing short names fall back to the original names.
- The cover date and address come from the saved event, rather than fixed demo text. Owners can hide either item. The existing guest-link name takes priority over the general guest greeting.
- Page 2 always retains its full calendar, including on short phones and six-week months. The calendar grows with available space, with larger numbers and the same rose heart on the saved date. The default extra Continue button is removed; Skip remains beside music. Welcome timing remains seven seconds by default and can be set from five to ten seconds.
- Studio adds bilingual Open/guest/family wording, button spacing and font size, guest font size, heading shape, short names, welcome timing, optional Continue, counts of 0–15 petals/butterflies and side/corner/background switches. These use the existing versioned style document, preserve unknown fields, and survive save, reload and publication. Existing media, heading, map, calendar, agenda, music and motion controls remain available.
- The home landing iPhone now shows an actual Floral cover capture. Try the invitation opens the same real renderer, in the current interface language. The full-demo link also points to Floral. Mobile uses the existing dialog; Escape closes the demo, releases its iframe and restores focus. The live invitation and audio stay opt-in. Matching responsive WebP assets are preloaded instead of the previous portrait.
- Existing realistic raster flowers, petals, butterflies, music, two-day agenda and Motion effects are retained. No new dependency, backend endpoint, permission or Flyway migration was added.

## Evidence

[Executed cases and run statistics](MOBILE_STUDIO_BROWSER_RESULTS.json) retain failed attempts and their corrected results. The latest distinct case/browser results are all passing across separate runs; this is not a claim of one combined test execution.

[Read-only live results on localhost:5173](MOBILE_STUDIO_LIVE_RESULTS.json) verify no cover scrolling at 440×956, 375×667 and rotated 844×390, the full calendar, no extra Continue, the new home poster, the working Floral iframe and Escape/focus restoration. No page errors were observed.

Reviewed screenshots: [440px cover](screenshots/mobile-studio/cover-440x956.png), [320px cover](screenshots/mobile-studio/cover-320x568.png), [landscape](screenshots/mobile-studio/cover-844x390.png), [440px calendar](screenshots/mobile-studio/calendar-440x956.png), [375px calendar](screenshots/mobile-studio/calendar-375x667.png), [320px calendar](screenshots/mobile-studio/calendar-320x568.png), [desktop home phone](screenshots/mobile-studio/home-poster-1440.png), [mobile home](screenshots/mobile-studio/home-poster-390.png).

## Commands and observed results

Commands below run from `apps/frontend-user` unless marked root.

| Command | Observed result |
| --- | --- |
| `npm test -- --maxWorkers=2` | Earlier full frontend baseline: 1,378 tests / 194 files passed, 84.89s. Run before the final cover/calendar/home refinements. |
| Targeted Vitest command below | Final affected tests: 79 tests / 7 files passed, 7.02s. Happy DOM prints its existing disabled-iframe-loading diagnostic; the real iframe is verified in browsers. |
| `npm run lint` | Final exit 0, no warnings. |
| `npm run build` | Final exit 0, 3,077 modules transformed, 2.07s. |
| Initial browser matrix below | 23 passed / 1 failed, 332.64s. WebKit reported a ResizeObserver loop; fixed by scheduling font fitting through animation frames. |
| WebKit cover recheck | 1 passed, 16.4s; seven screen sizes, no page errors. |
| Final cover/Studio/visibility/visual matrix below | 18 passed, 6 intentionally skipped duplicate visual exports, 130.35s. Four browser profiles; no unexpected failures. |
| Home matrix below | 12 passed / 4 failed, 134.56s. All four failures were the legacy marketing fixture intercepting a Vite source-module path containing `/api/`. |
| Marketing keyboard fixture recheck | After restricting the fixture to actual `/api/` paths: all 4 browser profiles passed, 15.20s. |
| Phone poster export | 1 Chromium export passed, 4.1s. The 880×1720 capture packages to 440×860 and 880×1720 WebPs. |
| Built-app smoke below | 3 passed, 29.3s: home iframe, seven cover sizes and full calendar/six-week month. |
| Root: `python scripts/qa/prepare-floral-v5-preview.py` | Exit 0. Refreshed three catalog thumbnails, seven comparison sheets and two home-phone posters. |
| Root: `git diff --check` | Passed; only Git's line-ending normalization notices. |

Final targeted unit command:

```powershell
npm test -- --maxWorkers=2 src/features/marketing/HomeFeature.test.jsx src/features/invitations/studio/InvitationStyleEditor.test.jsx src/features/templates/shared/invitationStyles.test.jsx src/features/templates/layouts/KhmerFloralGold/FloralRegal.test.jsx src/features/templates/layouts/KhmerFloralGold/FloralAmbience.test.jsx src/features/templates/layouts/KhmerFloralGold/useFloralEnvironment.test.jsx src/features/templates/layouts/KhmerFloralGold/floralModel.test.js
```

Browser commands (`playwright.floral-v5.config.js` has Chromium, Firefox, WebKit and mobile Chromium, two workers, no retries):

```powershell
# Initial matrix; all calendar and seven-second welcome cases passed here.
npx playwright test --config playwright.floral-v5.config.js floral-mobile-studio.spec.js floral-v5-regal.spec.js --grep 'desktop composition|complete welcome|long personalized|Studio saves and publishes short|cover content stays|welcome fits'
# Focused WebKit check after the observer correction.
npx playwright test --config playwright.floral-v5.config.js floral-mobile-studio.spec.js --project=webkit --grep 'desktop composition'
# Final checks after the observer correction.
npx playwright test --config playwright.floral-v5.config.js floral-mobile-studio.spec.js floral-v5-regal.spec.js floral-v5-visual.spec.js --grep 'desktop composition|long personalized|Studio saves and publishes short|cover content stays|all seven requested widths|export the actual opening'
# Home flow, timeout/retry and keyboard checks.
npx playwright test --config playwright.floral-v5.config.js floral-mobile-studio.spec.js phase2-landing.spec.js marketing-landing.spec.js --grep 'landing phone previews|public sample is opt-in|sample timeout|real invitation opens on demand'
npx playwright test --config playwright.floral-v5.config.js marketing-landing.spec.js --grep 'real invitation opens on demand'
# Production assets served locally by Vite preview on 4395.
$env:FLORAL_V4_BASE_URL='http://127.0.0.1:4395'
npx playwright test --config playwright.floral-v5.config.js floral-mobile-studio.spec.js --project=chromium --grep 'landing phone previews|desktop composition|complete welcome calendar'
```

## Resolved failures and limits

- WebKit's `ResizeObserver loop completed with undelivered notifications.` came from synchronous font changes inside the observer. Initial fitting stays synchronous; observer/font-ready updates now use a cancellable animation frame, with cleanup on unmount. The corrected four-browser runs pass.
- The first home check used a renderer selector matching both the registry wrapper and the actual invitation. It was corrected to `.kfg-invitation[data-template-renderer="khmer-floral-gold"]`; the readiness check now also waits for that real root.
- The legacy marketing fixture's `**/api/**` glob matched `/src/features/templates/api/templateCatalogApi.js` in development, returning JSON for a JavaScript module and leaving a blank page. Non-API paths now fall through. This was a test-fixture issue; the production smoke and live demo both pass.
- Early Studio test selectors included textarea values in implicit labels. The new fields now have explicit unique labels. An early relative-path report-copy attempt was run from the frontend directory; it was corrected at the repository root. No source data was affected.
- Browser publication/save tests use synthetic API fixtures; no live event, MySQL record or invitation was published. Responsive checks are emulated screens, not physical-device certification. Extremely long owner-written copy may require scrolling rather than unreadably small text. Image assets retain their native detail; no new claim of native 4K imagery is made.
- Recycled two task output directories and 34 temporary QA files after retaining these reports and reviewed screenshots. Stopped only task-owned QA servers. The existing user preview process remains running and `http://localhost:5173/` returned HTTP 200 after cleanup. Original source assets and runtime media are preserved. No production deployment was performed.
