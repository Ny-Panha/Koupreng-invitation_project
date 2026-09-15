# Auth API

Verified controller: `com.koupreng.backend.auth.api.AuthController`.

Routes:
- `POST /api/auth/register` role: `PUBLIC`
- `POST /api/auth/login` role: `PUBLIC`
- `POST /api/auth/google` role: `PUBLIC`
- `POST /api/auth/telegram` role: `PUBLIC`
- `POST /api/auth/logout` role: `USER`
- `GET /api/auth/me` role: `USER`
- `PUT /api/auth/me` role: `USER`
- `POST /api/auth/change-password` role: `USER`
- `POST /api/auth/forgot-password` role: `PUBLIC`
- `POST /api/auth/reset-password` role: `PUBLIC`

Request and response bodies are defined under `apps/backend/src/main/java/com/koupreng/backend/auth/api/dto` and are verified in runtime OpenAPI integration tests. Existing aliases inside `LoginRequest`, `RegisterRequest`, and `ChangePasswordRequest` remain compatibility behavior.

Cookie mode conditionally enables Spring CSRF protection. Backend integration coverage verifies rejection without a token, acceptance with a valid token, hostile-origin rejection, and the deliberately ignored password-recovery route. Browser token acquisition and Axios/header wiring remain a release gate before cookie mode is enabled in production.
