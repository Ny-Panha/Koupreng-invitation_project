# 03 — phase11 route authorization and consumer matrix

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

| Entry | Guard | State | Actual destination |
| --- | --- | --- | --- |
| /app/events/new | RequireAuth → HostLayout | new, restored, error, template queries | /app/events/:id or /app/events/:id/invitation?mode=guided |
| /event/create | redirect → canonical guard | legacy | /app/events/new |
| /create/wedding | redirect → canonical guard | legacy | /app/events/new |
| /dashboard/events/create | redirect → canonical guard | legacy | /app/events/new |
| /dashboard/invitations/new | guarded host redirect | legacy | /app/events/new |
| /create/wedding/:id | RequireAuth → LegacyBuilder | numeric owned ID → invitation; local legacy builder retained | guarded existing route |
| /templates | public catalog + safe templateUsePath | anonymous login next; signed-in intent | /app/events/new?template=<stable identity> |
| /app/events | RequireAuth | owner list | /app/events/new |
| /app/events/:eventId | RequireAuth + event ownership context | acknowledged server event | workspace |
| /app/events/:eventId/invitation | RequireAuth + event access | guided continuation | supported editor |

`RequireAuth` preserves encoded pathname/search/hash for login and distinguishes checking, error and anonymous states. Existing event context enforces access at the workspace. `/events/new` and `/app/events/:id/edit` are unsupported report claims, not routes added to make a report pass.

The 111 user + 24 admin route leaves / 62 groups are historical inventory provenance. Full app unit suites include the route inventories; they are not 135 newly completed browser state journeys. [Detailed route/state matrix](evidence/route-state-matrix.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
