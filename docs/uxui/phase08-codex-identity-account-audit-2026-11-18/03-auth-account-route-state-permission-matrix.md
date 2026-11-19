# Routes, aliases, states and authority

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

[route-state-matrix.json](evidence/route-state-matrix.json) has 13 distinct surfaces and 234 explicit state cells. TESTED refers to its named unit/fixture/browser layer; SOURCE-MAPPED is not a completed journey. No all-route-state percentage is claimed. Source inventory remains 135 routes / 62 groups / 63 app-group pairs.


| Surface | Guard / role | Authority | Evidence |
| --- | --- | --- | --- |
| /login | public | auth/login | apps/frontend-user/src/features/auth/LoginFeature.jsx |
| /register | public | auth/register | apps/frontend-user/src/features/auth/RegisterFeature.jsx |
| /forgot-password | public | auth/forgot-password | apps/frontend-user/src/features/auth/ForgotPasswordFeature.jsx |
| /reset-password | public token possession for mutation | auth/reset-password | apps/frontend-user/src/features/auth/ResetPasswordFeature.jsx |
| /app/profile | RequireAuth; server current-user authority | users/me; users/me/profile-image; users/me/change-password | apps/frontend-user/src/features/auth/ProfileFeature.jsx |
| /app/change-password | RequireAuth; server current-user/current-password | auth/change-password | apps/frontend-user/src/features/auth/ChangePasswordFeature.jsx |
| /dashboard/profile | guarded alias | /app/profile | apps/frontend-user/src/app/routes/hostRoutes.jsx |
| /dashboard/change-password | guarded alias | /app/change-password | apps/frontend-user/src/app/routes/hostRoutes.jsx |
| /profile | guarded alias | /app/profile | apps/frontend-user/src/app/routes/hostRoutes.jsx |
| session guard | authenticated only | auth/me; auth/logout | apps/frontend-user/src/app/guards/RequireAuth.jsx |
| Google entry/link | server verifies ID token; authenticated linking | auth/google; auth/link/google | apps/frontend-user/src/features/auth/components/SocialAuthButtons.jsx |
| Telegram entry/link | server verifies OIDC/HMAC; authenticated linking | auth/telegram; auth/link/telegram | apps/frontend-user/src/features/auth/components/SocialAuthButtons.jsx |
| admin /login + RequireAdmin | independent admin storage; exact ADMIN role | admin auth/session | apps/frontend-admin/src/app/guards/RequireAdmin.jsx |


[apps/frontend-user/src/layouts/AuthShell.jsx:1](../../../apps/frontend-user/src/layouts/AuthShell.jsx#L1) permits authenticated visits. [apps/frontend-user/src/app/routes/hostRoutes.jsx:21](../../../apps/frontend-user/src/app/routes/hostRoutes.jsx#L21) guards account aliases and preserves search/hash. There is no email-verification route or new provider invented by this phase.
