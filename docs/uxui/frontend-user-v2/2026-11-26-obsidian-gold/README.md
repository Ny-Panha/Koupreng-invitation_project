# Frontend User 2.1 — Obsidian Black × Champagne Gold Dark Mode Refinement

**Date:** 2026-11-26 (`UTC+07:00`)  
**Workstream Label:** Frontend User 2.0 Refinement (`2.1` working design label — **not** a new numbered UX/UI master-scope phase, **not** Phase 15 completion, **not** advancing to Phase 16)  
**Baseline HEAD:** `027c5d07c1dbfa1491b1917098b0b25fe3e2ac72` (`main`, matching `origin/main` before local edits)  
**Checkpoint Posture:** Uncommitted, reviewable local checkpoint in `D:\Koupreng-invitation_project` (no auto-commit, push, or deployment performed).

---

## 1. Mission & Scope Boundaries Preserved

- Replaced the Frontend User 2.0 green-black (`#111A17` / `#182520` / `#20312B`) dark theme in `apps/frontend-user` with neutral **Obsidian Black × Champagne Gold** (`#090909`..`#303030` `R=G=B` surfaces with `#D8B875` / `#E8CC91` champagne-gold accents, `#32291A` gold-tinted active highlights, and `#FAFAFA` / `#A3A3A3` neutral text).
- Preserved light mode (`#FBF6EE` body canvas, `#FFFEFB` surfaces, and the Deep Botanical light rail `#172B25`), stationary sticky desktop sidebar (`sidebarTop=96px` at `scrollY=0` and `scrollY=700`), independent sidebar menu scrolling, responsive 320px–1440px reflow, existing `120–240ms` UI motion and `prefers-reduced-motion` zeros, FOWT prevention (`public/color-mode.js`), and isolated ceremonial invitation renderers (`#FBF6EE` cream public canvas preserved even with `data-color-mode="dark"`).
- Preserved security, privacy, pricing/entitlement, USD/KHR ledger separation, and Phase 15 publishing/access contracts (`C10-001`, unresolved external staging `C08-013`, `serviceWorker` registration count `=== 0`, synthetic fixtures only).

---

## 2. Reference Research & Library Evaluation (2.1 Scope)

### 2.1 `ui-ux-pro-max` Query Execution

Executed `python .agents/skills/ui-ux-pro-max/scripts/search.py` against local skill databases on `2026-11-26T14:56:15+07:00`..`14:56:21+07:00` (`Exit Code: 0`):

1. `search.py "Obsidian Black Champagne Gold luxury event SaaS dark mode" --design-system --project-name "KoupReng Obsidian Gold"`:
   - Highlighted `>= 4.5:1` CTA/text contrast, independent visible focus/control boundaries, reduced-motion safety, SVG-only icons, and `150–300ms` transitions. Its generic slate/blue-orange auto-palette was explicitly rejected in favor of KoupReng's `#090909`..`#303030` obsidian grayscale and `#D8B875`/`#E8CC91` champagne gold.
2. `search.py "dark mode contrast focus accessibility" --domain ux`:
   - Applied WCAG 2.2 AA `>= 4.5:1` normal text, crisp non-obscured `:focus-visible` indicator (`#F0CF8B` `>= 3:1`), and elimination of gray-on-gray / white-on-white regressions (`#777777` control borders, `#FFB4AB` dark danger text, dark table/notification surfaces).
3. `search.py "typography scale hierarchy dark" --domain typography`:
   - Retained Koupreng's verified self-hosted Latin/Khmer pairing (`DM Sans` + `Kantumruy Pro` + `Moul` display) and `:root[lang="km"]` leading (`line-height: 1.8`) across obsidian surfaces.

### 2.2 `60fps.design`, `lawsofux.com`, and Ten Canonical UI Libraries

