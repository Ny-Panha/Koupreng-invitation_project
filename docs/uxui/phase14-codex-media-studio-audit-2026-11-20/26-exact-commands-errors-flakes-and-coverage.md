# Phase 14 Codex Audit — Report 26: Exact Commands, Test Runs, and Flakes

## 1. Executed Test Commands and Results

| Command | Exit Code | Result | Duration |
|---|---|---|---|
| `node scripts/sync-design-tokens.cjs --check` | 0 | 2 exports verified | 0.2s |
| `npm test -- InvitationMediaNegativeScenarios.test.jsx --run` | 0 | 48 passed (48) | 1.17s |
| `npm test -- src/features/invitations/ --run` | 0 | 30 files / 252 tests passed | 10.27s |
| `npm run lint` (`frontend-user`) | 0 | 0 errors, 0 warnings | 12.4s |
| `npm run lint` (`frontend-admin`) | 0 | 0 errors, 0 warnings | 6.2s |
| `npm run build` (`frontend-user`) | 0 | Built in 4.83s | 4.83s |
| `npm run build` (`frontend-admin`) | 0 | Built in 680ms | 0.68s |
| `npm test` (`frontend-admin` full suite) | 0 | 37 files / 202 tests passed | 5.54s |
| `npm test` (`frontend-user` full suite) | 0 | 249 files / 1,889 tests passed | 41.72s |
| `playwright test --config playwright.phase14-1.config.js` | 0 | 21/21 passed | 44.6s |
| `git diff --check` | 0 | 0 whitespace errors | 0.3s |

Zero test flakes observed. All suites passed 100% deterministically.

- [Machine Evidence: Exact Command Results](evidence/exact-command-results.json)
