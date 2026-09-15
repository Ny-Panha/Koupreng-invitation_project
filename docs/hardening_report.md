# Architecture V2 Hardening Report

Refreshed: 2026-09-15.

## Completed in the current tree

- Established domain-owned backend packages and ArchUnit boundaries while preserving the Spring Boot modular monolith.
- Added canonical `/api/v1` contracts, semantic runtime OpenAPI drift enforcement, consistent safe response/errors, validation, and ownership checks.
- Hardened JWT/cookie authentication, conditional cookie-mode CSRF, CORS/HTTPS/security headers, account/reset flows, upload validation, WAF/application rate boundaries, and trusted client-address handling.
- Added database uniqueness and pessimistic locking at guest, RSVP/payment, seating, check-in, and entitlement invariant boundaries.
- Made paid fulfillment server-owned, transactional, and idempotent; kept Telegram detection review-first; authenticated bot webhooks; moved PayWay verification outside database transactions.
- Added explicit network deadlines for PayWay and Cloudinary and kept optional AI/provider code behind adapter/configuration boundaries.
- Removed verified dead/duplicate frontend and legacy backend paths; centralized frontend HTTP/error/session handling without redesigning the retained UI.
- Added multi-stage non-root containers, unprivileged Nginx routing, internal data services, health checks, named volumes, placeholder-only environment examples, and production configuration checks.
- Expanded CI across tests, static analysis, coverage, OpenAPI drift, unused dependencies/files, Playwright, MySQL 8 migrations, Gitleaks, dependency audits, configuration, and Docker image builds.

## Latest green evidence

- Backend 245/245 locally runnable tests pass; one disposable-MySQL test is intentionally skipped locally; SpotBugs High and PMD are clean.
- Frontends pass 134 unit tests combined, clean lockfile installs, lint, Knip, depcheck, builds, and zero-advisory npm audits.
- All 56 controlled browser cases pass.
- Bot passes 26 tests, Ruff, Bandit, compileall, and pip-audit.
- Current tracked tree passes Gitleaks with zero findings.

## Still external or unresolved

- The historical Telegram credential incident remains critical until provider revocation and all-ref history remediation are proven.
- Java advisory status is unverified because the local no-key OWASP first sync did not complete; exact-commit CI must pass.
- Live providers, image builds, fresh/upgrade MySQL, public deployment controls, monitoring, backup/restore, asset rights, and full staging journeys require owner evidence.
- Organization staff permissions and scanner revoke/rate policy require product decisions before those capabilities are enabled.
- Telegram evidence retention/replay and frontend performance remain documented improvement work.

See `audit/security-followup.md`, `qa/verification-results.md`, `qa/known-limitations.md`, and `testing/SMOKE_TEST.md`. Repository hardening does not itself close a provider credential incident or prove a production environment.
