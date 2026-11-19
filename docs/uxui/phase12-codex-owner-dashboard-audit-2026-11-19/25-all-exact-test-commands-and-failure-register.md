# 25 — all exact test commands and failure register

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The table below is generated from durable command records: exact invocation, true process exit, duration and observed summary. Full user/admin totals are not added to overlapping targeted suites. Configured skips and inherited failures are retained. Output paths are local ignored raw evidence; their hashes are recorded even where the binary/log is not shipped.

Intermediate failures include two missing route-fixture failures in each app, a Node import lint failure, a profile locator strictness error, tooltip/mobile-trigger source bugs, a contrast failure, a same-port server collision and an admin preview pointing at localhost:5173. Long cross-phase runs interrupted for environment correction/source rebuild are not green completed runs. No deadline was increased to hide a real application failure. Raw environment warnings about NO_COLOR/FORCE_COLOR and expected mocked DOM/network errors can appear in otherwise passing suites.

| Command ID | Exact command | Exit | Seconds | Observed summary |
|---|---|---:|---:|---|
| backend-draft-contract | `apps\backend\mvnw.cmd -f apps/backend/pom.xml -Dtest=EventDraftPersistenceTests test` | 0 | 39.523 | Tests     : Starting EventDraftPersistenceTests using Java 25.0.1 with PID 7044 (started by ASER Nitro in D:\Koupreng-invitation_project\apps\backend); Tests     : The following 1 profile is active: "test"; Tests     : Started EventDraftPersistenceTests in 20.572 seconds (process running for 23.976); Tests run: 11, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 27.48 s -- in com.koupreng.backend.invitation.application.EventDraftPersistenceTests; Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 |
| c08-connection-replay | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-regressions.config.js --project=desktop-chromium --grep "pending login"` | 0 | 5.886 | 
  1 passed (4.9s) |
| codex-browser-2 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | 0 | 43.133 | 
  21 passed (42.5s) |
| codex-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | 1 | 107.574 | 
  6 failed;   15 passed (1.8m) |
| final-admin-full | `npm.cmd --prefix apps/frontend-admin test` | 0 | 18.646 | Test Files  37 passed (37); Tests  202 passed (202) |
| final-codex-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | 0 | 113.606 | 
  30 passed (1.9m) |
| final-events-dashboard | `npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ --run` | 0 | 9.096 | Test Files  33 passed (33); Tests  213 passed (213) |
| final-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | 53.817 |  |
| final-owner-complete | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | 0 | 79.362 | 
  33 passed (1.3m) |
| final-phase11-default | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase11-codex.config.js` | 0 | 145.561 | 
  54 passed (2.4m) |
| final-repository-policy | `node --test scripts/qa/repository-policy.test.mjs` | 0 | 0.145 |  |
| final-routes | `npm.cmd --prefix apps/frontend-user test -- src/app/ --run` | 0 | 15.405 | Test Files  7 passed (7); Tests  24 passed (24) |
| final-user-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | 2.868 |  |
| final-user-full-2 | `npm.cmd --prefix apps/frontend-user test` | 0 | 69.758 | Test Files  245 passed (245); Tests  1779 passed (1779) |
| final-user-full | `npm.cmd --prefix apps/frontend-user test` | 0 | 66.772 | Test Files  245 passed (245); Tests  1778 passed (1778) |
| final-user-lint-2 | `npm.cmd --prefix apps/frontend-user run lint` | 0 | 129.375 |  |
| final-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | 105.391 |  |
| freeze-admin-build | `npm.cmd --prefix apps/frontend-admin run build` | 0 | 5.552 |  |
| freeze-admin-full | `npm.cmd --prefix apps/frontend-admin test` | 1 | 63.641 | Tests 2 ⎯⎯⎯⎯⎯⎯⎯; Test Files  1 failed / 36 passed (37); Tests  2 failed / 200 passed (202) |
| freeze-admin-lint | `npm.cmd --prefix apps/frontend-admin run lint` | 0 | 47.369 |  |
| freeze-codex-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | 1 | 2.263 |  |
| freeze-phase11-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase11-codex.config.js --workers=2` | 0 | 183.561 | 
  54 passed (3.0m) |
| freeze-routes | `npm.cmd --prefix apps/frontend-user test -- src/app/ --run` | 1 | 3.992 | Tests 2 ⎯⎯⎯⎯⎯⎯⎯; Test Files  1 failed / 6 passed (7); Tests  2 failed / 22 passed (24) |
| freeze-token | `node scripts/sync-design-tokens.cjs --check` | 0 | 0.098 |  |
| freeze-user-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | 11.226 |  |
| freeze-user-full | `npm.cmd --prefix apps/frontend-user test` | 1 | 56.977 | Tests 2 ⎯⎯⎯⎯⎯⎯⎯; Test Files  1 failed / 244 passed (245); Tests  2 failed / 1776 passed (1778) |
| freeze-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | 1 | 94.429 |  |
| frozen-cross-phase | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-regressions.config.js` | 1 | 690.874 | 
  1 failed;   65 skipped;   456 passed (11.5m) |
