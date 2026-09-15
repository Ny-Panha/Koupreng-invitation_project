# Backend architecture, security, and data-integrity audit

> **Historical backend baseline (2026-08-10):** findings and test counts below describe the pre-Architecture-V2 snapshot. See `current-gap-status.md`, `security-followup.md`, and `../qa/verification-results.md` for current closure status and evidence.

Audit date: 2026-08-10
Scope: `apps/backend`, Flyway schema, frontend consumers, `apps/telegram-bot`, infrastructure/configuration, and existing security incident documentation.

## Executive result

Koupreng already has a substantial Spring Boot 4.0.7 modular-monolith backend with clear controller/DTO/service/repository/entity layers. Authentication, ownership checks, persisted invitation planning, public RSVP, check-in, seating, template payments, and admin capabilities are real backend flows rather than browser-only state. Controllers return DTOs/envelopes rather than JPA entities.

This audit did not rewrite the architecture. It closed five bounded invariant/security gaps:

1. dedicated public RSVP throttling;
2. pessimistic-lock protection for seating, check-in, and Telegram/manual payment mutation;
3. consistent guest validation and invitation-scoped email/phone duplicate rejection;
4. immutable organization ownership, active-member access, and membership audit events;
5. review-first Telegram detection plus additive stable API/check-in result codes.

Release readiness is still blocked by the historical credential incident until the repository owner verifies external revocation/rotation and history remediation. Paid subscriptions and organization team permissions are incomplete product capabilities and must not be represented as fully operational.

## Architecture and trust boundaries

```text
browser / admin SPA / Telegram bot / payment provider
  -> Spring Security and request filters
  -> controller and validated request DTO
  -> service authorization + domain transaction
  -> scoped repository / locking repository
  -> JPA entity and Flyway-managed database
  -> response DTO / stable error
```

- Browser boundary: JWT/cookie proof is validated; DB user active state and `token_version` are rechecked.
- Public boundary: only documented invitation/template/i18n/RSVP/payment callback routes are unauthenticated; public RSVP writes have a dedicated throttle.
- Internal-payment boundary: a required server secret protects bot-to-backend mutation endpoints; value comparison is constant-time.
- Provider boundary: PayWay callback data is verified through the provider adapter before paid state.
- Persistence boundary: scoped queries validate parent/child ownership; Flyway owns schema; backend transactions own business state.

## What is correct

- `SecurityConfig`, `AppJwtAuthenticationConverter`, and the cookie bearer resolver implement stateless authenticated requests with active-user/token-version enforcement, role conversion, production security headers, WAF, auth throttling, request logging, and restricted internal payment routes.
- Invitation, guest, RSVP, seating, check-in, budget, gift, media, and delivery services use invitation-scoped access patterns. No controller directly returns an entity.
- `TemplatePaymentService` keeps paid transition and `UserTemplateAccess` creation in one transaction and validates owner, amount, currency, provider evidence, order state, and expiry.
- Guest/RSVP/check-in/seat schemas have useful foreign keys and one-record uniqueness constraints. Order code, provider transaction IDs, and entitlements also have database uniqueness.
- File uploads pass through extension/MIME/size validation. Public DTOs keep private entity fields out of invitation reads.
- Production rate limiting uses Redis and a fail-closed posture; proxy header trust is separately configurable.
- Audit logging exists for security/admin/domain events and was extended to organization membership changes.

## Findings and dispositions

### CRITICAL-01 — Historical credential exposure remains an unverified release blocker

- **Finding:** A previously committed Telegram credential-shaped value must be treated as compromised. Current-tree deletion cannot revoke it or erase Git objects, forks, logs, or clones.
- **Evidence:** `docs/security/credential-incident-response.md` records the incident and required owner procedure. This audit found no owner-supplied proof of rotation, old-credential rejection, or completed history remediation.
- **Affected files/components:** repository history, Telegram bot deployment secret, CI/deployment secret stores, incident documentation.
- **Exploit/business scenario:** Anyone who retained the historical value could impersonate the bot or abuse its trusted integration until the provider revokes it.
- **Root cause:** A live-shaped credential entered tracked repository content and history.
- **Fix:** Repository owner revokes/reissues externally, updates secret stores, proves the old credential fails, scans history with redacted output, coordinates a history rewrite, invalidates caches/clones, and reviews relevant audit activity.
- **Tests/evidence required:** timestamped provider revocation evidence, rejected old-credential probe, successful deployment using replacement, clean redacted current-tree and history scans, remote-branch/tag verification.
- **Status:** **OPEN — RELEASE BLOCKER.** No credential values are reproduced in audit output. This working-copy audit cannot perform owner/provider actions.

