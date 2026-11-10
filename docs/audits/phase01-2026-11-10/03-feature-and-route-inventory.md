# Feature and full route inventory

Status is bounded by evidence. IMPLEMENTED means the named behavior has source plus executed unit/service/browser evidence; it does not imply every integration or device passed. UNVERIFIED and PARTIAL identify unfinished audit coverage rather than automatic defects. All browser results below use fictional DTOs.

## Feature inventory

| Feature | Status | Source evidence | Mobile status | Desktop status | Priority | Recommendation |
|---|---|---|---|---|---|---|
| Homepage/navigation | IMPLEMENTED (tested) | features/marketing; layouts/components/HostNav | Fixture render and navigation checks | Fixture PASS | P2 | Preserve brand and opt-in preview; profile first paint |
| Template catalog, search, category filtering | IMPLEMENTED (tested scope) | features/templates; templateCatalogApi | Fixture content PASS; controls not all exercised | Fixture PASS | P2 | Preserve backend IDs and free/premium facts |
| Template detail/demo/preview | IMPLEMENTED (tested scope) | templateRegistry; TemplateDemoPage | Event Essential render; Celestial/Silk journeys | Fixture PASS; admin frame initially blocked | P1 | Verify all real catalog/renderers before visual migration |
| Pricing and subscription plans | IMPLEMENTED (tested scope) | features/subscriptions; subscription backend | Fixture render/dialog checks | Fixture PASS | P2 | Preserve server price/quotas; no promotional promises inferred |
| Contact | IMPLEMENTED (tested scope) | ContactFeature; contact/api | Form render; backend suite | Fixture PASS | P2 | Retain form labels and validation |
| Venue discovery/detail | PARTIAL | features/marketing/VenuesFeature.jsx:14 | Four hard-coded venues; UI render PASS | Fixture PASS | P2 | Clearly distinguish curated static content from bookable inventory |
| About/help | PARTIAL (aliases) | app/routes/marketingRoutes.jsx:32 | Redirects to Contact | Redirect PASS | P3 | Add distinct content only if needed |
| Email/password login and registration | IMPLEMENTED (tested) | features/auth; auth/application | EN/KM axe and synthetic login PASS | Fixture PASS | P1 | Retain validated next path and distinct admin auth |
| Forgot/reset/change password | IMPLEMENTED (tested components/services) | auth routes; auth backend | Forms render; provider/email delivery unverified | Fixture PASS | P1 | Live disposable-account reset still required |
| Google login | UNVERIFIED live; implementation present | auth backend social identity verification | No provider sign-in performed | No provider sign-in performed | P1 | Test redirect, verified identity, cancellation on staging |
| Telegram login/WebApp | UNVERIFIED live; implementation present | shared/telegram; auth backend | SDK helpers/source inspected; no real client | Not tested live | P1 | Verify in Telegram and standard browser separately |
| Session/logout/role guards | IMPLEMENTED (tested) | authStorage; RequireAuth/RequireAdmin | Role/expiry boundaries PASS in fixtures | Fixture PASS | P1 | Keep browser and backend boundaries |
| Event list/search/filter/sort | IMPLEMENTED (tested scope) | features/events/EventsFeature.jsx | Visible Create Event tap PASS in 3 engines | Fixture PASS | P2 | Repair hidden-first test selector; preserve URL filters |
| Event creation wizard | IMPLEMENTED (tested scope) | events/onboarding/EventCreatePage.jsx | Two template-intent creation journeys PASS | Fixture PASS | P1 | Live create/save/publish still unverified |
| Event overview/workspace/settings | IMPLEMENTED (tested scope) | events/workspace; onboarding/EventDetails | Fixture render; date/program editing PASS | Fixture PASS | P2 | Retain event-scoped routing |
| Owner calendar grid | MISSING distinct routed module | hostRoutes; event/dashboard source search | No owner calendar journey available | No owner calendar route | P2 | Separate optional owner calendar from guest save-the-date calendar |
| Profile and notifications | IMPLEMENTED (tested scope) | profile/notifications features; backend modules | Fixture render; delivery not live | Fixture PASS | P2 | Preserve loading/error/access states |
| Organizations/team invitation | IMPLEMENTED (tested scope) | organizations; EventTeamPanel; V47/V48 | Fixture read; backend tests | Fixture PASS | P1 | Acceptance, role changes and concurrent access need disposable MySQL gate |
| Template ownership/entitlements | IMPLEMENTED (tested) | shared/access; payment/entitlement modules | Synthetic pending/PAID gating PASS | Fixture PASS | P1 | Server remains authoritative |
| Text/details/theme/section editor | IMPLEMENTED (tested scope) | InvitationForm; InvitationPlanEssentialEditor | Guided/advanced edit/save/reload PASS | Fixture PASS | P1 | Preserve unknown JSON fields and renderer identity |
| Live editor preview | IMPLEMENTED (tested) | shared/preview; owner Studio | Physical tap, focus/scroll/edits retained PASS | Fixture PASS | P1 | Keep one active frame and trusted messaging |
| Image selection/upload/progress/removal | IMPLEMENTED handlers; live storage UNVERIFIED | InvitationMediaManager; mediaLibraryModel; MediaService | Read fixture; no real mobile upload | Read fixture; backend suite | P1 | JPEG/PNG/WebP only; document HEIC limitation |
| Photo cropping/focal controls | PARTIAL verification | InvitationForm; TicketDesigner | Controls exist; large-photo/iOS crop not exercised | Not exhaustively tested | P1 | Test orientations, memory and keyboard alternatives |
| Draft persistence/save conflict recovery | IMPLEMENTED (tested) | weddingStorage; editor save hooks | Synthetic 401/409/503/offline retention PASS | Fixture PASS | P1 | Preserve local-vs-server boundaries |
| Publish/unpublish/share | PARTIAL runtime verification | invitationApi; InvitationService; delivery | Synthetic sharing/navigation; no live publish | No live publish | P1 | Verify safe event through publish and public read |
| Public invitation opening | IMPLEMENTED (tested scope) | PublicInvitationPage; TemplateExperience | Event Essential render; Celestial tap follow-up | Read render; moving-target test limitation | P1 | Test real client engines and every active renderer |
| Public map/location/calendar | IMPLEMENTED (tested scope) | template shared map/calendar exports | Calendar keyboard/ICS PASS; native maps unverified | Fixture calendar PASS | P2 | Verify external map and calendar app handoff |
| Invitation music/video | PARTIAL verification | template shared media/Openings | Autoplay recovery/source policies inspected | No real media/device matrix | P1 | Verify gesture, background/resume, cancellation and reduced motion |
| Guest records/groups/search/pagination/import | IMPLEMENTED (tested scope) | guestApi; GuestService; GuestWorkspace | Read fixture and synthetic inline creation PASS | Fixture PASS | P1 | Test big import/partial errors with real disposable data |
| RSVP owner dashboard | IMPLEMENTED (tested scope) | rsvp feature; RsvpService | Fixture read PASS; guest note contrast FAIL | Fixture read PASS | P2 | Repair AU-004; verify live summaries |
| Public personalized/general RSVP submission | UNVERIFIED end-to-end; backend tested | rsvpApi; RsvpController; RsvpService | No full public RSVP submission in this audit | Backend service tests PASS | P1 | Test private/public/token/deadline/duplicate/confirmation flows |
| Public wishes wall | PARTIAL by explicit policy | RsvpService.java:115-137 | Public wishes currently return empty lists | Owner wishes fixture renders | P2 | Confirm privacy/product policy before changing deliberate empty output |
| Delivery/share tracking/QR/check-in | IMPLEMENTED (tested scope) | delivery/checkin/ticket backend; frontend modules | Fixture render and contextual actions PASS | Fixture PASS | P1 | No real outbound messages or camera scans performed |
| Ticket designer/export | IMPLEMENTED (tested scope) | features/tickets/TicketDesigner.jsx | Preview & export tab works by touch in 3 engines | Canvas render PASS | P2 | Verify downloaded QR/print output on real devices |
| Seating/table assignment/floor plan | IMPLEMENTED (tested scope) | features/seating; seating backend | Assign guests touch panel PASS; no live write | Fixture read PASS | P2 | Verify drag alternatives and persisted positions with disposable data |
| Budget and expenses | IMPLEMENTED (tested scope) | budget backend; ExpensesPage | Fixture read; backend tests | Fixture PASS | P2 | Retain USD/KHR separation |
| Guest gifts/contributions | PARTIAL external verification | gift backend; WeddingGiftPage; template gifts | Manual gift records/UI present; no external payment | Fixture read PASS | P1 | Distinguish owner-recorded gifts from provider-verified receipts |
| Template order/create/status/review/entitlement | IMPLEMENTED (tested mocks/services) | paymentsApi; TemplatePaymentService | Synthetic one-order pending/PAID journey PASS | Fixture PASS | P1 | Provider/sandbox reconciliation still unverified |
| ABA static links and provider callback | UNVERIFIED externally; implementation present | TemplatePaymentService; AbaPayWayService | No app switch or transaction | No provider request made | P1 | Keep trusted verification and amount/currency/order matching |
| Telegram merchant notification delivery | UNVERIFIED runtime | apps/telegram-bot/main.py; payment evidence | pytest blocked; no real webhook | pytest blocked | P1 | Run existing suite in prepared environment; no messages needed |
| Payment history/receipt | IMPLEMENTED (tested scope) | me/payments APIs and receipt pages | Fixture read and denied receipt PASS | Fixture PASS | P1 | Preserve owner authorization and currency labels |
| Cancellation/refund | PARTIAL | PaymentCancelPage; order states | Cancel navigation exists; no refund workflow verified | Fixture render PASS | P2 | Specify refund policy before claiming refund support |
| Admin dashboard/users/reports/audit logs | IMPLEMENTED (tested scope) | frontend-admin features; admin/reporting backend | Fixture render; AU-005 contrast defects | Fixture read PASS | P1 | Verify mobile table tasks and role boundaries |
| Admin template CMS/visual studio | IMPLEMENTED with confirmed mobile defects | AdminTemplateEditFeature.jsx | FAIL AU-001?003 | Read renders; roundtrip test setup issue | P1 | Fix clipped split layout and a11y; preserve template serialization |
| General page/content CMS | MISSING distinct module | Admin routes/source inventory | No page publishing workflow discovered | No corresponding route | P3 | Treat marketing copy as code-managed until product scope approved |
| Admin payments/packages/notifications | IMPLEMENTED (tested scope) | frontend-admin features; subscription/payment backend | Fixture read, package modal focus PASS | Fixture PASS | P1 | No real settlement/account mutation performed |
| Attendance and financial analytics | IMPLEMENTED (tested scope) | AttendanceAnalytics; FinancialReport; reporting backend | Read fixture; backend query tests | Fixture PASS | P2 | Do not equate synthetic charts with production accuracy |
| AI invitation writing | PARTIAL fallback implementation | integration/ai/application/AiInvitationAssistantService | Fixture panel; no provider configured/verified | No live model | P3 | No concrete AiInvitationProvider implementation discovered; local guidance fallback exists |
| Multilingual management | IMPLEMENTED (tested scope) | shared/i18n; localized editor; backend bundles | EN/KM auth checks pass; route text contracts need locale awareness | Fixture display checks | P1 | Review Khmer typography in real Safari and with long names |
| Docker/Nginx/Redis/monitoring/backups | UNVERIFIED operationally; configuration present | docker-compose.yml; infra; CI | Docker daemon unavailable | No deployed stack tested | P1 | Validate prod profile/TLS/origins, backup restore and rate limits before release |

