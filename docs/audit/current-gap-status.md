# Architecture V2 Gap Reconciliation

Reconciliation date: 2026-09-15. Branch: `refactor/architecture-v2`.

This register supersedes the August snapshot. A code item is marked closed only when its implementation and relevant automated gates exist. Provider, production, and product-policy evidence remain explicitly open.

## Reconciled findings

| Finding | Severity | Status | Current evidence / remaining action |
| --- | --- | --- | --- |
| Historical Telegram credential exposure | CRITICAL | **OPEN — release blocker** | Current tracked tree is clean under Gitleaks 8.30.1, but a full-history scan still finds credential/rule matches. The repository owner must revoke the credential, prove the old value is dead, triage every history finding, and coordinate the rewrite procedure in `docs/security/credential-incident-response.md`. |
| Organization roles lack downstream action permissions | HIGH for team features | **OPEN — product decision** | Owner identity/role is immutable, inactive membership is denied, and membership changes are audited. `MANAGER`, `DESIGNER`, `CHECK_IN_STAFF`, `VIEWER`, and `MEMBER` still have no approved cross-module permission matrix. Keep team operations limited to current owner/admin rules until product approval and role-by-action/IDOR tests exist. |
| Retained asset redistribution rights | HIGH for public distribution | **OPEN — owner evidence** | Rights for retained music and gallery/photo source material must be documented or the assets replaced before public distribution. |
| Cookie authentication without an explicit CSRF contract | HIGH | **CLOSED** | Cookie mode conditionally enables Spring CSRF tokens; protected mutations reject missing tokens and hostile origins. Legacy and canonical route tests are in `CookieCsrfSecurityTests`. Bearer-only mode remains stateless with CSRF disabled by design. |
| Paid subscriptions had no trusted fulfillment transition | HIGH | **CLOSED** | Server-owned orders now use locked, idempotent confirmation and transactional subscription activation/expiry/entitlement rules. Frontends cannot self-activate. |
| Internal payment endpoints depended on an unsafe shared-secret check | HIGH | **CLOSED** | Required nonblank secret, constant-time comparison, isolated internal routes, and allow/deny tests are present. Telegram webhooks additionally require `X-Telegram-Bot-Api-Secret-Token` when configured. |
| Cross-invitation IDOR in child resources | HIGH | **CLOSED for implemented modules** | Guest, RSVP, media, seating, check-in, budget, gift, delivery, reporting, and notification operations resolve resources within the authenticated invitation boundary. Architecture and service tests protect the main ownership paths. |
| PayWay provider I/O held a database transaction; Cloudinary had no deadlines | MEDIUM | **CLOSED** | PayWay verification now runs outside the short transaction; the final state is reloaded with a pessimistic transaction-ID lock and duplicate paid callbacks are idempotent. PayWay has 15s connect/30s request timeouts; Cloudinary has 15s connect/60s request timeouts. |
| Seating capacity was checked only in memory without row serialization | MEDIUM | **CLOSED** | Assignment locks both the table and guest rows at the invariant boundary and rechecks capacity inside the transaction. |
| Public RSVP lacked a dedicated submission budget | MEDIUM | **CLOSED** | `PublicRsvpRateLimitFilter` applies a dedicated per-invitation/client budget without using personalized guest tokens as limiter keys. |
| Fresh MySQL/Flyway verification was optional only | MEDIUM | **CLOSED in CI; locally gated** | CI provisions MySQL 8 and runs `FreshDatabaseMigrationTests` against an empty database with Hibernate validation. The ordinary local suite skips this one test when disposable credentials are absent. Production keeps Flyway as schema authority. |
| Telegram detection could be treated as independent payment truth | MEDIUM | **MITIGATED / follow-up open** | `AUTO_CONFIRM_TELEGRAM_DETECTED` defaults false, locked detection enters review, and trusted confirmation owns fulfillment. Raw Telegram evidence retention/minimization and a signed timestamp/nonce replay protocol remain follow-up work. |
| Check-in staff, revoke semantics, and scanner-specific throttling | MEDIUM | **OPEN — product design** | Check-in is owner/admin authorized, row-locked, idempotent, and audited. Dedicated staff permissions, revoke state/reason, and measured scanner throttles require an approved venue workflow. |
| Duplicate legacy API aliases | LOW | **OPEN — compatibility debt** | `/api/v1` is canonical and frontend consumers use the stable contract. Compatibility aliases remain intentionally available; measure usage and remove only in a communicated versioned release. |
| Monolithic/duplicated frontend implementations | HIGH/MEDIUM | **CLOSED** | User and admin applications use routed feature boundaries, centralized API modules, shared UI only where genuinely shared, and server-authoritative domain data. ESLint, Vitest, Knip, depcheck, builds, and controlled Playwright routes pass. |
| Missing deployable container topology | HIGH | **CLOSED at repository level** | Four multi-stage/non-root Dockerfiles, MySQL/Redis services, health checks, named volumes, an unprivileged Nginx gateway, and Compose secret interpolation are present. Actual image builds remain a CI gate because the local Docker daemon was stopped. |

## Automated evidence snapshot

- Backend: 246 tests discovered, 245 passed, 1 environment-gated MySQL test skipped locally; JaCoCo report generated; SpotBugs High and PMD report zero findings.
- User frontend: 33 test files / 124 tests pass; lint, Knip, depcheck, build, and npm audit pass.
- Admin frontend: 3 test files / 10 tests pass; lint, Knip, depcheck, build, and npm audit pass.
- Browser: 12 critical journeys and 44 desktop/mobile route cases pass with controlled APIs.
- Telegram bot: 26 tests plus Ruff, Bandit, compileall, and `pip-audit` pass.
- API contract: 191 documented paths; runtime OpenAPI is compared semantically with the checked-in contract.
- Current tree: Gitleaks 8.30.1 reports zero findings on an exported tracked tree. Full history reports 32 redacted findings across 15 file/rule groups and remains incident evidence, not a current-source failure.

See `docs/qa/verification-results.md`, `docs/qa/known-limitations.md`, and `docs/testing/SMOKE_TEST.md` for the release evidence and manual provider checklist.
