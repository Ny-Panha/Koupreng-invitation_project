# 17 — changes, preservation and rollback

Execution dates: **17–18 November 2026 (Asia/Bangkok)**. The dated directory retains its 17 November start. Starting `main` `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4` matched fetched `origin/main`. Production changes are fixed at `3a02004430519ea4b9dc782821aacb4207b0b8b9`; report generation observed `e0a331ff4f4c0f3a7a0764cbaf588a83de18c2f8` on `main`. Remote remains `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`. Local commits only; no push, PR, deployment or production mutation.

The committed application/test delta from baseline is:

* `.gitignore`
* `apps/frontend-admin/src/app/App.jsx`
* `apps/frontend-admin/src/app/phase06ShellInventory.test.jsx`
* `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx`
* `apps/frontend-admin/src/features/templates/TemplateStudio.css`
* `apps/frontend-admin/src/layouts/AdminLayout.css`
* `apps/frontend-admin/src/layouts/AdminLayout.jsx`
* `apps/frontend-admin/src/layouts/components/AdminHeader.jsx`
* `apps/frontend-admin/src/layouts/components/AdminSidebar.jsx`
* `apps/frontend-admin/src/pages/notFound/AdminNotFoundPage.jsx`
* `apps/frontend-user/playwright.phase06.config.js`
* `apps/frontend-user/src/app/ScrollToTop.jsx`
* `apps/frontend-user/src/app/phase06ShellInventory.test.jsx`
* `apps/frontend-user/src/features/auth/AuthPage.css`
* `apps/frontend-user/src/features/auth/components/AuthLayout.jsx`
* `apps/frontend-user/src/features/events/EventsFeature.css`
* `apps/frontend-user/src/features/events/EventsFeature.jsx`
* `apps/frontend-user/src/features/events/EventsViewModes.test.jsx`
* `apps/frontend-user/src/features/events/workspace/EventWorkspace.css`
* `apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx`
* `apps/frontend-user/src/features/invitations/InvitationMediaManager.test.jsx`
* `apps/frontend-user/src/features/marketing/NotFoundFeature.jsx`
* `apps/frontend-user/src/layouts/AuthShell.jsx`
* `apps/frontend-user/src/layouts/HostShell.css`
* `apps/frontend-user/src/layouts/HostShell.jsx`
* `apps/frontend-user/src/layouts/components/Header.jsx`
* `apps/frontend-user/src/layouts/components/HostNav.css`
* `apps/frontend-user/src/layouts/components/HostNav.jsx`
* `apps/frontend-user/src/layouts/components/MarketingChrome.css`
* `apps/frontend-user/src/shared/ui/ResponsiveTable.jsx`
* `apps/frontend-user/src/shared/ui/ResponsiveTable.test.jsx`
* `apps/frontend-user/tests/e2e/phase06-layout-navigation.spec.js`
* `apps/frontend-user/tests/e2e/support/phase06Fixtures.js`
* `scripts/qa/phase06ShellInventory.mjs`

No backend source, Flyway SQL, upload protection, API contract, auth guard/allowlist, payment/settlement/entitlement/currency calculation, guest token/RSVP policy, publication ownership, draft serializer/conflict rule, trusted preview origin/session protocol, template registry, renderer art/font/media or dependency manifest changed. Existing server-owned statuses remain authoritative. USD and KHR were not mixed. A redirect never means PAID. Fixtures reject live writes and use fictional identities only.

Implementation commits: `4b39fb18` (navigation/shells), `e0ce7728` (safe-area cascade), `13fb564e` (Studio short-landscape insets), `db428514` (font-settled mobile auth toolbar), `595091fa` / `ec39af0d` (zero-entry and fast-navigation history recovery, with a permanent regression case), `3a020044` (scoped table horizontal keys and regression unit). Tests/source-binding collector: `7d98ba9b`, `21520b56` (sandbox/starter fixture correction), `6bfc10a5` (main-document fixture authority), `fefe5f62` (wait for media assets), `e0a331ff` (wait for home content before testing scroll). The final evidence commit is identified in the delivery reply. No commit was pushed; origin/main remains the starting SHA.

Rollback is a reviewed `git revert` of this phase’s commits in reverse chronological order, preserving any later teammate work. After the evidence commit, revert `e0a331ff`, `fefe5f62`, `3a020044`, `ec39af0d`, `595091fa`, `6bfc10a5`, `db428514`, `21520b56`, `13fb564e`, `e0ce7728`, `7d98ba9b`, then `4b39fb18`; inspect each resulting diff and rerun token parity and affected tests. Do not reset hard, force-push, revert a migration or remove unrelated assets. Keep the phase output ignore rule if local binaries remain. No database rollback is required because no schema/data changed.
