# Event-first verification — 2026-10-20

Branch: `feature/event-first-workspaces`. No push or deployment. [Architecture and release notes](../architecture/event-first-workspaces.md), [discovery](../audit/event-first-discovery.md).

## Executed checks

| Command (from repository root unless noted) | Actual result |
|---|---|
| `git fetch origin main`; `git rev-list --left-right --count HEAD...origin/main` at discovery | Original main was one local commit ahead, zero incoming; existing work preserved |
| `apps/backend/mvnw.cmd test -Dtest=AppJwtAuthenticationConverterTests,PasswordRoleAuthorityTests,AuthEndpointSecurityTests,EventAccessPolicyTests,InvitationServiceTests,ArchitectureRulesTests` | 45 passed, no failures/errors/skips |
| `apps/backend/mvnw.cmd test -Dtest=*Template*,InvitationServiceTests,FlywayMigrationVersionTests,ArchitectureRulesTests` | 74 passed at catalog implementation checkpoint |
| `apps/backend/mvnw.cmd test -Dtest=TemplateRecommendationServiceTests,EventDraftPersistenceTests,ArchitectureRulesTests` | 8 passed at initial persistence checkpoint |
| `apps/backend/mvnw.cmd test -Dtest=EventDraftPersistenceTests` | Latest run: 3 passed; real HTTP/auth, child isolation, catalog/paid denial, retry persistence |
| `apps/backend/mvnw.cmd test -Dopenapi.contract.update=true -Dtest=OpenApiIntegrationTests,ArchitectureRulesTests` | 19 passed; runtime contract refreshed and compared |
| `apps/backend/mvnw.cmd test` | 526 run; **496 passed, 30 skipped**, zero failures/errors; 1 min 44 sec |
| `apps/backend/mvnw.cmd package -DskipTests` | BUILD SUCCESS; JAR packaged, 3.449 sec |
| `npm --prefix apps/frontend-user test` | **497 passed**, 93 files; zero failures, 13.08 sec |
| `npm --prefix apps/frontend-admin test` | **80 passed**, 16 files; zero failures, 6.96 sec |
| `npm --prefix apps/frontend-user run lint` | Passed after fixes |
| `npm --prefix apps/frontend-admin run lint` | Passed |
| `npm --prefix apps/frontend-user run build` | Passed; about 427 kB entry JS before gzip; lazy event/editor routes retained |
| `npm --prefix apps/frontend-admin run build` | Passed |
| `npm --prefix apps/frontend-user audit --json` | 0 vulnerabilities |
| `npm --prefix apps/frontend-admin audit --json` | 0 vulnerabilities |
| `python -m pytest apps/telegram-bot/tests` | **72 passed**, 2 dependency deprecation warnings |
| `node scripts/generate-openapi-manifest.cjs` | 246 endpoints generated from the updated runtime contract |
| `python scripts/validate-agent-routing.py` | 0 errors/failures; 58 valid skills, existing duplicate React skill-name warning |
| `powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly` | 6/6 custom skills, 0 missing files/checksum errors |
| `git diff --check` | No whitespace errors |

Run Maven with `-f apps/backend/pom.xml` from the root or invoke `mvnw.cmd` while the working directory is `apps/backend`. Maven is not on this workstation's PATH. Raw session logs are local evidence under `.cache/event-first/logs/` after cleanup.

## Browser evidence

`npm --prefix apps/frontend-user run test:e2e -- tests/e2e/event-workspaces.spec.js tests/e2e/critical-routes.spec.js tests/e2e/silk-heritage.spec.js` passed **48 tests** in desktop Chromium and mobile Chromium, in 1.2 minutes. The earlier workspace/critical-only checkpoint passed 18 tests. Public folio, RSVP error/success, token preservation, unknown-template recovery, focus return and opening behavior remain covered.

After the final wizard styling and support-chat clearance fix, `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/event-workspaces.spec.js --workers=2` passed **6/6**, in **56.1 sec**, including both unforced mobile/desktop create journeys and all seven viewport widths. The final production user build also passed (909 ms at that checkpoint).

The workspace tests assert exact event identity, stale-content removal during switching, preserved module URLs, browser refresh, explicit legacy reports, ambiguous legacy selection, rejected event access before child requests, a birthday wizard with a single create request/UUID, and a real event ID returned to navigation. They use intercepted, explicitly declared browser fixtures. They do not claim real database or provider success.

Responsive assertions wait for actual content (not a loading shell) and check document overflow at **320, 375, 390, 430, 768, 1024 and 1440 px** for login, register, My Events, wizard, overview, guests, gifts and RSVP. Desktop/mobile screenshots are retained with the final report. The new neutral renderer also has a real public-adapter component test proving birthday title/type/language/date/contact/schedule survive mapping without wedding labels.

## Real backend coverage

`EventDraftPersistenceTests` uses the actual Spring application, HTTP security chain, repositories and a disposable H2 database generated from JPA mappings. It verifies registration, failed/successful login, an empty event list, creation of two independent events, owner guest creation, no guest/gift leakage to the other event, cross-event guest-to-gift denial, denial for another user and anonymous callers, and logout token revocation. Denial checks include invitation, guests, gifts, RSVP, budget, media, dashboard/report, check-in, seating, delivery and wishes. Other tests cover STAFF denial and both authority construction mechanisms.

