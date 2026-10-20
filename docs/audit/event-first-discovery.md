# Event-first discovery (2026-10-20)

Baseline: `62eb20f7`, local main one commit ahead of fetched `origin/main`, no incoming commits. Implementation branch: `feature/event-first-workspaces`. No production operations authorized.

## Verified architecture and journeys

React 19.2 / Router 7 / Zustand 5 / Vite 8 user and admin applications call the Java 25 / Spring Boot 4 modular monolith. MySQL migrations currently reach V36 (older database documentation is stale). Redis rate limiting and the FastAPI Telegram adapter remain separate. Controllers delegate to application services; ArchUnit guards those boundaries.

The managed event aggregate is `invitation/domain/UserInvitation.java`: owner, template, optional organization, type, date/time, venue, content, language and lifecycle. Frontend `eventId` will mean this aggregate's numeric backend `invitation_id`. `event/domain/Event.java` and ADMIN-only `event/api/EventController.java` are a separate legacy administrative aggregate and must remain intact. Public `/w/:slug`, `/i/:slug`, guest tokens and provider flows remain compatible.

Login, register and social authentication already use real services and default to `/dashboard/events`. Login has identifier/password visibility and social/forgot-password links; registration has matching passwords and strength validation. `stores/useAuthStore.js` supports HttpOnly cookie bootstrap and an explicitly configured bearer mode, generation guards and logout revocation. Redirect validation only checks leading slashes and needs a shared application allowlist. Logout does not clear the active event.

`features/events/hooks/useEvents.js` merges real owner invitations with account-local drafts and automatically attempts synchronization. It silently removes some missing synchronized drafts and swallows server deletion errors before deleting local records. These are data-preservation risks. Cards preserve the team's cover/card design; no search/status/sort controls exist. Manage uses `/dashboard?id=...`.

`app/routes/hostRoutes.jsx` mixes account and event modules. `InvitationScopedRedirect.jsx` trusts stored active IDs, then chooses the first server invitation/local draft. `layouts/components/HostNav.jsx` promotes global guests/budget/gifts. `DashboardFeature.jsx` falls back to the first invitation even when an explicit target is absent. Guests have explicit-ID validation, but gifts, expenses and financial reports can select a published/first invitation. This is the primary multi-event correctness defect. Per-module existing hooks and UI can be reused behind a verified route boundary; keying that boundary by event prevents obsolete async responses rendering in a different workspace.

Backend guests, gifts, budget, RSVP, media and delivery call `InvitationService.requireOwnedInvitationEntity`. Child queries include invitation identity; gift-to-guest validation uses both IDs. Seating, check-in and reports have owner-or-ADMIN policies. Organization membership allows attaching an organization, and does not grant access to all its invitations. Collaboration is not safely implemented; preserve owner-only permissions and document an extension point.

`AppJwtAuthenticationConverter.java` and `shared/config/SecurityConfig.java` currently elevate STAFF to ADMIN. A converter regression test even expects that elevation. Database V29 preserves the distinct STAFF enum; frontend admin and backend policies must reflect that distinction. Cookie CSRF, JWT token versions, enabled-account checks and payment confirmation invariants already have tests and must be preserved.

Templates have visual `TemplateCategory`, server-owned price/currency and active status, but no event/language compatibility. Existing dedicated renderers and `InvitationForm.jsx` are wedding-oriented (the form explicitly writes WEDDING). Do not classify them as birthday/corporate-compatible without a working renderer/editor. Add explicit compatibility metadata and truthful empty states; preserve the wedding editor and provide a configuration-based details editor for other supported events.

## Earlier hypotheses verified

| # | Finding | Current evidence |
|---|---|---|
| 1 | Ordinary login lands on My Events | Present: LoginFeature/RegisterFeature redirect defaults |
| 2 | Global event-module navigation | Present: HostNav dynamicNavItems and hostRoutes |
| 3 | Stored/first-event selection | Present: InvitationScopedRedirect, useGifts, useExpenses, useActiveEventReport |
| 4 | Dashboard query identity | Present: EventsFeature handleDashboard |
| 5 | Parallel global/scoped routes | Present: hostRoutes |
| 6 | Mixed draft/backend IDs | Present: useGuests, useGifts, hostPlanningStorage |
| 7 | STAFF becomes ADMIN | Present in JWT and password authority construction |
| 8 | UserInvitation contains canonical event fields | Present |
| 9 | Legacy Event and ADMIN controller | Present, explicitly documented legacy |
| 10 | Category means visual style | Present: TemplateCategory |
| 11 | Template-specific editor configuration | Present, but wedding-specific assumptions remain |
| 12 | Local persistence and backend sync | Present: weddingStorage, draftPublishApi, useEvents |

## Database and integration risks

Invitations own guests, RSVPs, gifts, media, delivery, seating and check-in. Budgets own budget items and belong to one invitation. Payments/subscriptions and template entitlements belong to accounts; gifts must remain separate. USD/KHR totals stay separate. V1–V36 must not change. Any compatibility mapping requires additive migration, conservative backfill and fresh/upgrade MySQL evidence. Do not grant paid access from recommendation selection.

## Incremental implementation plan

1. Correct STAFF authorities in both mechanisms; add role-denial tests and a reusable owner/permission policy.
2. Add canonical `/app/events/:eventId` boundary, explicit identity, switcher and legacy redirects; remove first-event selection from reachable modules.
3. Preserve existing dashboard/cards/navigation styling while separating account and event navigation; add list controls and data-preserving lifecycle errors.
4. Add catalog compatibility and deterministic recommendations, then a short accessible wizard creating a real backend draft with retry identity.
5. Integrate scoped existing modules and event-aware details; keep public links and paid entitlements intact.
6. Run targeted then full suites/builds, browser desktop/mobile smoke, dependency/routing checks; document actual evidence, external blockers and rollback.

Local tooling: Java 25 and Node available; Maven is available through `apps/backend/mvnw.cmd`, not PATH. Docker daemon is currently unavailable. External OAuth/payment/provider and MySQL validation need real environment evidence; mocked browser tests cannot prove provider integration.

Milestone 1 evidence: `apps/backend/mvnw.cmd test -Dtest=AppJwtAuthenticationConverterTests,PasswordRoleAuthorityTests,AuthEndpointSecurityTests,EventAccessPolicyTests,InvitationServiceTests,ArchitectureRulesTests` passed **45 tests**, no failures/errors/skips. STAFF now retains ROLE_STAFF in both auth mechanisms and is denied admin/legacy-event endpoints. The admin application no longer accepts STAFF as ADMIN. Existing owner rules remain intact; `EventAccessPolicy` is the owner-only workspace extension point.
