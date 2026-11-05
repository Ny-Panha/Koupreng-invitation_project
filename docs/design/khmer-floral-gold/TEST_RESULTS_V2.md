# Test results V2

Executed locally on 2026-11-05, Windows/PowerShell. Commands below ran from the
repository root unless a working directory is given. Raw logs are retained
locally in ignored `output/floral-v2/`; reviewed screenshots, the recording and
frame measurements are committed. Browser route fixtures are not live-service
or production-account verification.

## Final successful checks

| Command | Actual result | Scope |
| --- | --- | --- |
| `npm --prefix apps/frontend-user run lint` | Exit 0 | ESLint, including final editor changes |
| `npm --prefix apps/frontend-user run test -- --maxWorkers=2` | 166 files, **1,257 passed**, 75.02s | Full frontend unit/component suite, repeated after the final curved agenda changes |
| `npm --prefix apps/frontend-user run test -- --maxWorkers=2 src/features/events/onboarding/EventDetails.test.jsx` | **6 passed**, 2.09s | Focused verification after lazy-loading the style editor |
| `npm --prefix apps/frontend-user run build` | Exit 0 | Production Vite build; editor and film player remain separate lazy chunks |
| `npm --prefix apps/frontend-admin run lint` | Exit 0 | Existing admin, unchanged |
| `npm --prefix apps/frontend-admin run build` | Exit 0; Vite 4.84s | Existing admin, unchanged |
| `python scripts/validate-agent-routing.py` | 58 valid skills, 10 pinned verified, **0 errors** | Root instructions and routing |
| `.\mvnw.cmd test` in `apps/backend` | **669 discovered: 591 passed, 78 skipped, 0 failures/errors**, Maven 2:02 | Full backend, including H2 integration, entitlements, media, RSVP and ArchUnit |
| `.\mvnw.cmd test '-Dtest=Phase9MediaMySqlTests'` in `apps/backend` with disposable-DB environment | **5 passed, 0 skipped**, Maven 2:13 | Actual MySQL/Flyway/HTTP/JWT/private local media and Floral-specific publication |
| `git diff --check` | Exit 0 | Whitespace errors; CRLF normalization warnings are informational |

The full unit run includes the welcome/calendar repairs, lazy editor and curved
agenda. Final spacing and Studio miniature CSS additionally have browser coverage.
No test is described as a real Cloudinary or physical Safari run.

## Browser checks

The two disjoint stable-build batches below passed **134 scenarios** on desktop
Chromium and Pixel 7 Chromium:

```powershell
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/template-identity.spec.js tests/e2e/khmer-floral-media.spec.js tests/e2e/invitation-styles-v2.spec.js --workers=2
# 60 passed, 1.7m

npm --prefix apps/frontend-user run test:e2e -- tests/e2e/floral-motion-v2.spec.js tests/e2e/khmer-floral-gold.spec.js tests/e2e/phase9-video.spec.js --workers=2
# 74 passed, 2.3m
```

The same six files comprise the reported coverage. A final style-only rerun verifies shared CSS on the actual
Studio miniatures; its result is recorded in `RESULTS_V2.json`.

The later schedule/map request adds `floral-agenda-map-v2.spec.js` and a final
combined run of all seven affected files. That exact command and final count are
recorded in `RESULTS_V2.json`. Preceding focused runs passed 151 component tests,
16 agenda/map browser scenarios, 42 style scenarios, two artwork upload/removal
journeys, and two recorded motion journeys. Repeated executions are not added to
the unique-scenario count.

**Final combined run: 152 passed, 0 failed/skipped, 3.9 minutes.**

```powershell
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/floral-motion-v2.spec.js tests/e2e/floral-agenda-map-v2.spec.js tests/e2e/khmer-floral-gold.spec.js tests/e2e/invitation-styles-v2.spec.js tests/e2e/khmer-floral-media.spec.js tests/e2e/template-identity.spec.js tests/e2e/phase9-video.spec.js --workers=2
```

Coverage includes visitor/demo/create/edit/save/reopen/public RSVP fixtures;
Free/Basic/Pro/Premium/Custom Floral selection without checkout; 12 compatible
renderer style persistence journeys; eight date/program/guest-frame combinations;
all seven cover/welcome/details widths; no overflow/clipping; music gesture and
route cleanup; gallery swipe, modal focus/Escape; map enlargement; actual browser
MP4 decoding and error recovery; lazy video immediate dismissal; missing owner
media separation; exact template identity and denied template switches.

`npm --prefix apps/frontend-user run test:e2e -- --list` reported **1,188 tests in
91 files**. The full E2E corpus was not run: this change uses the seven affected
files, with the complete frontend/backend suites, rather than unrelated operations,
payments, check-in and historical UX campaigns. That is a scoped verification
decision, not an environment blocker or claim that the other 1,036 scenarios pass.

