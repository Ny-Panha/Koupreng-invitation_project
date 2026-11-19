# 26 — Independent Codex Handoff Protocol

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Handoff Protocol, Audit Verification Steps, and Push Standing Policy  
> **Status:** Complete in local working tree; awaiting independent audit by Phase 12 Codex  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Handoff Mandate & Roles

- **Gemini Phase 12.1 Role:** Completed frontend implementation, authoring 4 dedicated test suites, capturing 16 verified multi-viewport screenshots, generating 25 JSON evidence files, and compiling 26 markdown reports.
- **Git Policy Enforced:** Gemini has **NOT staged, committed, pushed, or deployed**. All modifications reside unstaged in the local working directory.
- **Phase 12 Codex Role:** Independent auditor responsible for reviewing the working tree diffs, re-executing unit and visual tests, validating acceptance gates, and conducting the formal integer audit.
- **Push Policy:** Only after the combined Phase 12.1 and Phase 12 integer audit is completed will Codex safely stage, commit, and push to `origin/main`.

---

## 2. Verification Commands for Codex Auditor

The Codex auditor can reproduce all test and build results using the exact commands:

```bash
# 1. Verify Design Token Synchronization
node scripts/sync-design-tokens.cjs --check

# 2. Run Events and Dashboard Unit Tests (193 tests across 29 files)
npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ --run

# 3. Run Route and Guard Unit Tests (24 tests across 7 files)
npm.cmd --prefix apps/frontend-user test -- src/app/ --run

# 4. Run ESLint Verifications
npm.cmd --prefix apps/frontend-user run lint
npm.cmd --prefix apps/frontend-admin run lint

# 5. Run Production Builds
npm.cmd --prefix apps/frontend-user run build
npm.cmd --prefix apps/frontend-admin run build

# 6. Re-execute Playwright Visual E2E Suite (16 verified screenshots)
npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-1.config.js
```

---

## 3. Working Tree Diff Summary

```bash
git status --short
# Modified:
#   apps/frontend-user/src/features/dashboard/DashboardFeature.jsx
#   apps/frontend-user/src/features/events/EventsFeature.css
#   apps/frontend-user/src/features/events/EventsFeature.jsx
#   apps/frontend-user/src/features/events/components/EventCalendar.css
#   apps/frontend-user/src/features/events/components/EventCalendar.jsx
#   apps/frontend-user/src/features/events/components/EventCard.jsx
#   apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx
# Untracked Tests & Config:
#   apps/frontend-user/playwright.phase12-1.config.js
#   apps/frontend-user/src/features/dashboard/Phase12_1DashboardTruthfulness.test.jsx
#   apps/frontend-user/src/features/events/Phase12_1EventListProvenance.test.jsx
#   apps/frontend-user/src/features/events/components/Phase12_1EventCalendarFidelity.test.jsx
#   apps/frontend-user/src/features/events/workspace/Phase12_1WorkspaceAuthority.test.jsx
#   apps/frontend-user/tests/e2e/phase12-1-owner-dashboard-screenshots.spec.js
#   docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/
```

All acceptance criteria are satisfied in the local working tree. Gemini Phase 12.1 officially hands off to the independent Phase 12 Codex auditor.