### HIGH-01 — Paid subscription purchase has no complete trusted activation path

- **Finding:** Paid package purchase persists a pending subscription, but no complete payment confirmation -> subscription activation/entitlement transition was found.
- **Evidence:** `SubscriptionController`, `SubscriptionService`, subscription/package entities, and Flyway tables provide list/current/history/purchase; template payment confirmation grants template access, not subscription activation.
- **Affected files/components:** `SubscriptionService`, `TemplatePaymentService`, `Subscription`, `packages`, `subscriptions`, subscription frontend service.
- **Exploit/business scenario:** A user pays but remains pending, or future client work is tempted to unlock the package locally to compensate.
- **Root cause:** Package purchasing and template payment entitlement are parallel workflows without a typed common order/activation contract.
- **Fix:** Define a server-owned subscription order/payment contract, idempotent trusted confirmation, transactional activation dates/expiry/entitlements, and reconciliation/admin recovery. Do not reuse a template entitlement implicitly.
- **Tests:** payment success/failure/duplicate/expiry/refund tests plus transaction rollback and user ownership tests.
- **Status:** **OPEN.** Frontend must continue treating paid subscription as pending.

### HIGH-02 — Organization role labels do not map to downstream permissions

- **Finding:** Organization roles exist, but invitation, guest, budget, media, payment, and export services generally authorize invitation owner/admin only. Granting access to every member would over-authorize viewers.
- **Evidence:** `OrganizationService` stores roles such as manager/designer/check-in/viewer, while downstream services use owner/admin helpers; `InvitationService` only permits active member organization selection.
- **Affected files/components:** organization/member entities and service; invitation/guest/check-in/seating/budget/media/payment/report services; organization frontend permissions UI.
- **Exploit/business scenario:** The UI advertises a team role that cannot perform work, or an overly broad “member” shortcut later permits destructive actions to viewers.
- **Root cause:** Roles were modeled without an explicit action-to-role permission matrix and centralized policy evaluator.
- **Fix:** Define effective permissions per domain action, add a policy service and authorization tests, migrate UI copy/controls to returned effective permissions, and preserve owner immutability.
- **Tests:** per-role allow/deny matrix, self-escalation, inactive membership, cross-organization IDOR, invitation ownership, payment/export denial.
- **Status:** **PARTIAL.** Owner immutability, active-member access, and audit events are fixed; downstream RBAC remains open.

### HIGH-03 — Cookie JWT mutations rely on SameSite rather than explicit CSRF tokens

- **Finding:** CSRF is disabled while authentication can be resolved from an HttpOnly cookie.
- **Evidence:** `SecurityConfig` disables CSRF; cookie bearer resolution and `AuthController` issue the auth cookie with HttpOnly/Secure/SameSite settings.
- **Affected files/components:** security configuration, cookie configuration, CORS/deployment origins, all state-changing browser endpoints.
- **Exploit/business scenario:** A future cookie/domain/SameSite/CORS change can turn a defense-in-depth gap into cross-site mutation exposure.
- **Root cause:** Stateless bearer assumptions and cookie convenience are combined without an explicit double-submit/synchronizer policy.
- **Fix:** Choose and document one supported mode: Authorization-header bearer only, or cookie auth with CSRF tokens/origin checks on unsafe methods. Add browser-level cross-origin tests before changing behavior.
- **Tests:** allowed-origin mutation, hostile-origin POST, missing/invalid CSRF token, login/logout cookie attributes.
- **Status:** **OPEN.** No breaking auth change was made in this audit.

### HIGH-04 — Guest uniqueness is not concurrency-safe at the database layer

