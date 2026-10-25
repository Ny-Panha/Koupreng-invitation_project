# Phase 9 verification results

Executed locally on 25 October 2026, Asia/Bangkok. Results below distinguish fixture browser responses, real servlet/database/file operations and mocked provider transport. Raw execution logs remain in ignored `.cache/phase9`; reviewed evidence and sanitized summaries are in `evidence/`.

## Baseline and final suites

| Layer | Baseline | Final result | Scope |
|---|---|---|---|
| User Vitest | 895 passed / 129 files | 896 passed / 130 files, 80.24 s | Full suite; includes shared token export integrity |
| Admin Vitest | 121 passed / 21 files | 121 passed / 21 files, 11.16 s | Full suite |
| Backend Maven | 610 passed, 4 skipped / 614 discovered | 620 passed, 4 skipped / 624 discovered, 3:43 | Full suite with disposable native MySQL/Flyway enabled |
| Backend final package | — | 55 passed, 0 failed/error/skipped, 2:02 | Final source: Phase 9 HTTP/MySQL (4), Cloudinary contract (3), local storage (3), MediaService (26), ArchUnit (5), OpenAPI (14) |
| Python worker pytest | 72 passed, 2 warnings | 72 passed, 2 warnings, 0.94 s | Unchanged worker; no external Telegram/bank calls |
| Template targeted Vitest | — | 40 passed / 3 files, 10.60 s | Template registry/rendering/security checks after adapter integration |
| Phase 8 browser regression | — | 45 passed, 4 skipped, 3.0 min | Chromium, Firefox, WebKit; functional/date/program/visual cases |
| Real browser/API/MySQL journey | — | 1 passed, 1.4 min | Chromium; real login, upload, save/reload, publish, playback, personalized QR/PNG, ICS |
| Phase 9 browser matrix | — | 51 passed, 5.8 min | Chromium, Firefox, WebKit; Studio, media, tickets, keyboard, scoped axe |
| Populated visual/admin checks | — | 8 passed, 1.1 min | Four user route-family cases plus before/after real admin; eight current admin axe scans |
| Original-build user captures | — | 4 passed, 42.3 s | Two languages × phone/desktop, eight route families |
| Inherited readiness follow-up | — | 9 passed, 2.8 min | Both ticket/Studio languages in three engines and 1920px guided cases; resolves the four recorded full-run failures |

The full backend skips are three `Phase6DemoMySqlTests` cases guarded by absent `PHASE6_DEMO_PROVISION`, and the benchmark `RsvpSummaryPerformanceMySqlTests` guarded by absent `RUN_RSVP_PERFORMANCE`. The four Phase 8 skips require an opt-in historical reference server; current rendered date/program cases ran. None is counted as passed.

The inherited Phase 7/ticket run reported 68 passed and four failed in 8.4 min. Two failures were a five-second readiness timeout while the route was loading under concurrent suites; two were an embedded preview's pending CSS import aborted by the next hard navigation. The affected tests now wait for the actual embedded template to mount and allow 15 seconds for initial route readiness. The follow-up matrix passed all nine cases, covering both languages in all three engines plus the 1920px guided case. All 72 distinct original cases have passing evidence across these runs; this is not represented as a single clean 72-case run. Existing draft, QR, overflow and error assertions were retained. The WebKit ticket-focus repair passes in the inherited run.

Earlier runs also exposed real CORS, populated-state contrast and WebKit focus failures; those failures were investigated and repaired before rerunning. A separate Chromium screenshot-protocol failure passed on targeted repeat, then the complete eight-case visual set passed with populated-content/finite-animation capture gates. A Windows WebKit MP4 decode error is an explicitly asserted recovery outcome, not successful film playback. Chromium and Firefox exercise actual decoded video frames and sound controls.

## Commands and environment

Commands run from the repository root (test-run output redirection omitted):

```powershell
npm --prefix apps/frontend-user test
npm --prefix apps/frontend-admin test
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build -- --outDir ../../.cache/phase9/admin-after-dist
mvn -f apps/backend/pom.xml test
mvn -f apps/backend/pom.xml package '-Dtest=Phase9MediaMySqlTests,CloudinaryCinematicContractTests,LocalCinematicStorageTests,MediaServiceTests,ArchitectureRulesTests,OpenApiIntegrationTests'
python -m pytest apps/telegram-bot/tests
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase9.config.js
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase9-regression.config.js
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase9-live.config.js
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase9-visual.config.js
python scripts/phase8/verify-calendar-downloads.py output/playwright/phase9-live --json-output docs/phase9/evidence/calendar-verification.json
node scripts/sync-design-tokens.cjs --check
python scripts/validate-agent-routing.py
powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly
docker compose config --quiet
git -c core.safecrlf=false diff --check
```

Backend integration uses `RUN_PHASE7_MYSQL=true`, `RUN_FLYWAY_INTEGRATION=true` and `FLYWAY_TEST_DB_URL=jdbc:mysql://127.0.0.1:3416/phase7_disposable?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC`, with temporary local credentials supplied through environment variables. Test guards reject another host/port/schema. This is a new task-owned MySQL 8.0.39 data directory. No normal application or production schema is used.

The real application runs on API 8189, user preview 4291 and admin previews 4292/4293. Cache builds explicitly use `VITE_API_URL=http://127.0.0.1:8189/api`. Live browser specs require ignored fictional fixture files via `PHASE9_BROWSER_FIXTURES` / `PHASE9_ADMIN_BROWSER_FIXTURES`; no test passwords, bearer tokens or guest tokens are included in these reports. The historical user capture uses `PHASE9_BASELINE=true`; inherited ticket exports set `STUDIO_EVIDENCE_DIR` to the task cache. Fixture specs use isolated preview ports and intercepted application responses.

## Integration and accessibility evidence

- Four native HTTP tests exercise real JWT authorization, Flyway schema, image validation, independent gallery/ticket quotas, CORS allow/reject, ticket associations, Premium-only media, publication, expiry, private bytes and event-scoped ownership. Their small signature fixtures prove validation/storage behavior, not codec decoding.
- Three filesystem tests verify private/public root separation, persistence across adapter instances, safe deletion and rejection of overlapping roots. Three mocked Cloudinary HTTP tests verify authenticated upload, signed expiring download and authenticated destruction. Live Cloudinary remains unverified.
- The passing real browser journey is followed by direct SQL assertions in `evidence/live-sql-verification.json`. The independently parsed downloaded calendar is valid, starts at 2027-12-05 10:30 UTC (17:30 Phnom Penh) and ends two hours later. Actual ticket PNG is 1200×1800; its personalized QR is decoded in the browser and compared with the real guest identity.
- Scoped axe scans use WCAG 2 A/AA, 2.1 AA and 2.2 AA tags on Studio, tickets, cinematic dialog and populated real admin dashboard/reports. Browser tests also exercise keyboard focus, Escape, native disclosures, text spacing, reflow and reduced motion. These scans do not certify every route/state or replace human screen-reader review.

## Tool checks and limits

Both frontend lint/build commands pass. Shared token exports match their canonical source. Routing validates 58 skills with zero errors; integrity verifies 59 bundled directories. Compose syntax validates. No historical migration changes are present.

Docker image build/container recreation could not run: the Linux engine named pipe is unavailable. Live payment/Telegram/SMTP/OAuth/Cloudinary providers, physical phones, native Safari, human screen readers and Khmer editorial review were not run. See `14-known-limitations.md` for release implications.
