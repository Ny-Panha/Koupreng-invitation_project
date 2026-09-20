# Architecture V2 Verification Results

Evidence date: 2026-09-15. Branch: `refactor/architecture-v2`. The backend OWASP row was refreshed on 2026-09-20 from `feat/week2-backend-security-owasp`.

These results describe local Windows execution on the checked-out branch unless explicitly identified as a CI definition. No GitHub Actions, production, Railway, or live-provider success is claimed before those external systems run on the exact commit.

## Automated results

| Area | Command/check | Result |
| --- | --- | --- |
| Backend full gate | `apps/backend/mvnw.cmd verify` | **PASS:** 246 tests discovered, 245 passed, 1 opt-in MySQL skip; executable JAR and JaCoCo report generated |
| Backend static analysis | Maven verify SpotBugs/PMD executions | **PASS:** 0 High-threshold SpotBugs findings/errors; PMD clean |
| Backend coverage | JaCoCo aggregate | 50.20% line and 34.91% branch; no minimum is configured |
| Architecture/API drift | ArchUnit plus runtime OpenAPI snapshot test | **PASS:** module rules pass and generated OpenAPI is semantically equal to `packages/api-contracts/openapi.yaml` |
| Fresh database | `FreshDatabaseMigrationTests` | **NOT RUN locally on this tree:** disposable MySQL variables unavailable; exactly 1 test skipped. CI has a mandatory MySQL 8 service job for this test |
| Java dependency use | `mvnw.cmd dependency:analyze` | **PASS with warnings:** Spring starter aggregation produces expected used-undeclared/unused-declared warnings; no blind transitive rewrite made |
| Java vulnerability feed | `mvnw.cmd -Pdependency-security org.owasp:dependency-check-maven:check` | **PASS (2026-09-20):** 114 dependencies analyzed; Netty remediated from vulnerable 4.2.17 to patched 4.2.18; final HTML/JSON reports contain 0 unsuppressed vulnerabilities. One exact-version Spring Tools/Spring Boot DevTools false positive is documented and suppressed; Sonatype OSS Index was unavailable without credentials |
| User frontend clean install | `npm ci --no-audit` | **PASS:** 385 packages installed from lockfile |
| User frontend quality | lint, Vitest, Knip, depcheck, build | **PASS:** 33 test files / 124 tests; 2,664 modules built; no unused dependency/file findings |
| User frontend bundle | Vite production build | **PASS with size warning:** JS 1,509.16 kB (412.56 kB gzip); CSS 569.37 kB (102.37 kB gzip) |
| Admin frontend clean install | `npm ci --no-audit` | **PASS:** 331 packages installed from lockfile |
| Admin frontend quality | lint, Vitest, Knip, depcheck, build | **PASS:** 3 test files / 10 tests; 1,917 modules built; no unused dependency/file findings |
| Admin frontend bundle | Vite production build | **PASS with size warning:** JS 515.36 kB (142.40 kB gzip); CSS 95.77 kB (13.81 kB gzip) |
| Node vulnerability audits | both `npm audit --audit-level=high` | **PASS:** 0 vulnerabilities in each lockfile |
| Browser E2E | Playwright Chromium desktop and Pixel 7 projects | **PASS:** 12 critical journeys and 44 route-smoke cases (56 total) with controlled API/provider responses |
| Telegram bot | Ruff, pytest, Bandit, compileall | **PASS:** 26 tests and all lint/static/compile gates |
| Python vulnerability audit | `pip-audit -r requirements.txt` | **PASS:** no known vulnerabilities in declared runtime requirements |
| Secret scan, tracked tree | checksum-verified Gitleaks 8.30.1 over `git archive HEAD` | **PASS:** 0 findings |
| Secret scan, full history | Gitleaks 8.30.1 `git --log-opts=--all --redact` | **FAIL / INCIDENT:** 32 findings across 15 file/rule groups; output retained locally only in redacted form |
| Compose topology | required-secret interpolation plus `docker compose config --quiet` | **PASS locally** |
| Container images | Dockerfiles/base-image manifest checks | Definitions/tags validated; **actual image builds not run locally** because Docker Desktop was stopped. CI discovers and builds every tracked Dockerfile |
| Configuration/script syntax | PyYAML, PowerShell parser, Node `--check` | **PASS:** workflow YAML, all tracked PowerShell scripts, and 3 Node scripts parse; Bash parsing is delegated to CI because Windows WSL has no `/bin/bash` distribution |

The user test suite emits expected Happy DOM network/iframe diagnostics for deliberately unavailable local/external URLs; the assertions pass. Mockito also warns about future JDK restrictions on dynamic agent attachment. Neither warning was hidden.

## Critical-flow evidence

| Flow | Repository-controlled evidence | Not claimed |
| --- | --- | --- |
| Authentication/authorization | Auth, JWT, cookie/CSRF, CORS, ownership, internal-secret, admin, and hostile-origin tests; frontend route guards | Live Google/Telegram provider sessions |
| Invitations/templates/media | Service validation and ownership tests, OpenAPI contract, frontend feature tests/build, controlled public route | Live create/edit/publish/upload against staging or Cloudinary |
| Guests/RSVP/check-in/seating | Invitation-scoped tests, uniqueness migration, rate limiter, pessimistic locks, idempotency checks | Venue scanner load, approved staff/revoke policy |
| Payment/purchase/subscription | Locked/idempotent state transitions, provider signature/check tests, admin/internal boundary tests, frontend payment routes | Real ABA charge/refund/callback, live Telegram delivery |
| Admin/audit/reporting | Backend role enforcement and audit tests; admin unit/build/browser route coverage | Live moderation/reconciliation with representative production data |
| Database | 17 append-only migrations tracked; Hibernate validation and opt-in fresh-MySQL test are implemented | Current-branch empty/upgrade MySQL execution outside CI; production clone/restore |
| Deployment | Non-root multi-stage images, Compose networks/volumes/health checks, unprivileged Nginx routing, environment documentation | Local Docker image build, public DNS/TLS, provider deployment, backup restore |

## Required external gates

- Complete CRITICAL-S01 credential revocation and history remediation with private owner evidence.
- Retain a successful OWASP Java dependency report from CI for the exact release commit; local worktree evidence is documented in `backend-owasp-verification.md`.
- Pass the CI fresh-MySQL and Docker image jobs for the exact release commit.
- Execute applicable manual/provider items in `docs/testing/SMOKE_TEST.md`.
- Approve or replace retained assets and approve the organization/scanner permission designs before enabling those capabilities.

Passing repository tests is necessary but does not make these external items green.
