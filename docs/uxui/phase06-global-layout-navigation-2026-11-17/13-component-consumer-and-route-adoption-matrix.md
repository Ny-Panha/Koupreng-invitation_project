# 13 — consumer and route adoption

135 current leaves / 63 app-group pairs; all have an accurate declared shell, access authority, primary domain phase and relevant state contract. The full [leaf ledger](evidence/route-shell-adoption.md) and [JSON](evidence/route-shell-adoption.json) include executed shell/leaf bindings, resolved lazy modules, dependency closure and primitive-source membership. The [graph](evidence/shell-consumer-graph.json) reconciles all 46 component register entries. Aliases are labeled; source mapping is not a claim of independent state certification.

| App | Group | Leaves | Shells / boundaries | Primitive-source leaves |
|---|---|---:|---|---:|
| frontend-admin | admin-dashboard | 4 | AdminLayout | 4 |
| frontend-admin | admin-logs | 2 | AdminLayout | 2 |
| frontend-admin | admin-monitor | 1 | AdminLayout | 1 |
| frontend-admin | admin-not-found | 1 | AdminSystem | 0 |
| frontend-admin | admin-notifications | 2 | AdminLayout | 2 |
| frontend-admin | admin-packages | 2 | AdminLayout | 2 |
| frontend-admin | admin-payments | 2 | AdminLayout | 2 |
| frontend-admin | admin-reports | 2 | AdminLayout | 2 |
| frontend-admin | admin-template-create | 1 | AdminStudio | 1 |
| frontend-admin | admin-template-edit | 1 | AdminStudio | 1 |
| frontend-admin | admin-templates | 2 | AdminLayout | 2 |
| frontend-admin | admin-user-detail | 1 | AdminLayout | 1 |
| frontend-admin | admin-users | 2 | AdminLayout | 2 |
| frontend-admin | auth-login | 1 | AdminAuth | 0 |
| frontend-user | analytics | 1 | EventWorkspace, HostShell | 1 |
| frontend-user | assistant | 2 | EventWorkspace, HostShell | 2 |
| frontend-user | auth-forgot | 1 | AuthShell | 0 |
| frontend-user | auth-login | 1 | AuthShell | 0 |
| frontend-user | auth-register | 1 | AuthShell | 0 |
| frontend-user | auth-reset | 1 | AuthShell | 0 |
| frontend-user | budget | 5 | EventWorkspace, HostShell | 5 |
| frontend-user | catalog | 2 | HostShell, MarketingShell | 2 |
| frontend-user | check-in | 3 | EventWorkspace, HostShell | 3 |
| frontend-user | checkout | 1 | MarketingShell | 0 |
| frontend-user | contact | 3 | MarketingShell | 0 |
| frontend-user | create-event | 5 | HostShell, RedirectOnly | 2 |
| frontend-user | dashboard | 3 | EventWorkspace, HostShell | 3 |
| frontend-user | delivery | 4 | EventWorkspace, HostShell | 4 |
| frontend-user | events | 5 | HostShell | 5 |
| frontend-user | gifts | 5 | EventWorkspace, HostShell | 5 |
| frontend-user | guests | 4 | EventWorkspace, HostShell | 4 |
| frontend-user | home | 1 | MarketingShell | 1 |
| frontend-user | invitation | 4 | EventWorkspace, HostShell, StandaloneEditorOrScopedRedirect | 2 |
| frontend-user | legacy-unsaved-editor | 2 | HostShell | 2 |
| frontend-user | local-preview | 2 | GuestRenderer | 2 |
| frontend-user | media | 3 | EventWorkspace, HostShell | 3 |
| frontend-user | not-found | 1 | UserSystem | 0 |
| frontend-user | notifications | 2 | HostShell | 2 |
| frontend-user | organization-detail | 2 | HostShell | 2 |
| frontend-user | organizations | 2 | HostShell | 2 |
| frontend-user | packages | 2 | HostShell | 2 |
| frontend-user | paid-templates | 2 | HostShell | 2 |
| frontend-user | password | 2 | HostShell | 2 |
| frontend-user | payment-cancel | 1 | UserSystem | 0 |
| frontend-user | payment-return | 2 | UserSystem | 0 |
| frontend-user | payment-status | 1 | UserSystem | 1 |
| frontend-user | payments | 2 | HostShell | 2 |
| frontend-user | preview | 2 | EventWorkspace, GuestRenderer, HostShell | 2 |
| frontend-user | pricing | 1 | MarketingShell | 1 |
| frontend-user | profile | 3 | HostShell | 3 |
| frontend-user | public-invitation | 2 | GuestRenderer | 2 |
| frontend-user | qr | 2 | EventWorkspace, HostShell | 2 |
| frontend-user | receipt | 2 | HostShell | 2 |
| frontend-user | reports | 4 | EventWorkspace, HostShell | 4 |
| frontend-user | rsvp | 3 | EventWorkspace, HostShell | 3 |
| frontend-user | seating | 3 | EventWorkspace, HostShell | 3 |
| frontend-user | settings | 1 | EventWorkspace, HostShell | 1 |
| frontend-user | team | 1 | EventWorkspace, HostShell | 1 |
| frontend-user | template-demo | 4 | GuestRenderer | 4 |
| frontend-user | ticket | 1 | EventWorkspace, HostShell | 1 |
| frontend-user | venue-detail | 1 | MarketingShell | 1 |
| frontend-user | venues | 1 | MarketingShell | 1 |
| frontend-user | wishes | 2 | EventWorkspace, HostShell | 2 |


The complete 270-case route sweep verifies current fictional content on desktop/mobile Chromium for every declared pattern, including aliases. It does not turn a redirect into a separate workflow or verify every role/error/payment mutation. Component-specific behavioral proof is only the named unit/browser tests. Unused AdminUI FilterTabs/DataTable declarations have no current production use; they are not presented as adopted tabs or tables. Specialized editors, media, charts, print, export, bulk selection and domain state completeness retain the phase owner in the ledger.
