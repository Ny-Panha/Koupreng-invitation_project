# Event-first implementation report

UX follow-up: the six-step onboarding described in this historical implementation report has since been replaced by a single-page event form. See the [UX/UI route audit](ux-ui-route-audit.md) for the current package page, creation flow, route findings and verification evidence.

## A. Executive summary

Implemented the event-first account journey on the local branch `feature/event-first-workspaces`. Managed events reuse `UserInvitation`; no replacement domain model or database rewrite was introduced. Ordinary authentication opens My Events. A selected numeric backend event owns its entire workspace, its module navigation and its data requests. STAFF no longer inherits ADMIN authority.

The branch contains working application code, additive schema/API changes, a real backend draft wizard, deterministic template recommendations, a neutral non-wedding invitation renderer, regression coverage and retained UI styling. It has not been pushed or deployed. Production readiness remains gated by MySQL migration and configured external-provider checks.

Related deliverables: [original audit and all 12 hypotheses](event-first-discovery.md), [architecture, diagrams, routing, permissions, onboarding, recommendation and migration design](../architecture/event-first-workspaces.md), [commands, counts, failures, blockers and reproduction](../qa/event-first-verification.md).

## B. Before versus after

| Before | Implemented behavior |
|---|---|
| STAFF elevated to ROLE_ADMIN in JWT and password paths | ROLE_STAFF retained; backend/admin UI denial tests |
| Global guest/gift/budget navigation; stored or first invitation fallback | Account navigation plus verified `/app/events/:eventId` workspace |
| Manage used `/dashboard?id=...` | Manage uses the exact backend ID; safe legacy redirects preserve explicit IDs |
| Nested report routes discarded invitation identity | Report reads only the routed event; ambiguous reports ask for selection |
| Local copies removed after missing-server/deletion failure paths | Local records retained and synchronization/deletion errors displayed |
| Template category only described style | Explicit relational event/language compatibility without repurposing style |
| Wedding-oriented creation/edit assumptions | Six-type wizard; retained wedding editor; shared non-wedding details and neutral public layout |
| No create retry identity | Owner-scoped UUID key, unique constraint and transactional owner lock |
| Basic slash-only auth redirect checks | Shared application-destination validation; explicit expiry and account-aware tab logout handling |

## C. Significant files changed

Paths below are relative to the repository root. Unrelated teammate components were retained.

