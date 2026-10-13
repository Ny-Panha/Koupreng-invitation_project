# API Contracts & OpenAPI Standards

## 1. OpenAPI Specification

OpenAPI documentation is generated automatically by Springdoc Starter WebMVC:
- Swagger UI path: `/swagger-ui.html`
- Scalar UI path: `/scalar`
- OpenAPI JSON specification: `/v3/api-docs`

Controlled via application properties:
```properties
springdoc.api-docs.enabled=${OPENAPI_ENABLED:false}
springdoc.swagger-ui.enabled=${SWAGGER_UI_ENABLED:false}
```

## 2. API Versioning & URL Conventions

- All REST endpoints are versioned under `/api/v1/`.
- Resource nouns in plural form: `/api/v1/invitations`, `/api/v1/guests`, `/api/v1/events`.
- Sub-resources represent relationships: `/api/v1/events/{eventId}/guests`.
- Actions that do not map to pure CRUD use explicit verbs:
  - `/api/v1/invitations/{id}/publish`
  - `/api/v1/payments/orders/{orderCode}/claim`
  - `/api/v1/checkin/guests/{guestId}/verify`

## 3. Backward Compatibility Rules

1. Never delete or rename existing fields in response DTOs.
2. New request fields must be optional with sensible defaults.
3. If an endpoint contract must break, increment the URL version to `/api/v2/`.

