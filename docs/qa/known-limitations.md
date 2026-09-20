# Known Limitations and Release Gates

Reviewed: 2026-09-15. Backend OWASP gate refreshed: 2026-09-20.

## Blocker / critical

1. **Historical Telegram credential incident:** revoke and rotate the provider credential, prove the old value is dead, triage all 32 redacted Gitleaks history findings across 15 path/rule groups, and complete a coordinated all-ref history rewrite. Current-tree cleanup is complete but cannot close an external credential incident. Follow `docs/security/credential-incident-response.md`.

## High release gates

1. **Asset rights:** redistribution/production rights for retained music and gallery/photo assets must be recorded or the affected assets replaced.
2. **Organization permissions, conditional:** team role labels are safe under current owner-only downstream enforcement, but team operations are not functionally complete. An approved role × action matrix and allow/deny/IDOR tests are required before marketing or enabling staff access.
3. **Release-candidate environment:** mandatory exact-commit CI gates—including OWASP Dependency-Check, fresh-MySQL migration, and Docker image builds—must pass, followed by staging/provider smoke evidence. The 2026-09-20 local OWASP run is clean but does not substitute for exact-commit CI.

## External/manual validation still required

- Live Google and Telegram login with production-like redirect/domain configuration.
- ABA sandbox checkout, server verification, callback replay/rejection, reconciliation, cancellation/refund policy, and real Telegram webhook delivery.
- SMTP/email and Cloudinary or selected storage-provider operations, including timeout/failure behavior.
- Public DNS/TLS, Cloudflare or chosen edge controls, Nginx trusted proxy headers, CORS/CSP/cookies/CSRF, production Redis fail-closed behavior, monitoring/alerts, and log redaction.
- MySQL empty migration, representative upgrade, backup, restore, and rollback rehearsals on the exact release commit.
- Full create/edit/publish/public RSVP/admin journeys against a staging database with representative non-sensitive data.
- Pixel-level comparison with the original design source, keyboard/screen-reader review, focus order, reduced motion, contrast, and long Khmer content.
- Provider-specific deployment proof. The repository now has a generic production container topology; Railway-specific readiness still requires project binding, service mapping, variables, logs, domains, database, and health-check evidence.

## Medium/low engineering backlog

- User bundle remains 1,509.16 kB minified JS and 569.37 kB CSS; admin JS is 515.36 kB. Add measured route/component splitting and performance budgets without destabilizing the retained UI.
- Define raw Telegram payment-evidence retention/minimization and, if needed across untrusted networks, signed timestamp/nonce replay protection.
- Approve check-in staff permission, revoke state/reason, and scanner-specific throttling.
- Retire legacy API aliases only after usage telemetry, consumer migration, parity tests, and a versioned deprecation window.
- Raise coverage strategically from the current 50.20% line / 34.91% branch baseline, prioritizing callback races, repositories, provider failures, and controllers rather than chasing percentage alone.
- Review the diagnostic Medium-threshold SpotBugs baseline separately; the enforced High threshold is clean.
- Plan for Mockito's future-JDK agent requirement and remove noisy expected Happy DOM network diagnostics where that can be done without hiding failures.

## Local evidence constraints

- Docker Desktop was stopped, so actual image builds were not executed locally; Compose interpolation/topology and image tag manifests were validated. CI is responsible for the clean Linux image builds.
- Disposable MySQL credentials were intentionally unavailable locally, so `FreshDatabaseMigrationTests` was the single skipped backend test. CI provisions an isolated MySQL 8 service.
- The workstation system drive had no free space, so Playwright and npm caches were redirected into ignored workspace `.cache/`; no user data was deleted.
- Controlled Playwright tests validate routes/responses, not live providers or staging persistence.

The release manager must not convert an environment-gated or provider-unverified item to PASS without sanitized evidence attached to the exact commit.
