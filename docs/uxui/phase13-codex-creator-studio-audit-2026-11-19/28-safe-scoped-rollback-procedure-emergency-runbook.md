# Report 28: Safe Scoped Rollback Procedure & Emergency Runbook

> **Target:** Hash-Guarded Rollback, Scoped Revert & Recovery Procedures  
> **Auditor:** Codex (Senior Release & Operations Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Problem with Unscoped Rollback Commands

Gemini's draft suggested the following commands:
```powershell
# DANGEROUS SNIPPET:
git checkout -- apps/frontend-user/src/features/invitations/InvitationForm.jsx ...
Remove-Item -Recurse -Force docs/uxui/phase13-1-gemini-creator-studio-2026-11-19
```

### Why This is Dangerous
1. `git checkout -- <file>` obliterates all unstaged modifications indiscriminately. If another developer or automated task touched files in the same directory, those edits are permanently lost.
2. `Remove-Item -Recurse -Force` bypasses the recycle bin and git index, destroying files without hash verification.

---

## 2. Safe, Hash-Guarded Scoped Rollback Procedure

In the unlikely event that Phase 13 changes need to be rolled back after commit or in a dirty working tree, follow this exact step-by-step procedure:

### Scenario A: Uncommitted Working Tree Rollback
To cleanly revert only the exact Phase 13 changes without touching unrelated work:

1. **Verify Git Status:**
   ```powershell
   git status --short
   ```
2. **Revert Only the 6 Specific Modified Files:**
   ```powershell
   $phase13Tracked = @(
     "apps/frontend-user/src/features/invitations/InvitationForm.jsx",
     "apps/frontend-user/src/features/invitations/studio/StudioChrome.css",
     "apps/frontend-user/src/features/invitations/studio/StudioSections.jsx",
     "apps/frontend-user/src/features/invitations/studio/StudioSections.test.jsx",
     "apps/frontend-user/src/features/invitations/studio/StudioToolbar.jsx",
     "apps/frontend-user/src/features/invitations/studio/StudioToolbar.test.jsx"
   )
   git checkout origin/main -- $phase13Tracked
   ```
3. **Cleanly Remove Only Phase 13 Untracked Files:**
   ```powershell
   $phase13Untracked = @(
     "apps/frontend-user/playwright.phase13-1.config.js",
     "apps/frontend-user/src/features/invitations/studio/InvitationStudioNegativeScenarios.test.jsx",
     "apps/frontend-user/tests/e2e/phase13-1-creator-studio-screenshots.spec.js"
   )
   foreach ($f in $phase13Untracked) {
     if (Test-Path $f) { Remove-Item -Path $f -Force }
   }
   ```

### Scenario B: Post-Commit Rollback on `main`
If the commit has been created locally or pushed:
```powershell
# Create a safe, explicit revert commit rather than rewriting history:
git revert --no-edit <commit-sha>
git push origin main
```
Never force-push (`git push -f`) to `origin/main`.