- **`60fps.design` & `lawsofux.com`:**
  - *Figure-Ground & Von Restorff Restraint:* Neutral `R=G=B` surfaces prevent chromatic visual fatigue while reserving champagne gold (`#D8B875` / `#E8CC91` / `#32291A`) strictly for active navigation, primary CTAs, links, and focus clarity.
  - *Aesthetic-Usability & Doherty Threshold:* Preserved crisp `120–240ms` state transitions and geometry-matched neutral charcoal skeletons (`Skeleton.css`) scoped away from isolated public invitations so loading states never flash dark blocks onto cream guest invitations.
  - *Hick's Law & Jakob's Law:* Preserved existing sidebar/top-nav taxonomy and native keyboard/form semantics without restructuring workflows.
- **Ten Canonical UI Libraries (Narrow 2.1 CSS-Token Refinement; 0 New Dependencies Added):**
  - *Reused existing primitives (`shadcn/ui`-style `Modal.jsx` / `ConfirmDialog.jsx`, `framer-motion` `<MotionConfig reducedMotion="user">`)* and existing CSS token architecture.
  - *Inspired only (no external code or asset imports):* Animate UI (tactile press timing), Lightswind UI (clear focus rings without neon blur bloat), Untitled UI React (neutral monochrome border/surface hierarchy), Kokonut UI (high-contrast segmented/radio states), Badtz UI, React Bits, Aceternity UI, Magic UI, and Skiper UI.

---

## 3. Canonical Token Mapping & Computed WCAG 2.2 AA Contrast

Updated canonical source [`apps/frontend-user/src/shared/styles/semantic-tokens.css`](../../../apps/frontend-user/src/shared/styles/semantic-tokens.css) (`:root.dark`, `:root[data-color-mode="dark"]`, and `--ui-studio-*`) and regenerated [`apps/frontend-admin/src/styles/application-tokens.css`](../../../apps/frontend-admin/src/styles/application-tokens.css) via `node scripts/sync-design-tokens.cjs`.

| Role / Pair | Dark Token / Value | Paired Against | Measured Contrast Ratio | Requirement Status |
|---|---|---|---|---|
| Canvas / Inset | `--ui-theme-canvas`, `--ui-theme-inset` = `#090909` | `--ui-theme-ink` (`#FAFAFA`) | **19.08:1** | Pass (`>= 4.5:1`) |
| Card / Surface | `--ui-theme-surface` = `#141414` | `--ui-theme-ink` (`#FAFAFA`) | **17.65:1** | Pass (`>= 4.5:1`) |
| Subtle / Interactive | `--ui-theme-subtle`, `--ui-theme-interactive` = `#1C1C1C` | `--ui-theme-ink` (`#FAFAFA`) | **16.33:1** | Pass (`>= 4.5:1`) |
| Raised / Overlay | `--ui-theme-raised`, `--ui-theme-overlay` = `#242424` | `--ui-theme-ink` (`#FAFAFA`) | **14.87:1** | Pass (`>= 4.5:1`) |
| Secondary Action | `--ui-theme-secondary-action` = `#262626` | `--ui-theme-on-secondary-action` (`#FAFAFA`) | **14.50:1** | Pass (`>= 4.5:1`) |
| Muted Text | `--ui-theme-muted` = `#A3A3A3` | `#090909` / `#141414` / `#1C1C1C` / `#242424` | **7.89:1 / 7.30:1 / 6.76:1 / 6.15:1** | Pass (`>= 4.5:1`) |
| Disabled State | `--ui-theme-disabled` (`#A3A3A3`) | `--ui-theme-disabled-bg` (`#202020`) | **6.46:1** | Pass (`>= 4.5:1`) |
| Primary Action & Hover | `--ui-theme-on-action` (`#141414`) | `#D8B875` / `#E8CC91` | **9.68:1 / 11.82:1** | Pass (`>= 4.5:1`) |
| Gold / Link on Dark | `--ui-theme-gold`, `--ui-theme-link` (`#D8B875`) | `#090909` / `#141414` / `#32291A` | **10.46:1 / 9.68:1 / 7.52:1** | Pass (`>= 4.5:1`) |
| Rail Active State | `--ui-rail-bg` (`#0D0D0D`), `--ui-rail-gold` (`#E8CC91`) | `--ui-rail-active-bg` (`#32291A`) | **9.18:1** | Pass (`>= 4.5:1`) |
| Focus Ring | `--ui-theme-focus` (`#F0CF8B`) | `#090909` / `#141414` | **13.28:1 / 12.28:1** | Pass (`>= 3.0:1`) |
| Control Border | `--ui-theme-control-border` (`#777777`) | `#090909` / `#141414` / `#1C1C1C` / `#242424` | **4.45:1 / 4.11:1 / 3.81:1 / 3.47:1** | Pass (`>= 3.0:1` UI boundary) |
| Semantic Danger | `--ui-theme-danger` (`#FFB4AB`) | `#141414` | **10.85:1** | Pass (`>= 4.5:1`) |
| Semantic Success | `--ui-theme-success` (`#86EFAC`) | `#141414` | **13.12:1** | Pass (`>= 4.5:1`) |
| Semantic Warning / Info | `#F2CB82` on `#32291A` / `#93C5FD` on `#172B42` | Respective soft badges | **9.29:1 / 7.97:1** | Pass (`>= 4.5:1`) |
| Decorative Divider / Scrim | `--ui-theme-border` (`#303030`), `--ui-theme-pressed` (`#303030`), `--ui-theme-scrim` (`rgb(0 0 0 / 68%)`) | — | Structural separation | Decorative / Overlay |

