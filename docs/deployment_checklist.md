# Production Deployment Checklist

Do not deploy until `production_readiness_report.md` has no release blockers.

## Repository and CI

- [ ] Intended release commit is reviewed and `git status --short` is clean.
- [ ] All ten CI jobs pass on that exact commit.
- [ ] Gitleaks current-tree scan passes and historical credential remediation is complete.
- [ ] Java, Node, and Python vulnerability audits have successful reports.
- [ ] Backend coverage/static analysis and fresh-MySQL migration jobs pass.
- [ ] User/admin lint, tests, analysis, builds, Playwright, and route smoke pass.

## Provider definition

- [ ] Each service has an explicit provider project/service ID, root directory, build command, start command, health path, and domain.
- [ ] Database engine/version, connection policy, migration owner, backup, restore drill, and rollback owner are documented.
- [ ] Runtime versions match JDK 25, Node 22, Python 3.13, and MySQL 8 expectations.
- [ ] The tracked Compose topology passes `docker compose config`, all four application images build, and its hostnames/health checks match the selected provider topology.

## Secrets and external services

- [ ] Telegram token is newly rotated; the old token is verified invalid.
- [ ] Telegram webhook registration uses the rotated `TELEGRAM_WEBHOOK_SECRET` as `secret_token`, and requests without the matching header are rejected.
- [ ] Database, JWT, admin-payment, OAuth, Telegram, email, storage, and provider credentials live only in the provider secret store.
- [ ] Production CORS origins, TLS/HSTS, CSP, cookies, trusted proxy headers, WAF, and rate-limit backend are verified.
- [ ] ABA callback source/secret behavior, Telegram delivery, SMTP, and storage uploads pass in staging.

## Assets and user experience

- [ ] Music/photo redistribution rights are recorded.
- [ ] Mobile/desktop visual acceptance, accessibility, and performance budgets pass.
- [ ] Public invitation, RSVP, user create/edit/publish, admin moderation, and failure recovery journeys pass against staging.

## Release and rollback

- [ ] Capture provider build/deploy logs, health output, smoke results, deployed commit SHA, and release timestamp.
- [ ] Keep the previous immutable artifact available.
- [ ] Take and verify a database backup before migration.
- [ ] Use the forward-recovery/rollback process in `rollback_plan.md`; never delete Flyway history rows as an improvised rollback.
