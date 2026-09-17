# Folder Structure and Ownership

This is the verified Architecture V2 repository structure as of 2026-09-15.

| Path | Ownership and rule | Status |
| --- | --- | --- |
| `apps/frontend-user` | Public marketing, authentication, host dashboard, builder, template preview/checkout, and public invitation routes. `src/app/router.jsx` is the only route authority. | KEEP |
| `apps/frontend-admin` | Admin login, guarded admin routes, moderation, reporting, and management UI. `src/app/App.jsx` is the route authority. | KEEP |
| `apps/backend` | Spring Boot API, security, persistence, integrations, Flyway migrations, and backend tests. | KEEP |
| `apps/telegram-bot` | FastAPI Telegram webhook/polling integration and isolated Python tests. | KEEP |
| `packages/api-contracts` | OpenAPI contract and Postman usage notes. It is the only shared package currently present. | KEEP |
| `docs/api` | Endpoint reference by domain. | KEEP |
| `docs/architecture` | Stable system and repository architecture. | KEEP |
| `docs/frontend` | Frontend-specific architecture and authoring guidance, outside production source trees. | KEEP |
| `docs/qa` | Reproducible cleanup, asset, dependency, verification, and limitation evidence. | KEEP |
| `docs/security` | Credential incident response and operational security checklists. | KEEP |
| `infra` | Docker/Nginx gateway configuration, MySQL/PostgreSQL backup references, least-privilege SQL, Prometheus, firewall, and tunnel setup. Provider-specific review remains required. | KEEP / CONFIGURE PER ENVIRONMENT |
| `scripts/ci` | Non-interactive CI smoke checks only. | KEEP |
| `scripts/dev` | Local setup and development launchers only. | KEEP |
| `scripts/maintenance` | Explicit Git pull/push/sync helpers; never invoked by CI. | KEEP |
| `tools` | Postman collection and sample data used for manual/API validation. | KEEP |
| `docs/lesson-react-dom` | Standalone educational material, not production source or current architecture. | NEEDS HUMAN REVIEW |

## Frontend-user boundaries

- `src/app/router.jsx` owns all public, authenticated, template, and fallback routes.
- `src/pages` contains route-level composition; `src/features` contains domain behavior.
- `src/shared` is limited to behavior genuinely reused across features.
- Bundled imports belong under `src/assets`; public files referenced by URL belong under `public`.
- Dynamic `/facebook/all/<folder>/...` and Canva section paths must be included in asset analysis before deletion.

## Frontend-admin boundaries

- `src/app/App.jsx` owns route composition and `RequireAdmin` enforcement.
- Domain UI remains under `src/features`; route wrappers remain under `src/pages`.
- HTTP access is centralized in `src/shared/api/adminHttpClient.js`.
- `src/pages/EventsPage.jsx` remains intentionally routed and is not an abandoned duplicate.

## Backend boundaries

The backend is a business-domain modular monolith. Modules such as `auth`, `user`, `template`, `invitation`, `media`, `guest`, `rsvp`, `payment`, and `admin` own their HTTP, application, domain, and infrastructure code as needed; simple modules may omit unnecessary layers. `shared` is restricted to cross-cutting configuration/security/errors/i18n/persistence concerns, while `integration` contains optional provider boundaries. Executable ArchUnit rules reject controllers that reach repositories/domain entities and prevent inward domain packages from depending on outward layers. Flyway migrations are append-only once shared; repairs require a new migration.

## Generated and local-only paths

`.env`, `node_modules`, `dist`, `.vite`, `target`, Python virtual environments/caches, coverage output, local database files, runtime logs, and Playwright output are ignored. They are not source-of-truth artifacts and must not be committed.
