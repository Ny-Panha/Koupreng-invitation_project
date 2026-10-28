# QA results — 2026-10-28

| Gate | Actual result |
|---|---|
| `npm --prefix apps/frontend-user test -- --maxWorkers=2` | **148 files / 1,088 tests passed**, 88.74s in the final full run |
| `npm --prefix apps/frontend-user run lint` | Exit 0 |
| `npm --prefix apps/frontend-user run build` | Exit 0; Vite 8 production build |
| `apps/backend/mvnw.cmd test` (backend working directory) | **642 tests: 575 passed, 67 skipped, 0 failures/errors**, 4m58s |
| Targeted Maven `-Dtest=RsvpServiceTests,InvitationContentPolicyTests,ArchitectureRulesTests test` | **22 passed**, 0 failures/errors/skips, 49.813s; included in the full backend result |
| Broad Playwright V3 + V3.2, four projects | 84 passed, 3 skipped, 1 WebKit navigation wait timeout; see resolution below |
| Final Playwright `--grep='RG32\|immersive media'` | **25 passed, 3 skipped**, 1.8m; exercises final feature behavior and clears the navigation failure |
| Final selector/minimal-style case, all four projects | **4 passed**, 12.7s |
| Final nine-viewport capture after spacing correction | **1 passed**, 3 intentional duplicate-project skips |
| Skill integrity / routing | 59 bundled directories verified; routing 0 errors (existing duplicate-name notice only) |
| `git diff --check` | Exit 0 |
| Staged credential-signature check | 0 private-key / GitHub-token / OpenAI-project-key / AWS-access-key signature matches; basic check, not a full SAST claim |

The browser runs use Chromium, mobile Chromium, Firefox and Windows WebKit against a local **production build** and synthetic API fixtures. Counting each project/title once and replacing earlier failures with their successful final reruns yields **89 passed / 3 intentionally skipped cases**, across 92 distinct cases. This is an aggregate of the recorded runs, not a claim that one monolithic invocation returned that summary. `evidence/qa-summary.json` records the final case outcomes.

Rebuild that per-case summary with `python scripts/qa/summarize-royal-garden-v3-2.py` while the recorded local JSON reports are available. Template selection explicitly accepts the application's existing confirmation dialog, and the minimal style is checked in the actual iframe before saving. An earlier selector probe that dismissed the default confirmation did not pass and is superseded by the four final successful cases.

The broad run's WebKit failure waited for the document `load` event on the catalog route before any layout assertion. The test now waits for DOM content and the actual Open Invitation control, retaining its geometry, video, frame and reachable-ending assertions. Its final rerun passed in every engine. No assertions or tests were disabled to clear failures. The three skips repeat the same nine-viewport image-capture loop on non-Chromium projects; all functional cases run in those projects.

Scope covered: actual Studio template selection; canonical date/countdown/calendar edits; arbitrary multi-day editing, reorder and disable; cross-month/year highlighting and selection; internal day-anchor focus; main and multi-event `.ics` downloads; dress colors/style/visibility; active-locale wording; save/reload/public rehydration; gift currency, account details and enlargement; real `PublicRsvpForm` POST through fixture API; no public wishes requests/wall; hidden-section navigation; fixed frame and overflow checks; unchanged opening/video/music/entitlements; other-template contracts through the full Vitest matrix.

New unit cases cover leap/month alignment, numeral settings, civil dates in different timezones, midnight, past/invalid events, changed Studio dates, disabled data, legacy day objects, stable IDs/extensions, canonical clearing, localized dress style, gift currency retention, English closing aliases, translation readiness, export escaping/folding/UIDs/DST and public-data isolation. Changed-code security checks include those export/URL/privacy tests, the backend privacy and permission checks, lint and diff validation.

The 67 backend skips are conditional MySQL/integration suites (including fresh/upgrade migrations, auth, entitlement, media, collaboration, guest mutation, payment evidence, reporting and RSVP performance). They were not run against a disposable MySQL instance in this session. H2-backed/backend tests and Flyway version uniqueness checks passed. No migrations changed.

**Verification boundaries:** Studio/public browser persistence is mocked, not a real MySQL save/publish journey. No production writes or deployment occurred. Native Safari/iOS, physical-device playback/performance and real bank transfer confirmation remain unverified. Windows WebKit's known protected MP4-blob decoder limitation follows the existing annotated fallback checks; it is not native Safari proof. Private wishes are protected by the server fix independently of the mocked browser checks.
