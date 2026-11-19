# 18 — Attributed File Changes and Selective Rollback

## 1. File Attribution Ledger

All Phase 08.1 changes were strictly scoped to the identity and account domain within `apps/frontend-user`. Preexisting Phase 07 and Phase 06 changes remain untouched in the working tree.

| File Path | Attribution Class | Original Status | Phase 08.1 Modifications |
|---|---|---|---|
| `apps/frontend-user/src/features/auth/AuthPage.css` | `PHASE08.1_EDIT` | Tracked | Integrated `--ui-theme-*` tokens, dark mode rules, recovery guidance card styles, reduced motion support. |
| `apps/frontend-user/src/features/auth/LoginFeature.jsx` | `PHASE08.1_EDIT` | Tracked | Added accessible eye toggle (caret retention), aria-describedby error alert, return target preservation. |
| `apps/frontend-user/src/features/auth/RegisterFeature.jsx` | `PHASE08.1_EDIT` | Tracked | Preserved phone registration DTO, dual eye toggles, 5-criterion rule checklist, confirm match indicator. |
| `apps/frontend-user/src/features/auth/ForgotPasswordFeature.jsx` | `PHASE08.1_EDIT` | Tracked | Removed inline hex colors, added `.auth-recovery-hint` card for phone users, privacy-neutral success card. |
| `apps/frontend-user/src/features/auth/ResetPasswordFeature.jsx` | `PHASE08.1_EDIT` | Tracked | Added query param `?token=...` prefill, dual eye toggles, client mismatch check, completion link. |
| `apps/frontend-user/src/features/auth/ProfileFeature.jsx` | `PHASE08.1_EDIT` | Tracked | Extracted inline `<style>` to `ProfileFeature.css`, added eye toggles to password accordion, section landmarks. |
| `apps/frontend-user/src/features/auth/ProfileFeature.css` | `PHASE08.1_NEW` | Untracked | Scoped stylesheet for profile page and avatar management with light/dark theme parity. |
| `apps/frontend-user/src/features/auth/ChangePasswordFeature.jsx` | `PHASE08.1_EDIT` | Tracked | Extracted inline `<style>` to `ChangePasswordFeature.css`, eye toggles on all 3 fields, 5-criterion checklist. |
| `apps/frontend-user/src/features/auth/ChangePasswordFeature.css` | `PHASE08.1_NEW` | Untracked | Scoped stylesheet for standalone change-password route with light/dark theme parity. |
| `apps/frontend-user/src/app/guards/RequireAuth.jsx` | `PHASE08.1_EDIT` | Tracked | Upgraded raw `authStatus === "error"` state to accessible Silk & Ink card with retry button. |
| `apps/frontend-user/src/features/auth/LoginFeature.test.jsx` | `PHASE08.1_NEW` | Untracked | Unit tests for login validation, password show/hide, aria attributes, return URL. |
| `apps/frontend-user/src/features/auth/ForgotPasswordFeature.test.jsx` | `PHASE08.1_NEW` | Untracked | Unit tests for recovery request, phone hint, privacy-neutral confirmation. |
| `apps/frontend-user/src/features/auth/ResetPasswordFeature.test.jsx` | `PHASE08.1_NEW` | Untracked | Unit tests for token prefill, validation, mismatch handling, completion state. |
| `apps/frontend-user/src/features/auth/ProfileFeature.test.jsx` | `PHASE08.1_NEW` | Untracked | Unit tests for profile form, password accordion toggles, section landmark. |
| `apps/frontend-user/tests/e2e/phase08-identity-account.spec.js` | `PHASE08.1_NEW` | Untracked | Playwright E2E suite covering all 7 identity surfaces and Axe WCAG 2.2 AA audits. |

---

## 2. Selective Rollback Procedure

To revert **only** Phase 08.1 modifications while completely preserving uncommitted Phase 07 marketing repairs:

```bash
# 1. Revert tracked files modified during Phase 08.1
git checkout -- apps/frontend-user/src/features/auth/AuthPage.css \
               apps/frontend-user/src/features/auth/LoginFeature.jsx \
               apps/frontend-user/src/features/auth/RegisterFeature.jsx \
               apps/frontend-user/src/features/auth/ForgotPasswordFeature.jsx \
               apps/frontend-user/src/features/auth/ResetPasswordFeature.jsx \
               apps/frontend-user/src/features/auth/ProfileFeature.jsx \
               apps/frontend-user/src/features/auth/ChangePasswordFeature.jsx \
               apps/frontend-user/src/app/guards/RequireAuth.jsx

# 2. Remove untracked files created during Phase 08.1
rm apps/frontend-user/src/features/auth/ProfileFeature.css
rm apps/frontend-user/src/features/auth/ChangePasswordFeature.css
rm apps/frontend-user/src/features/auth/LoginFeature.test.jsx
rm apps/frontend-user/src/features/auth/ForgotPasswordFeature.test.jsx
rm apps/frontend-user/src/features/auth/ResetPasswordFeature.test.jsx
rm apps/frontend-user/src/features/auth/ProfileFeature.test.jsx
rm apps/frontend-user/tests/e2e/phase08-identity-account.spec.js
rm -rf docs/uxui/phase08-1-gemini-identity-account-2026-11-18/

# 3. DO NOT run git checkout -- . or git clean -fd, as that would destroy Phase 07 work.
```