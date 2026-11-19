# 26 — Exact Command Results and Historical Regressions

## 1. Executed Test & Build Commands
- `git status --porcelain=v1 -uall`: Exit 0 (6 modified, 3 untracked, 0 staged).
- `node scripts/sync-design-tokens.cjs --check`: Exit 0 (2 exports verified).
- `vitest run src/features/invitations/ src/features/wedding-builder/ src/shared/preview/`: Exit 0 (32 test files, 231 tests passed).
- `frontend-user lint`: Exit 0.
- `frontend-user build`: Exit 0.
- `frontend-admin lint`: Exit 0.
- `frontend-admin build`: Exit 0.
- `playwright test --config=playwright.phase13-1.config.js`: Exit 0 (16 passed in 42.9s).

## 2. Historical Regressions Retained
- Phase 02 six failures preserved ([desktop, 129], [desktop, 196], [desktop, 208], [mobile, 129], [mobile, 196], [mobile, 208]).
- Guest filter failures preserved.

See [Exact Command Results](evidence/exact-command-results.json).
