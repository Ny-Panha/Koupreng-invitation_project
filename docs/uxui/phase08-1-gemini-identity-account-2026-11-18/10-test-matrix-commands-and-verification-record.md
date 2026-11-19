# 10 — Test Matrix Commands & Verification Record

## Comprehensive Test Execution Log

The following exact commands were executed on the local development workstation to verify Phase 08.1:

### 1. Token Sync & Linting
- **Command:** `node scripts/sync-design-tokens.cjs --check`
  - **Result:** Code 0, 0 token errors detected.
- **Command:** `npm --prefix apps/frontend-user run lint`
  - **Result:** Code 0, 0 lint errors or warnings.
- **Command:** `npm --prefix apps/frontend-admin run lint`
  - **Result:** Code 0, 0 lint errors or warnings.

### 2. Frontend User Unit Test Suite
- **Command:** `npm --prefix apps/frontend-user test -- src/features/auth/ --run`
  - **Result:** 9 test files passed, 63 tests passed (100% green in 1.62s).
- **Command:** `npm --prefix apps/frontend-user test -- --run`
  - **Result:** 224 test files passed, 1,525 tests passed (100% green in 42.37s).

### 3. Frontend Admin Unit Test Suite
- **Command:** `npm --prefix apps/frontend-admin test -- --run`
  - **Result:** 37 test files passed, 202 tests passed (100% green in 6.41s).

### 4. Phase 08.1 Dedicated Playwright E2E Suite
- **Command:** `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line`
  - **Result:** 18 tests passed across `desktop-chromium` and `mobile-chromium` (100% green).
  - Tests include:
    1. Login page rendering, show/hide password toggle, and redirect parameter preservation.
    2. Registration form with real-time 5-criterion rule checklist and password match indicator.
    3. Forgot password submission, phone registration hint card, and dev token link.
    4. Reset password flow with prefilled token, password toggles, and success card.
    5. Axe WCAG 2.2 AA automated audits on `/login`, `/register`, and `/forgot-password` (0 violations).
    6. Profile page and password accordion eye toggles.
    7. Change password page with 3 password eye toggles.
    8. Unauthenticated session guard retry card in `RequireAuth`.
    9. Bilingual Khmer rendering across all identity forms.

### 5. Regression Playwright Suites
- **Command:** `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase7-auth-accessibility.spec.js tests/e2e/batch11-auth-boundaries.spec.js --workers=2 --reporter=line`
  - **Result:** 20 tests passed (100% green).
- **Command:** `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2 --reporter=line`
  - **Result:** 26 passed, 6 failed (reproduced historical baseline with 100% fidelity; zero test weakening).
- **Command:** `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --workers=2 --reporter=line`
  - **Result:** 66 passed, 2 failed on known external popup URL timing under 2-worker concurrency.

### 6. Production Builds
- **Command:** `npm --prefix apps/frontend-user run build`
  - **Result:** Code 0, production bundle built cleanly in 2.84s.
- **Command:** `npm --prefix apps/frontend-admin run build`
  - **Result:** Code 0, production bundle built cleanly in 1.48s.