## Real persistence, media and skipped database suites

`KhmerFloralGoldIntegrationTests` uses real H2/JPA to create a Free Floral event,
save presentation JSON, publish, read public content, submit RSVP and check
duplicate/stranger/quota boundaries. `Phase9MediaMySqlTests` uses a task-owned
temporary MySQL directory on loopback 3416, an ephemeral test account and
`RUN_PHASE7_MYSQL=true` / `FLYWAY_TEST_DB_URL` / test DB credentials. It checks
Free/Pro/expired refusal, Premium ownership, selected video bytes, private guest
credentials and the Floral catalog/style/publication contract. No credentials
are recorded here. The temporary instance was shut down after the run.

The 78 full-suite skips are opt-in MySQL/migration suites. Five of them were
separately run successfully as described above; the other 73 were not enabled.
Existing development catalog data on 8080 was read only. No applied migration or
production backend authorization rule was changed.

Earlier focused backend commands also passed:

```powershell
# apps/backend; 42 passed
.\mvnw.cmd test '-Dtest=KhmerFloralGoldIntegrationTests,EntitlementServiceTests,InvitationDesignPolicyTests,PreWeddingVideoPolicyTests,LocalCinematicStorageTests,CloudinaryCinematicContractTests,ArchitectureRulesTests'
# apps/backend; 26 passed
.\mvnw.cmd test '-Dtest=MediaServiceTests'
```

`PreWeddingVideoPolicyTests` matched no class and is not counted as executed;
policy behavior is exercised by integration tests. The full Maven run supersedes
these unit totals. CloudinaryCinematicContractTests mocks the provider contract.

## Failed iterations and their resolutions

- Initial routing validation failed because root `AGENTS.md` was missing while
  `CODEX.md` linked to it. Added the root entry point matching the supplied rules;
  validation then passed.
- Newly lazy video imports exposed a synchronous Royal test assumption; it now
  waits for the actual video. Immediate-Skip browser tests now allow zero or one
  media fetch; real decoding remains a separate required test.
- An early editor test assumed all layouts use the Celestial cover and that Event
  Essential uses the wedding Studio. Helpers now use actual renderer entry points;
  Event Essential uses its existing details/save route and shared editor.
- After the requested standalone welcome, the full unit run had **9 failures**:
  seven calendar cases and two invitation-wording cases. Explicit calendar settings
  are now honored after portraits, and the saved-wording contract checks the real
  welcome scene. Focused recovery: **121 passed**; full rerun: **1,257 passed**.
- A Playwright configuration attempt used `test.use({video:'off'})` inside a
  describe group, which is invalid for a worker option. Removed the nested override;
  all seven widths then passed on both projects.
- A mixed browser run had **34 passed / 2 failed** during an overlapping Vite
  rebuild. Traces showed 404s for superseded `AuthoredClosing` and `copy` chunks.
  Builds and browser verification now run sequentially. Stable editor rerun:
  **60 passed**; no production code workaround or arbitrary timeout increase.
- Disposable MySQL setup initially failed when an empty environment password was
  stripped by PowerShell. A private temporary credential resolved it. A later test
  exposed a test helper dropping `templateId`; the helper now preserves the actual
  saved association. Final MySQL run: **5 passed**.
- The first new agenda/map fixture run had 14 failures because it supplied
  `googleMapsUrl` while the public draft contract stores `googleMapUrl`. The
  assertion expected `...query=Phnom+Penh` but received the existing venue-search
  fallback (`floral-agenda-map-v2.spec.js:30`). Corrected the fixture to use the
  actual canonical field; the next run passed all 16 cases. No URL validation was
  relaxed. Direct capture review then added button/dock clearance assertions.

Known test noise includes happy-dom refusing external Maps iframe loading,
intentional mocked cleanup errors, NO_COLOR/FORCE_COLOR warnings and Spring test
startup warnings. Results above use process exit codes and runner summaries.

## Performance and limits

The [frame sample](FRAME_TIMING_V2.json) measures actual cover/welcome animation
and idle requestAnimationFrame intervals in headless Chromium at 512×896. It does
not certify physical 60fps, decode memory or low-end phone behavior. The final
build sizes are recorded in `RESULTS_V2.json`; no runtime dependency was added.
The 41 optimized photo files total 1,841,502 bytes and are loaded responsively,
with below-the-fold images lazy-loaded and 144px viewer thumbnails.

Physical Safari/iOS, real customer accounts, live Cloudinary service, production
publication, live music licensing and the full E2E corpus were not tested. No
production deployment occurred. Visual differences and accessible interaction
evidence are documented in [VISUAL_QA_V2.md](VISUAL_QA_V2.md).
