# 15 — Confirmed Defects, Repairs & Reproduction

## 1. Repaired Defects in Phase 08.1

| Defect ID | Description | Before Phase 08.1 | Repair in Phase 08.1 | Verification |
|---|---|---|---|---|
| **DEF-08-01** | Missing password reveal toggle | Users could not inspect typed passwords, leading to typos on mobile. | Implemented accessible eye toggle button with `onMouseDown={(e) => e.preventDefault()}` to preserve input focus & caret. | `LoginFeature.test.jsx`, `phase08-identity-account.spec.js` |
| **DEF-08-02** | Inline `<style>` injection in profile | `ProfileFeature.jsx` injected 120+ lines of raw CSS via `<style>` tag on every render. | Extracted into dedicated scoped stylesheet `ProfileFeature.css` mapped to `--ui-theme-*` tokens. | Code audit, `npm run build` |
| **DEF-08-03** | Inline `<style>` injection in change password | `ChangePasswordFeature.jsx` injected inline `<style>` tags. | Extracted into dedicated scoped stylesheet `ChangePasswordFeature.css`. | Code audit, `npm run build` |
| **DEF-08-04** | Phone vs. Email recovery contract discrepancy | Registration requires a phone number, but forgot-password accepts email with zero explanation. | Added `.auth-recovery-hint` card explaining recovery procedure for phone accounts with direct support link. | `ForgotPasswordFeature.test.jsx`, `phase08-identity-account.spec.js` |
| **DEF-08-05** | Raw unstyled session error state | `RequireAuth.jsx` displayed raw unstyled text `"Error checking session"` upon auth failure. | Redesigned into accessible Silk & Ink card with `ShieldAlert`, retry action, and return to login link. | `batch11-auth-boundaries.spec.js` |
| **DEF-08-06** | Real-time password criteria feedback | Registration did not visually communicate which password criteria were met until submit error. | Implemented live 5-criterion rule checklist (8-100 chars, uppercase, lowercase, digit) and confirm match indicator. | `RegisterFeature.test.jsx`, `phase08-identity-account.spec.js` |

---

## 2. Reproduction Runbook

Each fix is directly verifiable through:
```bash
npm --prefix apps/frontend-user test -- src/features/auth/ --run
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line
```