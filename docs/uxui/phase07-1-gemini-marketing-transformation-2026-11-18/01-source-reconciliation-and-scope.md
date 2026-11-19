# 01 — Source Reconciliation and Route Scope

## 1. Git Baseline Reconciliation

Before any code modification, the local working directory and git references were strictly inspected:

```bash
git branch --show-current
# main

git rev-parse HEAD
# 2429b76545b683fad2a0a6f328bee3264875edc3

git rev-parse origin/main
# 4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4

git status --short
# (clean working tree at start)

git log --oneline -18
# 2429b765 docs(uxui): reconcile phase06 evidence and cross-phase gates
# e0a331ff test(navigation): require home content before scroll assertions
# fefe5f62 test(media): await assets before asserting loaded content
# 3a020044 fix(a11y): support horizontal keys on focused table regions
# ec39af0d fix(ux): initialize history positions before route readiness
# 595091fa fix(ux): remember zero scroll positions for Back navigation
# 6bfc10a5 test(ux): scope fixture sessions to the main document
# db428514 fix(auth): reserve mobile preference rows before font loading
# 21520b56 test(ux): isolate sandboxed frames and seed starter catalog fixtures
# 13fb564e fix(studio): retain safe area insets in short landscape
# e0ce7728 fix(ux): preserve safe area padding across shell breakpoints
# 7d98ba9b test(ux): verify shell navigation, route bindings and responsive recovery
# 4b39fb18 feat(ux): strengthen global navigation and responsive shell contracts
# 4d30a8f3 feat(ux): establish Phase 05 motion foundation and evidence
# f26c8329 Phase 04: establish reusable component contracts and evidence
# 1dc4b24b docs(uxui): record font metadata audit limit
# 205728e8 feat(uxui): establish phase 03 canonical visual foundations
# c4af9e82 docs(uxui): complete Phase 02 experience architecture
```

### Observation:
Local `main` was at `2429b76545b683fad2a0a6f328bee3264875edc3`, exactly 13 commits ahead of remote `origin/main` (`4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`), matching the handoff baseline perfectly. As required by the non-negotiable rules, no reset, hard pull, checkout of stale remote, or discarding of Phase 06 commits was performed.

---

## 2. Phase 07 Marketing Route Scope

Phase 07 owns the public marketing domain mounted under `MarketingShell` in `apps/frontend-user/src/app/routes/marketingRoutes.jsx`.

| Route Pattern | Target Component / Feature | Phase 07 Status | Ownership Boundary |
|---|---|---|---|
| `/` | `HomePage` (`HomeFeature`) | **Implemented & Transformed** | Public marketing homepage |
| `/contact` | `ContactPage` (`ContactFeature`) | **Implemented & Transformed** | Contact and support experience |
| `/venues` | `VenuesPage` (`VenuesFeature`) | **Implemented & Transformed** | Static venue discovery directory |
| `/venues/:id` | `VenuesPage` (`VenuesFeature`) | **Implemented & Transformed** | Selected venue detail dialog / deep-link |
| `/about` | `<Navigate to="/contact" replace />` | **Preserved Redirect** | Retained redirect to contact (no speculative pages) |
| `/help` | `<Navigate to="/contact" replace />` | **Preserved Redirect** | Retained redirect to contact (no speculative pages) |
| `*` (404) | `NotFoundPage` (`NotFoundFeature`) | **Preserved & Verified** | Public error recovery within marketing domain |
| `/templates` | `TemplatesPage` | **Teaser / Entry Only** | Full catalog filtering/checkout owned by Phase 09 |
| `/pricing` | `PricingPage` | **Teaser / Entry Only** | Price decision UX & entitlements owned by Phase 09 |

---

## 3. Preservation Invariants

The following verified system behaviors were strictly preserved without regression:
1. **One canonical skip link:** `<a className="host-skip-link" href="#marketing-content">` targets `<main id="marketing-content" tabIndex={-1}>`.
2. **Mobile Dialog Modality:** Native `<dialog>` in `Header.jsx` with `showModal()`, `close()`, tab trapping (`containMenuFocus`), Escape listener, body scroll lock, and resize-to-close at >=1101px.
3. **Scroll Restoration:** Back navigation restores zero scroll for home and remembers catalog scroll without resetting on locale toggle.
4. **Renderer Isolation:** Ten guest invitation families remain untouched in their isolated renderers (`apps/frontend-user/src/features/templates/layouts/`).
5. **No Global Route Curtain:** Operational content paints immediately without full-screen blocking overlays.
6. **Backend API Contracts:** Zero modification to backend endpoints, Spring controllers, or Flyway migrations.