| Area | Files or directory | Purpose |
|---|---|---|
| Frontend routing | `apps/frontend-user/src/app/routes/{hostRoutes,builderRoutes,InvitationScopedRedirect}.jsx` | Canonical workspaces, account aliases and safe legacy selection |
| Frontend boundary | `apps/frontend-user/src/features/events/workspace/` | Verified event context, keyed child lifetime, switcher, navigation and preserved editor dispatch |
| Frontend onboarding | `apps/frontend-user/src/features/events/onboarding/` | Six-step server-backed wizard, event-field configuration and settings/details |
| My Events | `apps/frontend-user/src/features/events/{EventsFeature.jsx,components/EventCard.jsx,hooks/useEvents.js}` | Explicit IDs, list controls, draft actions and data-preserving lifecycle |
| Existing modules | User dashboard, guests, gifts, expenses, RSVP, seating, check-in, QR, wishes, assistant, media/delivery/preview features | Route ID support and removal of reachable first-event selection |
| Authentication | User login/register/social redirect helper, `stores/useAuthStore.js`, `app/providers/AuthProvider.jsx` | Safe destinations, expiry, selected-event cleanup and same-account tab logout |
| Navigation | `apps/frontend-user/src/layouts/components/HostNav.jsx` | Preserve branded account header; event modules move into the event boundary |
| Neutral invitation | `apps/frontend-user/src/features/templates/layouts/EventEssentialLayout.jsx`, template experience/demo dispatch and draft adapters; `public/templates/event-essential.svg` | Event-aware public rendering, correct language/content and original vector thumbnail |
| Backend RBAC | `AppJwtAuthenticationConverter.java`, `SecurityConfig.java`; admin `RequireAdmin.jsx`, `AdminAuthProvider.jsx` | Separate STAFF and ADMIN across mechanisms and admin UI |
| Backend ownership | `invitation/application/EventAccessPolicy.java`, `InvitationService.java` | Owner-policy extension point; compatible template validation; retryable draft creation |
| Backend catalog | `template/domain/InvitationTemplate.java`, repository, `PublicTemplateResponse.java`, `TemplateRecommendationService.java`, `TemplateRecommendationController.java`, recommendation DTO | Reviewed compatibility sets and deterministic public recommendation API |
| Database | `apps/backend/src/main/resources/db/migration/V37__template_compatibility_and_draft_identity.sql` | Additive mappings, conservative seed/backfill and owner/request uniqueness |
| Contracts | `packages/api-contracts/openapi.yaml`, admin `openapiContractManifest.json` | Runtime schema and 246-endpoint monitor manifest |
| Backend tests | Role converter/password/endpoint tests, `EventAccessPolicyTests`, `EventDraftPersistenceTests`, `TemplateRecommendationServiceTests` | Real and isolated positive/negative regression coverage |
| Frontend tests | Workspace, provider, redirects, details, neutral public adapter, existing module/route/store tests | Explicit event identity, safe session behavior and real contract payloads |
| Browser tests | `apps/frontend-user/tests/e2e/event-workspaces.spec.js`, updated `critical-routes.spec.js` fixtures | Multi-event journeys, wizard, widths and legacy compatibility |
| Documentation/evidence | This report, discovery, architecture, verification, `docs/qa/event-first/*.png` | Actual implementation and test evidence |

## D. Security changes

Both authority-construction paths now yield ROLE_STAFF for STAFF. Real HTTP tests deny STAFF on admin and legacy-event endpoints; the admin frontend also rejects STAFF. Token-version checks, disabled-account handling, cookie CSRF, HMAC/provider payment evidence and server-owned pricing remain intact.

The exact owner-protected event must load before event modules mount. Protected requests retain backend ownership and invitation-scoped child queries; cross-event gift/guest references return the existing non-disclosing 404. H2 HTTP tests deny another user and anonymous requests across invitations, guests, gifts, RSVP, budget, media, reports, check-in, seating, delivery and wishes. Paid recommendation selection is independently denied without entitlement.

The event permission model is deliberately owner-only. No global STAFF support capability, collaborator role or organization-wide event grant was invented. Existing explicit ADMIN exceptions for platform moderation/reporting/seating/check-in remain documented in the role matrix. Legacy anonymous browser drafts are preserved by the existing storage model; they are not proof of authority to access any protected server event.

## E. UX and UI

Login/register and supported social flows lead to `/app/events`, while supported deep links retain their verified route guards. My Events preserves the team's cards, header, icons and typography, adds search/status/sort/paging and gives each backend event an explicit management action. A local-only draft continues in its existing editor.

The wizard offers real event types, catalog styles, supported language and pricing filters, compatible template previews and minimal event-specific details. Wedding fields stay in wedding flows; birthdays use a celebrant, corporate events use a host/organization, and engagement/anniversary use participant labels. A successful server save opens only the returned event ID. Retry/double-submit protection prevents unrelated duplicate creation.

Each workspace has an event header, switcher and separate module navigation. Switching retains the module and clears previous-event component state. Existing modules and wedding renderers are reused. The neutral Event Essential template supports saved message, schedule and contact details for non-wedding occasions. Settings use existing publication visibility rather than bypassing publication rules.

New labels, validation, loading/errors, keyboard focus and touch-sized controls follow the current Khmer-first identity. Actual-content overflow checks cover all seven requested widths. Full screen-reader/WCAG certification is outside the executed evidence.

## F. Database changes

V37 is the only new migration. It adds template-event and template-language relation tables, their foreign keys and constraints, and nullable `client_request_id` plus owner/request uniqueness on invitations. It conservatively classifies reviewed wedding renderers and seeds the new neutral template. Existing categories, public slugs, ownership, paid entitlements and financial currencies are preserved. Historical migrations through V36 were not modified.

