# Static ABA payment completion — 2026-10-13

Implementation prepared on `fix/static-aba-payment-completion`; publication to `main` was subsequently requested by the user. No production deployment or real bank transaction was performed. Concurrent agent-instruction/skill changes are preserved separately.

## A. Existing functionality reused

Server-priced fixed PayWay links, payer checkout, pending orders, subscription activation/locking, premium entitlements, inline guest/gift forms, companion ticket name, expense installments, media storage, reports, webhook secrets and existing tests.

## B. Fixes

| Files/modules | Business behavior |
|---|---|
| `SubscriptionService`, `TelegramDetectSubscriptionPaymentRequest`, `SubscriptionController` | Default-off settlement; name/reference/time/candidate checks; review/expired handling; evidence-backed manual confirmation |
| `PaymentEvidenceService`, `PaymentEvidence`, `PaymentEvidenceRepository`, new `V33__payment_evidence_and_notification_delivery.sql` | Shared durable transaction claim, original-message uniqueness, retained unmatched evidence; historical migration files unchanged |
| `TemplatePaymentService`, payment DTOs/controllers/history/confirmation services | Buyer review queues Telegram notification; manual confirmation requires recorded real bank ID and authenticated operator; all settlement paths share the claim guard |
| `PaymentNotificationService`, `PaymentNotificationDispatcher`, existing notification model/repository/service | Durable committed notification queue, short delivery leases, bounded retries and repeat-request suppression |
| `apps/telegram-bot/main.py` | Original numeric-allowlisted alerts, no-reference subscription routing, original-reply `/detect`, authenticated notification endpoint, metadata extraction and delivery retries |
| `PaymentQrCard.jsx`, `khqr.js` | Backend fixed-link QR; backend expiry; internal checkout ID clearly distinguished from bank ID; no invented KHQR/expiry/reference retention |
| `SubscriptionPackagesPage.jsx`, `AdminPaymentsFeature.jsx` | Poll through review; success requires ACTIVE + PAID + active entitlement; manual review supplies recorded bank ID |
| `AuthService`, `RegisterRequest`, `RegisterFeature.jsx` | Eight characters and uppercase requirement; existing number rule retained |
| `BudgetService`, `useExpenses.js` | Expense actual total calculated from valid installment entries, not caller scalar |
| `AdminReportOverview.jsx` | Backend category/tier/currency aggregates rendered correctly; USD/KHR separate; failed loads retain an error state |
| `application.properties`, `.env.example`, `docker-compose.yml`, `OpenApiConfig`, `packages/api-contracts/openapi.yaml`, `.github/workflows/ci.yml` | Notification routing/configuration, updated API contracts and CI coverage for payment-evidence concurrency tests |

Focused tests accompany the changed behavior. Khmer Celestial template styling and unrelated working-tree edits were preserved.

## C. Payment flow

Subscription Buy → payer details → backend PENDING_PAYMENT order → committed Telegram pending notification → existing fixed PayWay link → original ABA merchant alert → trusted bot detection → backend matching/evidence → PAID/ACTIVE **only under explicit opt-in and safe unique matching**, otherwise REVIEW_REQUIRED/UNMATCHED → browser polling.

With automatic mode disabled, an authorized operator inspects the original evidence and explicitly confirms the correct order using its real recorded transaction ID. A customer's template verification request only queues review.

## D. Professor revision status

| Revision | Status | Evidence |
|---|---|---|
| 1. Password minimum eight + uppercase | DONE | DTO/service and registration UI rejection tests |
| 2. Subscription packages | PARTIAL | Checkout, matching, activation and refresh paths tested; live merchant delivery/controlled transaction still required |
| 3. Inline guest add/edit | DONE | Existing `GuestTable` and guest authority/persistence tests passed |
| 4. Companion ticket name | DONE | Existing `GuestQrModal` uses the selected guest's `companionName`; targeted tests passed |
| 5. Actual expense read-only | DONE | Existing read-only field; server derives actual cost from installment entries; spoofed scalar test passed |
| 6. Inline gift-money form | DONE | Existing `GiftTable` and gift tests passed |
| 7. ABA verification and premium restriction | PARTIAL | Review notification and pending-access tests passed; actual Telegram delivery/bank scanner behavior requires external validation |
| 8. Event/revenue/category/subscription reports | DONE | Backend aggregate/currency tests and admin rendering test passed |
| 9. Event image upload/preview/persistence | DONE | Upload hook invokes API and retains returned preview URL; backend media unit/MySQL integrity tests passed |

## E. Tests actually executed

| Check | Result |
|---|---|
| Backend broader `mvnw.cmd clean verify -Dopenapi.contract.update=true` | 426 regular tests passed; 25 MySQL-gated tests skipped here and executed separately. Initial PMD import-style failure corrected. |
| Final focused `mvnw.cmd -Dtest=SubscriptionServiceTests,TemplatePaymentServiceTests package spotbugs:check pmd:check` | 65 passed; JAR packaged; SpotBugs zero bugs/errors; PMD passed |
| Disposable MySQL 8 migration/auth/subscription/guest/media/entitlement/report/evidence slice | 25 passed, zero skips; includes concurrent cross-product claims, fresh schema and append-only upgrade preservation |
| Latest backend XML aggregate across these runs | **452 tests, zero failures/errors/skips** (includes the additional review-expiry test) |
| Both frontends: lint, Vitest, `analyze:knip`, `analyze:deps`, build | Passed; user 82 test files, admin 46 tests |
| Telegram: Ruff, pytest, Bandit, compileall | Passed; **72 pytest tests** |
| Playwright critical-routes + route-smoke, one worker | **56 passed**, desktop/mobile Chromium, retries disabled |
| Repository config regression + Compose interpolation | **5 passed**; `docker compose config --quiet` exit 0 |

Evidence logs are retained under `.cache/static-aba-*`; the isolated MySQL process on port 33319 was shut down after verification. The existing application database was not modified. Existing dependency deprecations, isolated-DOM external-resource notices and bundle-size warnings remain; no test assertion was disabled.

## F. External setup

See [the reconciliation setup guide](subscription-static-payment-reconciliation.md#external-setup-still-required): enable BotFather Communication Mode; arrange group admin/privacy permissions; confirm real merchant sender and group IDs; configure shared/internal/webhook secrets; register the HTTPS webhook; validate a redacted real alert; authorize a controlled bank transaction; only then consider enabling `AUTO_CONFIRM_TELEGRAM_DETECTED`.

No live webhook registration, merchant account changes or real bank transaction was performed. Fixed link amount, bank scanner compatibility, actual delivery and reference retention are not inferred from local tests.

## G. Security summary

Buyer claims never grant access. Backend order identifiers are not ABA transaction IDs. Ambiguous payments cannot auto-activate. A shared database claim prevents reuse across orders/product types. Pending premium access remains restricted. Normalized evidence and original Telegram identifiers are stored instead of unrestricted raw bank text. Unmatched/expired evidence remains available for authorized investigation. Telegram evidence is not official ABA API verification; automatic settlement stays disabled until operational validation.
