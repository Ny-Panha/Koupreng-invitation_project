# Phase 07.1 — Known Defects, Risks, and Rollback Procedures

## 1. Defect & Risk Classification

### A. Known Baseline Carryovers (Non-Regression)
1. **Phase 06 Studio Landscape Orientation Tests (8 E2E Failures):**
   - *Classification:* Known baseline carryover.
   - *Impact:* Confined strictly to `StudioPreview.jsx` in Phase 08. Zero impact on public marketing surfaces.
2. **Phase 02 Legacy Viewport Snapshots (8 E2E Failures):**
   - *Classification:* Known baseline carryover.
   - *Impact:* Documented in Phase 06 closure ledger; does not affect marketing route rendering.

### B. Minor Robustness Risks
1. **Legacy Browser HTML5 `<dialog>` Support:**
   - *Risk:* Browsers older than Chrome 37 / Safari 15.4 / Firefox 98 lack native `<dialog>` support.
   - *Mitigation:* Modern evergreen browsers used by > 98% of target demographic support native dialogs. A standard polyfill can be integrated if legacy enterprise support is mandated.

---

## 2. Deterministic Rollback Runbook

Should a rollback of Phase 07.1 frontend modifications be required, execute the following commands from the repository root:

```bash
# 1. Restore modified tracked files to Phase 06 baseline HEAD (2429b76545b683fad2a0a6f328bee3264875edc3)
git checkout 2429b76545b683fad2a0a6f328bee3264875edc3 -- \
  apps/frontend-user/index.html \
  apps/frontend-user/src/features/marketing/MarketingFeature.css \
  apps/frontend-user/src/features/marketing/MarketingPages.css \
  apps/frontend-user/src/features/marketing/VenuesFeature.jsx \
  apps/frontend-user/src/layouts/components/MarketingChrome.css \
  apps/frontend-user/src/shared/i18n/marketingMessages.js

# 2. Remove untracked Phase 07.1 CSS and test files
rm apps/frontend-user/src/features/marketing/VenuesFeature.css
rm apps/frontend-user/src/features/marketing/Phase07Marketing.test.jsx

# 3. Verify clean worktree against baseline
git status --short
```