| frozen-owner-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | 0 | 137.33 | 
  30 passed (2.3m) |
| frozen-user-full | `npm.cmd --prefix apps/frontend-user test` | 0 | 90.02 | Test Files  245 passed (245); Tests  1779 passed (1779) |
| frozen-user-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | 147.241 |  |
| gemini12-replay | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-1.config.js` | 0 | 20.972 | 
  6 passed (20.2s) |
| guest-current | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/guest-workspace.spec.js --grep intersect --workers=2` | 1 | 12.266 | 
  2 failed |
| last-user-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | 3.958 |  |
| long-khmer-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js --grep "long Khmer"` | 1 | 18.93 | 
  1 failed;   2 passed (18.1s) |
| long-khmer-settled | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js --grep "long Khmer"` | 0 | 15.051 | 
  3 passed (14.4s) |
| phase02-current | `npm.cmd --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2` | 1 | 57.787 | 
  6 failed;   26 passed (57.1s) |
| regression-admin-build | `npm.cmd --prefix apps/frontend-admin run build` | 0 | 1.388 |  |
| render-comparison | `node output/phase12-codex/render-comparison.mjs` | 0 | 0.704 |  |
| repository-policy | `node --test scripts/qa/repository-policy.test.mjs` | 0 | 0.204 |  |
| revocation-green | `npm.cmd --prefix apps/frontend-user test -- src/features/events/workspace/` | 0 | 2.205 | Test Files  8 passed (8); Tests  41 passed (41) |
| revocation-red | `npm.cmd --prefix apps/frontend-user test -- src/features/events/workspace/Phase12CodexRevocation.test.jsx` | 1 | 1.644 | Tests 2 ⎯⎯⎯⎯⎯⎯⎯; Test Files  1 failed (1); Tests  2 failed (2) |
| rollback-patch-check | `git apply --reverse --check --ignore-space-change docs/uxui/phase12-codex-owner-dashboard-audit-2026-11-19/evidence/codex-owned-hunks.patch` | 0 | 0.042 |  |
| styleseed-resolve | `node .agents/skills/ss-resolve/scripts/resolve-context.mjs --from-lock STYLESEED.md --check` | 1 | 0.11 |  |
| styleseed-scan | `node .agents/skills/ss-score/scripts/styleseed-check.mjs scan --project-root . --artifact phase12-owner --format json` | 2 | 0.103 |  |
| targeted-3 | `npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ src/layouts/` | 0 | 9.282 | Test Files  33 passed (33); Tests  214 passed (214) |
| targeted-4 | `npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ src/layouts/` | 0 | 14.108 | Test Files  33 passed (33); Tests  215 passed (215) |
| unclaimed-draft-red | `npm.cmd --prefix apps/frontend-user test -- src/features/events/Phase12CodexAccountIsolation.test.jsx` | 1 | 2.001 | Tests 1 ⎯⎯⎯⎯⎯⎯⎯; Test Files  1 failed (1); Tests  1 failed / 3 passed (4) |
| user-build-2 | `npm.cmd --prefix apps/frontend-user run build` | 0 | 9.641 |  |
| user-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | 2.964 |  |
| baseline-targeted | `npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ --run` | 0 | None |  |
| baseline-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | None |  |
| before-browser | `PHASE12_CAPTURE=before; npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js --project=chromium` | 0 | None |  |
| negative-before | `npm.cmd --prefix apps/frontend-user test -- src/features/events/Phase12CodexAccountIsolation.test.jsx src/features/dashboard/Phase12CodexDataTruth.test.jsx` | 1 | None |  |
| negative-after | `npm.cmd --prefix apps/frontend-user test -- src/features/events/Phase12CodexAccountIsolation.test.jsx src/features/dashboard/Phase12CodexDataTruth.test.jsx` | 0 | None |  |
| design-targeted | `npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ src/layouts/` | 1 | None |  |
| design-targeted-2 | `npm.cmd --prefix apps/frontend-user test -- src/features/events/ src/features/dashboard/ src/layouts/` | 0 | None |  |
| design-lint | `npm.cmd --prefix apps/frontend-user run lint` | 0 | None |  |
| design-build | `npm.cmd --prefix apps/frontend-user run build` | 0 | None |  |
| design-browser | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js --project=chromium` | 1 | None |  |
| final-cross-phase | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-regressions.config.js` | None | None | INTERRUPTED; not a completed green run |
| corrected-cross-phase | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-regressions.config.js` | None | None | INTERRUPTED; not a completed green run |
| final-owner-33 | `npm.cmd --prefix apps/frontend-user run test:e2e -- --config=playwright.phase12-codex.config.js` | None | None | INTERRUPTED; not a completed green run |
| rollback-initial | `git apply --reverse --check docs/uxui/phase12-codex-owner-dashboard-audit-2026-11-19/evidence/codex-owned-hunks.patch` | 1 | None | Observed tool transcript: LF patch versus CRLF working files did not match. Read-only check; nothing changed. Follow-up --ignore-space-change check passed. |


[Report index](README.md).
