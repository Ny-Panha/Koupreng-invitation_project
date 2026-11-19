# 16 — Security, API & Business Preservation Matrix

## 1. Security Invariants Strictly Maintained

| Security Dimension | Contract Requirement | Preservation in Phase 08.1 |
|---|---|---|
| **Authentication Authority** | Server alone validates credentials and creates sessions; zero client-side auth bypasses. | All auth operations call existing `/auth/*` API endpoints. Zero mock overrides in production code. |
| **Credential & Token Privacy** | Passwords, tokens, and credentials must never appear in URLs, analytics, or DOM leaks. | Show/hide password toggles never log or expose credentials; token URL cleanup supported. |
| **Redirect Safety (`safeRedirect`)** | Protect against Open Redirect attacks via `redirectTo` query parameter. | Preserved `safeRedirect.js` validation: relative same-origin paths permitted; external protocol/javascript: rejected. |
| **Account Enumeration Defense** | Password recovery must not confirm or deny whether an email is registered. | `ForgotPasswordFeature.jsx` returns neutral privacy-safe success messaging regardless of user existence. |
| **Role & Workspace Boundaries** | Customer login must never grant access to Admin workspace. | Admin workspace remains completely isolated in `apps/frontend-admin` with separate auth guards and routes. |
| **Renderer Quarantine** | 10 bespoke wedding invitation renderer packages must never receive auth styling leaks. | `packages/templates/` has 0 git modifications. Renderers remain completely isolated. |
| **Backend & Flyway Integrity** | 48 historical database migrations and backend Spring Boot contracts must remain untouched. | 0 backend files modified. 0 Flyway migrations altered. |