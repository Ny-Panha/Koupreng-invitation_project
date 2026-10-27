# QA results

Verified against the local production build on Windows. Starting `main`: `1b4b8d15a109b0ca7e8008d2be305fd71f23c14e`. API sessions, owner saves and published invitations in browser tests are fixtures, not real production accounts.

## Final checks

Commands below run from `apps/frontend-user` unless a root command is explicitly shown.

| Command | Actual result |
| --- | --- |
| `npm run build` | Passed; Vite production build |
| `npm run lint` | Passed, exit 0 |
| `npm run analyze:knip` | Passed, exit 0; files/dependencies/unlisted/binaries |
| Gitleaks `stdin --redact --no-banner` over the staged Git diff | Passed, exit 0; no leaks found |
| `npm test -- --maxWorkers=2` | **146 files, 1055 tests passed**, 69.42s on the final soundtrack change |
| `npx playwright test --config playwright.royal-garden-v3.config.js` | **64 passed**, 5.0m; Chromium, mobile Chromium, Firefox, WebKit |
| `npx playwright test phase9-video.spec.js --config playwright.phase9.config.js` | **30 passed**, 1.3m; shared player and eight other templates across Chromium/Firefox/WebKit |
| `python scripts/validate-agent-routing.py` (root) | Passed; zero routing/integrity/link failures |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` (root) | Passed; 59 bundled skill directories verified |

Full unit tests emit expected Happy DOM notices for deliberately disabled iframe and external stylesheet loading. They exit 0. No assertions or entitlements were weakened.

## Browser coverage and evidence

- Default cover uses the new transparent source. Photo precedes the frame, fills the opening with cover fit, and retains editable focal settings. Explicitly cleared/custom media remain compatible.
- Wide button has a natural 3:1 image, stable ≥44px target, no backing/filter/shadow, no guest-band overlap, and generous lower ornament clearance at 375/390/768/1440 widths. The hover state is checked too.
- The lower information inset exposes additional content. Top heading, final signature, keyboard End and section navigation remain reachable inside one scroll root. The complete decorative frame stays stationary and outer `scrollY` remains zero.
- Latest film calligraphy/date placement is measured after finite entrance animations finish, and inspected in actual screenshots at 375×667, 390×844, 768×1024 and 1440×900. The date's line box stops 4px before the footer's central painted crest; the glyphs have additional clearance. The image's original aspect and alpha remain intact.
- The supplied wide film artwork replaces the opening artwork in the film. The date derives from canonical event data, handles the leap-day unit fixture, local numerals, English, and optional event time.
- One visible persistent music toggle plus separate Skip occupy the top-right safe area. The video remains muted even after an attempted unmute. Pause/replay remain available on the film itself.
- Real `/music/Nisai-និស្ស័យ.mp3` playback starts on the Open gesture. The audio element survives film, language switches, duplicate completion events and information entry without restart. A denied first play is retryable; a guest pause remains paused after video completion. [Native playback/gate proof](evidence/browser/soundtrack-and-gate-proof.json).
- Information is absent during video gating, including wheel, keyboard, hash, tab and mobile touch attempts. Missing/failed/not-entitled video falls back safely.
- Studio changes button style/label, monogram mode/scale, information spacing/signature, video date font/time, fit/focal position, shade and motion. The same iframe updates, the fixture server receives saved nested settings, reload preserves them, and the public fixture renders them. [Saved Studio preview](evidence/browser/chromium-studio.jpg).
- Reduced motion, authorized guest personalization, gift/private wishes/RSVP, map/gallery/program behavior, legacy fixed-frame opt-out, and scoped WCAG axe checks pass.
- Shared legacy players still allow their own video-sound behavior. The Royal-only permanent mute and styling do not replace those interfaces.

The full final browser result is [browser-results.json](evidence/browser-results.json). [Before/after gallery](review.html), [final geometry](evidence/after/geometry.json), [position measurements](evidence/position-verification.json), and [annotation-band overlay](evidence/comparisons/375-annotation-targets.jpg) support visual review. The colored overlay is a QA copy with target bands transcribed from the user's annotation; it is not the original uploaded image.

## Iteration failures, corrected

The first Chromium run found an editor selector using “Opening button style” instead of the real “Cover button style”, and the signature's rise animation temporarily translated it past the lower safe boundary. The selector was corrected and the signature now only fades. All checks subsequently pass.

The first four-browser overlay measurement sampled the date during its initial 5px translate, producing a 3–5px measured gap rather than the settled 8px. The geometry check now explicitly finishes finite entrance animations. The latest annotated steering then changed the anchor to the actual painted crest and the settled 4px line-box gap. The final four-browser run passes these source-based checks. The assertions still reject overlap or incorrect geometry.

## Practical limits

- No live backend save/reload/publication or real protected-media entitlement was exercised. Browser fixtures prove frontend contracts and server-response handling only.
- Installed Windows WebKit cannot decode the protected MP4 blob in this environment. Its authorized request and safe fallback are tested; local catalog MP4 playback works. Native iOS/macOS Safari playback remains unverified.
- Real mobile touch hardware, dynamic browser chrome, low-end-device FPS and production field vitals remain unverified.
- [Final mobile LCP](performance.md) is 6.604s under the explicit 1.6 Mbps/CPU4× profile; the earlier 2.5s goal remains unmet. This is not labelled production performance readiness.
- No backend, migration, payment, deployment, DNS or infrastructure change was made. Backend/worker suites were not rerun for this frontend-only refinement.
