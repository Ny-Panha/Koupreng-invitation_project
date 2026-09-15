# Architecture V2 API Contract

Status: migration baseline
Last reviewed: 2026-09-15

## Authority and compatibility

Runtime springdoc output from the backend is the machine-readable source of truth. `packages/api-contracts/openapi.yaml` is its checked-in review artifact. `OpenApiIntegrationTests` regenerates the runtime YAML in memory and fails backend verification when the reviewed snapshot drifts. The opt-in update command is documented beside the artifact.

Payment confirmation and fulfillment semantics are documented in `docs/api/payments.md`.

The canonical prefix for versioned business endpoints is `/api/v1`. Authentication is available canonically at `/api/v1/auth/**`, and current-user operations at `/api/v1/users/me/**`; existing `/api/auth/**` and `/api/users/me/**` routes remain compatibility aliases. `/api/admin` is still a compatibility contract, not an example for new modules. Compatibility routes remain until every user, admin, bot, and external caller has migrated and tests or telemetry provide removal evidence. The current-user contract is documented in `docs/api/users.md`.

A package move must not also change an endpoint's method, path, authentication rule, status code, JSON field, or nullability. Contract changes require a separately reviewed compatibility plan.

## Response conventions

Successful endpoints may retain the existing typed DTO or `ApiResponse<T>` shape. Controllers never serialize JPA entities. Dates use ISO-8601 representations, money remains decimal plus an explicit currency, and identifiers retain their current public type during migration.

Errors use the shared API error shape:

```json
{
  "timestamp": "2026-09-15T01:00:00Z",
  "status": 409,
  "error": "Conflict",
  "code": "RESOURCE_CONFLICT",
  "message": "The requested state conflicts with the current resource",
  "path": "/api/v1/resource",
  "fieldErrors": {}
}
```

Validation errors temporarily include both `fieldErrors` and the legacy `fields` alias. Clients must branch on the HTTP status and stable `code`, not localized `message` text. Unexpected exceptions are logged server-side and return a sanitized `INTERNAL_ERROR` response.

## Security and ownership

- Authentication and role checks are enforced by Spring Security and service policies, never only by a frontend guard.
- An invitation child operation scopes the lookup by its owning invitation as well as the child identifier or opaque token.
- Public RSVP and invitation endpoints expose only their intended public DTOs and remain rate-limited.
- Internal Telegram/payment endpoints are excluded from public OpenAPI and require their server-to-server secret.
- Cookie authentication activates the configured CSRF repository; bearer-header mode remains stateless with CSRF disabled. Both modes require contract-level security tests before production sign-off.

## Evolution checklist

For every endpoint migration:

1. inventory all callers and existing tests;
2. capture the current method, route, security rule, status codes, request, and response;
3. move or replace implementation behind that contract;
4. add positive, validation, authentication, authorization, ownership, and idempotency tests as applicable;
5. regenerate and diff OpenAPI;
6. migrate consumers only after the backend contract is stable;
7. deprecate aliases before deletion and record deletion evidence.
