# Architecture V2 Production Readiness Report

Assessment date: 2026-09-15. Branch: `refactor/architecture-v2`.

## Decision

**Architecture V2 is implemented and repository-level automated gates are green, but the product is NOT APPROVED FOR PUBLIC RELEASE.** The remaining release blocker is an externally owned historical credential incident. Java advisory, asset-rights, exact-commit CI, and live environment/provider evidence are also required before sign-off.

## Completed Architecture V2 scope

| Phase | Outcome |
| --- | --- |
| Repository/database audit | Current implementation, migrations, routes, ownership, security, integrations, duplication, assets, and deployment gaps inventoried before migration. Flyway remains append-only schema authority. |
| Backend modular monolith | 285 main Java files organized by business modules with `api`, `application`, `domain`, and `infrastructure` used where valuable. ArchUnit prevents regression into legacy technical-layer coupling. |
| Security/auth/users | Canonical v1 auth/current-user routes, JWT/cookie handling, CSRF cookie-mode contract, CORS/HTTPS headers, validation, rate limits, upload checks, centralized safe errors, ownership and admin enforcement. |
| Business domains | Templates, invitations/customization, media, guests, RSVP, delivery, check-in, seating, budget, gifts, organizations, notifications, reporting, audit, subscriptions, payments, events/QR, admin, and optional AI boundary migrated under domain ownership. |
| Payments/external adapters | Backend-owned locked/idempotent fulfillment; Telegram review-first detection and webhook secret; PayWay signature/server verification outside DB transactions; Cloudinary/PayWay deadlines; optional AI isolated behind configuration. |
| API contract | `/api/v1` is canonical, selected aliases preserve compatibility, JPA entities are not controller contracts, centralized response/errors exist, 191 OpenAPI paths are checked semantically against runtime generation. |
| User/admin frontends | Existing UI identity, Khmer typography, routes, and behavior preserved while dead/duplicate code was removed; data access is centralized and backend authority retained. Both independent builds and route guards pass. |
| Infrastructure | Non-root multi-stage Dockerfiles for all four apps; MySQL/Redis health and internal networks; named data volumes; unprivileged Nginx host routing; secret-only environment injection; deployment guide and rollback assets. |
| CI/QA | Backend tests/static/coverage/OpenAPI; frontend clean install/lint/unit/dead-code/build; bot lint/test/security/compile/audit; MySQL 8 migration; Playwright; Gitleaks; dependency audits; config and Dockerfile build jobs. |
| Cleanup/documentation | Verified legacy modules and duplicate frontend implementations removed through logical commits; README, architecture/database/API/deployment/security/QA docs and canonical smoke test aligned with the V2 state. |

## Latest evidence

- Backend: 246 discovered / 245 passed / 1 local disposable-MySQL skip; SpotBugs High 0; PMD 0; JaCoCo 50.20% line and 34.91% branch.
- User frontend: 124 tests; admin frontend: 10 tests; both clean-install, lint, Knip, depcheck, production builds, and npm audits pass.
- Controlled browser matrix: all 56 cases pass across desktop and mobile projects.
- Telegram bot: 26 tests plus Ruff, Bandit, compileall, and pip-audit pass.
- Current tracked tree: Gitleaks reports zero findings. Full history remains failed incident evidence with 32 redacted findings across 15 file/rule groups.
- Compose configuration validates locally. Actual clean image builds and current-tree fresh MySQL are defined as CI jobs and require their exact-commit results.

## Blocking and conditional gates

1. Complete Telegram credential revocation/rotation and coordinated history remediation, with proof the old credential is dead.
2. Obtain a successful OWASP Java dependency report; the local no-key first sync did not complete.
3. Pass all CI jobs—including clean image builds and MySQL 8 empty-schema validation—on the final commit.
4. Document or replace retained assets before public redistribution.
5. Run the staging/provider checklist for OAuth, ABA/Telegram, SMTP/storage, DNS/TLS/proxy/security, Redis, monitoring, backup, restore, and rollback.
6. Approve and test the organization role matrix before enabling team operations; approve scanner staff/revoke policy before offering venue staff access.

## Non-blocking backlog

- Reduce frontend bundle sizes with measured code splitting and explicit performance budgets.
- Add targeted coverage for remote failure/race/replay paths and repository/controller integration.
- Define Telegram raw-evidence retention and a replay-resistant internal protocol where deployment topology warrants it.
- Retire compatibility endpoints through telemetry and a versioned deprecation process.
- Address future JDK Mockito agent configuration and reduce expected test-environment network noise.

The authoritative execution evidence is `docs/qa/verification-results.md`; blockers are in `docs/qa/known-limitations.md`; the release procedure is `docs/testing/SMOKE_TEST.md`. No blocked item may be converted to PASS without sanitized evidence for the exact release commit.
