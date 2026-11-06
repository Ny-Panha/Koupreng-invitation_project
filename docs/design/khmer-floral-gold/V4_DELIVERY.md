# Floral Gold V4 delivery

2026-11-06. Continued from the V2 implementation and later release-hardening work;
preserved the official transparent Koupreng branding integration subsequently
committed as `33549ab5`. No backend source, API permission, subscription policy,
applied migration, production account or deployment configuration was changed.

## Delivered behavior

- Refined the original initials ornament, beveled cover action, portrait entrance,
  photograph/countdown dissolve and gallery loading/transitions.
- Added static data-saving behavior and hidden-tab decoration pause; preserved
  saved motion choices, reduced motion and the existing staged welcome/film flow.
- Fixed fullscreen swipe/focus handoff, Safari opener focus, unmount navigation
  cleanup, small-screen dock spacing and Khmer label clipping.
- Fixed mixed photo/portrait/map saves exceeding the server's five-file request
  limit. Requests are bounded; total quotas and ownership remain server enforced.
- Restored public playback of songs saved by Studio; native keyboard song choices
  persist and return focus. Explicit empty song selection remains empty.
- Refreshed stale poster choices after film upload and normalized generic browser
  WebP MIME using the existing signature check. Valid WebKit artwork/portrait/map
  uploads now save/reopen correctly.
- Added representative, clearly labeled preview-only date/program examples for
  new invitations. Fixed the closed workspace Help footer overlapping mobile Save
  and retained the mobile navigation's accessible name after logo integration.

Details: [visual evidence and differences](V4_VISUAL_REVIEW.md),
[Studio/media/template matrix](V4_VERIFICATION.md),
[ten-library and Maps decisions](V4_LIBRARIES_AND_MAPS.md),
[baseline audit](V4_BASELINE.md), and
[machine-readable browser results](V4_BROWSER_RESULTS.json).

## Commands and actual results

Frontend commands below were run in their respective app directories. Playwright
used `--config=playwright.floral-v4.config.js`; raw logs/reports remain local in
`.cache/floral-v4`. Repeated attempts are recorded, not added to unique-case counts.

| Command / scope | Actual result |
| --- | --- |
| User `npm test` | **1,340 tests / 190 files passed**, 27.37s final run. Baseline was 1,331 passed / 1 mobile navigation-name failure. |
| Admin `npm test` | **191 tests / 33 files passed**, 29.28s. Admin source was unchanged by V4. |
| User/admin `npm run lint` | Both passed. |
| User/admin `npm run build` | Both passed; final user build 2.96s, admin 7.78s. No separate TypeScript check script exists in these JavaScript apps. |
| Backend `mvnw.cmd test` | **598 passed, 82 skipped**, 680 total, 1:18; zero failures/errors. |
| Backend `mvnw.cmd test -Dtest=Phase9MediaMySqlTests` with the disposable MySQL environment enabled | **5 passed**, zero skipped/failures/errors, 31.822s. |
| Telegram `.venv\Scripts\python.exe -m pytest tests -q` | **74 passed**, one dependency deprecation warning, 1.39s. |
| Nine affected Playwright files across Chromium, Firefox, WebKit and mobile Chromium, then focused corrections | **404 distinct scenarios passed; 16 retired-template scenarios skipped** after combining latest results. Not a single uninterrupted all-green run. Exact attempt totals are below/in JSON. |
| Opt-in `FLORAL_V4_LIVE=1` live spec, Chromium | **1 actual-backend journey passed**, 76.96s final expanded run. Registration → authoring/uploads → persistence → protected MP4/WebM/publication → bilingual guest RSVP and duplicate response. |
| Generic-MIME targeted Vitest: `studioMedia.test.js InvitationForm.test.jsx cinematicIntro.test.js` | **35 passed**, 49.26s. Included in the final full user run. |
| Mobile Chromium touch-event gallery check | **1 passed**, 11.5s; emulated touch, not physical-device evidence. |
| Final `floral-v4-visual.spec.js --project=chromium --workers=1` | **3 passed**, 1.2m; seven-width scenes/Studio/welcome and measured frame samples. Its first attempt after resuming failed because local Vite had stopped; restarting Vite resolved the connection refusal. The Khmer cover capture was then made to wait for the ready cover before photographing it. |
| Built-app preview (`FLORAL_V4_BASE_URL=http://127.0.0.1:4390`) | **2 passed**, 8.1s: production-bundle gallery and saved-style/public-route contracts. **35 runtime asset URLs** returned HTTP 200 with valid non-HTML MIME. Local preview only; no deployment. |
| `python scripts/qa/prepare-floral-v4-media.py` | Generated original synthetic MP4/WebM/silent audio and fictional diagram. No reference footage shipped. |
| `git diff --check` | Passed after focused edits. |

The initial full backend opt-in attempt failed because PowerShell removed the empty
password environment variable. A task-owned local test account with an ephemeral
password resolved setup; the five actual MySQL checks then passed. Docker's daemon
was unavailable, so native isolated MySQL supplied real persistence/storage checks.

