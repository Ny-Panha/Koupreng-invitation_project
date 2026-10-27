# Actual QA record

Report assembled 27 October 2026 (Asia/Bangkok). Automated runs span 26–27 October. This is an engineering verification record, not a production deployment approval. See [browser-summary.json](evidence/browser-summary.json) for the delivery run and [review.html](review.html) for comparisons.

## Commands and outcomes

Run frontend commands from `apps/frontend-user`:

| Command | Actual result |
| --- | --- |
| `npm test -- --run` | 144 files, 1,059 tests passed; 61.45 seconds |
| `npm run lint` | Passed, exit 0 |
| `npm run build` | Passed, final build 8.57 seconds |
| `npm run analyze:knip` | Passed, no reported unused files/dependencies/binaries |
| `node node_modules/@playwright/test/cli.js test --config playwright.golden-opening.config.js` | Delivery run: 36 passed, 0 failed/skipped/flaky, 222.89 seconds, retries disabled |
| `node node_modules/@playwright/test/cli.js test --config playwright.royal-garden.config.js --workers=1` | Initial legacy run: 60 passed, 4 failed on the same obsolete language-selector query |
| `node node_modules/@playwright/test/cli.js test --config playwright.royal-garden.config.js --workers=1 --grep 'E2E-09'` | Corrected selector: all 4 affected browser cases passed, 39.2 seconds; 64 unique legacy cases verified across those runs |
| Gitleaks 8.30.1 current tracked/intended-new text tree, with `--redact --no-banner` | Passed, exit 0, no leaks found; three inherited exact fixture fingerprints unchanged |
| `git diff --check` | Passed |

Unit/component coverage includes default inheritance versus explicit clear, null/empty/owner-source round trips through save/public/template adapters, retained slides/gallery, unsafe source rejection, bounded controls, live names/date, independent owner cover, and removal while FileReader is still pending. The preceding Phase 12 complete suite remains documented separately: 1,050 user tests, 121 admin tests, 74 worker tests, and 636 backend passes / 4 opt-in skips out of 640 discovered tests. No golden-opening backend code changed.

## Browser matrix

The matrix uses desktop Chromium, Pixel 7 emulation in Chromium, desktop Firefox and desktop WebKit:

1. Ivory Royal: contain overlay, cover, lettering, names/date, portrait and main invitation.
2. Emerald Gold: the same complete sequence and text-contrast assertions.
3. Burgundy Romance: the same complete sequence and text-contrast assertions.
4. Upload, replace, remove, restore default, save/reload, preserved slide IDs, Studio publication action and saved public rendering.
5. Enter to Open, focused keyboard Skip, reduced-motion bypass, retained iframe identity on live palette change, eight Studio widths 320–1920, scoped Studio axe audit.
6. Controlled oval/golden comparison with owner cover image retained independently.
7. Muted owner video under the foreground artwork and poster fallback with reduced motion.
8. Maximum artwork scale with upper position on 1280×540 and 320×568: artwork bounds clear both Skip and title text.
9. Real-time title reveal, without a mocked clock: names paint correctly, with natural desktop/mobile screenshots.

The browser fixtures intercept API calls while exercising production-built frontend components, upload conversion, save payload serialization, reload and public rendering. They do not contact production storage, publish a real customer invitation or verify provider-side persistence. Backend HTTP/media regression verification was performed independently during Phase 12 against disposable MySQL.

## Visual and accessibility evidence

The 36 screenshots include cover, lettering, names and portrait poses for all three palettes in desktop/mobile Chromium, controlled oval/golden comparisons, Studio evidence and natural title reveals. Full-size files are linked from the comparison gallery and indexed with hashes in [review-manifest.json](evidence/review-manifest.json). Screenshot animation poses are sampled using Web Animations because Playwright's JavaScript clock does not advance compositor animations; the sampled names panel explicitly disables its entry animation for capture. Scene sequencing/timing assertions run independently. Separate `natural-names` captures use a real clock and no screenshot style overrides. Sampled screenshots represent deliberate poses, not a recording of physical-device frame timing.

Manual visual inspection found and fixed the hosted ticket button covering the mobile Open control and portrait text. It now remains hidden and unfocusable during the intro, then returns with content. Desktop inspection also prompted additional artwork space below Skip; the maximum-scale geometry case verifies the fix on short screens. Real names and date appear on a bounded palette panel, and on a shaded portrait panel. There is no additional Save the Date label when the artwork is present.

Computed palette contrast against the opening background:

| Palette | Body/control text | Gold names |
| --- | ---: | ---: |
| Ivory Royal | 10.02:1 | 4.96:1 |
| Emerald Gold | 13.21:1 | 10.07:1 |
| Burgundy Romance | 13.39:1 | 10.40:1 |

These are CSS color contrast calculations, not claims that arbitrary owner-uploaded pixels were audited. The browser tests separately assert control/name contrast of at least 4.5:1. The Studio audit is scoped to `.studio-intro-editor` and reports zero violations for WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. This does not constitute a whole-site screen-reader audit.

## Initial failures and corrections

The first golden Chromium run passed four cases and failed two fixture/selector assertions: the preview tab is named `Cover`, and canonical cover-media setup must include `designJson`. The test harness was corrected without removing the intended assertions. Subsequent runs passed 24, then 28, then the final expanded 32 cases. Deterministic CSS sampling also fixed blank-text screenshot poses caused by the separate compositor clock.

The legacy language case failed with `locator.selectOption: Test timeout of 45000ms exceeded`, waiting for `.rg-language select`, at `tests/e2e/royal-garden-v2.spec.js:105:45`. Phase 12 intentionally uses the shared hosted `Invitation language` navigation, already covered by its own tests. The legacy test now clicks its English button and still verifies authored names and the preserved guest token. Explicit `style: 'oval'` was added to the legacy fixture so its existing heading/editor checks continue to test the legacy style; the new default is covered by the dedicated suite.

Final code review caught an incorrect arriving-portrait index before commit. It now uses the first portrait during title arrival and retains the last only during invitation exit. A component regression test and all three browser palette cases assert that order. The final full unit suite includes this additional test.

## Remaining review limits

Physical-device browser testing, screen-reader listening and final native Khmer editorial review were not performed. The supplied source's provenance is the owner-provided artwork; no independent third-party licensing claim is made. Remote CI status is recorded in the delivery receipt after push and is not inferred from local success. No auto-merge or production deployment is authorized by this draft review.

Raw development logs remain private under `.cache/golden-calligraphy`; committed evidence contains synthetic event data and sanitized result summaries.
