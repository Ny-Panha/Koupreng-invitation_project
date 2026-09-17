# Architecture V2 Full Project QA Report

Evidence date: 2026-09-15.

## Outcome

All four applications pass their repository-controlled quality gates. The backend modular rules and semantic OpenAPI drift test pass; both React applications clean-install, test, analyze, and build; the bot passes lint/tests/security/compile/audit; the controlled desktop/mobile browser matrix passes; and the tracked current tree has zero Gitleaks findings.

Architecture V2 is therefore complete at the repository implementation level. It is **not approved for public production release** until the historical Telegram credential incident and the other external gates in `qa/known-limitations.md` are closed.

## Evidence totals

| Component | Result |
| --- | --- |
| Backend | 246 discovered; 245 passed; 1 disposable-MySQL skip; SpotBugs High 0; PMD 0; JaCoCo 50.20% line / 34.91% branch |
| User frontend | 33 files / 124 tests; ESLint, Knip, depcheck, build, npm audit pass |
| Admin frontend | 3 files / 10 tests; ESLint, Knip, depcheck, build, npm audit pass |
| Browser | 12 critical journeys + 44 route-smoke cases pass in controlled desktop/mobile projects |
| Telegram bot | 26 tests; Ruff, Bandit, compileall, pip-audit pass |
| API | 191 OpenAPI paths; checked-in YAML and runtime generation are semantically equal |
| Secrets | Current tracked tree pass; full history fail/incident (32 redacted findings in 15 path/rule groups) |
| Containers/database | Compose validates; current clean image builds and fresh MySQL migration await exact-commit CI evidence |

## Functional coverage map

| Area | Automated evidence | Remaining manual/provider evidence |
| --- | --- | --- |
| Auth/account/admin isolation | Backend JWT, cookie/CSRF, CORS, rate, role and route tests; frontend guards | Live Google/Telegram domains and sessions |
| Templates/invitations/public view | Services, validation, ownership, frontend tests/build, controlled public journey | Staging create/edit/publish and visual/accessibility approval |
| Media | Upload authorization/validation and provider adapter boundaries | Real storage upload/delete/timeout |
| Guests/RSVP/delivery | Domain tests, dedicated RSVP throttling, controlled routes | Staging import/share/email and realistic abuse/load |
| Check-in/seating/planning/gifts | Row-lock/invariant tests and routed frontends | Venue workflow, staff/revoke policy, representative data |
| Payments/purchases/subscriptions | Server verification, locking, idempotency, entitlement and internal-secret tests | ABA sandbox/live callbacks, Telegram delivery, reconciliation/refund policy |
| Reporting/notifications/audit | Backend ownership/admin tests and frontend routes | Staging data, external delivery, operational review |
| Deployment | Docker/Nginx/Compose definitions and validation | Image-build CI, DNS/TLS/edge, monitoring, backup/restore, rollback |

The detailed command results are in `qa/verification-results.md`. Execute `testing/SMOKE_TEST.md` on the release candidate and attach sanitized evidence; automated controlled responses are not a claim that a third-party provider worked.