The broad browser command was:

```powershell
npx playwright test --config=playwright.floral-v4.config.js khmer-floral-gold.spec.js khmer-floral-media.spec.js floral-motion-v2.spec.js floral-agenda-map-v2.spec.js invitation-styles-v2.spec.js phase9-video.spec.js template-identity.spec.js phase12-matrix.spec.js floral-v4-interactions.spec.js
```

It initially reported **371 passed / 29 failed / 16 skipped** in 33.4m. Failures
included the overbroad API fixture intercepting Vite modules, stale selectors,
WebKit WebP MIME rejection, narrow Khmer labels, native radio hit testing and
readiness/scroll races under concurrent browser load. The affected three-file
rerun reported **102 passed / 14 failed** in 15.9m. Focused `--last-failed
--workers=1` then reported **13 passed / 1 failed**; the remaining Firefox scroll
race was corrected using reduced motion for that functional case and stable hover.
The final interaction acceptance run passed **16/16** across all four profiles.
WebKit follow-up passed the WithJoy case, then **2/2** upload cases after MIME
normalization. The latest per-case result ledger has **zero unresolved failures**.

WebKit has three explicitly annotated codec cases: two MP4 fixture cases and one
PCM WAV case. They verify error recovery/readability/cleanup; those passes do not
certify MP4/audio decoding in the bundled Windows WebKit engine. Actual protected
MP4 and WebM decoding was verified in Chromium against the disposable backend.

Nonfatal logs include happy-dom iframe warnings during unit fixtures, Vite plugin
timing notices and the Telegram test-client deprecation. The actual live journey
collects uncaught page errors and asserts none; no full WCAG certification or
blanket claim that every console message on every application route is clean.

## Coverage limits and manual acceptance

The complete historical browser corpus (over 100 spec files) was not run. The
selected 420-case matrix targets templates, Studio, media, motion, navigation,
localization, RSVP and access boundaries. Unrelated admin/payment/reporting browser
journeys and the other opt-in backend scenarios remain outside this increment.

No physical Android, iPhone or tablet was attached. Before production release:

1. Open Khmer/English invitations on Android Chrome, iPhone Safari and a tablet;
   inspect Khmer marks, portrait crops, safe areas, floating controls and large text.
2. Tap/open/skip/replay film, toggle the single song, rotate the device and
   background/restore the browser. Test actual supported MP4/WebM encodes and iOS
   gesture/audio policy; verify failure still permits RSVP.
3. Swipe inline/fullscreen photos, use thumbnails/back/close, then submit/edit RSVP
   on a slow network. Check keyboard focus and VoiceOver/TalkBack labels.
4. Upload real camera JPEG/PNG/WebP and realistic film sizes through an authorized
   development storage provider. Cloudinary behavior, provider expiry/outages and
   API-backed Google Maps were not verified. Real purchase/payment was not tested.

Floral remains a diagram plus directions. No unconfigured interactive map or new
third-party iframe is advertised. No new ceremonial photography without cleared
rights was adopted; the 12 licensed romantic demo photos remain. Exact reference
flowers, typography contours, subjects, authored text and tone-mapped brightness
remain different. Source frames/comparisons and credential-bearing traces stay
ignored/local. Production deployment was not performed.

## Files and implementation commits

- `515834f0` — Studio save/upload/song fixes, WebP normalization, poster refresh,
  preview examples, native music controls, mobile Help stacking and the Navigation
  accessible name. Changes are in `InvitationForm.jsx`, `SpotifyMusicPicker.jsx/.css`,
  `InvitationStyleEditor.jsx`, its stylesheet, `PreWeddingVideoEditor.jsx`,
  `studioMedia.js`, new `stylePreviewContent.js`, `invitationDraftAdapter.js`,
  `Header.jsx`, `ChatBot.css` and their focused tests.
- `bc191a68` — Floral artwork, gallery, layout and stylesheet; new
  `useFloralEnvironment.js` plus gallery/environment unit tests.
- QA/evidence commit — `playwright.floral-v4.config.js`, three new `floral-v4-*`
  specs, focused existing Floral/motion/navigation test fixes, fixture-media
  generator, task-output ignore rules, this report set, frame timing and the
  `screenshots/v4` before/after/comparison evidence. Its containing commit is the
  final delivery commit reported after push verification.

Only reviewed project captures are committed. Prior phase screenshots/report-export
files regenerated by tests were restored to their original tracked versions;
raw local diagnostics remain ignored. The two implementation commits and final
evidence commit are pushed normally to `origin/main`, with a final fetch and
remote-hash check. No force push or deployment command is part of delivery.

Final review also found two newly untracked local assets that were not created by
this task: `public/music/Noly Record - wedding-Song.mp3` and
`public/templates/khmer-floral-gold/regal_scroll_frame_08_4k.webp` in the user app.
They are preserved untouched and excluded from these commits. Their appearance
does not change the reviewed runtime asset selection or license decisions.
