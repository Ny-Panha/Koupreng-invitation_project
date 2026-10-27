# Actual QA/QC results

27 October 2026, Asia/Bangkok. These are local engineering results. Browser API fixtures are synthetic; they do not publish a real customer invitation or verify production storage.

Run frontend commands from apps/frontend-user unless noted:

| Command | Actual result |
| --- | --- |
| `npm test -- --run` | 145 files, 1,078 passed, 28.77 seconds |
| `npm test -- src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenV3.test.jsx src/features/templates/registry/phase10Contract.test.jsx src/features/templates/shared/goldenIntro.test.jsx` | Final rendering change: 3 files, 42 passed, 6.37 seconds |
| `npm run lint` | Passed, exit 0 |
| `npm run build` | Passed; final build 1.15 seconds |
| `npm run analyze:knip` | Passed, no reported unused files/dependencies/binaries |
| `node node_modules/@playwright/test/cli.js test --config playwright.royal-garden-v3.config.js` | 28 passed, 0 failed/skipped/flaky, retries 0; list reporter total 2.0 minutes |
| Same V3 config, `--project mobile-chromium --grep 'catalog:|hosted:|Studio'` | Capture refresh: 3 passed, 23.37 seconds |
| Same V3 config, `--project chromium --project mobile-chromium --grep 'catalog:|responsive'` | Final artwork sizing/capture review: 4 passed, 20.0 seconds |
| `node node_modules/@playwright/test/cli.js test --config playwright.golden-opening.config.js` | 36 passed, 0 failed/skipped/flaky, 229.54 seconds |
| `node node_modules/@playwright/test/cli.js test --config playwright.royal-garden.config.js --workers=1` | 63 passed, 1 clock-synchronization failure; 5.5 minutes |
| Same legacy config, `--workers=1 --grep E2E-01` | Corrected explicit exit-stage wait: all 4 browser cases passed, 39.72 seconds; 64 unique legacy cases verified across these runs |
| Root: `apps\backend\mvnw.cmd -f apps/backend/pom.xml test -Dtest=ArchitectureRulesTests,LocalCinematicStorageTests,CloudinaryCinematicContractTests,MediaServiceTests` | 37 passed, 0 failures/errors/skips, 47.30 seconds |
| Root: `python scripts/validate-agent-routing.py` | Passed, 0 errors; inherited duplicate React skill-name warning |
| Root: `powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly` | Passed, 59 bundled skill directories verified |
| Root: `git diff --check` | Passed |
| Root: staged diff piped to `output/ci-tools/gitleaks.exe stdin --redact --no-banner` | Passed, no leaks found |

Evidence summaries: [V3 cases](evidence/browser-summary.json), [mobile capture refresh](evidence/mobile-capture-summary.json), [golden regression](evidence/golden-summary.json), [legacy regression](evidence/legacy-summary.json), [performance](evidence/performance.json), [media capability](evidence/media-capability.json). V3 case durations were extracted from the retained list log because the later capture refresh overwrote the JSON reporter file; the summary identifies this source rather than presenting reconstructed timing as raw reporter output.

## Coverage and limits

The V3 matrix uses desktop Chromium, Pixel 7 emulation in Chromium, Firefox and WebKit. It verifies click-only sample loading; inline playback without a dialog/form; real sample decoding; sound/pause/replay/Skip; protected request and real completion on Chromium/Firefox; protected-error fallback; authorized guest text; cleared/failed art; missing/unauthorized film; missing photo; long guest names; reduced motion and keyboard access; Studio live data, palette/intensity, retained iframe, save/reload, preview restart and saved public rendering. Legacy calligraphy covers also use inline film.

Scoped axe audits of the entrance, video, information and new Royal Garden Studio controls report zero violations against WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. This is not a whole-site screen-reader or arbitrary-owner-colors audit. Screenshot bounds are checked at eight requested widths. Fixed-background geometry is compared before and after document scrolling. The separate unit tests include unresolved protected-request timeout/abort and preparing a film in a hidden tab.

Windows WebKit plays the HTTP catalog sample but rejects the same valid MP4 as a blob in a minimal independent reproduction. Three WebKit cases explicitly annotate and test this fallback path. They are not evidence of protected decoding on native Safari. See the release gates.

## Failures found and corrected

The first browser pass found inherited brown text on the royal field; the new scene now sets its own text/background roles. Section animation originally lowered opacity too far during an axe sample; reveal opacity now starts at .9 to retain readable contrast. Studio tests initially used the wrong section label and a malformed range value; selectors/values were corrected without removing checks. Reload exposed a real preview-start race, fixed by readiness gating, a queued film request and a single initial gate handshake.

The legacy clock test now uses a stored oval fixture because the catalog demonstrates V3. It waits for the exit state before advancing the final transition, rather than depending on a compositor/React timing coincidence. Its four browser cases pass. One full unit run under concurrent heavy browser load timed out waiting for a lazy template import (showing only the loading state); the isolated contracts and a subsequent quiet full run passed without weakening the assertion. Existing happy-dom iframe-loading diagnostics remain in successful runs.

Visual review also caught incomplete high-DPR screenshot artwork when capture forced CSS scale and changed srcset density during the shot. Production rendering was correct. Capture now waits for decoding and retains device scale; the three mobile journeys were rerun and inspected.

Physical-device, native Safari protected-film, native Khmer editorial/cultural review, complete screen-reader listening, live backend publication/provider acceptance and the slow-profile LCP target remain unverified or unmet. No production readiness claim is made.