## All declared leaf patterns

The current inventory unit tests reconcile 111 customer + 24 administrative leaves with the existing matrix. This table uses the now-reconciled route list, then joins **this audit's** browser results; historical smoke statuses are ignored. Dynamic IDs are represented by explicit synthetic URLs in `evidence/browser-routes-results.json`. Alias rows are retained, because redirects and deep links are part of the contract. Declared public aliases can terminate behind a protected destination; the access label below describes the declaration, not an authorization bypass.

PASS R = route-specific read/render assertion using fictional data. PASS F = a focused responsive follow-up repaired an unsuitable assertion and exercised a visible control. No row implies full CRUD, accessibility conformance, live API operation or physical-device verification. Admin Studio requires AU-001?003 despite shallow render PASS.

| App / route | Declared role | Relevant source | Mobile 390?844 | Desktop 1440?844 | UX/UI result | Action |
|---|---|---|---|---|---|---|
| user `/templates/:id/preview` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (template-demo) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/create/wedding` | public | `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx` (create-event) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/event/create` | public | `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx` (create-event) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/events/create` | public | `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx` (create-event) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/create/wedding/:id` | authenticated | `apps/frontend-user/src/features/invitations/InvitationForm.jsx` (invitation) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/event/:id/manage` | authenticated | `apps/frontend-user/src/features/invitations/InvitationForm.jsx` (invitation) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/event/:draftId` | public | `apps/frontend-user/src/app/routes/builderRoutes.jsx` (local-preview) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/preview/:draftId` | public | `apps/frontend-user/src/app/routes/builderRoutes.jsx` (local-preview) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/payments/:orderCode/status` | public | `apps/frontend-user/src/app/routes/builderRoutes.jsx` (payment-status) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/payments/success` | public | `apps/frontend-user/src/app/routes/builderRoutes.jsx` (payment-return) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/payments/return` | public | `apps/frontend-user/src/app/routes/builderRoutes.jsx` (payment-return) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/payments/cancel` | public | `apps/frontend-user/src/app/routes/builderRoutes.jsx` (payment-cancel) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/w/:slug` | public | `apps/frontend-user/src/pages/public/PublicInvitationPage.jsx` (public-invitation) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/i/:slug` | public | `apps/frontend-user/src/pages/public/PublicInvitationPage.jsx` (public-invitation) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (home) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/templates` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (catalog) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/templates/:templateId/checkout` | authenticated | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (checkout) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/pricing` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (pricing) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/contact` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (contact) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/venues` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (venues) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/venues/:id` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (venue-detail) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/about` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (contact) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/help` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (contact) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/templates/:id` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (template-demo) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/templates/:id/demo` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (template-demo) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/login` | public | `apps/frontend-user/src/pages/auth/LoginPage.jsx` (auth-login) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/register` | public | `apps/frontend-user/src/app/routes/authRoutes.jsx` (auth-register) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/forgot-password` | public | `apps/frontend-user/src/app/routes/authRoutes.jsx` (auth-forgot) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/reset-password` | public | `apps/frontend-user/src/app/routes/authRoutes.jsx` (auth-reset) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events` | authenticated | `apps/frontend-user/src/pages/host/EventsPage.jsx` (events) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/new` | authenticated | `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx` (create-event) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/invitation` | authenticated | `apps/frontend-user/src/features/invitations/InvitationForm.jsx` (invitation) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/tickets/design` | authenticated | `apps/frontend-user/src/features/tickets/TicketDesigner.jsx` (ticket) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/settings` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (settings) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/team` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (team) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/analytics` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (analytics) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/preview` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (preview) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/guests` | authenticated | `apps/frontend-user/src/pages/host/GuestsPage.jsx` (guests) | PASS R | PASS R | AU-004 note contrast | Phase 02 contrast + Phase 09 flows |
| user `/app/events/:eventId/rsvp` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (rsvp) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/gifts` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (gifts) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/budget` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (budget) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/seating` | authenticated | `apps/frontend-user/src/features/seating/InvitationSeatingPage.jsx` (seating) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/check-in` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (check-in) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/reports` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (reports) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/delivery` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (delivery) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/media` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (media) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/qr` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (qr) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/wishes` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (wishes) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/events/:eventId/assistant` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (assistant) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/profile` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (profile) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/change-password` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (password) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/notifications` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (notifications) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/packages` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (packages) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/payments` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (payments) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/payments/:orderCode` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (receipt) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/organizations` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (organizations) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/organizations/:organizationId` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (organization-detail) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/app/templates/paid` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (paid-templates) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/profile` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (profile) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/change-password` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (password) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/notifications` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (notifications) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/packages` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (packages) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/payments` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (payments) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/payments/:orderCode` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (receipt) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/organizations` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (organizations) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/organizations/:organizationId` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (organization-detail) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/templates/paid` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (paid-templates) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/events` | authenticated | `apps/frontend-user/src/pages/host/EventsPage.jsx` (events) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations` | authenticated | `apps/frontend-user/src/pages/host/EventsPage.jsx` (events) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/new` | authenticated | `apps/frontend-user/src/features/events/onboarding/EventCreatePage.jsx` (create-event) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/design` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (legacy-unsaved-editor) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/edit` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (legacy-unsaved-editor) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:id/edit` | authenticated | `apps/frontend-user/src/features/invitations/InvitationForm.jsx` (invitation) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:id/preview` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (preview) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:id` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/guests` | authenticated | `apps/frontend-user/src/pages/host/GuestsPage.jsx` (guests) | PASS R | PASS R | AU-004 note contrast | Phase 02 contrast + Phase 09 flows |
| user `/dashboard/invitations/:invitationId/rsvp` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (rsvp) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/gifts` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (gifts) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/budget` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (budget) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/seating` | authenticated | `apps/frontend-user/src/features/seating/InvitationSeatingPage.jsx` (seating) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/check-in` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (check-in) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/reports` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (reports) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/qr` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (qr) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/wishes` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (wishes) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/assistant` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (assistant) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/delivery` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (delivery) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/invitations/:invitationId/media` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (media) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/guests` | authenticated | `apps/frontend-user/src/pages/host/GuestsPage.jsx` (guests) | PASS R | PASS R | AU-004 note contrast | Phase 02 contrast + Phase 09 flows |
| user `/dashboard/rsvp` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (rsvp) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/gifts` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (gifts) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/budget` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (budget) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/seating` | authenticated | `apps/frontend-user/src/features/seating/InvitationSeatingPage.jsx` (seating) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/check-in` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (check-in) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/reports` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (reports) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/delivery` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (delivery) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/media` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (media) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/expenses` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (budget) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/dashboard/share` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (delivery) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/events` | authenticated | `apps/frontend-user/src/pages/host/EventsPage.jsx` (events) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/event/list` | authenticated | `apps/frontend-user/src/pages/host/EventsPage.jsx` (events) | PASS F (raw assertion FAIL) | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/guests` | authenticated | `apps/frontend-user/src/pages/host/GuestsPage.jsx` (guests) | PASS R | PASS R | AU-004 note contrast | Phase 02 contrast + Phase 09 flows |
| user `/expenses` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (budget) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/gift` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (gifts) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/gifts` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (gifts) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/reports` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (reports) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/profile` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (profile) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/templates/browse` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (catalog) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `/templates/browse/:id` | authenticated | `apps/frontend-user/src/app/routes/hostRoutes.jsx` (template-demo) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| user `*` | public | `apps/frontend-user/src/app/routes/marketingRoutes.jsx` (not-found) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/login` | public | `apps/frontend-admin/src/pages/auth/LoginPage.jsx` (auth-login) | PASS R | PASS R | AU-006 footer contrast | Phase 02/03 contrast |
| admin `/templates/new` | ADMIN | `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx` (admin-template-create) | FAIL AU-001; render PASS | PASS R | Clipped mobile preview; unnamed link; mouse-only divider | Phase 02 AU-001?003 |
| admin `/templates/:templateId` | ADMIN | `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx` (admin-template-edit) | FAIL AU-001; render PASS | PASS R | Clipped mobile preview; unnamed link; mouse-only divider | Phase 02 AU-001?003 |
| admin `/` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/dashboard` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/users` | ADMIN | `apps/frontend-admin/src/features/users/AdminUsersFeature.jsx` (admin-users) | PASS R | PASS R | AU-005 contrast | Phase 02 semantic colors |
| admin `/users/:userId` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-user-detail) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/templates` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-templates) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/payments` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-payments) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/packages` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-packages) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/notifications` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-notifications) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/system-logs` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-logs) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/reports` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-reports) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/dev/api-monitor` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-monitor) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/dashboard` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/users` | ADMIN | `apps/frontend-admin/src/features/users/AdminUsersFeature.jsx` (admin-users) | PASS R | PASS R | AU-005 contrast | Phase 02 semantic colors |
| admin `/admin/templates` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-templates) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/payments` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-payments) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/packages` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-packages) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/notifications` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-notifications) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/reports` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-reports) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `/admin/system-logs` | ADMIN | `apps/frontend-admin/src/app/App.jsx` (admin-logs) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
| admin `*` | public | `apps/frontend-admin/src/app/App.jsx` (admin-dashboard) | PASS R | PASS R | Sampled render only | Preserve; functional/live coverage pending |
