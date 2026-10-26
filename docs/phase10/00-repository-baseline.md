# Repository baseline

Started 25 October 2026 (Asia/Bangkok) in `D:/Koupreng-invitation_project`: clean `main`, HEAD and fetched `origin/main` both `516923b651b33dafc8ee47ecca45fee6b55bb8ce`. Phase 7/8/9 history and Phase 9 reports were read. Initial user/admin suites passed 896/121 tests and both builds passed. The first backend run found 624 tests, 560 passed and 64 environment-guarded skips; enabling an owned native MySQL instance reduced this to the four documented opt-in skips.

Work began on `feat/phase10-studio-heritage`. A concurrent task subsequently switched the shared checkout to `chore/full-stack-security-modernization` and changed dependencies/backend sources. Phase 10's 30 modified and 64 then-new files were transferred byte-for-byte to `D:/Koupreng-Phase10-worktree`, checked out from the original SHA. Only the identical Phase 10 copies were removed from the shared checkout. That task's edits were preserved. Fresh npm installations and backend builds/tests in the isolated worktree exclude its uncommitted changes.

Active routes: wedding Studio is `InvitationForm` inside `EventWorkspace`; Event Essential uses `EventDetails`; public invitations use `PublicInvitationFeature` and the same `TemplateExperience` renderer. Registered template aliases are resolved before database numeric IDs. Java 25 / Boot 4.0.8 remain the isolated baseline; no backend production source or historical migration is changed.

Work resumed on 26 October 2026 (Asia/Bangkok). The isolated branch and committed changes were retained; verification continued from the recorded results rather than replacing the concurrent task in the original checkout.
