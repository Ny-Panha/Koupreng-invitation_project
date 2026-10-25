# Phase 8 verification results

Run date: 25 October 2026. Counts describe individual gates; focused reruns overlap the full suites and must not be added to them.

| Gate | Actual result |
| --- | --- |
| Baseline schedule / registry / persistence | 19 passed, 3 files |
| Final user Vitest | 895 passed, 129 files |
| Admin Vitest | 121 passed, 21 files, 15.19s |
| Full backend with native MySQL/Flyway enabled | 614 discovered; 610 passed, 4 skipped; zero failures/errors; 2:44 |
| Targeted policy + ArchUnit | 9 passed, zero skips |
| Native Phase 8 HTTP/MySQL save/publish/authorization test | Passed; also included in the final full backend run |
| Python worker | 72 passed; two upstream deprecation warnings; 1.32s |
| Catalog matrix | 97 passed; included in user Vitest |
| Main browser/visual/reference matrix | 37 passed, 3.1 minutes |
| Visibility + offline/retry, three engines | 6 passed, 35.4s |
| Event Essential wedding editing, three engines | 3 passed, 13.0s |
| Program/date editor axe checks, three engines | 3 passed, 15.1s |
| Genuine UI → API → MySQL → publication → ICS | 1 passed, opt-in owned Chromium environment |
| Independent calendar parsing | Four downloaded ICS files parsed successfully; UTF-8, CRLF/folding, required fields and duration verified |
| User/admin lint and production builds | Passed |
| Routing / pinned skill integrity | 58 routing skills valid, zero errors; 59 bundled directories verified |

There are **50 distinct browser checks** across the fixture matrices and the genuine live journey. The later six-case Event Essential/editor rerun verifies the final form adjustments and overlaps the earlier cases. Browser engines are Chromium, Firefox and WebKit. Fixture-based saves prove client behavior only. The live test uses actual login, creation, form editing, server responses, reload, visibility change, confirmation/publication, public rendering and a downloaded calendar, with no API interception. A separate SQL read matches the calendar UID to the stored published invitation. See [SQL/calendar evidence](evidence/calendar-and-live-persistence.json), [independent parser output](evidence/parsed-calendars.json), [backend skip names](evidence/backend-skips.json) and [gate summary](evidence/verification.json).

The four skips are three guarded historical Phase 6 demo scenarios and the explicitly opt-in RSVP benchmark. Native MySQL on loopback 3416 exercised existing migration/upgrade tests and the new payload; no Docker/prod database was used. Redis was unavailable in the isolated live API, so its existing database fallback handled auth cache operations.

## Reproducible commands

From the repository root:

```powershell
npm --prefix apps/frontend-user test -- --reporter=dot
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin test -- --reporter=dot
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-admin run build
py -3.14 -m pytest -q apps/telegram-bot/tests
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase8.config.js
```

`PHASE8_BASELINE_ORIGIN=http://127.0.0.1:4286` enables the four matched before/after captures; otherwise those read-only comparison cases deliberately skip. Current previews use 4288. The complete current configuration now includes the added visibility/offline, Event Essential and editor-a11y cases, so a single run combines the formerly separate fixture gates.

Backend verification used `apps/backend/mvnw.cmd -f apps/backend/pom.xml test` with Java 25, `RUN_PHASE7_MYSQL=true`, `RUN_FLYWAY_INTEGRATION=true`, and `FLYWAY_TEST_DB_URL` explicitly set to the owned `jdbc:mysql://127.0.0.1:3416/phase7_disposable?...` URL. Username/password were loaded privately; never put them in a report or command history. The existing native test guard enforces the exact disposable host/schema. XML totals match the reported 614/0/0/4.

For live UI verification, explicitly launch the current-source API on loopback 8188 against that disposable database; disable notification delivery. Build the user frontend with `VITE_API_URL=http://127.0.0.1:8188/api` and `--outDir ../../.cache/phase8/live-dist`. Set `PHASE8_BROWSER_FIXTURES` to a private P8 fixture file and run:

```powershell
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.phase8-live.config.js
py -3.14 scripts/phase8/verify-calendar-downloads.py output/playwright/phase8 output/playwright/phase8-live --json-output docs/phase8/evidence/parsed-calendars.json
python scripts/validate-agent-routing.py
powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly
```

The parser uses auxiliary `icalendar 7.3.0`, installed under the ignored `.cache/phase8/calendar-parser`; it adds no frontend/backend/worker dependency. The checkout lacked the already-declared axe package; verification reused the installed exact `@axe-core/playwright` 4.14.0 from the preserved Phase 7 worktree. No manifest/lockfile changed.

## Diagnosed intermediate failures

- The first new component run needed a `window.confirm` test shim; no browser confirmation behavior was bypassed.
- Five matrix failures identified empty program wrappers; those now return no program content.
- The initial browser gate had three failures: two selectors targeted an English/open cover that the existing template localized/closed, and real 401 handling redirected away from unsaved content. Selectors were corrected; Studio saves now retain the expired state through the existing interceptor option. Final three-engine recovery checks pass.
- One full user run had two contract failures: a neutral legacy schedule presentation changed, and an existing assertion omitted the new request options. The legacy rendering was preserved and the assertion now verifies the scoped recovery option.
- An additional browser run had two environment failures after its owned preview helper was stopped early; the isolated six-case rerun passed. No baselines were rewritten.
- Live retries exposed a narrow local CORS header list, two mismatched workflow selectors and the older fixture account's real ten-event capacity. The isolated API headers and selectors were corrected; a separate fictional P8 account received an explicit nonrevenue local test grant. Production entitlement rules stayed intact. The final live journey passes.
- A temporary generated build inside the frontend tree was picked up by ESLint. It was moved to the ignored task cache; final source lint passes.

No unresolved failure is omitted from the final gates. Hardware devices, manual screen readers, external banking/Telegram/email/OAuth delivery and production topology are unverified.