H2 verifies entity/relationship persistence and transaction behavior. Fresh/upgrade MySQL execution is still blocked by the local environment and must run before release. [Migration and rollback instructions](../architecture/event-first-workspaces.md#release-migration-and-rollback) preserve Flyway history and already-created neutral invitations.

## G. Test results

| Check | Result |
|---|---|
| Full backend | 526 run: **496 passed, 30 environment-gated skips**, 0 failures/errors |
| Backend packaging | BUILD SUCCESS |
| Latest OpenAPI + ArchUnit | **19 passed** |
| Full user frontend | **497 passed**, 93 files |
| Full admin frontend | **80 passed**, 16 files |
| Browser regression | **48 passed** across desktop/mobile Chromium, including original public wedding/RSVP tests |
| Telegram | **72 passed**, 2 dependency deprecation warnings |
| User/admin lint and builds | Passed |
| User/admin npm audits | **0 vulnerabilities** each |
| Skill/routing integrity | Passed; existing duplicate React skill-name warning |

The final cosmetic wizard refinement triggered another focused browser check. A workstation socket-buffer failure was traced; the reduced-worker run also exposed a real overlap with the existing support-chat button. After reserving mobile action space, the final run passed **6/6 checks in 56.1 sec with two workers**. Exact evidence and all commands are in the [verification report](../qa/event-first-verification.md). Browser fixtures and H2 results are explicitly distinguished from MySQL and provider certification.

## H. Screenshots

Retained rendered evidence:

- [Desktop My Events](../qa/event-first/my-events.png)
- [Birthday setup with event-specific fields](../qa/event-first/birthday-details.png)
- [Event guest workspace at 320 px](../qa/event-first/workspace-320.png)
- [Event guest workspace at 1440 px](../qa/event-first/workspace-1440.png)

These contain declared test fixtures, not production customer data.

## I. Remaining work

| Status | Scope |
|---|---|
| Completed | STAFF separation, owner workspace boundary, exact-ID routes, switcher, scoped module integration, My Events controls, six-type onboarding, backend draft persistence/retries, deterministic recommendations, neutral public rendering, regression tests/contracts/docs |
| Partially verified | Supported social/payment/media integrations are preserved and covered by existing tests; live provider success requires configured staging accounts |
| Blocked by environment | Fresh/upgrade MySQL/Flyway execution and the 30 environment-gated database/integration tests; Docker daemon unavailable and disposable fixture credentials unconfigured |
| Deferred intentionally | Event collaboration/memberships, staff-specific platform support grants, server-paginated event catalog, admin UI for compatibility metadata and bespoke visual templates for every non-wedding occasion |

Future template compatibility must be reviewed and added through a forward migration. Unknown templates remain available through their existing catalog/editor path but do not receive unverified recommendation claims. No unfinished feature is represented as a production integration success.

## J. Final local verification and operations

Use the [nine-step manual verification flow](../qa/event-first-verification.md#local-manual-reproduction) with the repository's normal local stack. The central check is one ordinary user creating two distinct event IDs, adding data to one, switching modules/events and refreshing without seeing the other's records. Repeat with a second user, a STAFF account and expired/logged-out sessions.

Review V37 against disposable MySQL before any rollout. Deploy backend/schema and frontend compatibly only after explicit authorization. No deployment, production restart, DNS change, credentials change, paid activation shortcut or push to main was performed. Keep the neutral renderer available during rollback for existing neutral invitation links; leave additive schema/data and migration history in place.

Implementation commits before this report:

- `87888006` — STAFF authority separation and ownership policy/discovery.
- `bcf3c868` — Compatibility metadata, recommendations, draft retry identity, HTTP tests and API contracts.
- `7e7a0089` — Verified workspaces, preserved modules, event onboarding/editor, session UX and frontend tests.

Browser evidence and final QA documentation are recorded in the final focused QA commit.
