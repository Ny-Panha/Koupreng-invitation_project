# Payment Reconciliation Engine & Anti-Fraud Controls

## 1. Multi-Factor Reconciliation Matrix

Because static ABA PayWay checkout links do not carry dynamic, cryptographically bound order metadata into the bank's transaction push, the backend reconciliation engine (`PaymentEvidenceService.java`, `TemplatePaymentService.java`, `SubscriptionService.java`) applies a multi-factor matching algorithm:

| Factor | Evaluation Rule | Failure Action |
|---|---|---|
| **Currency** | Exact match (`USD` vs `KHR`). No auto-conversion. | `CURRENCY_MISMATCH` -> Rejection / Review |
| **Amount** | Exact decimal match (`5.00` vs `5.00`). Decimal-safe comparison. | `AMOUNT_MISMATCH` -> Rejection / Review |
| **Time Window** | Alert timestamp must fall within `[createdAt - 60s, expiresAt]`. | `OUTSIDE_WINDOW` -> Retain evidence for Admin Review |
| **Payer Suffix** | Last 3 digits extracted from account mask (`***789`) must match claim. | Inconclusive -> Routes to Admin Review Queue |
| **Transaction ID** | Real ABA transaction ID (`payway_transaction_id`) must be unique. | `DUPLICATE_TRANSACTION` -> Rejection / Collision Flag |
| **Remark / Ref** | Optional: Matches order code (e.g. `EVT261110101` or `SUB2611100001`). | Discrepancy -> Routes to Admin Review Queue |

---

## 2. Invariant: Default to Manual Review Queue

In accordance with Phase 10 safety constraints:
```properties
app.payment.auto-confirm-telegram-detected=false
```
Unattended, automatic settlement is **disabled by default**. Even when a Telegram alert parses with valid amount and currency:
1. `PaymentEvidence` is recorded with outcome `REVIEW_REQUIRED`.
2. The order status is set to `PAID_PENDING_REVIEW`.
3. The order appears in the administrative review queue in `AdminPaymentsFeature.jsx`.
4. Digital entitlements (template access or subscription activation) **remain locked** until an authorized human administrator reviews the evidence and clicks "Confirm".

---

## 3. Handling Edge Cases & Collision Scenarios

### Scenario A: Multi-Candidate Collision
- **Condition:** Two independent users order the same $15.00 USD template within the same 10-minute window, and neither banking alert includes an explicit order code remark.
- **Engine Behavior:**
  - Automated confirmation is blocked.
  - Both candidate orders are placed into `PAID_PENDING_REVIEW`.
  - The evidence record is marked with `outcome = REVIEW_REQUIRED`.
  - The administrator examines the exact bank timestamps, payer names, and bank push sequence to attribute the payment manually.

### Scenario B: Replay Attack Defense
- **Condition:** An attacker spots a transaction ID posted in a shared chat and attempts to claim it against their own pending order.
- **Engine Behavior:**
  - `PaymentEvidenceRepository.reserve(...)` uses an atomic `INSERT ... ON DUPLICATE KEY UPDATE` to claim the transaction ID row lock.
  - If the evidence was already claimed (`outcome = PAID`), or is linked to another order code, `PaymentEvidenceService.claim(...)` throws:
    ```
    HTTP 409 CONFLICT: "Merchant evidence is unavailable, conflicts with this order, or was already used"
    ```
  - The database unique constraint on `template_payment_orders.payway_transaction_id` acts as a fail-safe against concurrent threads.

### Scenario C: Cross-Product Collisions
- **Condition:** A single transaction ID is claimed for both a template purchase and a subscription purchase.
- **Engine Behavior:**
  - `SubscriptionService.java` explicitly queries `templatePaymentOrderRepository.existsByPaywayTransactionId(transactionId)`.
  - If a template order already claimed that transaction ID, the subscription settlement is immediately rejected with:
    ```
    SUBSCRIPTION_PAYMENT_DUPLICATE_TRANSACTION
    ```

### Scenario D: Late Arrival (Expired Orders)
- **Condition:** A bank alert arrives after the 30-minute order session has expired.
- **Engine Behavior:**
  - The order is marked `EXPIRED`.
  - The bank alert is stored as `UNMATCHED` / `REVIEW_REQUIRED`.
  - The customer is not automatically granted access; an admin can manually reconcile or issue a replacement order.
