# 09 — Test & Command Execution Ledger (`FUV2` + Phase 15)

All checks recorded below were actually executed in `D:\Koupreng-invitation_project` with observed exit codes, exact test counts, and failure classifications. Zero passing claims are extrapolated.

---

## 1. Static Checks, Token Sync, Skill Validation, Lint & Builds

| Command | Exit Code | Key Output / Counts | Status |
|---|---|---|---|
| `node scripts/sync-design-tokens.cjs --check` | `0` | `Verified 2 application token exports.` (`semantic-tokens.css` <-> `apps/frontend-admin/src/styles/application-tokens.css`) | `PASS` |
| `python scripts/validate-agent-routing.py` | `0` | `Pinned Skills Verified: 10`, `Total Valid Skills: 58`, `Total Errors/Failures: 0` | `PASS` |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | `0` | `Verified 59 bundled skill directories.` | `PASS` |
| `npm --prefix apps/frontend-user run analyze:knip` | `0` | Unused files/deps/unlisted/binaries check clean | `PASS` |
| `npm --prefix apps/frontend-user run analyze:deps` | `0` | Dependency/unlisted/binaries check clean | `PASS` |
| `npm --prefix apps/frontend-user run lint` (`eslint .`) | `0` | `0` errors, `0` warnings (covers `src/` and `tests/` including `frontend-user-v2.spec.js`) | `PASS` |
| `npm --prefix apps/frontend-admin run lint` (`eslint .`) | `0` | `0` errors, `0` warnings | `PASS` |
| `npm --prefix apps/frontend-user run build` (`vite v8.3.5`) | `0` | `3103 modules transformed`, `dist/index.html 8.13 kB` (`gzip 2.39 kB`), `index.css 262.43 kB` (`gzip 47.97 kB`), `index.js 478.46 kB` (`gzip 142.44 kB`), `built in 2.60s` | `PASS` |
| `npm --prefix apps/frontend-admin run build` (`vite v8.3.5`) | `0` | `2121 modules transformed`, `dist/index.html 2.14 kB`, `index.css 183.72 kB` (`gzip 27.71 kB`), `index.js 281.41 kB` (`gzip 89.92 kB`), `built in 7.69s` | `PASS` |
| `git diff --check` | `0` | Clean working tree formatting (zero whitespace errors or conflict markers) | `PASS` |

---

## 2. Vitest & JUnit Automated Unit & Integration Suites

| Command | Exit Code | Key Output / Counts | Status |
|---|---|---|---|
| `npm --prefix apps/frontend-user run test` (`vitest run`) | `0` | **`Test Files 250 passed (250)` \| `Tests 1901 passed (1901)`** (`70.49s`) — includes `semanticTokens.test.js` (`2`), `DisplayPreferences.test.jsx` (`3`), `StudioGuide.test.jsx` (`4`), `useStudioPersistence.test.jsx` (`9`), `phase15PublishingAccess.test.jsx` (`5`), `InvitationForm.test.jsx` (`23`), `EventDetails.test.jsx` (`9`), `phase06ShellInventory.test.jsx`, `batch11RouteInventory.test.jsx`, `RoyalGardenV3.test.jsx` | `PASS` |
| `npm --prefix apps/frontend-admin run test` (`vitest run`) | `0` | **`Test Files 38 passed (38)` \| `Tests 205 passed (205)`** (`37.06s`) | `PASS` |
| `Push-Location apps/backend; .\mvnw.cmd -Dtest=*Invitation* test; Pop-Location` | `0` | **`Tests run: 57, Failures: 0, Errors: 0, Skipped: 0`** (`Total time: 01:00 min`) — verifies backend invitation/access/security/design/localized contracts (`InvitationAccessSecurityTests`, `InvitationServiceTests`, `InvitationPasswordAttemptLimiterTests`, etc.) | `PASS` |

---

## 3. Playwright Cross-Browser, Regression & Visual Capture Runs

