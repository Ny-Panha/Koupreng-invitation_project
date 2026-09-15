# Frontend to backend capability matrix

> **Historical discovery snapshot (2026-08-10):** use this for migration provenance, not current release status. See `current-gap-status.md` and `../qa/verification-results.md`.

**Evidence snapshot:** 2026-08-10
**Scope:** user routes, admin routes, API clients, Spring controllers/services, and persistence authority

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `CONNECTED` | The visible workflow calls an existing backend contract and persists through its domain service. |
| `PARTIAL` | A primary journey works, but endpoints, states, authorization, or UX remain incomplete. |
| `LOCAL_DRAFT_ONLY` | Intentionally browser-owned before an explicit server save. |
| `FRONTEND_GAP` | Backend capability exists without a complete reachable UI workflow. |
| `BACKEND_GAP` | UI/product intent exists, but the secure authoritative backend behavior is absent. |
| `EXPERIMENTAL` | Route and contract exist, but production behavior is stubbed or feature-gated. |
| `LEGACY` | Superseded compatibility surface that should not receive new client work. |

## User-facing route and authority matrix

| Capability | Browser route / page | Client state and API | Backend controller/service | Persistence authority | Status |
| --- | --- | --- | --- | --- | --- |
| Registration/login/social auth | `/register`, `/login` | auth API + `koupreng.auth` session envelope | `AuthController` / auth and identity services | `users`, password reset tokens | `CONNECTED` |
| Profile/password/image | `/dashboard/profile`, `/dashboard/change-password` | user/auth APIs | `UserController`, `AuthController` | `users` | `CONNECTED` |
| Marketing/template discovery | `/`, `/templates`, `/templates/:id`, `/templates/browse*` | template catalog API | `TemplateCatalogController` / catalog service | `templates` | `CONNECTED` |
| Local wedding builder | `/create/wedding*`, `/event/:draftId/manage`, `/preview/:draftId` | `weddingStorage` draft map | no matching draft endpoint | browser until explicit invitation creation | `LOCAL_DRAFT_ONLY` |
| Events list | `/dashboard/events` | local builder drafts plus invitation-oriented behavior | separate `EventController` exists | mixed/unresolved | `PARTIAL` |
| Invitation CRUD/publish | `/dashboard/invitations*` | `invitationService` | `InvitationController` / `InvitationService` | `invitations`, sections | `CONNECTED` |
| Public invitation/access | `/w/:slug`, `/i/:slug` | public invitation/media/RSVP APIs + session access token | invitation, media, RSVP controllers | invitations, media, guests, RSVPs | `CONNECTED` |
| Invitation media | `/dashboard/invitations/:id/media` | multipart media API | `MediaController` / `MediaService` | `media_files` + configured storage | `CONNECTED` |
| Guest list CRUD/import | `/dashboard/guests`, `/dashboard/invitations/:invitationId/guests` | guest hook/API; local only without server invitation | `GuestController` / `GuestService` | `guests` | `PARTIAL` — file import/export/grouped/send-list UI incomplete |
| RSVP dashboard/public submit | `/dashboard/invitations/:invitationId/rsvp`, public invite | RSVP API | `RsvpController` / `RsvpService` | `rsvps` | `PARTIAL` — host PATCH/DELETE incomplete |
| Delivery tracking | `/dashboard/invitations/:id/delivery` | delivery API | `InvitationDeliveryController` / delivery service | `invitation_delivery_events` | `CONNECTED` |
| QR generation | embedded guest/invitation actions | QR API | `QrCodeController` / QR service | derived from invitation/guest | `CONNECTED` |
| Check-in | `/dashboard/invitations/:invitationId/check-in` | scan/manual API | `CheckInController` / `CheckInService` | `guest_check_ins` | `PARTIAL` — operator/camera scanner role workflow absent |
| Seating | `/dashboard/invitations/:invitationId/seating` | seating API | `SeatingController` / `SeatingService` | `event_tables`, `guest_seat_assignments` | `PARTIAL` — bulk and concurrency guarantees incomplete |
| Budget | `/dashboard/invitations/:invitationId/budget`, `/dashboard/expenses` | budget API; local draft fallback | `BudgetController` / `BudgetService` | `budgets`, `budget_items` | `CONNECTED` for server invitation |
| Gifts | `/dashboard/gifts` | gift API; local draft fallback | `WeddingGiftController` / gift service | `wedding_gifts` | `CONNECTED` for server invitation |
| Dashboard/reporting | `/dashboard` | composite API loads | `DashboardReportController` plus domain clients | domain tables | `PARTIAL` — partial failures collapse to zero-like values |
| Organizations/team | `/dashboard/organizations*` | organization API | `OrganizationController` / `OrganizationService` | `organizations`, `organization_members` | `PARTIAL` — membership management connected; downstream permissions are a `BACKEND_GAP` |
| AI writing helper | `/dashboard/invitations/:invitationId/assistant` | AI API with disclosed local template fallback | `AiInvitationAssistantController` / stub service | stateless | `EXPERIMENTAL` |
| Packages/subscriptions | `/dashboard/packages` | subscription API | `SubscriptionController` / subscription service | `packages`, `subscriptions` | `CONNECTED` |
| Template checkout/status/access | checkout and `/payments/:orderCode/status` | template payment API | `TemplatePaymentController` / payment service/provider adapter | payment orders, transactions, access grants | `CONNECTED`; provider journey still needs staging verification |
| User payment history/receipt | `/dashboard/payments*` | `/v1/me/payments` client | `PaymentHistoryController` | payment orders/transactions | `CONNECTED` after this pass |
| Notifications | `/dashboard/notifications` | notification API | `NotificationController` | `notifications` | `CONNECTED` |

