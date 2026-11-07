# QA results

These results describe the initial V4 baseline. Checks for the later direct-film, Pich/Pisey, cover and information-spacing changes are recorded in [the responsive refinement](11-direct-video-responsive-refinement.md).

Commands were run from the repository root on Windows, with the existing dependency installation. Test log copies and the final browser JSON summary are in `evidence/checks/`. No backend, database, authorization or payment settlement code changed.

| Command | Final result |
| --- | --- |
| `npm --prefix apps/frontend-user run lint` | Passed, no lint errors |
| `npm --prefix apps/frontend-user run test` | 195 files, 1,387 tests passed; 34.16 seconds |
| `npm --prefix apps/frontend-user run build` | Passed; final build 5.50 seconds |
| `npm --prefix apps/frontend-user run test:e2e -- --config playwright.royal-garden-v4.config.js` | 20 passed, 3 skipped; 31.9 seconds; includes burgundy WCAG checks |
| `npm --prefix apps/frontend-user run test:e2e -- --config playwright.royal-garden-v32.config.js --project=chromium` | 22 passed, 1 skipped; 2.5 minutes |
| `npm --prefix apps/frontend-user run test:e2e -- --config playwright.royal-garden-v4.config.js royal-garden-v4.spec.js` | Final code and captures: 14 passed, 1 baseline skipped; 35.3 seconds |
| `npm --prefix apps/frontend-user run test:e2e -- --config playwright.royal-garden-v32.config.js --project=chromium --grep 'legacy calligraphy'` | Final legacy check: 1 passed; 7.1 seconds |
| `npm --prefix apps/frontend-user run test -- src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenV3.test.jsx src/features/templates/layouts/RoyalGardenCinematic/hooks/useIntroSequence.test.jsx` | Legacy replay and hook regression: 35 passed; 2.20 seconds |
| `npm --prefix apps/frontend-user run test -- src/features/invitations/PublicRsvpForm.test.jsx src/features/invitations/PublicRsvpForm.language.test.jsx src/features/templates/layouts/RoyalGardenCinematic` | 85 passed; 14.46 seconds before the complete final suite |
| `python scripts/design/extract-royal-garden-v4-reference.py 'C:\Users\ASER Nitro\Downloads\Royal-Garden-Cinematic-new-Ui.mov'` | Extracted 20 actual video frames |
| `python scripts/design/compare-royal-garden-v4.py` | Composed 18 reference/application pairs and before/after comparison |
| `git diff --check` | Passed |

The original FFmpeg executable was not on PATH. Extraction used the installed `imageio_ffmpeg` FFmpeg 7.1 binary. No codec installation was needed.

Initial failures were investigated and corrected:

- Ten focused assertions assumed the prior immediate video transition or carousel default. Timed tests now traverse the actual curtain states; legacy styles retain their carousel default. Original artwork regression tests explicitly exercise the preserved blue hosted configuration instead of the changed marketing sample.
- A new swipe test initially omitted required Touch constructor fields; the corrected test dispatches real TouchEvents with identifier and target.
- A new Studio test initially navigated to the wrong editor tab; controls are under Media & Opening → Cinematic intro.
- Lint initially found a missing `node:process` test import; fixed.
- One performance capture waited for an image supplied in the wrong fixture field. It now uses the canonical saved cover design. The screenshot helper waits for the rendered template and decoded imagery, avoiding a captured loading screen.
- Final screenshot review also waited for the global preloader to disappear and finished the captured photo's opacity transition, so final captures show the settled scene. Review added a legacy replay regression and retained CONTENT → VIDEO_PREPARING for replay.
- The first regression sweep had three failures from assumptions about the old demo frame/button. All three continue to check the original artwork on a hosted blue invitation; the final regression sweep passes.

Happy DOM logs its configured external iframe/stylesheet loading limits during the complete unit suite (maps, remote fonts and embedded previews). Those logs are not test failures. Browser tests use real Chromium and mocked API fixtures, including protected-media responses. PowerShell renders Node's NO_COLOR/FORCE_COLOR notice as NativeCommandError text, but all final commands above exit 0. The production build succeeds.

Skipped cases: the one-time pre-change baseline capture is intentionally disabled after implementation. Older V3.2/V3.3 viewport sweeps require the `desktop-chromium` project name and skip under this `chromium` project; V4 separately executes all nine requested guest viewports. Native Safari, Firefox, WebKit, real mobile devices, production APIs and a production deployment were not verified. The backend was not rebuilt because its source and contracts were not changed.
