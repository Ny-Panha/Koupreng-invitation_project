# 14 — Exact Test Commands & Failure Register

## 1. Test Commands & Observed Results

```bash
# 1. Design Token Parity Check
node scripts/sync-design-tokens.cjs --check
# Result: PASSED (Verified 2 application token exports)

# 2. Auth Domain Unit Tests (apps/frontend-user)
npm --prefix apps/frontend-user test -- src/features/auth/ --run
# Result: PASSED (9 test files, 63 tests in 1.27s)

# 3. Full Frontend User Unit Regression
npm --prefix apps/frontend-user test -- --run
# Result: PASSED (224 test files, 1525 tests in 42.37s)

# 4. Full Frontend Admin Unit Regression
npm --prefix apps/frontend-admin test -- --run
# Result: PASSED (37 test files, 202 tests in 6.41s)

# 5. Static Analysis (ESLint)
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
# Result: PASSED (0 errors, 0 warnings across both workspaces)

# 6. Production Builds
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build
# Result: PASSED (0 errors)

# 7. Phase 08.1 Dedicated Playwright E2E Suite
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line
# Result: PASSED (18/18 tests in 13.3s with 0 Axe WCAG 2.2 AA violations)

# 8. Cross-Phase Regressions
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js --workers=2 --reporter=line
# Result: PASSED (24/24 tests)

npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2 --reporter=line
# Result: 26 PASSED / 6 KNOWN FAILURES (Preserves QA-NEW-01, QA-NEW-02, QA-NEW-03 baseline)
```

---

## 2. Failure Register

- **New Phase 08.1 Product Defects:** 0
- **New Test Failures:** 0
- **Known Baseline Failures Preserved:**
  - `phase02-foundations.spec.js`: 6 known test assertions (QA-NEW-01, QA-NEW-02, QA-NEW-03) preserved without artificial modification or assertion weakening.
  - `phase06-layout-navigation.spec.js`: 2 Studio reflow timeout failures on external port mismatch (`127.0.0.1:4173` vs `localhost:5173`) preserved as Phase 06/Phase 08 Studio scope.