---

## 4. Scope of Shared Admin Token Sync

- **Changed Admin File:** [`apps/frontend-admin/src/styles/application-tokens.css`](../../../apps/frontend-admin/src/styles/application-tokens.css) (`+61 / -61` lines, generated exclusively by `node scripts/sync-design-tokens.cjs`).
- **Admin Redesign:** None. Zero admin JSX, routes, or feature styles were edited.
- **Admin Sanity Verification:** `node scripts/sync-design-tokens.cjs --check`, `npm --prefix apps/frontend-admin run lint`, `npm --prefix apps/frontend-admin run build` (`2121 modules transformed`), and `npm --prefix apps/frontend-admin run test` (`38 files / 205 tests`) all exited `0` after the final edit.
- **Pre-existing Admin CI Issue Preserved Honestly:** `npm --prefix apps/frontend-admin run analyze:knip` fails on pre-existing unused file `apps/frontend-admin/src/features/dashboard/components/AnimatedNumber.jsx` from upstream commit `027c5d07` (unchanged by 2.1).

---

## 5. Exact Changed & New Files (`git status --short`)

`33` tracked files modified (`+752 / -360` lines via `git diff --stat`), `2` untracked artifacts/scripts added:

### Modified Source & Test Files
1. `apps/frontend-admin/src/styles/application-tokens.css` (generated token sync)
2. `apps/frontend-user/src/shared/styles/semantic-tokens.css`
3. `apps/frontend-user/src/shared/styles/app-experience.css`
4. `apps/frontend-user/src/shared/styles/semanticTokens.test.js`
5. `apps/frontend-user/src/shared/ui/ConfirmDialog.css`
6. `apps/frontend-user/src/shared/ui/RouteErrorBoundary.css`
7. `apps/frontend-user/src/shared/ui/Skeleton.css`
8. `apps/frontend-user/src/shared/ui/Toast.css`
9. `apps/frontend-user/src/layouts/HostShell.css`
10. `apps/frontend-user/src/layouts/OwnerExperience.css`
11. `apps/frontend-user/src/layouts/components/MarketingChrome.css`
12. `apps/frontend-user/src/features/auth/AuthPage.css`
13. `apps/frontend-user/src/features/events/components/EventCalendar.css`
14. `apps/frontend-user/src/features/events/onboarding/EventCreatePage.css`
15. `apps/frontend-user/src/features/events/onboarding/EventDetails.css`
16. `apps/frontend-user/src/features/events/workspace/EventWorkspace.css`
17. `apps/frontend-user/src/features/gifts/GiftsFeature.css`
18. `apps/frontend-user/src/features/gifts/components/GiftTable.jsx`
19. `apps/frontend-user/src/features/guests/GuestWorkspace.css`
20. `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx`
21. `apps/frontend-user/src/features/invitations/InvitationForm.jsx`
22. `apps/frontend-user/src/features/invitations/InvitationPages.css`
23. `apps/frontend-user/src/features/invitations/MediaLibrary.css`
24. `apps/frontend-user/src/features/invitations/studio/StudioChrome.css`
25. `apps/frontend-user/src/features/invitations/studio/StudioGuide.jsx`
26. `apps/frontend-user/src/features/marketing/MarketingFeature.css`
27. `apps/frontend-user/src/features/marketing/MarketingPages.css`
28. `apps/frontend-user/src/features/marketing/VenuesFeature.css`
29. `apps/frontend-user/src/features/marketing/components/LandingHero.css`
30. `apps/frontend-user/src/features/templates/components/PublicTemplateDevicePreview.css`
31. `apps/frontend-user/src/features/templates/components/templates.css`
32. `apps/frontend-user/src/features/templates/pages/BrowseTemplates.css`
33. `apps/frontend-user/tests/e2e/frontend-user-v2.spec.js`

