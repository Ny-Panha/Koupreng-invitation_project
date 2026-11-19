# Sessions, guards and safe return

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

[apps/frontend-user/src/stores/useAuthStore.js:59](../../../apps/frontend-user/src/stores/useAuthStore.js#L59) retains generation protection, one in-flight cookie bootstrap, anonymous401/403 versus retryable5xx/offline error, validated response shape and bearer expiry. `useAuthStore.test.js` and `AuthProvider.test.jsx` exercise restoration, late bootstrap after logout, cross-tab logout and expired bearer. Cookie-mode browser build is not separately certified.

[apps/frontend-user/src/app/guards/RequireAuth.jsx:10](../../../apps/frontend-user/src/app/guards/RequireAuth.jsx#L10) shows checking skeleton before content, localized error retry and complete path/query/hash return. C08-007 rejects malformed or nested credential-bearing next targets without removing valid template intent. Dashboard aliases and `/profile` remain under the auth guard. Historical admin boundary tests cover USER/STAFF/unsupported roles, expired token and customer storage isolation; UI guards never grant backend admin authority.
