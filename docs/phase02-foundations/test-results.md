# Phase 02 verification ledger

All commands ran from `D:\Koupreng-invitation_project` in PowerShell. Outputs are retained under [evidence](evidence/). Browser runs use local production builds and fictional API fixtures. They do not start Spring Boot, MySQL or a payment provider.

## Unit, lint, build and preservation checks

| Actual command | Result |
|---|---|
| `npm --prefix apps/frontend-user test` | 195 files; **1,392 passed**; 62.20s. [Log](evidence/user-vitest.log) |
| `npm --prefix apps/frontend-admin test` | Latest rerun after observer scheduling change: 33 files; **191 passed**; 28.56s. Existing nonfatal happy-dom/network stderr remains. [Latest log](evidence/admin-vitest-complete.log); [initial 28.92s run](evidence/admin-vitest.log) retained. |
| `npm --prefix apps/frontend-user run lint` | Exit 0. [Latest full log](evidence/user-lint-complete.log) |
| `npm --prefix apps/frontend-admin run lint` | Exit 0. [Latest full log](evidence/admin-lint-complete.log) |
| `node scripts/sync-design-tokens.cjs` | Updated existing admin token export from canonical source |
| `node scripts/sync-design-tokens.cjs --check` | Exit 0; verified two token exports |
| `git diff --check` | Exit 0; Git reports existing CRLF-to-LF normalization notices for touched files |
| `node docs/phase02-foundations/evidence/verify-foundations.mjs` | Exit 0; all 48 migration checksums match, no tracked backend/worker/manifest/lockfile changes; measured bundle artifacts |
| `node docs/phase02-foundations/evidence/summarize-browser-results.mjs` | Exit 0; independently counted 126 final cases (96 foundation / 30 core), earlier 334 broad cases, zero final failures/skips/errors; computed opaque RGB contrast pairs meet 4.5:1 |
| `node node_modules/eslint/bin/eslint.js tests/e2e/phase02-foundations.spec.js tests/e2e/support/batch12RouteContracts.js` (cwd `apps/frontend-user`) | Exit 0 after final bounded-fixture edits. [Log](evidence/fixture-eslint.log) |
| `node node_modules/eslint/bin/eslint.js src/features/templates/AdminTemplateEditFeature.jsx src/features/templates/useStudioPanelLayout.js src/features/templates/components/StudioPanelResize.jsx src/features/templates/components/StudioPreviewFrame.jsx` (cwd `apps/frontend-admin`) | Exit 0 after the observer scheduling correction |

Both Vite production builds are executed by every Playwright invocation through `scripts/qa/serve-phase02.mjs`. The helper invokes the app-local Vite CLI with `build --outDir <repository>/output/playwright/phase02-foundations/<user|admin>-build`, followed by `preview --host 127.0.0.1 --port <4173|4174> --strictPort --outDir <same directory>`. Its child environment sets `VITE_USER_APP_URL=http://127.0.0.1:4173`; `.env` files and application runtime defaults remain unchanged. Playwright refuses to reuse an existing server, so stale builds cannot silently satisfy the run.

Observed build warnings: external output directories are not emptied (old content hashes remain, and the measurement script excludes them); Vite plugin callback timing hints; Node `NO_COLOR`/`FORCE_COLOR` notices. Builds/tests still exit successfully where indicated. Exploratory missing-file lookups were corrected using the actual source paths and did not change application files.

One targeted ESLint invocation initially combined the app working directory with a repository-relative CLI path, resulting in `MODULE_NOT_FOUND` (duplicated `apps/frontend-user` path). The corrected app-local command above passed; this was a command-path error, not an application/lint failure.

Historical comparison: Phase 01 had 1,391 user and 191 admin unit passes, totaling 1,582. Phase 02 adds one meaningful token-pair contrast test, totaling 1,583. Historical backend results were 598 pass/82 skip; **no backend tests were rerun in this frontend-only phase**, so those historical numbers are not new passes. Applied migrations, DTOs and payment/auth rules were untouched.

## Reproduce the current browser gates

Foundation gate (all six configured profiles):

```powershell
node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js phase02-foundations.spec.js --output output/playwright/phase02-foundations/release-foundations-results
```

Result: **96 passed, zero failed/skipped, 4.5 minutes**: 16 tests × six profiles. It covers all six audit defects, portrait/landscape widths, resize keyboard/pointer/focus behavior, one retained iframe and field state, true inner preview widths, named links, rendered light/dark contrast, real normal-motion pointer **and keyboard** opening, and six Khmer route contracts at 320/390/1440px. No forced clicks, retries or skipped cases are configured. The suite records computed foreground/background samples as attachments to its passing contrast checks. [Retained JSON](evidence/foundation-results.json), [log](evidence/release-foundations-playwright.log), [counts/computed color summary](evidence/verification-summary.json).

