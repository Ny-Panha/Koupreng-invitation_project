# Phase 14.1 — Command Results and Failed-First Evidence

## 1. Failed-First Diagnostic History
In accordance with development discipline, real failures encountered during initial runs were documented and repaired:

1. **Role Tab Mismatch:**
   - *Failure:* Initial rewrite assigned `role="tab"` to category buttons, conflicting with existing test assertion `getByRole('button', { name: /cover/i })`.
   - *Fix:* Replaced with `<button type="button" aria-pressed="...">` inside a `role="group"` container.
2. **Regex URL False Positive:**
   - *Failure:* `invitationMediaReferences` matched `https://maps.example.test` because `map` was in the keyword regex, causing unexpected in-use tagging.
   - *Fix:* Refined regex to target specific media attributes without greedily capturing URL domain fragments.
3. **ESLint Unused Imports:**
   - *Failure:* Unused Lucide icons (`ChevronRight`, `MapPin`, `Sliders`) in `InvitationMediaManager.jsx`.
   - *Fix:* Pruned unused variables; ESLint exited with 0 errors.

## 2. Final Regression Test Commands
- `npm --prefix apps/frontend-user run test:run` -> **249 test files passed, 1,889 tests passed, 0 failures (37.57s)**.
- `npm --prefix apps/frontend-admin run test:run` -> **37 test files passed, 202 tests passed, 0 failures (12.31s)**.
- `npm --prefix apps/frontend-user run lint` -> **Exit code 0 (0 errors, 0 warnings)**.
- `npm --prefix apps/frontend-admin run lint` -> **Exit code 0 (0 errors, 0 warnings)**.
- `npm --prefix apps/frontend-user run build` -> **Exit code 0 (vite build 6.83s)**.
- `npm --prefix apps/frontend-admin run build` -> **Exit code 0 (vite build 4.83s)**.
- `npx playwright test --config playwright.phase14-1.config.js` -> **21 tests passed, 0 failures (34.7s)**.

- [Machine Evidence: Test Command Failures](evidence/test-command-failures.json)