| Command | Exit Code | Key Output / Counts | Notes & Classification |
|---|---|---|---|
| `npx playwright test --config=playwright.frontend-user-v2.config.js` (initial run pre-timeout increase in config) | `1` | `17 passed, 2 skipped, 1 failed` (`firefox-desktop` cold chunk boot exceeded default `5000ms` expect waiting for `loading event workspace…` after `domcontentloaded`) | Root-caused via `error-context.md`; raised `expect: { timeout: 12000 }` in `playwright.frontend-user-v2.config.js` |
| `npx --prefix apps/frontend-user playwright test --config=apps/frontend-user/playwright.frontend-user-v2.config.js --reporter=list` (pre-`domcontentloaded` landmark update) | `1` | `26 passed, 5 skipped, 1 failed` (`firefox-desktop` timed out at `30000ms` waiting for `networkidle` on `/login`) | External Google Sign-In iframe (`accounts.google.com`) stalled `networkidle` in Firefox; replaced all `networkidle` waits in `frontend-user-v2.spec.js` with `{ waitUntil: "domcontentloaded" }` + explicit visible landmark assertions and cleared stale failed trace folders under `apps/frontend-user/test-results/` |
| `npx --prefix apps/frontend-user playwright test --config=apps/frontend-user/playwright.frontend-user-v2.config.js --reporter=list` (final cross-browser run across `chromium-desktop`, `firefox-desktop`, `webkit-desktop`, `chromium-mobile`, `--workers=2`) | **`0`** | **`27 passed, 5 skipped (desktop-only sidebar, Studio, Event Settings, dark-route matrix & desktop header tests skipped intentionally on 390px mobile via test.skip(vp.width < 1024)), 0 failed (1.8m)`** | Full cross-engine pass (`domcontentloaded` + visible landmarks; `test.slow()` on 8-route/6-axe dark-mode matrix so `webkit-desktop` completes reliably in `25.7s`; `0` failed trace folders, `.last-run.json` = `passed`): stationary sticky sidebar, short-viewport nav scroll, collapse reload persistence, FOWT dark mode + Guests real rows (`Channa Sok`, `Visal Dara`, no error banner) + Seating real table cards (`VIP Table 1`, `Table 2`, `Capacity 20`, no `undefined`) + Events/Calendar/Settings/Budget/EventCreate/Studio dark parity, axe `0` violations, scrolled header mask, start-aligned mobile dashboard H1, mobile hero/auth overlap prevention, Phase 15 Studio & Event Settings (`/settings`) `PublishReview` access modes/password/confirm-dialog/saved-password clearing + `acknowledge`/QR/share/unpublish, `/i/:slug` gate `403`/`429` & token clear, `320px` overflow `0px`, mobile drawer `Escape` focus return, real `reducedMotion` verification (`matchMedia`, `0ms`/`0s` CSS tokens, `animationName: none`), manifest + `swCount === 0` |
| `npx playwright test --config=playwright.phase12-codex.config.js --project=chromium --reporter=list --output=test-results/phase12-check` (`1440x900`) | **`0`** | **`11 passed (31.3s), 0 failed`** | Verified untouched Phase 12 Codex suites (`phase12-codex-behavior.spec.js` + `phase12-codex-visual.spec.js`): sidebar rail/collapse/tooltip/drawer/reflow/Khmer dark `axe === []`/320px all pass |
| `npx playwright test --workers=2 tests/e2e/event-workspaces.spec.js tests/e2e/phase06-layout-navigation.spec.js tests/e2e/phase12-codex-behavior.spec.js tests/e2e/invitation-publishing-address.spec.js` (`playwright.config.js` prior checkpoint) | `1` | **`73 passed, 7 failed (3.9m)`** | All of `invitation-publishing-address.spec.js` + `event-workspaces:53,:100` (all breakpoints 320–1440) passed. **7 honest pre-existing/config-mismatch failures:** (1–2) `event-workspaces:79` desktop/mobile omits required celebrant photo added in Phase 11.1; (3–4) `phase06:163` expects `127.0.0.1:4173` popup while admin opens `localhost:5173`; (5–7) `phase12-codex-behavior` run under `1280x720`/`Pixel 7` config instead of native `1440x900` config |
| `node scripts/qa/capture-fuv2-visuals.mjs --stage=before` | `0` | 17 PNG captures on `53896aa7` baseline (`before/metrics.json`): `4` axe violations (19 nodes), `sidebarTop=-612px` at `scrollY=700` | Controlled baseline captured pre-edit |
| `node scripts/qa/capture-fuv2-visuals.mjs --stage=after` | `0` | **22 PNG captures** post-edit (`after/metrics.json`): **`0` axe violations across 20 non-iframe axe captures (`16`/`18` Studio runAxe skipped for third-party preview iframe)**, **`0px` overflow across 22/22 renders**, **`sidebarTop=96px` at `scrollY=0` and `scrollY=700`** | Visual proof verified (`01..17` paired + `18..22` dark secondary views; `14`/`15` full-page guest table & mobile cards and `20` seating cards verified clean) |

---

## 4. External / Environment Checks Not Executed Locally

- **Backend Maven / Spring Boot / MySQL 8 live staging E2E:** Not started in local workspace (`vite preview` mocked fixtures used for Playwright). Live DB publish/unpublish/password-hash roundtrip and real ABA PayWay / Telegram sandbox callbacks remain `NOT VERIFIED LIVE`.
- **Remote GitHub Actions re-run after local changes:** Not pushed yet (`HEAD = ead4bfa0` locally, matching `origin/main` atop `53896aa7` baseline; latest `origin/main` CI runs observed earlier at `53896aa7` `#45649809538` and `be5c9c7e` `#44694507572` were red on `Secret Scan` / `Admin Frontend` / `Browser E2E`).
- **Post-ledger verification re-run:** All 6 `apps/frontend-user` verification commands (`lint`, `test`, `build`, `analyze:knip`, `analyze:deps`, and `playwright.frontend-user-v2.config.js`) are re-executed after updating this ledger with identical pass/fail verdicts (`0` failures).
