# 03 — source route and component ownership

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

`HostShell` owns authenticated host spacing, the skip destination and preview/Studio exclusions. `HostNav` owns logo, four primary destinations, profile/account menu, locale/theme and mobile main menu. `EventWorkspace` owns verified event identity, access refresh, module guard, sidebar/drawer and content context. `EventNavigation` renders the 19 destinations (overview plus 18 modules) from the unchanged navigation model. `EventsFeature` owns collection URL state, list/calendar, filters, pagination and deletion presentation; `useEvents` owns scoped loading, local merge/sync and acknowledged deletion.

`DashboardFeature` remains the owner overview. Non-owner overview uses the separate role-limited workspace surface, so owner charts and finance requests are not mounted there. `RsvpComposition` renders a static aggregate response snapshot with a definition-list alternative. Styling is owned by existing component sheets plus the explicitly host-scoped `OwnerExperience.css`; public invitations, marketing navigation and admin do not import that sheet.

The [route matrix](evidence/route-matrix.json) records every destination and [role matrix](evidence/role-module-matrix.json) records the exact grant mapping. The unchanged `/app/events/new`, preview exceptions, aliases, backend-owned entitlements and renderer identities remain contracts, not redesign opportunities.

[Report index](README.md).