Broad regression command actually run:

```powershell
node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js batch12-route-content.spec.js batch12-core-hardening.spec.js batch12-security-journeys.spec.js phase2-intent.spec.js phase2-studio.spec.js phase2-payment.spec.js phase2-operations.spec.js phase7-auth-accessibility.spec.js phase8-functional.spec.js --project desktop-chromium --project mobile-chromium --output output/playwright/phase02-foundations/regression-results
```

Result: **334 passed, zero failed/skipped, 5.1 minutes**. This includes 135 route patterns × two profiles = 270 route checks and 64 existing regression/journey checks. Imported existing payment cases also run as selected by these specifications. The result is independently retained in [regression-results.json](evidence/regression-results.json) and [regression-playwright.log](evidence/regression-playwright.log).

The 334-case run preceded the last scoped focus-outline/decorative-glow refinements and final locale-expectation corrections. The final foundation gate validates those later changes. It retains the broad run as evidence without relabeling it a later full rerun.

An additional cross-engine core run used `batch12-core-hardening.spec.js --output output/playwright/phase02-foundations/core-results` with the same runner/config and all six profiles. Result: **29 passed / 1 failed**, 3.5m. Mobile WebKit completed the authored-field assertions but failed the existing empty-JavaScript-error assertion with `ResizeObserver loop completed with undelivered notifications`. This was addressed in the two new editor observers by coalescing measurements/state updates through `requestAnimationFrame` and canceling queued frames on cleanup, rather than filtering the error. The foundation suite now also fails on any page JavaScript error. [Log](evidence/core-playwright.log), [JSON](evidence/core-before-results.json).

Final combined rerun after that correction:

```powershell
node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js phase02-foundations.spec.js batch12-core-hardening.spec.js --output output/playwright/phase02-foundations/final-verification-results
```

Result: **125 passed / 1 failed**, 7.9m. The WebKit observer warning was resolved and all 30 core cases passed. One mobile WebKit resize test consumed about 57 seconds in Playwright's synthetic mouse stability wait before the widen action completed; its value assertion passed, then the next reset click reached the overall timeout. The retained trace identifies this wait. Touch-capable profiles now use visible/enabled, center-hit-tested touchscreen taps for the simple resize buttons, preserving all value/bounds/drag/focus/error assertions. This also directly verifies the touch alternative rather than emulating a mouse click on a touch profile. [Log](evidence/final-verification-playwright.log), [JSON](evidence/final-verification-before-results.json).

Final acceptance command after this test synchronization correction:

```powershell
node apps/frontend-user/node_modules/@playwright/test/cli.js test --config apps/frontend-user/playwright.phase02-foundations.config.js phase02-foundations.spec.js batch12-core-hardening.spec.js --output output/playwright/phase02-foundations/accepted-verification-results
```

Result: **126 passed, zero failed/skipped, 7.6 minutes**. All six profiles passed 21 cases each: 16 foundation and five existing core cases. Both authored-field save/reload and public-opening tests pass in all six profiles; the original four Phase 01 failures are resolved. The final run retains strict JavaScript-error assertions, including the WebKit viewport/save lifecycle. No production code changed for the synthetic-mouse timeout, no JavaScript errors were filtered, and no assertions were removed or forced clicks introduced. [Final log](evidence/accepted-verification-playwright.log), [final JSON](evidence/final-verification-results.json), [independent counts and contrast samples](evidence/verification-summary.json).

## All observed browser failures and corrective runs

All commands used the same local runner/config above. The following ledger records development failures instead of discarding them.