- **Finding:** Service checks now reject duplicate nonblank email/phone per invitation on every supported write path, but concurrent writers can pass before either commits.
- **Evidence:** `GuestService` duplicate checks and `GuestRepository` queries; Flyway guest table lacks normalized `(invitation_id,email)` and `(invitation_id,phone)` uniqueness.
- **Affected files/components:** guest service/repository/entity, `guests` schema, imports.
- **Exploit/business scenario:** Two operators/imports create duplicate contact identities, causing ambiguous invitation delivery and RSVP linkage.
- **Root cause:** Legacy nullable/un-normalized contact fields make a portable unique constraint nontrivial.
- **Fix:** Decide normalization/case/blank semantics, backfill conflicts, add normalized nullable columns or database-appropriate functional constraints in a new Flyway migration, translate constraint conflicts to `GUEST_DUPLICATE`.
- **Tests:** real-database concurrent insert/update and migration tests with null/blank/case/format variants.
- **Status:** **PARTIAL.** Deterministic service validation and regression tests are implemented.

### MEDIUM-01 — Several list/report endpoints are unbounded

- **Finding:** User/admin/invitation/payment/notification/guest/report collections often return full arrays with no page contract.
- **Evidence:** controller route inventory and repository methods returning `List`, including admin users/invitations/payments, notifications, payment history, guests, and some reports.
- **Affected files/components:** admin management, guest, RSVP, notification, payment history, dashboard/report controllers/services/repositories and frontend consumers.
- **Exploit/business scenario:** Large tenants cause slow queries, large JSON/exports, memory pressure, and poor dashboard latency.
- **Root cause:** MVP array contracts were retained as datasets grew.
- **Fix:** Add optional bounded `page`, `size`, `sort`, and filters while preserving existing responses during migration; measure common queries and add indexes from query plans.
- **Tests:** maximum size, stable sort, filter ownership, page boundary, query-count/performance tests.
- **Status:** **OPEN.** Avoided a broad breaking contract change.

### MEDIUM-02 — PayWay remote verification occurs inside a database transaction

- **Finding:** Callback handling performs network verification while its service transaction is open.
- **Evidence:** transactional callback path in `TemplatePaymentService` invokes `AbaPayWayService` before completing state transition.
- **Affected files/components:** payment callback service/adapter, order rows, connection pool.
- **Exploit/business scenario:** Provider latency holds DB resources, increases contention, and can amplify callback retries.
- **Root cause:** Remote verification and atomic paid transition share one method boundary.
- **Fix:** Verify outside the write transaction, then enter a short locked transactional method that rechecks state/evidence and grants entitlement idempotently; persist a bounded verification attempt record if recovery requires it.
- **Tests:** timeout/retry, duplicate callbacks, state changed between verification and commit, rollback, provider mismatch.
- **Status:** **OPEN.** Manual/Telegram mutation locks are implemented; callback refactor requires a deliberate contract slice.

### MEDIUM-03 — Payment/Telegram raw metadata has no explicit retention policy

- **Finding:** Raw notification/message and provider metadata are stored for reconciliation, but bounded retention/redaction is not defined.
- **Evidence:** `TemplatePaymentOrder` metadata fields and Telegram detection mapping; bot forwards raw message text.
- **Affected files/components:** template payment table/entity/service, bot request construction, backup/observability policy.
- **Exploit/business scenario:** Long-lived payment messages increase privacy impact and incident blast radius.
- **Root cause:** Reconciliation evidence was added without data classification and deletion requirements.
- **Fix:** Classify required fields, stop persisting unnecessary raw text, redact payer identifiers, define retention/cleanup job, and limit admin exposure.
- **Tests:** redaction mapping, cleanup cutoff, authorized retrieval, logs do not contain raw payload.
- **Status:** **OPEN.** This audit did not delete historical records.

### MEDIUM-04 — Public generic RSVP duplicate and party-size limits are incomplete

