# Phase 10 — ABA PayWay, Secure Telegram Payment Reconciliation, Premium Purchases, Guest Contributions & Mobile-First Payment UX Modernization

## 1. Executive Summary

Phase 10 hardens, modernizes, and documents the payment, reconciliation, and guest financial contribution infrastructure of Koupreng E-Invitation. 

Operating under the commercial and architectural constraint that the platform operates with low implementation costs and without an approved, configured enterprise ABA merchant verification API integration, Phase 10 cements a robust, low-cost static ABA PayWay checkout flow paired with a defense-in-depth Telegram merchant notification worker and manual-review reconciliation engine.

### Key Milestones Achieved
- **Zero Client Self-Approval:** Client submissions (payer name, claimed last 3 digits, or payment slips) are strictly treated as claimant evidence. Premium template access and subscription tier benefits remain locked until server-authoritative settlement commits.
- **Server-Authoritative Pricing & Policy:** Template orders and subscription tiers enforce server-defined pricing and currencies (`TemplateCheckoutPolicy`, `SubscriptionPaymentPlanResolver`). Client-side price tampering or currency forging is impossible.
- **Dual Flow Separation (Platform Revenue vs Guest Gifts):**
  - **Flow A (Platform Revenue):** Template purchases and subscription plans paid to platform ABA links. Settles into platform revenue and grants digital entitlements.
  - **Flow B (Guest Contributions):** Wedding cash gifts and KHQR transfers sent directly to the event host's personal accounts. Managed in `/app/events/:eventId/gifts` with explicit "Manual record" designations, separate USD/KHR accounting, and zero platform fee or entitlement crossover.
- **Strict Multi-Currency Separation:** USD and KHR ledgers are completely decoupled. Decimal-safe arithmetic (`BigDecimal` / `Decimal.quantize("0.01")`) prevents floating-point rounding errors. Zero arbitrary exchange rate conversions.
- **Telegram Bot Ingestion & Reconciliation:**
  - Group Privacy Mode and Bot-to-Bot communication realities accounted for with explicit webhook configuration.
  - Allowlisted numeric chat IDs and verified merchant sender IDs (`PayWayByABA_bot`).
  - Webhook protection via `secret_token` and `X-Admin-Payment-Secret`.
  - Replay prevention via unique database constraints on `payway_transaction_id` and pessimistic locking (`SELECT ... FOR UPDATE`).
  - Safe default: `AUTO_CONFIRM_TELEGRAM_DETECTED=false` routes ambiguous, multi-candidate, or unverified alerts to the admin review queue.
- **Modernized Admin Payment Review Workspace (`AdminPaymentsFeature.jsx`):**
  - Added status filter tabs: `All`, `Pending`, `Review Required`, `Paid / Confirmed`, and `Failed / Expired / Rejected`.
  - Rich metadata display: Internal order code, item type, expected amount/currency, payer details, bank transaction reference, and timestamps.
  - Privileged confirmation modal deriving operator identity strictly from authenticated Spring Security context (`Authentication.getName()`), preventing client spoofing.
- **Mobile-First Responsiveness:**
  - Full fluid responsiveness from 280px folded screens to 2560px ultra-wide monitors.
  - Native iOS Safari compatibility with minimum 44px touch targets, safe area insets, and zero zoom-triggering form inputs (16px base font).
  - Clear banking app handoff instructions and non-destructive countdown timers.
- **Zero Flyway Breakage:** All 48 existing migrations remain completely immutable (`migrationCount: 48, changedMigrations: []`).

---

## 2. Phase 10 Document Map

| Document | Purpose |
|---|---|
| [payment-architecture.md](payment-architecture.md) | End-to-end payment architecture, sequence flows, state machine, and threat boundaries. |
| [static-aba-checkout.md](static-aba-checkout.md) | Low-budget static PayWay link analysis, QR presentation, and banking app handoff. |
| [telegram-bot-ingestion.md](telegram-bot-ingestion.md) | Telegram bot worker architecture, bot-to-bot delivery realities, and webhook security. |
| [reconciliation-security.md](reconciliation-security.md) | Multi-factor reconciliation, collision handling, replay defense, and anti-fraud rules. |
| [admin-payment-review.md](admin-payment-review.md) | Modernized Admin Payments feature, filter tabs, modal verification, and audit logging. |
| [subscription-entitlements.md](subscription-entitlements.md) | Commercial subscription package policy, historical seed pricing, and entitlement boundaries. |
| [guest-gifts-contributions.md](guest-gifts-contributions.md) | Complete isolation of wedding gifts from platform revenue, dual currency, and digital envelopes. |
| [responsive-accessibility.md](responsive-accessibility.md) | Cross-device audit (280px–2560px), iOS Safari handling, touch targets, and bilingual WCAG 2.2 AA. |
| [integration-test-results.md](integration-test-results.md) | Concrete execution evidence for Vitest, Maven, Pytest, Ruff, Bandit, and Flyway checks. |
| [operator-setup-guide.md](operator-setup-guide.md) | Operations manual for environment secrets, Telegram numeric IDs, and manual settlement. |
| [backlog.md](backlog.md) | Completed Phase 10 items, remaining owner decisions, and Phase 11 boundaries. |

---

## 3. Verified Delivery Baseline

- **Repository:** `Ny-Panha/Koupreng-invitation_project`
- **Branch:** `main`
- **Baseline Phase 09 HEAD:** `de53bb54f47daa51a298f2ebca2640340cf5a315`
- **Total Migrations:** 48 migrations (V1 to V48 intact, 0 modified)
- **Quality Gates:** 100% test pass rate across Frontend User Vitest, Frontend Admin Vitest, Backend Spring Boot Maven tests, and Python Telegram Bot Pytest/Bandit.
