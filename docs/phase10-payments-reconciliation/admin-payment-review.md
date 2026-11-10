# Modernized Admin Payment Verification & Review Workflow

## 1. Overview of `AdminPaymentsFeature.jsx`

In Phase 10, the admin payment review experience (`apps/frontend-admin/src/features/payments/AdminPaymentsFeature.jsx`) was modernized to provide an executive review dashboard for verifying pending orders, inspecting evidence, and confirming payments safely.

```text
┌────────────────────────────────────────────────────────────────────────┐
│  Admin Payments Dashboard                                              │
│                                                                        │
│  [ Total: 3 ]     [ Pending: 2 ]     [ Paid: 1 ]     [ Failed: 0 ]     │
│                                                                        │
│  Tabs: [ All (3) ] [ Pending (2) ] [ Review (1) ] [ Paid (1) ] [ Failed ]│
│  Search: [ Search payments...                                      ]   │
├────────────────────────────────────────────────────────────────────────┤
│  Order Code  Item          Type     Amount     Status   Payer/Ref  Action│
│  KPR-TMP-101 Celestial     TEMPLATE USD 15.00  PENDING  Sok Chan   [Confirm]
│  SUB-PKG-202 Diamond VIP   SUBSCRIP USD 29.00  REVIEW   Dara (*789)[Confirm]
│  KPR-TMP-303 Emerald Luxe  TEMPLATE USD 12.00  PAID     Sophea     —   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Status Filter Tabs

The workspace includes real-time filter tabs that filter orders instantly without server-side round trips:
1. **All (`ALL`):** Displays all historical and active payment orders.
2. **Pending (`PENDING`):** Filters for orders awaiting payment or bank notifications.
3. **Review Required (`REVIEW`):** Isolates orders in `REVIEW_REQUIRED` or `PAID_PENDING_REVIEW` state requiring operator attention.
4. **Paid / Confirmed (`PAID`):** Lists successfully settled orders.
5. **Failed / Expired (`FAILED`):** Lists orders in `FAILED`, `REJECTED`, `CANCELLED`, or `EXPIRED` status.

---

## 3. Privileged Manual Verification Modal

When an administrator clicks "Confirm" on an eligible order:
1. **Authoritative Amount Display:** The modal prominently displays the server-authoritative amount and currency (e.g. `USD 15.00`), preventing operator input of forged amounts.
2. **Mandatory Transaction Reference:** The operator must provide the official ABA bank transaction reference (`ABA PayWay Transaction Reference / Merchant Alert ID`).
3. **Derived Operator Identity:**
   In `PaymentConfirmationController.java`:
   ```java
   paymentConfirmationService.confirm(new ConfirmPaymentRequest(
       request.orderCode(),
       request.amount(),
       authentication.getName(), // Derived strictly from Spring Security Context!
       request.itemType(),
       request.paywayTransactionId()
   ))
   ```
   The browser cannot override the `confirmedBy` attribute; the backend binds the actual authenticated admin account identity.
4. **Atomic Settlement & Rollback:** The settlement executes inside a database transaction (`@Transactional`). If evidence verification fails or access grant fails, the entire transaction rolls back cleanly.

---

## 4. Audit Logging & Non-Repudiation

Every manual confirmation is logged to `AuditLogService` with:
- Action: `MANUAL_ADMIN`
- Operator Username: Authenticated admin ID
- Timestamp: ISO-8601 UTC
- Order Code & Item Type
- Bank Transaction Reference
- IP Address & Request ID
