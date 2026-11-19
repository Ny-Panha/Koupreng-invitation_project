# 24 — Test Matrix & Verification Evidence

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Automated Unit Tests, Route Tests, ESLint Verifications, and Playwright Visual Suites  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Test Suite Summary

| Test Domain | Target Command | Files | Tests | Failures | Duration | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Events & Dashboard Unit Tests** | `npm test -- src/features/events/ src/features/dashboard/ --run` | 29 | 193 | 0 | 5.49s | **PASS** |
| **App Routing & Guards** | `npm test -- src/app/ --run` | 7 | 24 | 0 | 1.59s | **PASS** |
| **ESLint (`frontend-user`)** | `npm run lint` | all | - | 0 | 18.0s | **PASS** |
| **ESLint (`frontend-admin`)** | `npm run lint` | all | - | 0 | 6.2s | **PASS** |
| **Production Build (`frontend-user`)** | `npm run build` | all | - | 0 | 1.46s | **PASS** |
| **Production Build (`frontend-admin`)** | `npm run build` | all | - | 0 | 450ms | **PASS** |
| **Design Token Sync** | `node scripts/sync-design-tokens.cjs --check` | 2 | - | 0 | 320ms | **PASS** |
| **Playwright Visual E2E** | `playwright test --config=playwright.phase12-1.config.js` | 1 | 6 | 0 | 15.6s | **PASS** |

---

## 2. Dedicated Phase 12.1 Test Suites

1. `apps/frontend-user/src/features/events/Phase12_1EventListProvenance.test.jsx` (3 tests):
   - Provenance badge rendering and action routing ("Manage event" vs "Resume draft").
   - Deterministic sorting by `newest`, `date`, and `title`.
   - Khmer Unicode NFC search normalization.
2. `apps/frontend-user/src/features/events/components/Phase12_1EventCalendarFidelity.test.jsx` (3 tests):
   - Leap year `2028-02-29` date computation without month shift.
   - Status chip tone differentiation for local and failed-sync drafts.
   - Authentic Khmer month and weekday header labels.
3. `apps/frontend-user/src/features/events/workspace/Phase12_1WorkspaceAuthority.test.jsx` (2 tests):
   - Synchronous state clearance on event switch (101 -> 102) to prevent flashing stale data.
   - Non-owner restriction: shared event notice and delete button suppression.
4. `apps/frontend-user/src/features/dashboard/Phase12_1DashboardTruthfulness.test.jsx` (3 tests):
   - Strict USD/KHR currency separation in budget and gift totals.
   - Future countdown pill vs past event completed pill.
   - Truthful 0 guest count vs uninitialized data.
5. `apps/frontend-user/tests/e2e/phase12-1-owner-dashboard-screenshots.spec.js` (6 tests):
   - Captures 16 multi-viewport screenshots across 1440px, 768px, 393px, 320px, and 844x390.
