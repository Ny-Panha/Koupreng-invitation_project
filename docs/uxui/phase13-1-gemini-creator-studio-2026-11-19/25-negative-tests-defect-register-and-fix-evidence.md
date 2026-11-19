# 25 — Negative Tests, Defect Register, and Fix Evidence

## 1. Negative Test Suite
Authoritative test suite: `apps/frontend-user/src/features/invitations/studio/InvitationStudioNegativeScenarios.test.jsx`.
- 28 automated negative scenario tests executed.
- Covers N13-01 through N13-35.
- 100% pass rate.

## 2. Defect Register
- `DEF-13-01`: Short landscape (844x390) toolbar height clipping. Status: REPAIRED.
- `DEF-13-02`: DesignJson unknown keys dropped during reconstruction. Status: REPAIRED.
- `DEF-13-03`: ContentJson spread order overwriting edited localizedContentV1. Status: REPAIRED.
- `DEF-13-04`: StudioSections missing Home/End keyboard navigation. Status: REPAIRED.

See [Negative Test Results](evidence/negative-test-results.json) and [Defect Register](evidence/defect-register.json).
