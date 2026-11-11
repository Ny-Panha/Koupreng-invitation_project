# 15 — changed files, risks and rollback

Scoped code changes: user `LoadingButton.jsx/.css`, `ResponsiveTable.jsx/.css`, `FormField.css`, `SearchInput.css`, `StatusBadge.css`, RSVP and organization route CSS, `sharedUi.test.jsx`; admin `AdminUI.jsx`, `Toast.jsx`, `App.css`, new `AdminUI.test.jsx`; new `phase04-components.spec.js`; this dated documentation/evidence directory. The token source and generated mirror were not edited. No package manifests, backend files, migration SQL, route factories, renderer code, art or license ledger changed. Review `git show --stat` for the final committed file list.

| Change | Business invariant | Reversible step | Regression suite | Rollback | Open limit |
|---|---|---|---|---|---|
| Admin safe button default | Report refresh does not submit a form; explicit submit remains possible | Restore prior default only at caller if a legitimate implicit submit is found | `AdminUI.test.jsx`, report Playwright, admin full suite | Revert `ActionButton` hunk and add explicit caller types | Undiscovered implicit-submit consumers need audit |
| Admin persistent error toast | Service failure stays visible; no fake success | Retain old timeout behavior only with a reviewed recovery UX | `AdminUI.test.jsx`, admin full suite | Revert `Toast.jsx` hunk | Live notification queue and screen reader timing untested |
| Admin semantic status/card colors | Pending review ≠ paid; values still service-owned | Restore former style classes | `AdminUI.test.jsx`, captures, admin build | Revert `AdminUI.jsx` style hunks | Contrast on every tone/forced color open |
| User table named region | Organization data stays semantic and keyboard reachable | Remove wrapper focus/role if a route proves duplicate tab burden | `sharedUi.test.jsx`, organization Playwright | Revert table JSX/CSS hunk | Scroll distance and all table densities untested |
| User loading ARIA | Pending action cannot be double-triggered | Remove added `aria-busy` | `sharedUi.test.jsx`, user full suite | Revert one attribute | Real async race cases untested |
| User forms/search/table theme | Labels, names, data and validation remain unchanged | Restore former CSS roles if a route-specific override is needed | Full user suite, route captures, 8 axe scans | Revert scoped shared CSS hunks | Native Khmer/forced-color physical review open |
| RSVP/organization contrast | Real text remains readable in light/dark modes | Restore route styling after replacement with an equally contrasted role | Axe script + 10 new browser checks | Revert only route CSS hunks | Other route-specific contrast remains unmeasured |

No destructive migration or data rollback is required. The scoped code can be reverted as one Phase 04 commit if a regression appears; preserve later independent commits and do not force-push. The ignored `output/playwright/uxui-phase04-2026-11-11/` folder may be regenerated from the tracked scripts and must not be treated as source.
