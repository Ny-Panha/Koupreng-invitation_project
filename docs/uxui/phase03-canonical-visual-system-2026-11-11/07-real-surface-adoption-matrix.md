# Real surface adoption matrix

| Surface | Real source/selector | Implemented Phase 03 | Deferred ownership |
|---|---|---|---|
| Public marketing | `styles/index.css` `.kp-marketing-shell` and `app-experience.css` dark rules | Canvas, surface, ink, muted, border, focus and core CTA aliases | Phase 07 page composition, Phase 04 interactive variants |
| Login/register | `features/auth/AuthPage.css` `.auth-shell` | Card, field, heading, placeholder, error, link, submit and dark mode; divider/link contrast repaired | Phase 08 auth flow states, Phase 04 field primitives |
| Owner/event | `app-experience.css` `:root` → `.dash-wrapper`, `--ws-*` | Page/card/action/status bridge follows canonical palette in light/dark | Phases 11–20 route-specific widgets, Phase 04 component variants |
| Admin shell | `styles/index.css` Tailwind aliases and `AdminLayout.css` consumers | Root background, card, text, primary, border/input/ring aliases; local type | Phase 24 admin lists, charts and dense tables |
| Template Studio | `features/templates/TemplateStudio.css` | Workspace, panel, switch, controls, focus and preview frame chrome roles | Phase 25 full Studio, five sections and font picker |
| Feedback/status | `--ui-theme-{info,warning,danger,success,pending,review,verified,manual}*` | Stable roles and warning compatibility bridge | Phase 04 variants and domain phases' source-of-truth labels |

This matrix names visible adoption, not 135 route-by-route visual certification. Existing hard-coded internals and Tailwind utilities still exist; moving each requires its owning phase to verify states. The Phase 02 [62-group surface ledger](../phase02-experience-architecture-2026-11-11/evidence/feature-surface-ledger.md) reconciles every current group with its later phase. Phase 03 supplies foundations across those groups; the user/admin route inventory tests confirm the current 111/24 route count without route/guard edits.
