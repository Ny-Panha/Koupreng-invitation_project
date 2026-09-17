# Architecture V2 Smoke Test

Last reviewed: 2026-09-15.

Use this checklist for a release candidate deployed to an isolated local or staging environment. It deliberately separates repository-controlled checks from provider and operator checks. Never use production credentials, real guest data, or a live charge while following it.

## 1. Preconditions

- JDK 25, Node.js 22, Python 3.13, MySQL 8, and Docker Compose are available as required by the chosen run mode.
- A clean `.env` was created from `.env.example`; every `replace-*` value was replaced outside Git.
- `JWT_SECRET`, database passwords, `ADMIN_PAYMENT_SECRET`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_WEBHOOK_SECRET` are unique for this environment.
- For provider checks, use dedicated Google, Telegram, ABA PayWay, SMTP, and Cloudinary test/sandbox accounts.
- The exposed historical Telegram credential has been revoked and the incident checklist in `docs/security/credential-incident-response.md` has external owner evidence.

Record the commit SHA, tester, environment, start/end time, and evidence link before testing.

## 2. Automated release gates

Run from a clean checkout:

```powershell
Set-Location apps/backend
.\mvnw.cmd clean verify

Set-Location ../frontend-user
npm ci
npm run lint
npm test
npm run analyze:knip
npm run analyze:deps
npm run build

Set-Location ../frontend-admin
npm ci
npm run lint
npm test
npm run analyze:knip
npm run analyze:deps
npm run build

Set-Location ../telegram-bot
python -m pip install -r requirements-dev.txt
python -m ruff check .
python -m pytest -q
python -m bandit -q -r main.py start.py
python -m compileall -q main.py start.py tests
python -m pip_audit -r requirements.txt
```

Also require successful CI results for the fresh MySQL migration, browser matrix, Gitleaks current-tree scan, dependency audits, workflow/configuration validation, and all Dockerfile builds. A local skip is not a substitute for the CI MySQL job.

## 3. Start and infrastructure

For the complete container topology:

```powershell
docker compose config --quiet
docker compose build --pull
docker compose up -d
docker compose ps
```

Expected:

- MySQL and Redis are healthy and are not published to the host.
- Backend readiness becomes healthy before the web and bot services are considered ready.
- `GET /actuator/health/liveness` and `GET /actuator/health/readiness` return healthy states through the intended internal or protected operator path.
- The default gateway serves the user app at `http://localhost:8080` and admin at `http://admin.localhost:8080`.
- `/api/**`, `/uploads/**`, and `/telegram/webhook` reach their intended upstream; an SPA route refresh does not return an Nginx 404.
- Restarting containers preserves MySQL data and local-upload data through named volumes.

Capture `docker compose ps` and sanitized health output. Do not attach environment values or authorization headers.

## 4. Identity and access

Use a new test identity.

- Register with valid input; verify the response envelope, authenticated navigation, and server-created user.
- Try duplicate email/phone and invalid password/input; verify a safe validation/conflict response with no stack trace or SQL.
- Log out; verify the old token/session no longer reaches an authenticated route.
- Log in again; open the user dashboard and profile; update a non-sensitive profile field.
- Verify a normal user receives `403` from an admin endpoint and cannot open the admin dashboard.
- Verify an unauthenticated visitor is redirected from protected user and admin routes.
- If cookie authentication is enabled, verify an unsafe request without the CSRF header is rejected, a valid cookie/header pair succeeds, and a hostile origin is rejected.
- Run Google and Telegram login only against configured test applications; record provider result without tokens.

## 5. Core invitation journey

- Load the template catalog and preview the retained Khmer wedding template on mobile and desktop.
- Create a draft invitation from the user application.
- Edit event information and customization, upload permitted test media, save, refresh, and confirm persistence.
- Confirm invalid type/extension/oversized media is rejected and cannot be fetched through an unauthorized invitation.
- Publish the invitation; copy its public URL and open it in a private browser session.
- Verify the public page shows public-safe data only, handles Khmer text and long content without overflow, and does not expose owner-only fields.
- Unpublish it and verify public access is denied; republish before the remaining checks.