- **Finding:** RSVP validates nonnegative/attending counts and one RSVP per known guest, but generic name-based guest creation can race and no invitation maximum party size is modeled.
- **Evidence:** `RsvpService`, RSVP/guest schema, request DTOs.
- **Affected files/components:** public RSVP service/DTO, guest schema, invitation settings.
- **Exploit/business scenario:** Concurrent submissions create duplicate guests; abusive but throttled submissions may claim unrealistic attendee counts.
- **Root cause:** Generic RSVP has no stable public idempotency key and the invitation model lacks a maximum party-size rule.
- **Fix:** Add an idempotency key or stable normalized generic identity policy and a configurable server-side maximum; use a DB constraint/lock appropriate to the chosen identity.
- **Tests:** concurrent duplicate POST, replay, maximum boundary, personalized resubmission, deadline.
- **Status:** **PARTIAL.** Dedicated per-slug/client RSVP throttling is implemented and tested.

### MEDIUM-05 — Check-in staff/revoke/rate policy is incomplete

- **Finding:** Check-in is transactional/idempotent and cross-invitation safe, but only owner/admin authorization is effective; revoke state and dedicated scanner throttle are absent.
- **Evidence:** `CheckInController`, `CheckInService`, organization roles, check-in entity/schema.
- **Affected files/components:** check-in policy/service/entity/DTO, organization permissions, scanner UI.
- **Exploit/business scenario:** Designated staff cannot legitimately scan, compromised owner credentials can scan at unbounded app-specific rate, and an invalidated guest cannot be represented as revoked.
- **Root cause:** Check-in lifecycle and organization permission model were only partially specified.
- **Fix:** Introduce explicit `CHECK_IN` permission, revoke state/reason/audit transition, and a scanner-specific rate policy after measuring venue throughput.
- **Tests:** role matrix, revoked token, duplicate scan, wrong invitation, throttle boundary, audit entry.
- **Status:** **PARTIAL.** Locked idempotency, result codes, and same-invitation detection are implemented/tested.

### MEDIUM-06 — Flyway operational validation is environment-dependent

- **Finding:** Local configuration enables out-of-order migrations, the sequence intentionally skips V2, and the fresh-MySQL test needs external database environment variables.
- **Evidence:** `application.properties`, migration filenames, `FreshDatabaseMigrationTests` gating.
- **Affected files/components:** Flyway configuration, CI database service, production rollout process.
- **Exploit/business scenario:** A migration order mistake is tolerated locally or a production-only MySQL incompatibility escapes an H2/unit run.
- **Root cause:** Local convenience and CI integration prerequisites are not a single mandatory release gate.
- **Fix:** Keep production out-of-order disabled, document the gap, provision disposable MySQL in CI, run `flyway:validate`/fresh migrate on every backend release, and never edit applied migrations.
- **Tests:** empty MySQL migration, upgrade from last production version, schema constraint/index assertions.
- **Status:** **OPEN/ENVIRONMENT-GATED.** No applied migration was edited.

### MEDIUM-07 — Cloud media adapter has no explicit HTTP timeout policy

- **Finding:** The Cloudinary adapter uses a default JDK HTTP client without explicit connect/request timeouts.
- **Evidence:** media/cloud adapter construction using `HttpClient.newHttpClient()`.
- **Affected files/components:** cloud media service, upload/replace operations, application thread pool.
- **Exploit/business scenario:** Network stalls tie up request threads and prolong user operations.
- **Root cause:** Provider adapter was implemented without bounded network policy.
- **Fix:** Configure connect/request timeouts, cancellation, safe bounded retry only for idempotent operations, and provider latency/failure metrics.
- **Tests:** connect timeout, response timeout, interrupted request, no duplicate upload on retry.
- **Status:** **OPEN.** Kept out of the focused domain-invariant batch.

### MEDIUM-08 — AI assistant is a safe stub, not a production AI capability

- **Finding:** The controller delegates to an application service and does not block invitation creation, but there is no provider abstraction implementation, dedicated limiter, usage tracking, or timeout/failure circuit.
- **Evidence:** `AiInvitationAssistantController`, `AiInvitationAssistantService`, AI DTOs; no provider repository/configuration.
- **Affected files/components:** AI service/controller and frontend assistant.
- **Exploit/business scenario:** Product UX can promise generation the backend does not provide, or a later direct provider call bypasses privacy and resiliency constraints.
- **Root cause:** Interface/UX was scaffolded before provider architecture.
- **Fix:** Define a provider port, privacy-minimized contract, dedicated quota/rate limiter, timeout/cancellation, usage ledger, and graceful unavailable response before enabling a provider.
- **Tests:** provider timeout/error, rate/usage limits, PII exclusion, invitation creation unaffected.
- **Status:** **OPEN/PARTIAL.** Current stub is isolated and non-authoritative.

