# Chapter 18 — Changed Files Preservation & Selective Rollback

## 1. Attributed Changes Ledger

Only 6 existing files were modified, and 3 test/config files were added. Zero files from Phase 06, 07, or 08 were deleted, reset, or staged.

## 2. Safe Selective Rollback Commands

If a selective rollback of Gemini Phase 09.1 changes is ever requested:

```powershell
# Revert modified files
git checkout HEAD -- apps/frontend-user/src/features/templates/components/TemplateGrid.jsx
git checkout HEAD -- apps/frontend-user/src/features/templates/components/templates.css
git checkout HEAD -- apps/frontend-user/src/features/templates/pages/BrowseTemplates.css
git checkout HEAD -- apps/frontend-user/src/features/templates/pages/BrowseTemplatesFeature.jsx
git checkout HEAD -- apps/frontend-user/src/features/marketing/MarketingPages.css
git checkout HEAD -- apps/frontend-user/src/features/marketing/PricingFeature.jsx

# Remove untracked Phase 09.1 tests and reports
Remove-Item apps/frontend-user/src/features/templates/Phase09Templates.test.jsx
Remove-Item apps/frontend-user/playwright.phase09.config.js
Remove-Item apps/frontend-user/tests/e2e/phase09-marketplace-catalog.spec.js
Remove-Item -Recurse docs/uxui/phase09-1-gemini-marketplace-experience-2026-11-18
```
*(Warning: Never run `git reset --hard` or `git clean -fd`, which would destroy unstaged Phase 07 and 08 files).*
