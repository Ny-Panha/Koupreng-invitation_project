# 00 — Project Recovery, Git SHA State, and Phase Status (`Frontend User 2.0`)

**Prepared / Verified:** 2026-11-26 (`UTC+07:00`)  
**Workspace:** `D:\Koupreng-invitation_project`  
**Default Branch:** `main`

---

## 1. Authoritative Git & Remote State Comparison

| Check | Historical Prompt Reference (2026-11-21) | Initial Local State (pre-sync) | Active Synchronized State |
|---|---|---|---|
| `git rev-parse HEAD` | `be5c9c7e2e2a587f5d6aae7594038880ce015a2e` (Phase 14 dev checkpoint) | `be5c9c7e2e2a587f5d6aae7594038880ce015a2e` | `53896aa72a8eeee6570fb5c75e9b3b867ec27e11` (fast-forwarded from `origin/main`) |
| `git ls-remote origin refs/heads/main` | `be5c9c7e2e2a587f5d6aae7594038880ce015a2e` | `53896aa72a8eeee6570fb5c75e9b3b867ec27e11` (`feat(ui): refresh admin workspace and navigation` by `Kimlong1610`) | `53896aa72a8eeee6570fb5c75e9b3b867ec27e11` |
| Initial dirty / untracked changes | Unknown remotely | **Zero dirty / zero untracked files** | Local Phase 15 & Frontend User 2.0 working set built cleanly atop `53896aa7` |
| `apps/frontend-admin` preservation | Do not alter admin visual UI except verified token sync | Preserved intact | `Kimlong1610`'s `OwnerExperience.css` header centering (`53896aa7`) + `apps/frontend-admin` visual UI preserved; shared tokens synced via `node scripts/sync-design-tokens.cjs` |

---

## 2. GitHub Actions CI Baseline Inspection (Observed via GitHub REST API)

- **Historical Phase 14 Run `44694507572`** (at `be5c9c7e`): **completed — failure**
  - Succeeded (9): `User Frontend Lint, Test, Analysis & Build`, `Real HTTP MySQL Ownership, RBAC & Entitlements`, `Backend Static & Dependency Usage Analysis`, `Telegram Bot Lint, Test & Compile`, `Dependency Vulnerability Audit`, `Admin Frontend Lint, Test, Analysis & Build`, `Deployment Configuration & Docker Applicability`, `Backend Build, Test, Coverage & Static Analysis`, `Fresh MySQL Flyway Migration`
  - Failed (2): `Secret Scan`, `Browser E2E & Route Smoke`
- **Latest `origin/main` Run `45649809538`** (at `53896aa7`): **completed — failure**
  - Failed: `Secret Scan`, `Admin Frontend Lint, Test, Analysis & Build`
  - Skipped: `Browser E2E & Route Smoke` (dependent on earlier jobs)
  - Succeeded: `User Frontend Lint, Test, Analysis & Build`, `Backend Build, Test, Coverage & Static Analysis`, `Fresh MySQL Flyway Migration`, `Real HTTP MySQL Ownership, RBAC & Entitlements`, `Telegram Bot Lint, Test & Compile`, `Dependency Vulnerability Audit`, `Deployment Configuration & Docker Applicability`
  - **Rule enforced:** Remote CI is **NOT** claimed green. Live E2E / GitHub Secret Scan require owner-environment inspection after push.

---

## 3. Phase 15 Recovery Table (`FUV2-08` / `FUV2-09` / `FUV2-G43`)

| Capability / File | State at `53896aa7` Baseline | Gap / Issue Found on Recovery | Resolution Implemented Locally | Status |
|---|---|---|---|---|
| Visibility Selection (`PUBLIC`, `PRIVATE`, `PASSWORD_PROTECTED`) | Backend (`InvitationService.java`) enforces visibility & `accessPassword` hashing, but `InvitationForm.jsx` hardcoded `visibility: "PUBLIC"` with zero UI switcher | Owners had no way in Studio to choose `PRIVATE` or `PASSWORD_PROTECTED` | Added access mode radio group inside `PublishReview.jsx` & `<select>` in `InvitationForm.jsx` authoring panel | `UPGRADED` |
| Password Setting & Rotation (`accessPassword`) | Backend rejects publishing `PASSWORD_PROTECTED` without a hash; Studio never included `accessPassword` in save payload | Publishing password-protected invites from Studio was broken | Added password field (with reveal toggle + saved-password preservation indicator) wired to `PUT /invitations/{id}` + `publishReadiness.js` validation | `UPGRADED` |
| Share Sheet, QR Code & Social Share | `StudioGuide.jsx` step 4 showed basic text link + clipboard copy only | Lacked scannable QR card, SVG download, Telegram/WhatsApp/Web Share actions | Added `<QRCode>` SVG render + `.svg` download + Web Share API + Telegram + WhatsApp links inside `.studio-share-atelier` | `UPGRADED` |
| Studio Unpublish Control | Existed only buried inside Dashboard `<details>` (`"Publication settings"`) | Not exposed in Studio Step 4 confirmation flow | Added `"Unpublish invitation"` with accessible confirmation modal directly in `StudioGuide.jsx` + `InvitationForm.jsx` (`confirm`) while preserving Dashboard controls | `UPGRADED` |
| Protected Public Gate (`/i/:slug` `403` / `429`) | `.protected-gate-card` had zero CSS styling (borderless/invisible `<input>` at 390px), untranslated English errors on Khmer UI, no password reveal, and stale `sessionStorage` token retention | Failed mobile visual usability and stale-token retry UX | Styled `.protected-gate-card` + eye toggle + semantic dark/light tokens, localized `403`/`429` messages, cleared stale `sessionStorage` tokens on `403` | `UPGRADED` |
| Dashboard Mobile Alignment & Overview Dark Contrast | Mobile `ទិដ្ឋភាពទូទៅនៃកម្មវិធី` heading offset; `overview-metric-sub` & `overview-activity p` failed dark contrast | Mobile layout defect & WCAG AA failure in dark mode | Fixed flex alignment + mapped dark surface tokens (`axe=0`) | `UPGRADED` |

---

## 4. Phase Scope Boundaries (`AGENTS.md` & Master Prompt)

- **Phases 06–13:** Historically checkpointed (`53896aa7` baseline retained).
- **Phase 14:** Media & Studio checkpointed (`f14-1-58-acceptance.json`, note `F14.1-26` tally reconciliation documented in `11-security-and-historical-carryover.md`).
- **Phase 15:** `FUV2-G43 = PARTIAL` (`VERIFIED_LOCAL` across Studio, Event Settings, PublishReview, Share Atelier, Protected Gate, Vitest, Playwright cross-browser, and 57/57 backend `*Invitation*` JUnit tests; pending live Spring Boot + MySQL 8 staging publishing acceptance before Phase 15 sign-off).
- **Phases 16–21:** Visual/design-system/theme layers upgraded cleanly via shared shells & semantic tokens **without claiming business milestone sign-off** for future phase scope.
- **Phases 22–27:** Retain workflow scope in `docs/uxui/MASTER_SCOPE.md`. Phases 28–30 do not exist.
