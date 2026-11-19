# Phase 07.1 — Exact Test Commands and Failure Register

## 1. Complete Test Execution Log

All verification commands were executed in the repository root or target application directories.

### Unit & Integration Verification

```bash
# Command 1: Design Token Synchronization Check
node scripts/sync-design-tokens.cjs --check
# Result: PASSED (Verified 2 application token exports)

# Command 2: Route Inventory Parity (User App)
npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx
# Result: PASSED (1 file, 2 tests passed, 0 failed)

# Command 3: Route Inventory Parity (Admin App)
npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx
# Result: PASSED (1 file, 2 tests passed, 0 failed)

# Command 4: Marketing Feature Test Suite (including Phase07Marketing.test.jsx)
npm --prefix apps/frontend-user test -- src/features/marketing/
# Result: PASSED (7 test files, 41 tests passed, 0 failed)
# Test files verified:
# - Phase07Marketing.test.jsx (5 tests)
# - ContactFeature.test.jsx (5 tests)
# - HomeFeature.test.jsx (6 tests)
# - VenuesFeature.test.jsx (7 tests)
# - NotFoundFeature.test.jsx (4 tests)
# - MarketingShell.test.jsx (7 tests)
# - HeaderFooter.test.jsx (7 tests)

# Command 5: Frontend User ESLint
npm --prefix apps/frontend-user run lint
# Result: PASSED (0 errors, 0 warnings)

# Command 6: Frontend Admin ESLint
npm --prefix apps/frontend-admin run lint
# Result: PASSED (0 errors, 0 warnings)

# Command 7: Frontend User Production Build
npm --prefix apps/frontend-user run build
# Result: PASSED (built in 1.83s, 0 errors)

# Command 8: Frontend Admin Production Build
npm --prefix apps/frontend-admin run build
# Result: PASSED (built in 4.02s, 0 errors)
```

---

## 2. Playwright E2E Regression Checks

```bash
# Command 9: Phase 04 Reusable Component System E2E
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js --reporter=line --workers=2
# Result: PASSED (10 passed in 19.3s)

# Command 10: Phase 05 Motion & Interaction Platform E2E
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase05-motion.spec.js --reporter=line --workers=2
# Result: PASSED (14 passed in 23.3s)

# Command 11: Phase 06 Global Layout & Navigation E2E
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase06-layout-navigation.spec.js --reporter=line --workers=2
# Result: 36 passed, 8 failed in 49.3s
# Failure Analysis: The 8 failing tests belong strictly to Studio landscape orientation preview tests,
# which are an established carryover from Phase 06 baseline. All 36 marketing navigation, header skip links,
# mobile drawer, and dialog tests passed completely.

# Command 12: Phase 02 Foundations E2E
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --reporter=line --workers=2
# Result: 24 passed, 8 failed (Matches known Phase 06 baseline carryover)
```

---

## 3. Failure & Baseline Discrepancy Register

| Test / Scenario | Outcome | Root Cause | Impact on Phase 07.1 |
|---|---|---|---|
| Phase 06 Studio Landscape Preview (8 tests) | `FAILED` | Pre-existing baseline limitation in Studio canvas rotation mocks (`StudioPreview.jsx`). | **Zero impact on Phase 07.1**; marketing shell and public pages are unaffected. |
| Phase 02 Legacy Viewport Snapshots (8 tests) | `FAILED` | Known snapshot variance recorded in Phase 06 carryover ledger. | **Zero impact on Phase 07.1**; preserved as documented carryover. |
