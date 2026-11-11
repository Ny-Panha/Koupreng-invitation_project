# Journey maps and friction

The steps below are source-backed intended paths. **Only the specifically cited browser/unit checks are current PASS**; end-to-end provider and database completion remains unverified. Every journey requires an empty/loading/error, denied/expired, interrupted and retry branch in its delivery phase.

| Journey / entry | Meaningful steps and recovery to inspect | Current evidence and friction | Phase |
|---|---|---|---|
| Visitor `/` | Browse/filter `/templates` → demo → free/premium → login → return intent. Recover empty catalog, wrong entitlement or cancelled sign-in. | Routes and template catalog exist; current route smoke is render only. Price/ownership must come from server. | 07–09 |
| New owner `/app/events/new` | Choose type/template → content/date → save → Studio → preview → publish → share; recover validation, duplicate submit and network failure. | Event creation and event workspace are routed. Khmer button wording changed from a historical test contract. Live persisted creation not retested here. | 11, 13–15 |
| Returning owner `/app/events` | Open event → edit, save/reload, conflict/draft recovery → republish. | Owner workspace routes and preview exist; preserve unsaved-history guard and unknown JSON. | 12–15 |
| Guest `/w/:slug` or `/i/:slug` | Open/skip ceremony → program/map/calendar/media → RSVP → confirmation; handle expired/private/invalid token and motion reduction. | Two public aliases, renderer registry and RSVP backend paths exist. Real mobile/in-app completion unverified. | 16, 18 |
| Operations `/app/events/:eventId` | Import/dedupe guests → RSVP board → seating → ticket/QR → check-in → reports. Recover partial import, capacity and duplicate scan. | All routes are present; no current live write/scan proof. | 17–20, 22 |
| Template buyer `/templates/:templateId/checkout` | Create order → pending/review → provider return → verified entitlement/receipt; recover expiry, duplicate callback and wrong currency. | Client and backend payment modules exist. No live ABA transaction was attempted. | 09, 21 |
| Gift contributor / owner | Distinguish manual recorded gift from provider-verified settlement → reconcile finance view. | Gift and payment modules are distinct; messaging must not imply bank verification for manual entry. | 21–22 |
| Admin `/login` | Authenticate → manage catalog/template preview → users/packages/payments/reports/logs; handle role denial and save failure. | Admin routes and Studio editor exist; targeted mobile Studio checks pass. Real admin mutation unverified. | 24–25 |
| Collaborator `/app/organizations` | Invite/accept/reject → permitted event task → revoke/expired access. | Organization/team routes and backend modules exist. Concurrent revocation requires isolated MySQL validation. | 23 |
| Exceptional entry | Offline, invalid token, session expiry, quota, conflict, large upload, denied media and interrupted redirect. | Source handlers exist across modules; this audit has no complete route × state/browser matrix. | Owning phase, 26 |

For each delivery phase, record actual entry, screen steps, user goal, feedback, exit, recovery, permission and persisted state. Current step counts would be false precision until flows are exercised with a controlled dataset.
