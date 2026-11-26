# 11 — Security Boundaries, CI State & Historical Carryover Reconciliation (`FUV2`)

---

## 1. Non-Bypassable Security, Authorization & Financial Boundaries Preserved

- **Authoritative Server Prices & Entitlements (`FUV2-G32`):** Zero pricing math, tier checks, or payment approvals moved to browser UI. `TemplateChooser`, `InvitationForm`, `TemplateCheckoutPage`, and `PaymentStatusPage` remain strictly server-validated (`C08-013`).
- **Guest RSVP & Check-In Privacy (`C10-001`):** Public invitation and RSVP endpoints still expose zero guest directory/phone PII; only non-PII public invitation details or verified token payloads render.
- **Protected / Private Invitation Access Control (`Phase 15` / `FUV2-G43`):**
  - `PUBLIC` / `PRIVATE` / `PASSWORD_PROTECTED` enforcement remains backend-authoritative (`InvitationService.java`).
  - `InvitationForm.jsx` & `EventDetails.jsx` omit blank `accessPassword` strings on re-saves so existing server password hashes are never accidentally cleared or exposed back to client JSON (`hasSavedPassword` displays only an active-state indicator), clear typed `accessPassword` post-save (`useStudioPersistence` `acknowledge` transform in `EventDetails.jsx`), and omit `accessPassword` from `downloadEdits()` recovery JSON.
  - `PublicInvitationFeature.jsx` clears stale `sessionStorage` access tokens immediately upon server `403` rejection and displays non-enumerating localized error feedback on `403`/`429`.
  - `PublicUnavailableView` continues rendering `"Go to Dashboard"` **only** when `isOwner` is authenticated and verified (`lines 132-145, 542`).
- **Admin Visual UI Isolation (`FUV2-G40`):** Zero visual/JSX refactors made to `apps/frontend-admin`; only canonical tokens synced to `application-tokens.css`, followed by `sync-design-tokens --check`, admin `eslint .`, `vitest run` (**38 files / 205 tests pass**), and `vite build`.

---

## 2. Historical Defect Reconciliation (`57` Prior Audit Items + Phase 14.1 `58` Gates)

Reconciled against `docs/uxui/phase14-codex-media-studio-audit-2026-11-20/evidence/f14-1-58-acceptance.json` and `historical-57-itemized-plus-new.json`:

1. **`F14.1-26` Tally Arithmetic Discrepancy Reconciled:**
   - The machine-readable file `f14-1-58-acceptance.json` sums to **`51 VERIFIED — LOCAL, 4 PARTIALLY COMPLETE, 2 REVIEW REQUIRED, 1 BLOCKED — EXTERNAL`** (`= 58`), whereas the companion markdown `27-fifty-eight-independent-gates.md` summarized `50 / 4 / 3 / 1` (double-counting `F14.1-26`).
   - Recorded transparently without altering historical Phase 14 files (`Rule: never rewrite historical audit prose silently`).
2. **Carried Historical Boundaries (`C08-013`, `C10-001`):**
   - `C08-013` (PayWay / Telegram live webhook reconciliation & settlement order finality): `NOT VERIFIED LIVE` inside static frontend Vite preview harness; backend MySQL integration tests cover service contracts cleanly in CI, while live PSP sandbox requires staging credentials.
   - `C10-001` (Public guest/RSVP PII scoping): verified preserved by static contract inspection + unit/E2E public flow checks.
3. **Phase 15 Standing Commitments Fulfilled Locally (`FUV2-G43`):**
   - Closed Phase 15 authoring/publishing/access gaps in `InvitationForm.jsx`, `EventDetails.jsx`, `useStudioPersistence.js`, `PublishReview.jsx`, `StudioGuide.jsx`, `publishReadiness.js`, and `PublicInvitationFeature.jsx` (`EventDetails.test.jsx` `9/9`, `useStudioPersistence.test.jsx` `9/9`, `InvitationForm.test.jsx` `22/22`, `phase15PublishingAccess.test.jsx` `5/5`, `StudioGuide.test.jsx` `4/4`, plus Playwright cross-browser Studio & Event Settings pass).

---

## 3. GitHub Actions CI Run Classification (Observed via Public GitHub API)

| Workflow Run | Commit SHA | Succeeded Jobs | Failed / Skipped Jobs | Honest Classification |
|---|---|---|---|---|
| `#44694507572` (Historical Phase 14) | `be5c9c7e2e2a587f5d6aae7594038880ce015a2e` | `9` (`User Frontend`, `Admin Frontend`, `Backend Build/Test`, `MySQL Flyway`, `Real HTTP MySQL`, `Backend Static`, `Telegram Bot`, `Dependency Audit`, `Docker Config`) | **`Secret Scan: failure`**, **`Browser E2E & Route Smoke: failure`** | **CI RED** — needs renewed CI run & log fix on GitHub Actions |
| `#45649809538` (Latest `origin/main` before local edits) | `53896aa72a8eeee6570fb5c75e9b3b867ec27e11` | `8` (`User Frontend`, `Backend Build/Test`, `MySQL Flyway`, `Real HTTP MySQL`, `Backend Static`, `Telegram Bot`, `Dependency Audit`, `Docker Config`) | **`Secret Scan: failure`**, **`Admin Frontend: failure`**, `Browser E2E & Route Smoke: skipped` | **CI RED** — `Admin Frontend` failed on `53896aa7` remotely; locally `frontend-admin` passes `lint`, `205/205` vitest, and `vite build` after token sync |

**Critical Honesty Statement:** Local passes (`eslint`, `vitest`, `knip`, `vite build`, `playwright`) verify our local repository state (`53896aa7` + Frontend User 2.0 + Phase 15 working changes). Remote GitHub Actions **`Secret Scan`** and **`Browser E2E & Route Smoke`** require a clean commit/push + remote CI re-run inspection before CI can ever be reported green.
