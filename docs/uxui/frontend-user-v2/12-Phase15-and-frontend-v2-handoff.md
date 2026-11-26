# 12 — Phase 15 & Frontend User 2.0 Development Handoff

**Updated:** 2026-11-26 (`UTC+07:00`)  
**Workspace:** `D:\Koupreng-invitation_project`  
**Branch / Base SHA:** `main` atop `53896aa72a8eeee6570fb5c75e9b3b867ec27e11` (reviewed local changes currently uncommitted — not auto-pushed or auto-deployed)

---

## 1. Honest Readiness Summary

| Program Track | Local UI / Contract Verdict | Live Staging / CI Verdict | Evidence Reference |
|---|---|---|---|
| **Frontend User 2.0 Foundations & Visual Refresh (`FUV2-01`..`06`, `13`)** | **VERIFIED — LOCAL** | Not yet run against remote GitHub Actions | `08-after-visual-proof.md`, `09-test-command-ledger.md`, `frontend-user-v2.spec.js` (`27 passed, 5 skipped [desktop-only on mobile], 0 failed`) |
| **Admin Token Compatibility (`apps/frontend-admin`)** | **VERIFIED — LOCAL** | `53896aa7` admin CI job failed remotely prior to token sync; local admin clean | `sync-design-tokens --check`, admin `eslint .`, `38 files / 205 tests`, `vite build` (`2121` modules) |
| **Phase 15: Publishing, Access Control, QR/Share, Unpublish & Gate** | **VERIFIED — LOCAL (`PARTIAL` on acceptance gate `FUV2-G43` pending live staging backend)** | Requires real MySQL/Spring Boot HTTP staging run (`PUT /invitations/{id}`, `publish`, `unpublish`, `403/429` bcrypt rate limit); local JUnit `*Invitation*` `57/57` green | `phase15PublishingAccess.test.jsx`, `StudioGuide.test.jsx`, `useStudioPersistence.test.jsx`, `InvitationForm.test.jsx`, `EventDetails.test.jsx`, `frontend-user-v2.spec.js` (Studio + Event Settings), `mvnw.cmd -Dtest=*Invitation* test` |
| **Phases 16–21 (Player, Guest CRM, RSVP/Wishes, Seating, Tickets, Gifts/Payments)** | Surface styling & tokens upgraded cleanly (`UPGRADED`); **domain acceptance NOT claimed** | Unchanged — each phase keeps its own future business acceptance track per `docs/uxui/MASTER_SCOPE.md` | `01-route-feature-state-inventory.csv` |
| **Phases 22–27 & Phases 28–30** | Phases 22–27 retain approved roadmap; **Phases 28–30 do not exist** | n/a | `AGENTS.md`, `docs/uxui/MASTER_SCOPE.md` |

---

## 2. Explicit Scope Boundaries & Unmodified Guarantees

1. **Template Artwork Isolated (`FUV2-G03`):** Dedicated wedding invitation templates (`royal-garden-cinematic`, `khmer-floral-gold`, `khmer-celestial`, `silk-heritage`, `emerald-canva-luxe-wedding`, `digital-yes`, `with-joy-portal`, `bliss-editorial`) retain independent art direction and are unaffected by dashboard dark mode toggles.
2. **Backend / Flyway / Entitlements / Payment Math Untouched (`FUV2-G32`, `C08-013`, `C10-001`):** Zero changes made to Java backend services, Flyway migrations, ABA PayWay settlement flows, or admin visual screens (`apps/frontend-admin` received only canonical synced CSS tokens in `application-tokens.css`).
3. **PWA Caching Safety Guard (`FUV2-G41`):** Added `manifest.webmanifest` referencing verified PNG app icons (`/branding/icons/icon-192.png`, `/branding/icons/icon-512.png`). Deliberately kept Service Worker registrations at `0` so private `/api/` responses, guest PII, or session auth headers are never cached across account switches.
4. **Pre-existing Playwright Test Caveats Found During Cross-Suite Regression (`task-675`):**
   - `event-workspaces.spec.js:79` (untouched repo test) failed because `/app/events/new` enforces required celebrant/event photo upload before creation while `event-workspaces.spec.js` submits without uploading a photo (`Alert: An event photo is required to complete event creation.`).
   - `phase06-layout-navigation.spec.js:163` (untouched repo test) failed waiting for admin preview popup URL `http://127.0.0.1:4173/templates/event-essential` while default admin preview opened `http://localhost:5173/templates/event-essential`.
   - `phase12-codex-behavior.spec.js:27` fails when mistakenly invoked under `playwright.config.js` (`1280x720`) because `useEventNavigation.js` collapses auto-mode sidebars `< 1440px`, whereas running with its dedicated `playwright.phase12-codex.config.js` (`1440x900`) passed **11/11 tests cleanly** after our sticky sidebar changes.

---

## 3. Safe Git & Publication Next Steps (Human / Owner Decision)

Changes are intentionally **uncommitted locally** for review (no push, force-push, or auto-deploy executed). Before pushing to `origin/main`:
1. Inspect `git status --short` and `git diff --stat` (confirming only intended `apps/frontend-user`, `apps/frontend-admin/src/styles/application-tokens.css`, `scripts/qa/capture-fuv2-visuals.mjs`, and `docs/uxui/frontend-user-v2/` changes are staged).
2. Re-run `node scripts/sync-design-tokens.cjs --check` if any token values are tweaked during review.
3. Run live Spring Boot + disposable MySQL integration verification for Phase 15 (`PUBLIC` / `PRIVATE` / `PASSWORD_PROTECTED` hash retention, `403` / `429` public unlock, `unpublish`) before setting `FUV2-G43` to `VERIFIED_STAGING`.
4. After scoping and pushing a reviewed checkpoint commit to `origin/main`, inspect why GitHub Actions `Secret Scan` and `Browser E2E & Route Smoke` failed historically on runs `#44694507572` / `#45649809538`, plus monitor the new CI run until green.

---

## 4. Concrete Next Engineering Actions

1. **Stage Next Technical Task (`Phase 15` Staging Certification -> `Phase 16` Domain Verification):**
   - Boot Spring Boot + MySQL 8 with test/staging profile, run `invitation` publish/unpublish/password-gate flows end-to-end against real `/api/v1/invitations/*` & `/api/v1/public/invitations/*` endpoints, and verify HTTP `403` / `429` + token issuance.
   - Address remote CI failures (`Secret Scan` false positive or flagged file, and `Browser E2E & Route Smoke`) in `.github/workflows/`.
   - Proceed strictly to **Phase 16** domain verification (ceremonial guest invitation player across all 8 registered renderers) without skipping roadmap chronology.
