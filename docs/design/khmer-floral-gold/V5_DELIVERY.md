# Khmer Floral Gold V5 delivery

2026-11-06. Based on `b122e505` on `main`. No production deployment was performed.

## Result

The owner-selected Regal Scroll Gold #8 now frames live, editable text by default
in Khmer Floral Gold. Explicit saved legacy frames remain available. The marketing
cover uses `វីរៈ`, `&`, `សុមាលី` in a compact descending staircase, and the catalog
thumbnail is an optimized capture of that actual cover.

Studio uses the existing `invitationStyleV1` persistence contract for frame choice,
size, text size/color/alignment/layout, gold treatment, opacity and offset. It keeps
custom initials or uploaded logos when changing frames. Automatic Khmer initials,
full names and English text are supported; rendered text is fitted within the
transparent center after font loading and resize.

The cleared Noly Record wedding song starts on the opening gesture and continues
through welcome/calendar, details, language changes and scrolling using the
existing single music controller. Its button reflects playback, pause and error
states. Retry remains clickable after playback errors. Owner-selected music and
No Music take priority; missing owner music stays silent. The library's prior
default and the Premium muted-film/Skip/recovery behavior are preserved.

Downloaded raster decorations include seven photographed lotus petals falling
independently in fixed horizontal lanes, four butterfly colors following flutter
paths, small drifting hearts and slow stars. Matching blush rose/hydrangea borders
move gently in the wind around an open ivory center across all three scenes.
Content paints above the decorative layer, which cannot receive pointer input.
Details reveal once on scroll in 650ms, with restrained heading/photo/countdown
entrances. No motion, reduced motion, data saving and hidden-tab pause are honored.

Source/license/alpha/optimization details and song authorization are recorded in
[V5_ASSETS.md](V5_ASSETS.md), with exact downloaded/runtime hashes in
[V5_EFFECT_SOURCES.json](V5_EFFECT_SOURCES.json). The 4K frame master is retained
unchanged locally and ignored by Git. Private reference footage and extracted
frames are also local only. No new SVG particle artwork or animation engine was
introduced; the existing SVG ornaments and legacy frames remain available.

## Visual evidence

The responsive set uses 896px viewport height and actual loaded Khmer/English
fonts. Comparison sheets align the baseline and final cover at equal scale.

| Width | Final Khmer cover | Final English cover | Before/after |
| --- | --- | --- | --- |
| 360 | [Khmer](screenshots/v5/after/cover-km-360.png) | [English](screenshots/v5/after/cover-en-360.png) | [Compare](screenshots/v5/before-after-360.jpg) |
| 390 | [Khmer](screenshots/v5/after/cover-km-390.png) | [English](screenshots/v5/after/cover-en-390.png) | [Compare](screenshots/v5/before-after-390.jpg) |
| 430 | [Khmer](screenshots/v5/after/cover-km-430.png) | [English](screenshots/v5/after/cover-en-430.png) | [Compare](screenshots/v5/before-after-430.jpg) |
| 512 | [Khmer](screenshots/v5/after/cover-km-512.png) | [English](screenshots/v5/after/cover-en-512.png) | [Compare](screenshots/v5/before-after-512.jpg) |
| 768 | [Khmer](screenshots/v5/after/cover-km-768.png) | [English](screenshots/v5/after/cover-en-768.png) | [Compare](screenshots/v5/before-after-768.jpg) |
| 1024 | [Khmer](screenshots/v5/after/cover-km-1024.png) | [English](screenshots/v5/after/cover-en-1024.png) | [Compare](screenshots/v5/before-after-1024.jpg) |
| 1440 | [Khmer](screenshots/v5/after/cover-km-1440.png) | [English](screenshots/v5/after/cover-en-1440.png) | [Compare](screenshots/v5/before-after-1440.jpg) |

Additional captures: [catalog card](screenshots/v5/catalog-card.png),
[animated cover](screenshots/v5/animated-cover.png), and
[details map](screenshots/v5/details-map.png). The viewport captures show the
shared border on [welcome/calendar](screenshots/v5/welcome-background.png) and
[scrolled wedding details](screenshots/v5/details-background.png).

## Validation

Commands were run from `apps/frontend-user` unless stated otherwise. Raw temporary
logs and Playwright artifacts remain under ignored `.cache`/`output` paths.

