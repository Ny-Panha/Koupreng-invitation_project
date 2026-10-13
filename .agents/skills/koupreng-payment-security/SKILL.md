---
name: koupreng-payment-security
description: "Security architecture, threat mitigation, and reconciliation rules for Koupreng's ABA PayWay and Telegram merchant alert payment flow. Use when modifying payment controllers, webhook handlers, Telegram bot ingestion, subscription activation, order settlement, or financial audit trails."
---

# Koupreng Payment Security & Reconciliation Standards

## 1. System Architecture Overview

Koupreng operates a cost-conscious, low-budget payment architecture designed for Cambodia's banking ecosystem without recurring expensive enterprise API fees:

```text
1. Customer initiates template/subscription order
   │
   ▼
2. Backend creates PENDING Order (server-owned price, currency, orderCode)
   │
   ▼
3. Customer transfers via static ABA PayWay QR/Link
   │  Customer submits claim (payer name, last 3 ABA account digits, timestamp)
   │  Order status remains: PENDING (never self-approved by client input!)
   │
4. Telegram Merchant Alert Bot receives official ABA bank push in merchant channel
   │
   ▼
5. Telegram Bot worker verifies message origin & forwards to Backend internal webhook
   │  Header: X-Admin-Payment-Secret / HMAC signature
   │
   ▼
6. Backend Payment Reconciliation Engine (Pessimistic Lock, Idempotent)
   ├─ Exact amount match (e.g. 5.00 USD)
   ├─ Exact currency match (USD vs KHR)
   ├─ Payer suffix match (last 3 digits) or fuzzy name match
   ├─ Unique transaction ID validation (checks replay prevention)
   │
   ├─ MATCH FOUND  ──► Order Status = PAID ──► Entitlements granted
   └─ AMBIGUOUS   ──► Order Status = PENDING_REVIEW ──► Alert admin console
```

---

## 2. Cardinal Security Invariants

1. **Zero Browser Self-Approval:**
   Client input (payer name, claimed amount, uploaded slip, or last 3 account digits) is strictly *untrusted claimant evidence*. No order, template access, or subscription tier may be marked `PAID` or activated solely based on browser submissions.
2. **Server-Owned Prices:**
   Prices and currency rules are defined exclusively on the server in database catalogs (`TemplatePaymentOrder`, `SubscriptionTier`). The backend rejects any client request attempting to supply an arbitrary price.
3. **Replay & Cross-Order Prevention:**
   Every bank transaction ID (`payway_transaction_id`) is stored with a unique database constraint. An alert cannot be reused to confirm multiple orders.
4. **Currency Separation:**
   USD and KHR must never be conflated. An order priced at $5.00 USD cannot be settled by 5.00 KHR, and vice versa.
5. **No Blind Trust in Static Payment Links:**
   Because a static ABA payment QR/link does not carry dynamic order references into the bank's alert message, the system relies on multi-factor reconciliation (amount + currency + timestamp window + payer suffix + optional remark).
6. **Data Minimization:**
   Never store full bank account numbers, credit card CVVs, or unmasked sensitive PII. Only store the last 3 account digits (`payer_account_last3`), payer display name, and the official bank transaction reference.

---

## 3. Webhook Boundary Protection

The endpoint receiving alerts from the Telegram worker (`/api/v1/payments/webhook/telegram-detect`) must enforce:

- **Secret Token Validation:** Validate `X-Admin-Payment-Secret` matching `ADMIN_PAYMENT_SECRET`.
- **Sender Whitelisting:**
  - Verify message originates from authorized Telegram channel/group IDs (`TELEGRAM_ALLOWED_GROUP_IDS`).
  - Verify sender username or bot ID matches ABA merchant alert bot (`TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES=PayWayByABA_bot`).
- **Audit Logging:** Every incoming webhook payload is logged verbatim to `payment_webhook_logs` with source IP, timestamp, and signature status before parsing.

---

## 4. Concurrency & Idempotency Controls

- **Pessimistic Locking:** When matching and settling an order, acquire a database row lock (`SELECT ... FOR UPDATE` via `LockModeType.PESSIMISTIC_WRITE`) on `TemplatePaymentOrder` to prevent race conditions from concurrent webhook retries.
- **Idempotency Key:** If an identical webhook payload or duplicate transaction alert is received, return HTTP 200 with cached result without duplicate balance or access allocation.
- **Audit Trails:** All manual overrides by system administrators must record the admin's identity (`confirmed_by`), reason, timestamp, and original evidence in `payment_evidence`.

---

## 5. Detailed References

- [ABA & Telegram Reconciliation Flow](references/aba-telegram-reconciliation.md)
- [Payment Threat Model & STRIDE Analysis](references/payment-threat-model.md)
- [Reconciliation Invariants & Edge Cases](references/reconciliation-invariants.md)

