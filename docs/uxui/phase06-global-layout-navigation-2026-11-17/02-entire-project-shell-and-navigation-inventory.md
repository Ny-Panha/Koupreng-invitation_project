# 02 — entire project shell inventory

The [route JSON](evidence/route-shell-adoption.json) and [generated readable table](evidence/route-shell-adoption.md) account for every current leaf. Static redirects, conditional aliases/legacy editor branches and actual screens are distinguished. A route pattern is not an independent workflow and an import is not a behavioral pass.

| Declared shell / boundary | Source-mapped leaves (overlap allowed) |
|---|---:|
| AdminAuth | 1 |
| AdminLayout | 20 |
| AdminStudio | 2 |
| AdminSystem | 1 |
| AuthShell | 4 |
| EventWorkspace | 19 |
| GuestRenderer | 10 |
| HostShell | 80 |
| MarketingShell | 9 |
| RedirectOnly | 3 |
| StandaloneEditorOrScopedRedirect | 2 |
| UserSystem | 5 |

`MarketingShell` owns public discovery; template demo/guest routes are declared outside it. `AuthShell` wraps auth-owned visual pages. `HostShell` wraps guarded account/event routes, with explicit focused Studio and preview branches. `EventWorkspace` remains data/permission aware. `AdminLayout` owns operational pages, while guarded Template Studio is standalone. User/admin system and auth pages retain their own boundaries.

The executed JSX chain is authoritative: for example `/app/events/:eventId/preview` still declares HostShell → EventWorkspace, while HostShell omits HostNav for preview. It is not mislabeled as a completely unwrapped public route. Direct builder aliases with no inherited shell are `RedirectOnly`; their destination owns the actual workspace.

There are 63 app/group pairs. [Consumer graph](evidence/shell-consumer-graph.json) maps direct imports, literal dynamic imports and transitive component reach. All 46 Phase 04 entries are reconciled. 116 leaves have a source-resolved registered primitive dependency; aliases are included and this count does not mean independently tested component states. Global support/feedback hosts are not silently counted as per-route domain adoption.