| Command | Actual result |
| --- | --- |
| `npm test -- --maxWorkers=4` | 1,371 tests in 194 files passed; final run 57.64s. |
| `npm run lint` | Passed, exit 0. |
| `npm run build` | Passed, exit 0; final bundle built in 1.69s. |
| `npx playwright test --config=playwright.floral-v5.config.js khmer-floral-gold.spec.js floral-v4-interactions.spec.js floral-v5-regal.spec.js` | 128 passed in 493.86s, before the final lotus/border artwork revision. Covered Free/Basic/Pro/Premium/Custom, RSVP, calendar/gallery and Studio regressions across Chromium, Firefox, WebKit and mobile Chromium. |
| `npx playwright test --config=playwright.floral-v5.config.js floral-v5-regal.spec.js` | 48 passed in 147.59s with the final downloaded lotus/border assets, before the last background-position adjustment. |
| `npx playwright test --config=playwright.floral-v5.config.js floral-v5-regal.spec.js --grep "downloaded raster\|details sections"` | 8 passed in 35.5s after anchoring the border to the viewport. Checks fixed bounds on cover/welcome/scrolled footer, all four browser profiles, motion, petal lanes and scroll reveal. |
| `npx playwright test --config=playwright.floral-v5.config.js floral-v5-visual.spec.js --project=chromium --workers=1` | Final seven-width cover checks and actual catalog export passed (2 scenarios), 15.1s. |
| `$env:FLORAL_V4_BASE_URL='http://127.0.0.1:4395'; npx playwright test --config=playwright.floral-v5.config.js floral-v5-regal.spec.js --project=chromium --workers=1 --grep "actual transparent\|template listing\|downloaded raster"` | 3 passed in 14.1s against the final built-app preview: actual MP3/frame, refreshed catalog image, shared fixed background and welcome capture after its entrance completed. Local preview only. |
| `python scripts/qa/prepare-regal-scroll.py` (repository root) | Generated and inspected 480/960 transparent frame derivatives; original checksum retained. |
| `python scripts/qa/prepare-floral-ambience.py` (repository root) | Generated nine downloaded-source raster derivatives and checksum manifest. |
| `python scripts/qa/prepare-floral-v5-preview.py` (repository root) | Generated three responsive catalog WebPs and seven before/after sheets. |

### Corrections found during validation

Early runs exposed the owner text/music adapter dropping saved values, catalog
demo music being omitted, an audio error message obscuring the retry control, and
an existing CSS view-timeline overriding the new scroll reveal. These were fixed
and covered by the passing adapter/component/browser checks.

Initial unit runs included two form timeouts under concurrent load and one stale
expectation that the demo had no music; bounded workers and the updated authorized
demo assertion resolved those failures. One mobile playback assertion sampled the
clock before the first media tick; polling actual elapsed time resolved the race.
A Vite watcher initially served stale CSS; restarting it with polling resolved
the local environment issue. An overlapping browser output directory deleted a
trace in an early run; subsequent browser commands use sequential artifact writes.
One broad rerun was interrupted when the user revised the floral design and is
not counted as passing. A Python download attempt returned HTTP 403; `curl.exe`
successfully downloaded the same free standard images. A rejected candidate image
fetch timed out. Rejected artwork was not added to runtime assets.

The final visual inspection found the inherited paper background was positioned
against the entire long document. It now stays fixed to the viewport, with bounds
checked before opening, during welcome and after scrolling to the details footer.
The welcome screenshot waits for the entrance's fully readable hold phase.

Source review covered saved-style bounds, owner/demo music precedence, escaped
live text, observer cleanup and decorative layering. It found no remaining
blocking issue in the changed scope. Existing normalization and controller paths
are retained rather than duplicated. [Compact executed-case ledger](V5_BROWSER_RESULTS.json)
records each browser run with its artwork/position scope and codec annotations.

### Evidence limits

The Studio save/refresh/preview/publish/guest journey uses API-intercepted browser
fixtures plus the real canonical payload/content adapters. No new live MySQL or
production publish was performed for V5. Backend, admin and Telegram source did
not change and their suites were not rerun for this frontend increment.

Actual MP3 decoding/playback passed in the four browser profiles. Bundled Windows
WebKit rejects the MP4 fixture with codec error 3/4; that case verifies graceful
recovery and continuing MP3, not successful WebKit MP4 decoding. No physical phone
was attached, so mobile evidence is browser emulation. The complete historical
browser corpus and a full WCAG certification are outside this change.

## Changed areas

- Floral artwork/layout/styles/model, ambience and scroll-reveal hook.
- Canonical invitation style normalization and Studio controls/previews.
- Demo content and public catalog image adapter/optimized cover captures.
- Existing owner draft/content mapping and music library metadata.
- Focused Vitest/browser checks, preparation scripts, provenance and screenshots.

Implementation commit:
[`f902169ddbcec07c302acbdddbcfd7f3ad1492f3`](https://github.com/Ny-Panha/Koupreng-invitation_project/commit/f902169ddbcec07c302acbdddbcfd7f3ad1492f3).
The post-commit `git fetch origin main` found one local commit ahead and zero
behind, with no remote team changes requiring integration. This evidence update
is a separate documentation commit. The normal push is `git push origin main`;
the final branch SHA is checked using `git ls-remote origin refs/heads/main` and
reported in the delivery response. No deployment command was run.
