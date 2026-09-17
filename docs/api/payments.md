# Payment confirmation API

## Administrative confirmation

`POST /api/v1/admin/payments/confirm` is the canonical ADMIN-only manual confirmation boundary for server-created template and subscription orders.

```json
{
  "orderCode": "SUB2609151234",
  "amount": 19.00,
  "confirmedBy": "admin-demo",
  "itemType": "SUBSCRIPTION"
}
```

`itemType` is `TEMPLATE` or `SUBSCRIPTION`. The backend reloads and locks the identified order, compares the submitted amount to the server-owned amount/currency, checks its current state, records confirmation evidence, and performs the matching fulfillment. Repeating a confirmed subscription request returns the existing paid outcome without creating another entitlement.

The existing `POST /api/v1/admin/template-payments/confirm` route remains a compatibility contract for template-only callers. Public return/success pages never confirm payment.

Possible stable failure codes include `PAYMENT_ITEM_TYPE_INVALID`, `PAYMENT_AMOUNT_MISMATCH`, `SUBSCRIPTION_NOT_PENDING`, and `SUBSCRIPTION_ACTIVATION_CONFLICT`.

## Static subscription checkout

`POST /api/v1/me/subscriptions/purchase` accepts only the package ID, ABA account holder name, and account last three digits. Price and PayWay URL are selected on the server for `BASIC` (USD 0.01), `PRO` (USD 199.00), and `PREMIUM` (USD 499.00). The response is a pending order; opening PayWay never activates it.

Authenticated owners poll `GET /api/v1/me/subscriptions/orders/{orderCode}`. The internal bot-only endpoint `POST /api/v1/internal/subscription-payments/telegram-detect` is protected by `X-ADMIN-PAYMENT-SECRET` and returns `PAID`, `ALREADY_PROCESSED`, `UNMATCHED`, or `REVIEW_REQUIRED`.

This flow reconciles merchant Telegram evidence after an allowlisted administrator reply. It does not use the official ABA PayWay verification API.
