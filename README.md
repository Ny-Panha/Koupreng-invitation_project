# Koupreng

Koupreng is a Khmer invitation platform composed of a public/host React application, a separate React admin application, a Spring Boot API, and a Python Telegram payment-detection service.

## Repository layout

```text
apps/
├── backend/           Spring Boot API, Flyway migrations, and tests
├── frontend-admin/    administrator React/Vite application
├── frontend-user/     public invitation and host React/Vite application
└── telegram-bot/      FastAPI/Telegram integration and tests
packages/
└── api-contracts/     OpenAPI and Postman contracts
docs/                  architecture, API, operations, and QA evidence
infra/                 proxy, monitoring, database, backup, and firewall assets
scripts/
├── ci/                CI-only smoke automation
├── dev/               local setup and stack launchers
└── maintenance/       explicit Git maintenance helpers
tools/                 Postman collection and sample seed data
```

The detailed ownership rules are in `docs/architecture/folder-structure.md`. Cleanup evidence is under `docs/qa/`.

## Prerequisites

- JDK 25
- Node.js 22 and npm
- Python 3.13
- MySQL 8

Copy `.env.example` to an untracked root `.env` and replace every placeholder. Never commit `.env`, tokens, private keys, database dumps, generated logs, build output, or dependency caches.

## Setup

Linux/macOS:

```bash
chmod +x scripts/dev/*.sh scripts/maintenance/*.sh
./scripts/dev/setup.sh
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev\setup.ps1
```

## Run locally

The repository-specific all-service launcher is:

```powershell
.\run-local-stack.ps1
```

Individual services:

```bash
cd apps/backend && ./mvnw spring-boot:run
cd apps/frontend-user && npm ci && npm run dev
cd apps/frontend-admin && npm ci && npm run dev
cd apps/telegram-bot && python -m pip install -r requirements.txt && python start.py
```

Default local URLs:

- API: `http://localhost:8080`
- User frontend: `http://localhost:5173`
- Admin frontend: `http://localhost:5174`
- Telegram service: `http://localhost:8000`

## API documentation

With the backend running in the default development configuration:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

To test an authenticated operation, call `POST /api/auth/login`, copy the returned
`accessToken`, click **Authorize** in Swagger UI, and paste the JWT only. Swagger UI
adds the `Bearer` prefix. Bearer authentication is the intended Swagger workflow;
the optional HttpOnly auth cookie and the application's existing CSRF behavior are
not changed for documentation. If CSRF is enabled in a deployment, cookie-authenticated
mutating requests must also satisfy that deployment's CSRF requirements.

`OPENAPI_ENABLED`, `SWAGGER_UI_ENABLED`, and `SWAGGER_UI_PERSIST_AUTHORIZATION`
control generation, the interactive UI, and local authorization persistence. The
first two default to `true` for development and explicitly default to `false` in the
`prod` profile. Sensitive `/api/v1/internal/**` service endpoints are not included in
the generated contract.

## Verification

```bash
cd apps/backend && ./mvnw clean verify
cd apps/frontend-user && npm run lint && npm test && npm run analyze:knip && npm run analyze:deps && npm run build
cd apps/frontend-admin && npm run lint && npm test && npm run analyze:knip && npm run analyze:deps && npm run build
cd apps/telegram-bot && python -m pytest -q && python -m ruff check .
```

Browser journeys run from `apps/frontend-user` with `npm run test:e2e`. The repository-wide CI workflow also runs secret scanning, dependency audits, fresh-MySQL Flyway migration, static analysis, build artifacts, and route smoke tests.

See `docs/qa/verification-results.md` for the last evidenced run and `docs/qa/known-limitations.md` before release. The repository is not represented as Railway-ready until a Railway project binding, service topology, and deployment logs are supplied and verified.

## Security

Read `SECURITY.md` before reporting a vulnerability. The credential incident discovered during the 2026-07-21 audit also requires external token rotation and a coordinated history rewrite; removing a value from the current tree does not revoke it or erase it from Git history.

## Invitation ownership rule

Invitation child data is scoped by `invitationId`. Guests, budget items, gifts, RSVPs, media, delivery events, seating, and invitation notifications must never be queried or deleted across invitations. The backend verifies the authenticated owner or `ADMIN` for `DELETE /api/v1/invitations/{invitationId}`.