## Admin route and authority matrix

The admin application is deployed as its own frontend. Its browser paths are `/dashboard`, `/users`, `/events`, `/invitations`, `/templates`, `/payments`, `/packages`, `/notifications`, `/system-logs`, and `/reports`; they are not prefixed with `/admin`.

| Capability | Admin page | Backend surface | Status |
| --- | --- | --- | --- |
| Admin login/guard | `/login`, `RequireAdmin` | `/api/auth/login`, role assertion | `CONNECTED` |
| Users and roles | `/users`, `/users/:userId` | `/api/v1/admin/users*` | `CONNECTED` |
| Invitations/moderation | `/invitations*` | `/api/v1/admin/invitations*` | `CONNECTED` |
| Templates | `/templates*` | `/api/v1/admin/templates*` | `CONNECTED` |
| Payments | `/payments` | `/api/v1/admin/payments*`, admin template payments | `CONNECTED` |
| Packages | `/packages` | `/api/v1/admin/packages*` | `CONNECTED` |
| Notifications | `/notifications` | `/api/v1/admin/notifications*` | `CONNECTED` |
| Reports/analytics/health | `/reports`, `/system-logs`, dashboard | admin reports, analytics, health, logs, alerts | `PARTIAL` — broad contract; provider/live data requires deployment verification |

## Backend controller inventory and frontend coverage

