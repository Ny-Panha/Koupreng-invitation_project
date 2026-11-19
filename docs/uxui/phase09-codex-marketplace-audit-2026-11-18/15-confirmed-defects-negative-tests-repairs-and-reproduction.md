# Chapter 15 — Confirmed Defects, Negative Tests, Repairs & Reproduction

## 1. Codex Confirmed Defects & Repairs

### C09-001 (P2): Search Clear Button Hit Target Below WCAG 2.2 AA Minimum
- **Defect:** Button in public catalog had `width: 22px; height: 22px; min-height: auto !important; padding: 0 !important;` and host browse button lacked minimum dimensions/touch area. Failed WCAG 2.2 AA SC 2.5.8 (24px minimum) and mobile 44px comfortable touch target contract.
- **Repaired In:** `apps/frontend-user/src/features/templates/components/templates.css` (`.kp-search-clear-btn`) and `apps/frontend-user/src/features/templates/pages/BrowseTemplates.css` (`.tb-search-clear-btn`).
- **Fix:** Upgraded base elements to 24px minimum (`min-width: 24px !important; min-height: 24px !important; position: relative;`) and added `::before` pseudo-element with 44x44px comfortable touch hit area on both public and host search clear buttons.
- **Verification:** Passed in Playwright spec test 02 and Vitest N09-02.

### C09-002 (P2): Bilingual Search Index Omission in matchesTemplateSearch
- **Defect:** In `catalogPolicy.js`, `matchesTemplateSearch` indexed `descriptionKm` and `descriptionEn`, but omitted `nameKm` and `nameEn`. Cross-language searches failed.
- **Repaired In:** `apps/frontend-user/src/features/templates/model/catalogPolicy.js`
- **Fix:** Added `template.nameKm` and `template.nameEn` to the search text array.
- **Verification:** Verified via `Phase09CodexAuditRegression.test.jsx` test N09-01.

### C09-003 (P3): Concurrency Timeout on Lazy Template Mount in Full Test Suite
- **Defect:** Under high Vitest concurrency (60 worker environments running 700 tests), `phase12ContractMatrix.test.jsx` failed with `AssertionError: expected 'កំពុងផ្ទុកសន្លឹកការ… / Loading invitation…' to contain 'Fictional first partner'` due to default 1000ms `waitFor` expiring during async lazy component mounting.
- **Repaired In:** `apps/frontend-user/src/features/templates/registry/phase12ContractMatrix.test.jsx`
- **Fix:** Extended `waitFor` timeout to 5000ms for resilient async lazy loading.
- **Verification:** Verified with full templates suite passing 60/60 files and 700/700 tests cleanly.

## 2. Preserved Upstream Repairs (P09-001 through P09-006)

All 6 Gemini upstream repairs were re-tested and independently confirmed intact.
