# Backend, API and database compatibility

## Critical flow traces

| Flow | UI → client → backend → persistence | Contract to preserve |
|---|---|---|
| Owner create | `EventCreatePage.jsx` → `invitationApi.create` → `InvitationController` POST `/api/v1/invitations` → `InvitationService` → `UserInvitationRepository` | Server-owned user/template/access; `clientRequestId`; event type/language compatibility; quotas; draft status |
| Owner edit/publish | Studio → `invitationApi.update/publish` → invitation controller PUT and PATCH `/invitations/{id}/publish` → service/policies → invitations | Preserve unknown `contentJson`/`designJson`, expected-update concurrency, published/private visibility and entitlement decisions |
| Guest read | `/i/:slug` or `/w/:slug` → `invitationApi.publicBySlug/publicGuestView` → GET `/public/invitations/{slug}` and guest-view → published/token policy | A slug or client-side view flag must not bypass private/password/personalized policies |
| RSVP | `PublicRsvpForm` → `rsvpApi` → `RsvpController` general/personalized endpoints → `RsvpService` → guest and RSVP repositories | Deadline, invite token, guest-link-required duplicate recovery, seat counts, privacy-safe response |
| Guest operations | Guest workspace → `guestApi` page/overview/import APIs → guest controllers/services → guest records/batch receipts | Paging/source of truth, owner/permission policy, idempotent import commit, export authorization |
| Media | Media manager/editor → `mediaApi` multipart → `MediaController`/`MediaService` → validator/storage port → metadata repository | MIME+extension+signature/size limits, type-specific entitlement, private access, transactional cleanup |
| Premium | Checkout/status → `paymentsApi.createStaticPaymentOrder/getOrderStatus/claimPayment` → `TemplatePaymentController` → `TemplatePaymentService` → orders/evidence/access repositories | Trusted server PAID only; exact amount/currency/order; claim/review never equals settlement |
| Subscription | Packages UI → subscription service → subscription controllers/application → subscriptions/benefit snapshots | Snapshot benefits/quotas; no client-inferred premium; template purchase and subscription remain distinct |
| Team | Organization/EventTeam panels → organization APIs → collaboration/organization services → memberships and invitations | Owner permissions versus team permissions; acceptance proof and role revocation |
| Reports | FinancialReport/admin reports → report API → reporting query/export services → SQL/JPA | Snapshot/filter/timezone semantics, owner/admin scopes, separate USD/KHR totals, formula-safe exports |

`evidence/backend-annotation-inventory.json` contains exact controller mappings and line locations. Source OpenAPI examples/test contract exist; no running server's OpenAPI was fetched. Success envelopes and direct auth responses must both remain compatible with existing clients. Keep `GlobalExceptionHandler` error code/details shape so field/access/retry UI continues to work.

## Database evidence and preserved invariants

48 SQL migrations through V51 were inventoried and SHA-256 recorded. Existing schemas include historical event/payment tables as well as current invitation/template order models; source presence alone is insufficient proof of dead tables. No migration, schema, row or database configuration was changed.

- V37 adds template event/language compatibility and a unique `(user_id, client_request_id)` invitation request index. Preserve that identity when submitting/retrying from mobile.
- V33 adds globally keyed merchant transaction evidence, unique `(chat_id,message_id)` and payment delivery keys; V34 adds transaction date. Duplicate evidence must not fund both a template order and subscription.
- V26 introduces explicit currencies in wedding finances; amounts remain decimal and USD/KHR totals stay separate. Styling must not collapse them into a single misleading sum.
- V38/V39 cover ticket-design persistence/cleanup; V41 import receipts; V42 seating layouts; V43 gift request identity; V44–46 benefit snapshots/free fallback; V47/V48 team acceptance; V49 guest dashboard ordering index; V50/V51 catalog retirement/Floral registration.
- Base JPA `open-in-view=false` is useful: service DTO mapping must load required relationships deliberately. Some services use explicit transaction isolation/locks and reporting/query-growth tests; no N+1 defect was confirmed by this audit. Large unpaged lists remain a scale verification target, not a proven incident.

Full backend tests execute unit, MockMvc, H2 query/integration and architecture checks. **82 environment-gated tests are skipped**, including real MySQL uniqueness/locks, migration upgrade/fresh schema and scale checks. Actual applied migration checksums, entity/schema compatibility, EXPLAIN plans and concurrent payment/guest/import correctness cannot be certified from the filesystem.

## Payment/auth security detail

`TemplatePaymentService.handlePaywayCallback` verifies a supplied signature when present and uses remote transaction verification before marking a paid callback complete. A missing callback signature alone is **not** evidence of an unsigned-payment bypass: the server-side approval/amount/currency/order verification path must be traced. Provider verification occurs outside the database transaction, followed by a locked completion path. Preserve that separation and idempotent already-PAID behavior.

Telegram merchant detection distinguishes trusted evidence from user review claims. Administrator/internal confirmation routes use separate security checks. Frontend payment return parameters are not payment authority; this is exercised by browser tests. No real callback, merchant alert, external payment or entitlement write was sent in this phase.

Auth has bearer and optional cookie modes. Disabling CSRF for stateless Authorization-header requests is not automatically a defect. Cookie mode explicitly uses CSRF protection and tests. Production SameSite/HTTPS/cross-origin behavior still needs an actual deployed flow; do not relax CORS or CSRF to make mobile tests pass.

## Implemented versus optional integrations

Cloudinary and local storage adapters are present. External storage behavior was not verified with credentials or real uploads. Google and Telegram identity verification code/tests exist, but no actual provider sign-in occurred. The Python service is a Telegram webhook/delivery service, not evidence of a separate FastAPI AI generator. Java AI has a provider interface, timeout/fallback and entitlement boundary; no concrete provider implementation was discovered. Public wishes deliberately return empty lists in current service overloads—confirm product/privacy intent before proposing a wall.

## Phase 02 compatibility boundary

AU-001–006 and semantic/layout/test changes should require **no backend endpoint, DTO, role, package, storage policy or schema changes**. Existing client serialization and preview message validation remain authoritative. If implementation unexpectedly needs one, separate the proposed contract change with evidence and targeted backend tests; do not smuggle it into a design foundation task. Never edit V1–V51 retrospectively.

Next database verification: provision task-owned disposable MySQL 8 schemas, then run existing fresh/upgrade/integrity tests with their documented environment variables. Do not point those suites at production, a teammate's schema or an unverified computed database name. Validate production Flyway configuration and backup restore separately before release.
