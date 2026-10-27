# Verification results

27 October 2026, Windows. Main started this final brief at `0a3f167bd7973ac54bb7ab4b8fe0b19f1f85bce6`; previous integration commits were preserved. No production service, customer invitation or deployment was changed.

| Command / scope | Actual result |
| --- | --- |
| `npm --prefix apps/frontend-user test -- --maxWorkers=2` | **146 files / 1,051 tests passed**, 89.93s, exit 0 |
| Targeted Royal/provider/intro Vitest run | 4 files / 46 tests passed, 1.15s before the two additional music-precedence cases; the final full run includes those cases |
| `npm --prefix apps/frontend-user run lint` | Passed, exit 0 |
| `npm --prefix apps/frontend-user run analyze:knip` | Passed, exit 0 |
| `npm --prefix apps/frontend-user run build` | Passed, final compatibility build 3.53s |
| From `apps/frontend-user`: `npx playwright test --config playwright.royal-garden-v3.config.js` | **56 passed**, 0 failed/skipped, 4.2m; Chromium, mobile Chromium, Firefox and Windows WebKit |
| Same config: `--project chromium --project mobile-chromium --grep 'hosted:\|soundtrack:'` | **6 passed**, 22.7s after final ticket gate/touch/hash-start checks |
| Same config: `--grep 'unavailable video\|reduced motion'` | **8 passed**, 21.2s after viewport-height fallbacks and still/hidden title-shimmer compatibility correction |
| Default config: critical-routes, route-smoke and phase9-video, `--workers=2 --reporter=list,json` | **74 passed / 2 failed**, 3.5m; failures investigated below |
| Default config: `phase9-video.spec.js --project mobile-chromium --grep 'khmer-golden-canva-inspired-wedding\|real browser video' --workers=1 --reporter=list,json` | Both failing cases **passed**, 6.0s, unchanged assertions/timeouts |
| `powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly` | Passed; 59 bundled skill directories |
| `python scripts/validate-agent-routing.py` | Passed, 58 valid skills, 0 errors; inherited duplicate React skill-name warning |
| `git diff --cached --check` | Passed |
| Staged diff through `output/ci-tools/gitleaks.exe stdin --redact --no-banner` | Passed, no leaks found |

[Complete Royal browser report](evidence/browser-results.json), [final six-case gate report](evidence/gate-final-results.json), [broader regression report](evidence/regression-results.json), [isolated regression recheck](evidence/regression-recheck-results.json). The broader run is reported as 74+2 rechecked, not falsely presented as one clean 76-case invocation.

The [eight-case final compatibility report](evidence/compatibility-results.json) verifies still mode, reduced motion, unavailable media and keyboard access across the four browser projects. The CSS follow-up adds `100vh` before `100dvh` and pauses/disables the title's pseudo-element sweep for hidden/still settings. It does not change the measured modern-browser canvas geometry or audio/data implementation.

## Audio, scene gate and persistence proof

[Recorded native audio/gate proof](evidence/soundtrack-and-gate-proof.json) verifies one audio play request inside active user activation, no pre-interaction song, a persistent audio node and increasing audio time through film/exit/information. The actual approved bundled MP3 plays in the browser. The video is muted and a DOM unmute attempt is immediately corrected. No independent Royal video-volume button or progress row exists.

Wheel, keyboard PageDown/End/arrows/Space, hash navigation and tab traversal cannot access unmounted information. The final mobile case additionally sends a Chromium touch swipe. Skip followed by a duplicate ended event triggers one exit. Information begins at its first scroll position. A synthetic NotAllowedError tests blocked-song retry; actual music playback then starts from the video-scene control, and guest-paused music remains paused after film completion. These synthetic denial and duplicate-event checks are identified as simulations, not claims about every browser's permission policy.

Hosted films still use the protected POST/blob loader. Missing entitlement prevents requests; missing/broken media recovers; no public sample fallback enters an owner invitation. Browser fixtures test real Studio/iframe controls, focal/fit changes, autosave/save/reload, public rendering, unchanged saved personal content, guest token retention and private RSVP text across language changes. Canonical owner identity is not made editable to satisfy a test.

The full unit run includes explicit silence and custom-track precedence through draftToTemplate, protected-loader cancellation/timeouts, single terminal transitions, legacy styles, artwork clearing, long guest text and optional follow-up/poster settings. Native browser tests cover sound/pause/replay/Skip, normal end/error, reduced motion, fixed-frame scrolling, keyboard reachability, gallery/map/calendar and gift/private-wishes/RSVP contracts. Scoped axe checks pass for Royal entrance, film, information and Studio controls against WCAG 2/2.1/2.2 A/AA tags.

## Failures and limits

The broader run's loading fixture aborts after a fixed 1.5 seconds; under combined browser/capture load its modal closed before the Skip assertion. A second short film ended while the accessibility audit was still running, so a later synthetic ended event had no player to target. Both passed isolated without altering assertions, timeouts or production behavior. Earlier repair iterations also caught the obsolete hidden-hosted-language assertion, former separate-footer geometry and removed independent sound setting; their replacement checks assert the newly requested behavior.

Windows WebKit plays the HTTP catalog film and the actual song. Its protected MP4 blob path rejects decoding on this installation; annotated protected/Studio cases prove authorized request and usable fallback. They do **not** certify native macOS/iOS Safari protected playback. Physical-device FPS, human screen-reader listening, Khmer editorial approval and final customer visual acceptance remain unverified.

Save/reload/publication browser flows use synthetic API fixtures; no live customer backend/storage publication or production entitlement-bearing invitation was exercised. No backend endpoints, security contracts, schema or deployment changed in this final repair. Earlier backend media/architecture test evidence remains historical, not a substitute for live verification. This report does not claim an entirely green GitHub CI pipeline; an earlier unrelated admin-reporting browser failure was outside this scope.

Performance samples, exact environment and target gaps are recorded in [performance-report.md](performance-report.md). Asset origins, unchanged source hashes and the user's soundtrack permission are in [asset-manifest.json](asset-manifest.json). The main implementation contract and screenshot review are in [README](README.md) and [visual review](visual-review.md).