| Controller | Endpoint family | Consumer / status |
| --- | --- | --- |
| `AuthController` | `/api/auth/*` | user/admin auth — `CONNECTED` |
| `UserController` | `/api/users/me*` | user profile — `CONNECTED` |
| `EventController` | `/api/v1/events*` | admin calls; user product model differs — `PARTIAL` |
| `InvitationController` | `/api/v1/invitations*`, public invitation | user/public — `CONNECTED` |
| `TemplateCatalogController` | `/api/v1/templates*` | user catalog — `CONNECTED` |
| `TemplatePaymentController` | payment creation, provider callbacks, access, internal/admin confirm | user/admin/bot — `CONNECTED`, staging verification required |
| `PaymentHistoryController` | `/api/v1/me/payments*` | user payment history/receipt — `CONNECTED` |
| `SubscriptionController` | packages/subscriptions | user/admin — `CONNECTED` |
| `GuestController` | invitation guests, grouped/search/import/export | user — `PARTIAL` |
| `RsvpController` | public RSVP/wishes, owner summaries/mutations | public/user — `PARTIAL` |
| `QrCodeController` | invitation/guest QR | user — `CONNECTED` |
| `CheckInController` | scan/manual/summary/history/undo | user — `PARTIAL` |
| `SeatingController` | plan/tables/assignments/summary/export | user — `PARTIAL` |
| `BudgetController` | budget/items/summary/export/admin view | user/admin — `CONNECTED` primary flows |
| `WeddingGiftController` | invitation gifts | user — `CONNECTED` |
| `MediaController` | upload/list/replace/delete/public media | user/public — `CONNECTED` |
| `InvitationDeliveryController` | prepare/share/email/reminders/events | user — `CONNECTED` primary flows |
| `NotificationController` | user notifications | user — `CONNECTED` |
| `OrganizationController` | organizations/members/roles | user — `PARTIAL` |
| `AiInvitationAssistantController` | invitation copy/story/formal/translate/timeline | user — `EXPERIMENTAL` |
| `DashboardReportController` | user/admin dashboards/reports/exports | user/admin — `PARTIAL` UX |
| `AdminManagementController` | canonical `/api/v1/admin/*` management surface | admin — `CONNECTED` |
| `AdminNotificationController` | admin notification campaigns | admin — `CONNECTED` |
| `AdminUserController` | legacy `/api/admin/users` | no new client work — `LEGACY` |
| `AdminInvitationController` | legacy `/api/admin/invitations` | no new client work — `LEGACY` |
| `I18nController` | `/api/v1/i18n/messages` | shared user UI — `CONNECTED` |
| `HealthController` | health/readiness | operations/admin — `CONNECTED` operationally |

## Backend-chief contract gaps

### 1. Organization permissions

Define explicit permissions such as `INVITATION_EDIT`, `GUEST_READ`, `GUEST_WRITE`, `CHECK_IN`, `SEATING_WRITE`, and `BILLING_READ`. Evaluate them in backend services against invitation organization membership; do not infer them from frontend role labels. Return effective permissions with organization/invitation context so controls can be rendered accurately.

### 2. AI provider adapter

The controller shape exists but the service always declines generation. A production contract needs provider abstraction, request/response validation, secret isolation, timeouts, bounded retries, prompt/data minimization, moderation, quotas, cost telemetry, and an explicit failure taxonomy. Guest lists or contact data must not be included by default.

### 3. Seating concurrency and bulk semantics

`assign-guests` is an alias around a single assignment shape rather than an atomic bulk command. Define a typed batch contract and transaction behavior, add a version/lock strategy for capacity, and return `409` with the current seating snapshot on conflict.

### 4. Dashboard partial data

Either provide one versioned dashboard projection with freshness metadata or expose per-domain error provenance. The frontend cannot truthfully distinguish zero from unavailable when failures are normalized to empty results.

### 5. Event aggregate ownership

Choose whether `Event` and `UserInvitation` are separate product concepts or whether one is legacy. Publish that decision in the API contract and migrate the user Events screen accordingly; maintaining two competing aggregates invites inconsistent counts and deletion behavior.

## Fixed contract mismatches in this pass

| Mismatch | Resolution |
| --- | --- |
| Route `:id` vs page `invitationId` | Standardized affected route params and route tests. |
| `invitationService.listMy()` nonexistent | Uses `listMine()`. |
| `rsvpService.listWishes()` nonexistent | Uses owner `listByInvitation()` and strict guest ID merge. |
| Server mutations falling back to local guest writes | Fail visibly for persisted invitations; local writes only for local drafts. |
| AI Apply sent response object plus unsupported `notes` | Sends a DTO-safe update and maps accepted text to `storyText`. |
| AI fallback hidden | Response exposes `LOCAL_TEMPLATE`, provider warning, and a non-AI title. |
| Missing user payment history client | Added list/detail/receipt calls for the existing controller. |
| Non-terminal payment QR states stopped polling | Polls until a recognized terminal status. |
| Organization controls defaulted owner when context missing | Permission helper now fails closed. |

No backend endpoint, request DTO, database migration, or authorization policy was silently changed.
