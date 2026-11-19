# Chapter 14 — Exact Test Commands & Failure Register

## 1. Executed Test Commands

| Command | Exit Code | Pass/Fail | Notes |
|---|---|---|---|
| `node scripts/sync-design-tokens.cjs --check` | 0 | 2 exports verified | Design tokens in sync |
| `npm --prefix apps/frontend-user test -- src/features/templates/` | 0 | 59 files, 688 passed | Complete template unit suite |
| `npm --prefix apps/frontend-user test -- src/features/marketing/` | 0 | 9 files, 44 passed | Complete marketing unit suite |
| `npm --prefix apps/frontend-user test -- src/features/auth/` | 0 | 10 files, 97 passed | Auth & safe redirect suite |
| `npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx` | 0 | 1 file, 2 passed | 111 user routes verified |
| `npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx` | 0 | 1 file, 2 passed | 24 admin routes verified |
| `npm --prefix apps/frontend-user run lint` | 0 | 0 errors | Clean ESLint |
| `npm --prefix apps/frontend-admin run lint` | 0 | 0 errors | Clean ESLint |
| `npm --prefix apps/frontend-user run build` | 0 | Success (1.69s) | Production bundle |
| `npm --prefix apps/frontend-admin run build` | 0 | Success (5.50s) | Production bundle |
| `npm --prefix apps/frontend-user run test:e2e -- --config playwright.phase09.config.js` | 0 | 42 passed (48.5s) | Phase 09 E2E across 6 projects |
| `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2` | 0 | 18 passed (17.5s) | Phase 08 E2E regression check |
| `npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase07-featured-collection.spec.js --workers=2` | 0 | 8 passed (17.7s) | Phase 07 featured collection E2E |

## 2. Failure Register
- Phase 06 layout navigation test 11 (Studio desktop reflow popup URL check) failed due to preview port origin expectation (`4173` vs `5173`). Documented as existing environment origin alignment gate.
- Historical Phase 02 QA-NEW assertions remain known red baselines pending native copy approval.