### MEDIUM-09 — File guest import does not have full DTO-validation parity or a row cap

- **Finding:** CSV/XLSX import limits files to 5 MB and checks format/name/duplicates, but generated row DTOs do not pass through the same Bean Validation boundary as JSON import and parsed row count is not capped at 1,000.
- **Evidence:** `GuestController`, `GuestService.validateImportFile`/row parsers, `GuestRequest`, and `GuestImportRequest`.
- **Affected files/components:** guest file import service/parsers, import response, large-event operations.
- **Exploit/business scenario:** A compact file can create an excessive number of rows or persist email/length/value combinations that the JSON endpoint rejects.
- **Root cause:** File rows are constructed inside the service after controller validation, and the JSON collection cap was not reused.
- **Fix:** Run every parsed row through the Jakarta validator, return row-scoped safe errors, enforce an explicit maximum row count during parsing, and decide whether invalid rows make the import atomic or are reported/skipped.
- **Tests:** CSV/XLSX row limit, invalid email/length/negative value, duplicate within file and database, partial-vs-atomic behavior, malformed signature.
- **Status:** **OPEN.** File size/type/signature and duplicate checks remain; this was documented rather than hidden behind the JSON fix.

### LOW-01 — Duplicate and legacy route/model families increase maintenance cost

- **Finding:** Canonical and legacy admin routes coexist; budget exposes two item path shapes; `Event` and `UserInvitation` overlap; legacy/current payment tables coexist.
- **Evidence:** controllers and Flyway/entity inventory.
- **Affected files/components:** admin/event/budget/payment controllers, frontend services, schema.
- **Exploit/business scenario:** Fixes land in one family but not another, creating inconsistent validation or authorization.
- **Root cause:** Backward-compatible evolution without a deprecation ledger.
- **Fix:** Instrument usage, declare canonical routes/models, add parity tests, publish deprecation dates, then remove only after confirmed zero consumers and a migration.
- **Tests:** route parity, authorization parity, caller inventory, migration verification.
- **Status:** **OPEN.** No compatibility-breaking removal was attempted.

### LOW-02 — Check-in summary has a query amplification pattern

- **Finding:** Summary/list mapping performs RSVP lookup per checked-in guest.
- **Evidence:** `CheckInService` response/list assembly and RSVP repository calls.
- **Affected files/components:** check-in summary service/repositories.
- **Exploit/business scenario:** Large events generate N+1 queries and slower check-in dashboards.
- **Root cause:** Convenient per-record mapping instead of a join/projection/batched map.
- **Fix:** Measure query count, then fetch required RSVP fields in one query or batch and map by guest ID.
- **Tests:** query-count assertion and response parity on large fixtures.
- **Status:** **OPEN.** Correctness is unaffected.

## Fixed findings in this implementation batch

| Prior severity | Finding and root cause | Fix and affected files | Regression evidence | Status |
|---|---|---|---|---|
| High | Public RSVP writes had only broad WAF limits, enabling invitation-specific abuse | `PublicRsvpRateLimitFilter`, `SecurityConfig`, `AppProperties`, properties; key excludes invite token; Redis fail-closed outages remain `503` instead of being misreported as throttling | generic/personalized/throttle-route/unavailable filter tests | **FIXED** |
| High | Seating capacity used an unlocked read-check-write; concurrent assignments could overfill | pessimistic table and guest queries plus transactional assignment; conflict code | `SeatingServiceTests` verifies lock use and capacity rejection | **FIXED at service level**; real DB contention test remains desirable |
| High | Check-in find-then-save could race and wrong-invitation tokens were indistinguishable | locked guest lookup, global existence check without PII, additive result/code contract | `CheckInServiceTests` duplicate and cross-invitation cases | **FIXED at service level** |
| High | Telegram/manual confirmation read order state without a row lock and Telegram auto-confirmed by default | locked order query; configuration default `false`; review state before entitlement | existing payment state suite updated for lock path and review behavior | **FIXED** |
| High | Organization APIs allowed assigning `OWNER`, changing owner membership, inactive-member access, and unaudited changes | owner-role guard, owner mutation guard, active membership query, sanitized audit events | `OrganizationServiceTests` | **FIXED for membership lifecycle** |
| Medium | Guest create/update/JSON import validation differed; duplicates could be introduced through some paths | shared duplicate checks, nested validation, sizes/minimums/import cap | `GuestServiceTests` plus compile-time/controller validation coverage | **FIXED at service level**; DB concurrency gap is HIGH-04 |
| Medium | Errors lacked stable code/path and used only legacy validation fields | additive `ApiException.code`; standardized handler fields; legacy `fields` preserved | `GlobalExceptionHandlerTests` | **FIXED without breaking existing field consumers** |