| Log / output directory | Command selection | Actual result / diagnosis |
|---|---|---|
| `before-playwright.log` / `before-results` | `phase02-foundations.spec.js --project mobile-chromium --workers 1` | **6 expected failures** before app edits: clipped geometry, unnamed link, absent keyboard separator, three contrast violations. Demonstrates that the regressions detect original defects. |
| `first-fix-playwright.log` / `first-fix-results` | Same six cases | **6 passed**, 17.0s. Subsequent tests were strengthened to require actual iframe content rather than merely a fitted loading frame. |
| `focused-playwright.log` / `focused-results` | Early expanded selection, 24 planned cases | Intentionally interrupted exploratory run after initial passes: retained-edit test tried to fill a field while its Catalog subpanel was inactive. Corrected the test to activate Settings → Catalog and use the associated label. Not counted as a completed pass. |
| `foundations-playwright.log` / `foundations-results` | Initial ten-test suite, six profiles | **48 passed / 12 failed**, 2.9m. Six real short-landscape collapsed-preview failures led to minimum workspace/native scroll. Six strict `.kc-shell` locator failures occurred after successful pointer opening; the template intentionally has multiple shells, so asserted its first visible shell. |
| `final-foundations-playwright.log` / `final-foundations-results` | Ten tests, six profiles | **60 passed**, 1.9m. Subsequent assertions added explicit focus width, internal horizontal overflow, keyboard opening and six Khmer route groups. |
| `verified-foundations-playwright.log` / `verified-foundations-results` | Sixteen tests, six profiles | **78 passed / 18 failed**, 4.3m. Two Chromium focus checks found the thin UA outline; six landscape checks found decorative-glow overflow; six Khmer admin checks expected fallback rather than actual translated Save copy; four WebKit/Firefox Khmer checkout checks expected an English currency-symbol position. Corrected focused CSS/decoration and exact source/locale expectations. Pointer and keyboard opening passed. Retained [JSON](evidence/expanded-foundations-before-results.json). |
| `complete-foundations-playwright.log` / `complete-foundations-results` | Sixteen-test suite, six profiles | **90 passed / 6 failed**, 4.0m. All app corrections and locale assertions passed; the six admin Khmer contract checks exposed a missing fixture prerequisite: the real embedded user app also reads `GET /api/v1/templates` through its catalog provider. Added only the explicit catalog and known Event Essential detail reads to the bounded admin-template fixture. Unknown APIs/mutations still fail closed. Retained [JSON](evidence/complete-foundations-before-results.json). |
| `release-foundations-playwright.log` / `release-foundations-results` | Final sixteen-test suite, six profiles | **96 passed**, 4.5m; no failures/skips/retries. This filename names the local foundation gate, not a production release. |

Output directories are relative to `output/playwright/phase02-foundations/`. Paths in each log are authoritative for the exact test titles and source-line positions at that revision. Reports changed line numbers as tests were strengthened; the six AU IDs stayed stable.

## The four historical Phase 01 failures

| Original test / project | Original failure and reproduced evidence | Root cause / corrective action | Phase 02 outcome |
|---|---|---|---|
| `template save roundtrip preserves authored fields and immutable catalog identity` — desktop Chromium | Frame heading unavailable while only 4173/4174 were served; default admin frame pointed at localhost:5173. Phase 01 follow-up already demonstrated success with the configured origin served. | Test-server prerequisite. Source-build admin with matching `VITE_USER_APP_URL`; serve the real user renderer. Preserve origin/session validation and serializer. | Passed in 334-case run; authored/unknown fields, immutable catalog identity and save/reload assertions retained. |
| Same template test — mobile Chromium | Same absent iframe origin; repaired mobile layout also requires opening the appropriate pane. | Same source-built configuration; explicitly Preview then Edit before save assertions. | Passed; real frame heading and roundtrip remain required. |
| `public wedding opens in three engines with reduced motion and bilingual responsive content` — desktop Chromium | Locator click waited for a continually animated opening button to become stable; suite did not explicitly set the reduced-motion condition advertised by its title. | Test synchronization/setup. Explicit reduced motion for deterministic accessibility/render path; fixture's `review-celestial` route. Independently test normal-motion physical coordinate action and keyboard activation. | Passed in broad regression; independent pointer/keyboard gate covers all three engines. No production ceremonial behavior changed. |
| Same public wedding test — mobile Chromium | Same stability wait, while Phase 01 physical-coordinate taps succeeded. | Same deterministic motion setup plus actual touchscreen tap in normal-motion coverage. No `force` click used. | Passed; bilingual/viewport assertions retained. Physical phone still untested. |

QA-001 changes keep all 135 leaves and content-specific assertions. Events use the visible create action and exact destination; tickets open Preview & export and then return to Edit; seating opens Assign guests and checks its real guest options. Khmer expectations use current provider translations. Checkout still asserts the exact fixture amount/currency through the browser's locale formatter, accounting for engine-specific currency placement; it does not accept an arbitrary amount or weaken payment rules. Unknown API reads remain rejected with 501 and read-only smoke mutations with 405.

## Visual/accessibility limits

The foundation tests capture `studio-mobile-preview.png`, `studio-landscape.png`, `studio-desktop.png`, `studio-edit-en.png` and `studio-edit-km.png` per profile. Portrait/landscape/desktop captures were manually inspected after the actual iframe heading rendered. Reduced motion controls screenshot timing; there is no asserted golden pixel-diff baseline. Scoped axe checks and keyboard/focus assertions support the six repairs, not application-wide WCAG conformance.

Physical mobile keyboards, assistive technology, actual iOS/Android Safari/Chrome, provider returns and embedded Telegram/Facebook browser behavior were not tested. No synthetic route or payment fixture is presented as proof of database persistence, provider settlement or production readiness.

After the final run, `Get-NetTCPConnection -LocalPort 4173,4174 -State Listen -ErrorAction SilentlyContinue` returned no listeners. The explicit count check exited 0 with **zero remaining local preview listeners**; see [cleanup log](evidence/server-cleanup.log). Report-relative links were also checked against the filesystem with no missing targets. No commit or push was performed.
