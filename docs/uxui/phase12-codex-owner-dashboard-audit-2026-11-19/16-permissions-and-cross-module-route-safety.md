# 16 — permissions and cross module route safety

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The route/module contract remains `moduleAllowed(path, owner, permissions)`. Owners retain all existing module destinations; collaborators receive only mapped grants. Budget, gifts, delivery, settings, team and other owner-only destinations are not inferred from VIEW_EVENT. Direct denied URLs fail closed. A source-backed separate collaborator overview does not request owner financial aggregates.

The existing numeric route guards, RequireAuth, preview/Studio exceptions and legacy continuation remain. No Java controller, entitlement selector, payment flow, invitation renderer or applied migration changed. Current route tests reconcile exact leaf patterns against the restored immutable route fixtures. Existing guest RSVP authority, account-switch HTTP isolation, create request UUID, partial-cover retry and media ownership are regression invariants.

[Role matrix](evidence/role-module-matrix.json) and [attribution](evidence/file-attribution.json) distinguish UI affordances from server grants. Live multiuser HTTP/MySQL authorization is not newly certified by mocked browser success.

[Report index](README.md).