### Added QA Script & Evidence Directory
- `scripts/qa/capture-obsidian-gold-visuals.mjs`
- `docs/uxui/frontend-user-v2/2026-11-26-obsidian-gold/` (`README.md`, `evidence/before/` 25 PNGs + `metrics.json`, `evidence/after/` 30 PNGs + `metrics.json`)

---

## 6. Before / After Screenshots & Computed Color/Axe Summary

Captured against production `vite preview` builds using Chromium + `@axe-core/playwright` (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`):
- **BEFORE (`evidence/before/`, captured on untouched `027c5d07`):** `25` captures — green-black canvas (`rgb(17, 26, 23)`), green cards (`rgb(24, 37, 32)` / `rgb(32, 49, 43)`), white card leaks on Notifications (`rgb(255, 255, 255)`) & RSVP table, plus `2` failing axe runs (`21-rsvp-dark-en-1440.png`: `3` contrast nodes; `22-notifications-dark-en-1440.png`: `3` contrast nodes).
- **AFTER (`evidence/after/`, captured after final edits):** `30` captures (`01..25` 1:1 pairs + `26..30` additional matrix coverage for `1024x768`, Gifts, Check-In, Analytics, Template Demo):
  - **`0` axe violations** across all `27` audited captures (`17-studio-dark`, `25-public-invitation`, and `30-template-demo` run with `runAxe: false` to exclude third-party preview iframe / guest art).
  - **`0px` horizontal overflow** across all `30/30` captures (`320x568`, `390x844`, `768x1024`, `844x390`, `1024x768`, `1440x900`).
  - **Neutral grayscale confirmed (`R=G=B`):** All `26` dark-mode management/marketing/auth/gate captures measured `body=rgb(9, 9, 9)`, `card=rgb(20, 20, 20)` or `rgb(28, 28, 28)`, `rail=rgb(13, 13, 13)`, `hdr=rgb(20, 20, 20)`.
  - **Stationary desktop sidebar confirmed:** `11-dashboard-dark-en-1440.png` (`scrollY=0`) -> `sidebarTop=96`; `12-dashboard-dark-scrolled-1440.png` (`scrollY=700`) -> `sidebarTop=96`.
  - **Light mode & template isolation confirmed:** `02-home-light-en-1440.png` (`body=rgb(251, 246, 238)`), `13-dashboard-light-en-1440.png` (`body=rgb(251, 246, 238)`, `card=rgb(255, 254, 251)`), `25-public-invitation-isolated-dark-390.png` (`body=rgb(251, 246, 238)`, Khmer Floral Gold intact), `30-template-demo-dark-en-1440.png` (`body=rgb(251, 246, 238)`, isolated demo art intact).

| # | Capture File | Route | Viewport | Locale / Theme | BEFORE Highlight | AFTER Computed State | Axe Violations (After) |
|---|---|---|---|---|---|---|---|
| 01 | `01-home-dark-en-1440.png` | `/` | `1440x900` | `en` / `dark` | Green `#111A17` canvas & pill | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 02 | `02-home-light-en-1440.png` | `/` | `1440x900` | `en` / `light` | Light baseline | `body=rgb(251,246,238)` `0px` | `0` |
| 03 | `03-home-dark-km-390.png` | `/` | `390x844` | `km` / `dark` | Green hero/rail tones | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 04 | `04-login-dark-en-1440.png` | `/login` | `1440x900` | `en` / `dark` | Green blob & card | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 05 | `05-templates-dark-en-1440.png` | `/templates` | `1440x900` | `en` / `dark` | Green/slate surfaces | `body=rgb(9,9,9)` `hdr=rgb(20,20,20)` `0px` | `0` |
| 06 | `06-pricing-dark-en-1440.png` | `/pricing` | `1440x900` | `en` / `dark` | Green surfaces | `body=rgb(9,9,9)` `hdr=rgb(20,20,20)` `0px` | `0` |
| 07 | `07-venues-dark-en-1440.png` | `/venues` | `1440x900` | `en` / `dark` | Green surfaces | `body=rgb(9,9,9)` `hdr=rgb(20,20,20)` `0px` | `0` |
| 08 | `08-events-dark-en-1440.png` | `/app/events` | `1440x900` | `en` / `dark` | Green workspace | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 09 | `09-events-dark-km-320.png` | `/app/events` | `320x568` | `km` / `dark` | Green workspace | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 10 | `10-events-calendar-dark-en-1440.png` | `/app/events?view=calendar` | `1440x900` | `en` / `dark` | Green calendar accents | `body=rgb(9,9,9)` `hdr=rgb(20,20,20)` `0px` | `0` |
| 11 | `11-dashboard-dark-en-1440.png` | `/app/events/42` | `1440x900` | `en` / `dark` | `rgb(15,24,21)` rail / `rgb(24,37,32)` cards | `rail=rgb(13,13,13)` `sidebarTop=96` `0px` | `0` |
| 12 | `12-dashboard-dark-scrolled-1440.png` | `/app/events/42` | `1440x900` | `en` / `dark` | Green rail (`scrollY=700`) | `rail=rgb(13,13,13)` `sidebarTop=96` `0px` | `0` |
| 13 | `13-dashboard-light-en-1440.png` | `/app/events/42` | `1440x900` | `en` / `light` | Light baseline | `body=rgb(251,246,238)` `card=rgb(255,254,251)` | `0` |
| 14 | `14-dashboard-dark-tablet-768.png` | `/app/events/42` | `768x1024` | `en` / `dark` | Green dark mode | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 15 | `15-dashboard-dark-landscape-844x390.png` | `/app/events/42` | `844x390` | `en` / `dark` | Green dark mode | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 16 | `16-guests-dark-km-1440.png` | `/app/events/42/guests` | `1440x900` | `km` / `dark` | Green dark mode | `body=rgb(9,9,9)` `rail=rgb(13,13,13)` `0px` | `0` |
| 17 | `17-studio-dark-en-1440.png` | `/app/events/42/invitation` | `1440x900` | `en` / `dark` | `#0F172A` studio panels | `body=rgb(9,9,9)` neutral panels `0px` | N/A (iframe) |
| 18 | `18-settings-dark-en-1440.png` | `/app/events/42/settings` | `1440x900` | `en` / `dark` | Green dark mode | `body=rgb(9,9,9)` `rail=rgb(13,13,13)` `0px` | `0` |
| 19 | `19-seating-dark-en-1440.png` | `/app/events/42/seating` | `1440x900` | `en` / `dark` | Green dark mode | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 20 | `20-budget-dark-en-1440.png` | `/app/events/42/budget` | `1440x900` | `en` / `dark` | Green dark mode | `body=rgb(9,9,9)` `card=rgb(28,28,28)` `0px` | `0` |
| 21 | `21-rsvp-dark-en-1440.png` | `/app/events/42/rsvp` | `1440x900` | `en` / `dark` | White container & `axe=1` (3 nodes) | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 22 | `22-notifications-dark-en-1440.png` | `/app/notifications` | `1440x900` | `en` / `dark` | White `.notif-stat` & `axe=1` (3 nodes) | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 23 | `23-profile-dark-en-1440.png` | `/app/profile` | `1440x900` | `en` / `dark` | Green dark mode | `body=rgb(9,9,9)` `hdr=rgb(20,20,20)` `0px` | `0` |
| 24 | `24-public-password-gate-dark-km-390.png` | `/i/protected-sample` | `390x844` | `km` / `dark` | Green card & body cream | `body=rgb(9,9,9)` `card=rgb(20,20,20)` `0px` | `0` |
| 25 | `25-public-invitation-isolated-dark-390.png` | `/i/vannak-kolab-2027` | `390x844` | `km` / `dark` | Pre-fix waited on skeleton | Isolated cream `body=rgb(251,246,238)` `0px` | N/A (art) |
| 26 | `26-dashboard-dark-laptop-1024.png` | `/app/events/42` | `1024x768` | `en` / `dark` | AFTER-only coverage | `body=rgb(9,9,9)` `rail=rgb(13,13,13)` `0px` | `0` |
| 27 | `27-gifts-dark-en-1440.png` | `/app/events/42/gifts` | `1440x900` | `en` / `dark` | AFTER-only coverage (caught & fixed `.wg-inline-error` & method pill) | `body=rgb(9,9,9)` `rail=rgb(13,13,13)` `0px` | `0` |
| 28 | `28-checkin-dark-en-1440.png` | `/app/events/42/check-in` | `1440x900` | `en` / `dark` | AFTER-only coverage (caught & fixed 6 contrast nodes) | `body=rgb(9,9,9)` `rail=rgb(13,13,13)` `0px` | `0` |
| 29 | `29-analytics-dark-en-1440.png` | `/app/events/42/analytics` | `1440x900` | `en` / `dark` | AFTER-only coverage | `body=rgb(9,9,9)` `rail=rgb(13,13,13)` `0px` | `0` |
| 30 | `30-template-demo-dark-en-1440.png` | `/templates/khmer-floral-gold/demo` | `1440x900` | `en` / `dark` | AFTER-only coverage | Isolated cream `body=rgb(251,246,238)` `0px` | N/A (art) |

---

## 7. Post-Final-Edit Test & Verification Ledger

All checks below ran cleanly after the final source edits (`InvitationCheckInPage.jsx` & `InvitationPages.css`):

| Command | Exit Code | Exact Observed Results |
|---|---|---|
| `node scripts/sync-design-tokens.cjs --check` | `0` | `Verified 2 application token exports.` |
| `python scripts/validate-agent-routing.py` | `0` | `Pinned Skills Verified : 10`, `Total Valid Skills : 58`, `Total Errors/Failures : 0` |
| `git diff --check` | `0` | Clean (no conflict markers or trailing whitespace errors) |
| `npm --prefix apps/frontend-user run lint` | `0` | `eslint .` clean (`0` errors, `0` warnings) |
| `npm --prefix apps/frontend-user run analyze:knip` | `0` | Clean (`files,dependencies,unlisted,binaries`) |
| `npm --prefix apps/frontend-user run analyze:deps` | `0` | Clean (`dependencies,unlisted,binaries`) |
| `npm --prefix apps/frontend-user run build` | `0` | `✓ 3103 modules transformed.`, `built in 2.07s` |
| `npm --prefix apps/frontend-user run test` | `0` | `Test Files 250 passed (250)` \| `Tests 1901 passed (1901)` — includes `Phase10Identity.test.jsx` (`52`), `templateRegistry.test.jsx` (`9`), `semanticTokens.test.js` (`2`), `phase15PublishingAccess.test.jsx` (`5`), `StudioGuide.test.jsx` (`4`), `useStudioPersistence.test.jsx` (`9`), `InvitationForm.test.jsx` (`23`), `EventDetails.test.jsx` (`9`), `batch11RouteInventory.test.jsx` (`2`), `phase06ShellInventory.test.jsx` (`1`) |
| `npm --prefix apps/frontend-admin run lint` | `0` | Clean |
| `npm --prefix apps/frontend-admin run build` | `0` | `✓ 2121 modules transformed.`, `built in 754ms` |
| `npm --prefix apps/frontend-admin run test` | `0` | `Test Files 38 passed (38)` \| `Tests 205 passed (205)` |
| `npx --prefix apps/frontend-user playwright test --config=apps/frontend-user/playwright.frontend-user-v2.config.js --reporter=list` | `0` | `27 passed, 5 skipped (1.3m)` across `chromium-desktop`, `firefox-desktop`, `webkit-desktop`, `chromium-mobile` (`5` desktop-only tests intentionally skipped on `390px` mobile via `test.skip(vp.width < 1024)`) |
| `node scripts/qa/capture-obsidian-gold-visuals.mjs --stage=after` | `0` | `30/30` captures green: `0` axe violations (`27/27` audited), `0px` overflow (`30/30`), neutral `R=G=B` across all dark app shells |

---

## 8. Reconciliation of `FUV2-G39` & CI Run `45778347228`

### 8.1 `FUV2-G39` Historical Count Reconciliation
- In the pre-existing Frontend User 2.0 record (`docs/uxui/frontend-user-v2/evidence/acceptance-gates.json`, preserved untouched), `FUV2-G39` summarizes `"250/250 Vitest (1900 tests) ... 3102 user modules"`.
- In `docs/uxui/frontend-user-v2/09-test-command-ledger.md`, the actual recorded post-2.0 totals were already `250 files / 1901 tests` and `3103` user modules (because of `1` added test/module prior to 2.1).
- In this 2.1 refinement, `apps/frontend-user` remains `250 files / 1901 passed tests` (including new `R=G=B` assertions in existing `semanticTokens.test.js` without inflating test counts) and `3103 modules transformed`. Both historical and current counts are preserved transparently without altering prior 2.0 evidence files.

### 8.2 Upstream CI Run `45778347228` on Baseline `027c5d07`
Observed live via GitHub Actions API on `027c5d07c1dbfa1491b1917098b0b25fe3e2ac72` (conclusion `failure`, unchanged since local 2.1 changes are uncommitted):
- `Backend Build, Test, Coverage & Static Analysis`: `success`
- `Deployment Configuration & Docker Applicability`: `success`
- `Dependency Vulnerability Audit`: `success`
- `Real HTTP MySQL Ownership, RBAC & Entitlements`: `success`
- `User Frontend Lint, Test, Analysis & Build`: `success`
- `Backend Static & Dependency Usage Analysis`: `success`
- `Telegram Bot Lint, Test & Compile`: `success`
- `Fresh MySQL Flyway Migration`: `success`
- **`Secret Scan` (`.github/workflows/ci.yml` Gitleaks `dir .`):** **`failure`**
- **`Admin Frontend Lint, Test, Analysis & Build`:** **`failure`** (reproduced locally: `npm --prefix apps/frontend-admin run analyze:knip` reports unused `src/features/dashboard/components/AnimatedNumber.jsx`)
- **`Browser E2E & Route Smoke`:** **`skipped`**

---

## 9. Individual Evaluation of All Ten 2.1 Acceptance Gates

| Gate | Requirement Summary | Status | Observed Evidence |
|---|---|---|---|
| **Gate 1** | Neutral grayscale (`R=G=B`) on dark management canvas, card, rail, overlay, default interactive surfaces; restrained gold active & true semantic states | **PASS (Verified Locally)** | `semanticTokens.test.js` (`2/2`), `frontend-user-v2.spec.js` `R=G=B` & surface checks across Chromium/Firefox/WebKit (`27/27`), `capture-obsidian-gold-visuals.mjs` `after/metrics.json` (`body=rgb(9,9,9)`, `card=rgb(20,20,20)` / `rgb(28,28,28)`, `rail=rgb(13,13,13)`), visual inspection of dark screenshots |
| **Gate 2** | Light mode & light botanical rail preserved; zero FOWT or theme regression | **PASS (Verified Locally)** | `02-home-light-en-1440.png`, `13-dashboard-light-en-1440.png` (`body=rgb(251,246,238)`, `card=rgb(255,254,251)`, light rail unchanged); FOWT test passes across Chromium, Firefox, WebKit |
| **Gate 3** | Registered invitation renderers & protected preview iframe retain authored styling | **PASS (Verified Locally)** | `templateRegistry.test.jsx` (`9/9`) and `Phase10Identity.test.jsx` (`52/52`) verify all `10` dedicated renderer components (`38` alias keys in `templateRegistry.js`); `25-public-invitation-isolated-dark-390.png` & `30-template-demo-dark-en-1440.png` confirm isolated `#FBF6EE` cream rendering with `Skeleton.css` dark leak fixed |
| **Gate 4** | Studio chrome neutral obsidian/gold; exported/previewed invitation art unchanged | **PASS (Verified Locally)** | `StudioChrome.css` + `StudioGuide.jsx` (`fgColor="#141414"` QR), `17-studio-dark-en-1440.png` (`body=rgb(9,9,9)`), `frontend-user-v2.spec.js` Studio Playwright tests pass across all desktop browsers |
| **Gate 5** | WCAG 2.2 AA contrast (`4.5:1` / `3:1`), `#777777` control borders, keyboard focus, axe `0` violations with transparent exclusions | **PASS (Verified Locally)** | Computed contrast ratios (`3.47:1`–`19.08:1`), `0` axe violations across all `27/27` non-iframe/non-art AFTER captures (fixed prior RSVP/Notifications/Gifts/Check-In failures); transparent exclusions: `17-studio-dark` iframe preview, `25-public-invitation` & `30-template-demo` guest invitation art |
| **Gate 6** | Zero horizontal overflow, no focus clipping/sidebar displacement/stuck body scroll across viewport matrix | **PASS (Verified Locally)** | `320x568`, `390x844`, `768x1024`, `844x390`, `1024x768`, `1440x900` all `overflowPx=0`; `sidebarTop=96` at `scrollY=0` & `700`; mobile drawer `Escape` focus return + Chromium/Firefox/WebKit/Mobile E2E green (browser emulation only; no physical hardware claim) |
| **Gate 7** | Loading/empty/error/success/disabled/selected/hover/focus/pressed coherent; `reducedMotion` & dark menus/charts readable | **PASS (Verified Locally)** | `Skeleton.css` neutral dark skeletons scoped cleanly, `Toast.css`, `ConfirmDialog.css`, `RouteErrorBoundary.css`, `GiftsFeature.css`, `InvitationCheckInPage.jsx`, reduced-motion E2E check (`0ms`/`0s` CSS vars + `animationName: none`) pass |
| **Gate 8** | Existing functional/security regression & Phase 15 client tests pass; external staging & CI blockers preserved | **PASS LOCAL / PARTIAL EXTERNAL** | `250/250` user Vitest (`1901` tests, incl. Phase 15 client suites) + `27/27` Playwright (`5` desktop-only skipped on mobile); external live Spring Boot + MySQL 8 Phase 15 staging (`FUV2-G43`) & remote CI fixes (`FUV2-G44`) remain open/external |
| **Gate 9** | Shared-token parity & admin sanity checks pass; no unrelated admin/backend edits | **PASS (Verified Locally)** | `sync-design-tokens.cjs --check` pass, only `application-tokens.css` synced in admin, admin lint/build/`38/38` Vitest pass |
| **Gate 10** | Visual proof of botanical-green removal without fabricated staging/hardware/live-PSP claims | **PASS (Verified Locally)** | Direct inspection of paired BEFORE vs AFTER screenshots (`01`, `08`, `11`, `16`, `19`, `20`, `21`, `22`, `24`, `25`, `26`, `27`, `28`, `29`, `30`) confirms transition from green-black `#111A17`/`#182520` + white card leaks to Obsidian Black `#090909`/`#141414` × Champagne Gold `#D8B875` |

---

## 10. Unresolved Risks & Next Engineering Steps

1. **GitHub Actions CI Blockers (Pre-existing on `027c5d07`):** Investigate and resolve the `Secret Scan` (Gitleaks) finding and the admin `analyze:knip` unused-file failure (`AnimatedNumber.jsx`) before expecting green CI on `main`.
2. **Phase 15 Live HTTP + MySQL 8 Staging Verification (`FUV2-G43`):** Run genuine Spring Boot + MySQL 8 HTTP staging checks (`PUBLIC` / `PRIVATE` / `PASSWORD_PROTECTED` roundtrips, `403`/`429` bcrypt rate limit, publish/unpublish) and browser route-smoke before claiming Phase 15 complete or beginning Phase 16.
3. **Physical Device Validation:** Mobile `320px`/`390px`/`844x390` checks used Playwright headless browser emulation rather than physical iOS Safari / Android Chrome hardware.