Real catalog tests persist compatibility rows, exercise the recommendation HTTP endpoint, reject invalid filters and incompatible templates, and deny creation with an unpurchased premium template. Retry tests persist one draft for a repeated owner/key and a different draft for another key. Existing payment, security, currency, guest, gift, check-in and architecture suites remain part of the full Maven run.

## Failures encountered and corrected

- New endpoint/DTO fields caused the expected OpenAPI drift failure; regenerated the checked-in runtime contract and admin monitor manifest, then passed the comparison test.
- An initial new persistence test inherited the default local MySQL connection and failed with access denied. Changed this isolated test to an explicit disposable H2 database. This is not a passing MySQL migration result.
- The real registration journey initially encountered the existing development first-user-admin bootstrap. The test now uses the production-like setting `app.auth.first-user-admin-enabled=false`; no production configuration changed.
- A cross-event guest lookup returns non-disclosing 404 under the existing contract; corrected the new test's expected status from 400.
- Existing frontend tests assumed first-event/global navigation. Updated them to enter explicit routes and assert selection rather than restore unsafe fallback behavior.
- Windows import resolution confused `EventFields.jsx` with `eventFields.js`; component imports now include the extension.
- A Windows editing step corrupted newly inserted Khmer text; corrected the source using Unicode-safe patches and inspected rendered screenshots.
- A responsive test initially accepted the loading shell; strengthened it to await actual page content before checking overflow and taking screenshots.
- A duplicate event-time property was caught by lint and removed. New public-adapter coverage caught the language mode nested under `extras`; mapping now preserves it at the neutral renderer boundary.
- Persisting a local retry key exposed a manual/automatic synchronization race; manual attempts now count as the automatic attempt for that draft, retaining explicit retry control.
- A later parallel browser rerun hit workstation `net::ERR_NO_BUFFER_SPACE` while loading the React runtime; the affected workspace checks were rerun with two workers. This resource failure was diagnosed from the browser trace rather than attributed to an application assertion.
- The refined mobile wizard exposed overlap between Continue and the existing support-chat button. Added space to the mobile action row and reran the unforced browser interaction.

These introduced failures were resolved. No unrelated pre-existing test failure was suppressed or treated as a pass.

## Blocked release checks

**MySQL/Flyway:** Docker daemon is unavailable; disposable MySQL test credentials were not configured. The full suite skipped 30 environment-gated tests. V37's unique version, JPA mappings, real H2 persistence and checked-in migration history were checked, but fresh/upgrade MySQL execution, foreign-key/check behavior and MySQL concurrency have not been certified. Run the repository's `RUN_FLYWAY_INTEGRATION=true` fixture with disposable `FLYWAY_TEST_DB_URL`, `FLYWAY_TEST_DB_USERNAME`, `FLYWAY_TEST_DB_PASSWORD` before release. Never point migration tests at production data.

**External providers:** Live Google/Telegram identities, ABA merchant alerts/replay handling, SMTP and media-provider success require configured staging accounts. Existing implementations/tests are preserved. No simulated OAuth or client-side paid approval was added.

**Accessibility:** New controls have labels, native input validation, focus indicators, step focus, busy/error/status semantics and touch-sized buttons. Keyboard/manual screen-reader and full WCAG certification are not claimed. Existing team styles and modal primitives are retained.

## Local manual reproduction

1. Configure the existing local development environment and database; ensure it is disposable before exercising new Flyway migrations. Start through the repository's normal local workflow (`run-local-stack.ps1`) or backend/user/admin dev commands.
2. Register an ordinary user with first-user-admin bootstrap disabled if verifying an empty database. Confirm the landing route is `/app/events` and the empty state has Create Event.
3. Create a wedding using a compatible wedding template. Enter required names/date/time/venue and save. Note the numeric event ID in `/app/events/:eventId`.
4. Create a birthday using Event Essential. Confirm celebrant fields replace wedding fields; save to a different numeric ID.
5. Add a guest and gift to the wedding. Switch to the birthday while on Guests, then Gifts; verify its own records/empty state. Refresh both URLs.
6. Edit the birthday message, contact and schedule in Settings. Complete the address and choose public visibility; save, publish from Overview, and inspect its existing public slug URL. Verify non-wedding labels, actual saved content and the existing public RSVP flow.
7. Verify `/dashboard?id=<weddingId>` and `/dashboard/invitations/<weddingId>/reports` preserve identity. Verify `/dashboard/guests` asks you to select an event even when a stored active ID exists.
8. Sign in as a second user and request the first event's URLs/APIs; expect denial. Use a STAFF account against admin pages/APIs; expect denial. Sign out and verify the selected event clears while saved drafts remain.
9. For a create failure, retry in the same wizard. Confirm the request key is unchanged and only one server event exists. For deletion failure, verify the local draft/card remains.
