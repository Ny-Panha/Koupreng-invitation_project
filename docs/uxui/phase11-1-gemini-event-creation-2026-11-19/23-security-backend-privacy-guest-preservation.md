# 23 — Security, Backend Contracts, Privacy, and Preservation

**Phase:** `11.1`  
**Audit Scope:** Auth, Entitlements, Database, Privacy

---

## 1. Security & Authorization

- **JWT Route Guarding:** `RequireAuth` encapsulates `/app/events/new`. Unauthenticated requests redirect to `/login` while preserving `redirectUrl` state.
- **Client Request Idempotency:** The wizard issues a unique `X-Client-Request-Id` UUID header with `POST /api/events` to ensure backend deduplication on network retries.
- **Visibility Enforced:** Newly created events strictly enforce `visibility: "PRIVATE"` in the payload; events are never made public by default.

---

## 2. Database & Flyway Preservation

- All 48 Flyway migrations in `backend/src/main/resources/db/migration/` remain 100% untouched.
- No JPA entity mappings or database schemas were altered.
- All backend REST controllers and contracts remain read-only.