## 6. Guest, RSVP, delivery, and planning

- Create a guest, then verify duplicate contact rules and cross-invitation access denial.
- Import a small valid guest file/list and reject malformed or over-limit input.
- Open a personalized invitation using the generated guest token and submit an RSVP.
- Submit the same guest response again; verify update/idempotent behavior rather than a duplicate guest/RSVP.
- Verify public RSVP throttling returns `429` after the configured test limit without placing guest tokens in logs or limiter keys.
- Prepare a delivery batch and verify share text/link generation. Test email only when sandbox SMTP is configured.
- Create a table, assign a guest within capacity, reject over-capacity assignment, and repeat the assignment to verify invariant protection.
- Check in a guest by QR and manually; a duplicate scan must return a deterministic already-checked-in result rather than another row.
- Create/update/export budget data and record/update/delete a wedding gift; verify all records remain scoped to the invitation owner.

## 7. Payment and entitlement

Use the configured static test amount or ABA sandbox only.

- Create a template payment order and verify order code, amount, currency, expiry, and pending state are server-owned.
- Send a Telegram detection event with the wrong internal secret; expect rejection before business logic.
- Send a valid test detection; with the production-safe default it must enter `PAID_PENDING_REVIEW`, not unlock immediately.
- Confirm the order through the authorized admin/internal path and verify exactly one paid transition and one template entitlement.
- Replay the same detection/confirmation and verify no duplicate entitlement or payment is created.
- For dynamic PayWay sandbox, verify callback signatures and the server-to-server check-transaction result. Test wrong amount/currency, rejected provider state, duplicate callback, and provider timeout.
- Verify paid subscription confirmation activates the selected package exactly once with its server-owned duration/limits.
- Verify the user payment history and receipt endpoints expose only the current user's records; admin history is admin-only.

Never infer payment success from a browser redirect or frontend payload.

## 8. Admin and audit

- Log in as an administrator through the admin application and load dashboard, users, templates, invitations, payments, packages, notifications, audit/system logs, and monitoring routes.
- Activate/deactivate a test user, change a non-owner role, moderate a test invitation, and perform a test payment confirmation.
- Verify each privileged operation is enforced by the backend and produces a sanitized audit event with actor, action, target, and timestamp.
- Verify an organization owner cannot be removed or assigned through member APIs.
- Do not enable team-role marketing/operations until the product owner approves the downstream permission matrix for `MANAGER`, `DESIGNER`, `CHECK_IN_STAFF`, `VIEWER`, and `MEMBER`.

## 9. Failure and recovery checks

- Stop Redis: with production fail-closed rate-limit settings, verify sensitive rate-limited operations fail safely; restore Redis and verify recovery.
- Make a test provider endpoint unavailable: verify bounded failure and no database lock/thread remains waiting indefinitely.
- Restart backend during normal traffic; verify readiness transitions and no partial paid/entitlement state.
- Run the documented MySQL backup and restore procedure against disposable data, then verify Flyway validation and representative records.
- Verify logs contain request IDs and operational state but no passwords, JWTs, CSRF values, reset tokens, provider secrets, full payment payloads, or raw personal data.

## 10. Release sign-off

The candidate passes only when:

- every automated gate is green on the exact commit;
- every applicable manual item above has attached sanitized evidence;
- no `BLOCKER`, `CRITICAL`, or unaccepted `HIGH` item remains in `docs/qa/known-limitations.md`;
- current-tree Gitleaks reports zero findings and historical credential remediation has separate external proof;
- asset redistribution rights, provider journeys, DNS/TLS/proxy behavior, monitoring, backup, and restore have named owner approval;
- rollback steps in `docs/rollback_plan.md` were reviewed for the target deployment.

Record failed steps with severity, reproduction, expected/actual behavior, owner, and retest evidence. Do not convert an environment-gated or provider-unverified item to PASS.
