# Phase 14 Codex Audit — Report 30: Changed Files, Hashes, and Rollback

## 1. Reviewed Source Files for Phase 14 Publication
- `apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx`
- `apps/frontend-user/src/features/invitations/MediaLibrary.css`
- `apps/frontend-user/src/features/invitations/mediaLibraryModel.js`
- `apps/frontend-user/src/shared/i18n/workspaceMessages.js`
- `apps/frontend-user/playwright.phase14-1.config.js`
- `apps/frontend-user/src/features/invitations/InvitationMediaNegativeScenarios.test.jsx`
- `apps/frontend-user/tests/e2e/phase14-1-media-studio.spec.js`

## 2. Safe Rollback Instructions
To cleanly revert Phase 14 changes without collateral damage:
```powershell
git checkout 769b9a4bd934a4214605625b739a5bd6cf780294 -- apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx
git checkout 769b9a4bd934a4214605625b739a5bd6cf780294 -- apps/frontend-user/src/features/invitations/MediaLibrary.css
git checkout 769b9a4bd934a4214605625b739a5bd6cf780294 -- apps/frontend-user/src/features/invitations/mediaLibraryModel.js
git checkout 769b9a4bd934a4214605625b739a5bd6cf780294 -- apps/frontend-user/src/shared/i18n/workspaceMessages.js
Remove-Item apps/frontend-user/playwright.phase14-1.config.js
Remove-Item apps/frontend-user/src/features/invitations/InvitationMediaNegativeScenarios.test.jsx
Remove-Item apps/frontend-user/tests/e2e/phase14-1-media-studio.spec.js
```

- [Machine Evidence: Rollback Plan](evidence/rollback-plan.json)
- [Machine Evidence: Source Attribution](evidence/source-attribution.json)
