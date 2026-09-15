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
