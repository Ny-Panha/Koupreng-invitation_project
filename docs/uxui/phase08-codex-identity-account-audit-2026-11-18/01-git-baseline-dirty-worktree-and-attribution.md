# Git baseline and preservation

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

Observed origin/main `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`; 13 local commits retained. No fetch, merge, rebase, reset, stash or staging. Baseline includes the audit bootstrap file; all other original dirty rows belong to prior work. [git-worktree-baseline.json](evidence/git-worktree-baseline.json) records byte hashes and local log. [changed-files-attribution.json](evidence/changed-files-attribution.json) has exact Codex hunks; [preservation-diff.json](evidence/preservation-diff.json) checks protected source and prior reports.

Original Phase07/08 work is retained, not restored to HEAD. Reliable before screenshots use the actual dirty initial build. The Phase08 preserved Phase07 patch is local comparison material, not blanket authorization to reverse it.


| Path | Codex attribution | Hunks |
| --- | --- | --- |
| apps/frontend-user/index.html | CODEX overlay on preserved Phase07/08 dirty source | 1 |
| apps/frontend-user/src/app/guards/RequireAuth.jsx | CODEX overlay on preserved Phase07/08 dirty source | 2 |
| apps/frontend-user/src/app/guards/RequireAuth.test.jsx | CODEX on clean HEAD source | 3 |
| apps/frontend-user/src/app/routes/hostRoutes.jsx | CODEX on clean HEAD source | 2 |
| apps/frontend-user/src/features/auth/AuthPage.css | CODEX overlay on preserved Phase07/08 dirty source | 3 |
| apps/frontend-user/src/features/auth/ChangePasswordFeature.css | CODEX overlay on preserved Phase07/08 dirty source | 9 |
| apps/frontend-user/src/features/auth/ChangePasswordFeature.jsx | CODEX overlay on preserved Phase07/08 dirty source | 11 |
| apps/frontend-user/src/features/auth/ForgotPasswordFeature.jsx | CODEX overlay on preserved Phase07/08 dirty source | 6 |
| apps/frontend-user/src/features/auth/ForgotPasswordFeature.test.jsx | CODEX overlay on preserved Phase07/08 dirty source | 3 |
| apps/frontend-user/src/features/auth/LoginFeature.jsx | CODEX overlay on preserved Phase07/08 dirty source | 1 |
| apps/frontend-user/src/features/auth/ProfileFeature.css | CODEX overlay on preserved Phase07/08 dirty source | 3 |
| apps/frontend-user/src/features/auth/ProfileFeature.jsx | CODEX overlay on preserved Phase07/08 dirty source | 16 |
| apps/frontend-user/src/features/auth/RegisterFeature.jsx | CODEX overlay on preserved Phase07/08 dirty source | 1 |
| apps/frontend-user/src/features/auth/RegisterFeature.test.jsx | CODEX on clean HEAD source | 1 |
| apps/frontend-user/src/features/auth/ResetPasswordFeature.jsx | CODEX overlay on preserved Phase07/08 dirty source | 11 |
| apps/frontend-user/src/features/auth/ResetPasswordFeature.test.jsx | CODEX overlay on preserved Phase07/08 dirty source | 1 |
| apps/frontend-user/src/features/auth/components/SocialAuthButtons.jsx | CODEX on clean HEAD source | 1 |
| apps/frontend-user/src/features/auth/components/SocialAuthButtons.test.jsx | CODEX on clean HEAD source | 1 |
| apps/frontend-user/src/features/auth/safeRedirect.js | CODEX on clean HEAD source | 1 |
| apps/frontend-user/src/layouts/components/HostNav.css | CODEX on clean HEAD source | 1 |
| apps/frontend-user/src/stores/useAuthStore.js | CODEX on clean HEAD source | 1 |
| apps/frontend-user/src/stores/useAuthStore.test.js | CODEX on clean HEAD source | 1 |
| apps/frontend-user/tests/e2e/phase08-identity-account.spec.js | CODEX overlay on preserved Phase07/08 dirty source | 2 |
| apps/frontend-user/src/features/auth/Phase08Regression.test.jsx | NEW CODEX | 1 |
| apps/frontend-user/src/features/auth/accountPasswordPolicy.js | NEW CODEX | 1 |
| apps/frontend-user/src/features/auth/components/AccountPasswordGuidance.jsx | NEW CODEX | 1 |
| apps/frontend-user/tests/e2e/phase08-codex-regression.spec.js | NEW CODEX | 1 |
| apps/frontend-user/playwright.phase08.config.js | NEW CODEX | 1 |

Pre-Codex phase attribution, including initial hunk coordinates and direct Phase07 hash matches: [pre-codex-phase-attribution.json](evidence/pre-codex-phase-attribution.json).

Preserved local commit log:

```text
2429b765 docs(uxui): reconcile phase06 evidence and cross-phase gates
e0a331ff test(navigation): require home content before scroll assertions
fefe5f62 test(media): await assets before asserting loaded content
3a020044 fix(a11y): support horizontal keys on focused table regions
ec39af0d fix(ux): initialize history positions before route readiness
595091fa fix(ux): remember zero scroll positions for Back navigation
6bfc10a5 test(ux): scope fixture sessions to the main document
db428514 fix(auth): reserve mobile preference rows before font loading
21520b56 test(ux): isolate sandboxed frames and seed starter catalog fixtures
13fb564e fix(studio): retain safe area insets in short landscape
e0ce7728 fix(ux): preserve safe area padding across shell breakpoints
7d98ba9b test(ux): verify shell navigation, route bindings and responsive recovery
4b39fb18 feat(ux): strengthen global navigation and responsive shell contracts
```

Baseline capture recovery: [baseline-first-path-recovery.json](evidence/baseline-first-path-recovery.json) documents an initial porcelain leading-space parsing error. The index.html hash was correctly recorded before edits, but its first snapshot path was missed. Removing only the known Codex meta line from a local copy reproduced the exact immutable baseline SHA-256; the live source was untouched. The final selective patch uses those verified starting bytes, so its index.html rollback contains only the Codex referrer meta hunk and preserves the Phase07 metadata change.
