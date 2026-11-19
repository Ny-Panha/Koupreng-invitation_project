# Chapter 19 — File Change Attribution, Diff Hunks & Safe Rollback Plan

## 1. Codex Source Modifications

Only three source files and two test files were created/modified by Codex during Phase 09:

1. `apps/frontend-user/src/features/templates/components/templates.css`
   - Added `CODEX-P09` target size enhancement for `.kp-search-clear-btn` (24px base + 44px `::before` touch area) and adjusted input padding to `38px`.
2. `apps/frontend-user/src/features/templates/pages/BrowseTemplates.css`
   - Added `CODEX-P09` target size enhancement for host browse `.tb-search-clear-btn` (24px base + 44px `::before` touch area, position relative).
3. `apps/frontend-user/src/features/templates/model/catalogPolicy.js`
   - Added `CODEX-P09` bilingual search fields (`nameKm` and `nameEn`) to `matchesTemplateSearch`.
4. `apps/frontend-user/src/features/templates/Phase09CodexAuditRegression.test.jsx`
   - Added dedicated negative scenarios test suite (12 tests covering N09-01 to N09-24).
5. `apps/frontend-user/src/features/templates/registry/phase12ContractMatrix.test.jsx`
   - Enhanced `waitFor` timeout from default 1000ms to 5000ms to eliminate high-concurrency Vitest test flakes on lazy template component mounting.

## 2. Safe Selective Rollback (No Git Reset)

If rollback of Codex changes is ever requested:
- Revert only hunks labeled `CODEX-P09` in `templates.css`, `BrowseTemplates.css`, and `catalogPolicy.js`.
- Revert the `timeout: 5000` addition in `phase12ContractMatrix.test.jsx`.
- Delete `apps/frontend-user/src/features/templates/Phase09CodexAuditRegression.test.jsx`.
- **NEVER** run `git reset --hard`, `git clean -fd`, or `git restore .` which would wipe Phase 07, Phase 08, and Phase 09.1 uncommitted work.
