# Phase 04 reusable component adoption handoff

Phase 04 should migrate the existing primitives to `--ui-theme-*` roles without replacing their public APIs, modal focus managers, entitlement checks or route state. This is a plan; no Phase 04 component rewrite occurred in Phase 03. Start with a source inventory of actual imports/usages from both apps, then migrate a small shared component family and verify its real consuming routes before broad replacement.

| Component family | Role mapping and state contract | Representative route owners |
|---|---|---|
| Buttons, links, icon buttons | `action/on-action`, `secondary-action`, quiet surface, `danger-action`, `link`, focus; hover, active, disabled, busy, selected; ≥44px comfortable targets and accessible names | Marketing, auth, owner, admin, Studio |
| Menus, nav, breadcrumbs | `surface`, `overlay`, `ink/muted`, `border`, selection, focus; expanded/current semantics and keyboard order | Global shell, owner workspace, admin shell |
| Text inputs, select, combobox, date/time, check/radio, rich text | `surface`, `ink`, `placeholder`, `control-border`, `danger`, `focus`; label/help/error/required/read-only/busy; Khmer line height and 320px reflow | Auth, wizard, guest import, event forms, Studio |
| Dialog, drawer, popover, tooltip | `overlay`, `inverse`, border and shadow; preserve existing focus trap, return focus, escape and scroll lock | Owner and admin overlays |
| Alerts, toasts and validation | Info/warning/danger/success/pending/review/verified/manual pairs; icon plus wording; do not infer payment or delivery truth from CSS | Checkout, gifts, delivery, admin moderation |
| Table, list, card, search/filter, pagination, bulk toolbar, skeleton | Canvas/surface/subtle/inset, dividers, selected and focus; density variants, row hover and empty/denied/loading states | Owner CRM/finance, admin users/payments/reports |
| Media upload, progress, preview controls | Boundary, status, danger and focus roles; preserve MIME/size/ownership checks and preview trust | Creator/media Studio |
| Charts, reports and exports | Ink/muted, categorical status, tabular numbers and print surface; white export/print contract | Budgets, admin reports |
| Studio/preview chrome | `--ui-studio-*` for editor; invitation iframe keeps authored palette; Edit/Preview and resizer keyboard/pointer reachability | Creator Studio, admin Template Studio |

For each family: define light/dark/forced-colors variables; build Khmer and English long-label samples; verify idle, hover, focus, pressed, disabled, busy, error, denied, offline and reduced-motion states. Test 320/390/768/1440px and short landscape where relevant. Use actual keyboard focus and `@axe-core/playwright` plus computed contrast for every meaningful foreground/background pair. Do not replace current working focus infrastructure just to unify CSS. Keep status text/source of truth in application data.

The existing [Phase 02 62-group surface ledger](../phase02-experience-architecture-2026-11-11/evidence/feature-surface-ledger.md) is the route-to-owner reconciliation. Phase 04 affects shared primitives across all 111 user and 24 admin routes, while later phases own full route completion:

| Phase | Adoption and route cluster |
|---|---|
| 05–06 | Motion governance, global layout/navigation and responsive shells |
| 07–10 | Marketing, identity, marketplace/purchase, renderer family art and registry |
| 11–15 | Event wizard, owner workspace, creator Studio, media, review/publish/share |
| 16–20 | Guest invitation, CRM/delivery, RSVP/wishes, seating, QR/check-in |
| 21–23 | Gifts/payment, budget/reporting, team/organization/notifications/support |
| 24–25 | Admin platform and admin Template Studio/content pipeline |

Dependency gates: verify current backend role/entitlement boundaries before changing denied states; preserve template serialization/unknown JSON and preview origin/session; keep payment verification separate from manual records; obtain native Khmer copy review before locking labels; use an isolated dynamic catalog dataset before publishing a renderer parity claim. Any test-only maintenance of the three known Phase 02 assertions needs the owning QA/copy decision. Accept Phase 04 only after primitives can be swapped into representative real routes with stable APIs and no new accessibility or business-state regression.
