# Phase 10 Backlog, Commercial Decisions & Phase 11 Boundaries

## 1. Completed Phase 10 Items

- [x] **PAY-1001 (Architecture Audit):** Audit current static PayWay link architecture, server-authoritative catalogs, and dual-ledger separation.
- [x] **PAY-1002 (Template Checkout Modernization):** Refine template purchase order flow, QR generation without arbitrary KHQR payload forging, and persistent pending state.
- [x] **PAY-1003 (Subscription Checkout):** Preserve approved subscription packages (BASIC $0.01, PRO $199, PREMIUM $499), enforce server price authority, and lock pending orders from feature access.
- [x] **PAY-1004 (Telegram Worker Webhook Hardening):** Strict secret token checking (`X-Telegram-Bot-Api-Secret-Token`), numeric group allowlisting, numeric sender validation, and originality checking.
- [x] **PAY-1005 (Anti-Replay & Concurrency):** Enforce unique constraints on `payway_transaction_id`, pessimistic locking via `SELECT ... FOR UPDATE`, and cross-product collision checks.
- [x] **PAY-1006 (Admin Payment Verification Modernization):** Modernize `AdminPaymentsFeature.jsx` with real-time status filter tabs (All, Pending, Review Required, Paid, Failed), rich order metadata, and privileged manual confirmation modal.
- [x] **PAY-1007 (Payment History & Receipts):** Accurate backend statuses, bounded status polling, and receipts that strictly require `status = "PAID"`.
- [x] **PAY-1008 (Guest Gifts Decoupling):** Complete firewall between platform revenue and wedding guest gifts in `/app/events/:eventId/gifts`. Dual USD/KHR separation without speculative currency conversions.
- [x] **PAY-1009 (Cross-Device & Mobile Responsiveness):** Fluid layout from 280px to 2560px, iOS Safari input zoom fixes (16px base font), 44px minimum touch targets, and banking app handoff.
- [x] **PAY-1010 (Automated QA & Security Scan):** 100% pass rate across Vitest (User + Admin), Maven, Pytest, Ruff, and Bandit. All 48 Flyway migrations preserved.

---

## 2. Outstanding Owner Commercial Decisions

Per `docs/OWNER_TEMPLATE_PRICING_DECISION.md` and `docs/OWNER_ENTITLEMENT_DECISION.md`:

1. **Template Catalog Pricing Approvals:**
   - Currently, only `garden-royal-khmer-wedding` has an active server-authorized legacy static offer ($0.01 USD).
   - Other templates (`khmer-celestial`, `royal-khmer-wedding`, `emerald-luxe`) remain free or subject to owner review before enabling individual paid checkouts.
2. **Official Enterprise ABA Merchant API:**
   - If the business acquires an official ABA Merchant Agreement in the future, dynamic PayWay API checkout (`AbaPayWayService.java`) can be configured by setting `app.payment.provider-mode=aba_payway` without breaking client contracts or database schemas.
3. **Commercial Subscription Policy:**
   - System remains in `ENFORCE_PACKAGE_POLICY=false` until owner approves the final free-tier quota numbers and paid package pricing adjustments.

---

## 3. Strict Boundary: Phase 11 Scope

Phase 10 is complete. **Do NOT begin Phase 11 (General Admin CMS Modernization)** without explicit user approval.
Phase 11 encompasses:
- General Admin CMS and template catalog editing tools.
- Multi-user administrative permissions and audit dashboard expansion.
- Content and marketing page management.
