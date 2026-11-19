# Chapter 16 — Exact Commands, Results, Failures & Reliability

## 1. Executed Test Suite Registry

```bash
# 1. Design Token Parity
node scripts/sync-design-tokens.cjs --check
# Result: Verified 2 application token exports. (PASS)

# 2. Route Inventory Integrity
npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx
# Result: 2 passed (PASS)
npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx
# Result: 2 passed (PASS)

# 3. Phase 09 Template Tests
npm --prefix apps/frontend-user test -- src/features/templates/Phase09Templates.test.jsx
# Result: 10 passed (PASS)
npm --prefix apps/frontend-user test -- src/features/templates/Phase09CodexAuditRegression.test.jsx
# Result: 12 passed (PASS)

# 4. Directory Full Regressions
npm --prefix apps/frontend-user test -- src/features/templates/
# Result: 60 files passed, 700 passed (PASS) (including 12 Codex regression tests)
npm --prefix apps/frontend-user test -- src/features/marketing/
# Result: 9 files passed, 44 passed (PASS)
npm --prefix apps/frontend-user test -- src/features/auth/
# Result: 10 files passed, 97 passed (PASS)
npm --prefix apps/frontend-admin test
# Result: 37 files passed, 202 passed (PASS)

# 5. Code Quality & Builds
npm --prefix apps/frontend-user run lint   # PASS
npm --prefix apps/frontend-admin run lint  # PASS
npm --prefix apps/frontend-user run build  # PASS (index: 477.66 kB)
npm --prefix apps/frontend-admin run build # PASS (index: 285.33 kB)

# 6. Playwright Phase 09 Tests
npm --prefix apps/frontend-user run test:e2e -- --config playwright.phase09.config.js --workers=2
# Result: 42 passed across 6 projects (PASS)
npm --prefix apps/frontend-user run test:e2e -- --config playwright.phase09.config.js
# Result: 42 passed using 10 default workers (PASS)

# 7. Cross-Phase Browser Regressions
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2
# Result: 18 passed (PASS)
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase07-featured-collection.spec.js --workers=2
# Result: 8 passed (PASS)
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2
# Result: 26 passed, 6 known historical failures QA-NEW-01/02/03 preserved (PASS)
```