## Data and transaction review

- Entities and tables align for active domain objects. Current template payments use `template_payment_orders` and `user_template_access`; `template_orders` is a distinct older model.
- Money is represented with `BigDecimal` and DECIMAL columns. Timestamps are server-generated temporal values; public JSON uses ISO serialization.
- High-risk read-check-write paths fixed here use `PESSIMISTIC_WRITE`. Locks are acquired inside `@Transactional` service methods.
- No already-applied Flyway file was modified. Guest database uniqueness, subscription activation, and any check-in revoke state require new migrations after data compatibility analysis.
- Invitation deletion and guest imports are transactional. Payment-to-entitlement is transactional. The remote callback transaction is called out separately rather than silently changed.

## API and frontend compatibility

- The audit found matching user/admin callers for the canonical endpoint families in `docs/audit/backend-frontend-contract.md`.
- No endpoint, DTO field, or enum was removed. New error/check-in fields are additive.
- Safer Telegram behavior is a deliberate server policy change: bot detection no longer means paid unless deployment explicitly opts into that risk. Existing admin confirmation completes the flow.
- Frontends must not infer team permissions from role labels until the backend returns effective permissions.

## Verification record

- Focused regression command: `mvnw.cmd -Dtest=PublicRsvpRateLimitFilterTests,SeatingServiceTests,CheckInServiceTests,GuestServiceTests,OrganizationServiceTests,TemplatePaymentServiceTests,GlobalExceptionHandlerTests test`
- First focused result: **39 tests, 0 failures, 0 errors, 0 skipped**. Two further default/active-membership regressions are included in the final full result.
- Full backend command: `mvnw.cmd clean verify` -> **BUILD SUCCESS**, **151 tests, 0 failures, 0 errors, 1 skipped**, executable JAR created, SpotBugs **0 bug instances / 0 errors**, PMD passed, JaCoCo report generated.
- JaCoCo aggregate snapshot: **38.89% lines**, **34.93% instructions**, **24.87% branches**. The build has no configured coverage failure threshold; these figures are evidence, not a claim of sufficient coverage.
- The single skip is `FreshDatabaseMigrationTests`: `RUN_FLYWAY_INTEGRATION` and disposable `FLYWAY_TEST_DB_*` settings were absent. Fresh MySQL migration is therefore **not verified**.
- OWASP Dependency-Check was attempted twice (four-minute and six-minute bounds). Both attempts timed out during vulnerability-data processing and produced no report; the spawned workers were stopped. Dependency vulnerability status is **not verified**.
- Telegram bot: `pytest -q` -> **24 passed**; Ruff and Bandit passed; `pip check` found no broken requirements; `pip-audit -r requirements.txt` found no known vulnerabilities.
- Frontend contract regression subset: payment service, organization, and guest-authority Vitest files -> **10 tests passed**.
- Filename-only current-tree token-shape scan found only three occurrences in two Telegram bot test files; masked inspection confirmed they are explicitly assigned test fixtures. No value was printed.

## Recommended delivery sequence

1. Resolve CRITICAL-01 externally before release.
2. Keep Telegram auto-confirm disabled; deploy this bounded hardening batch and observe `PAID_PENDING_REVIEW` reconciliation.
3. Design and implement paid subscription activation as a typed, idempotent payment contract.
4. Specify organization effective permissions before granting any downstream member access.
5. Add disposable MySQL and concurrency integration gates, then tackle guest DB uniqueness and PayWay transaction shortening.
6. Add pagination and provider timeout/retention work as backward-compatible API slices.
