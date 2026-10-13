# Payment Threat Model & STRIDE Analysis

## 1. Threat Matrix

| STRIDE Category | Threat Description | Koupreng Defense Mechanism |
|---|---|---|
| **Spoofing** | Attacker calls `/webhook/telegram-detect` with fake bank alerts | Enforce `X-Admin-Payment-Secret` matching `ADMIN_PAYMENT_SECRET`. Whitelist incoming Telegram chat/group IDs and sender bot IDs. |
| **Tampering** | Client alters amount or order code in claim request | Server recalculates expected total from database template record. Client amount is purely advisory claimant evidence. |
| **Repudiation** | User claims payment was settled but denied access | Full audit trail in `payment_webhook_logs`, `payment_evidence`, and immutable timestamps on `template_payment_orders`. |
| **Information Disclosure** | Leakage of customer bank account numbers or financial data | Data minimization: Store only masked last 3 digits (`***123`). Never log full bank details. |
| **Denial of Service** | Flooding webhook endpoint with bogus payloads | Rate limiting in Nginx and Redis; early rejection of unauthenticated payloads. |
| **Elevation of Privilege** | Normal user calling manual settle endpoint `/confirm` | Role check: `@PreAuthorize("hasRole('ADMIN')")`. |

## 2. Replay Attack Prevention

A malicious user who spots a payment alert in a shared group could try claiming the same transaction code.
- Defense: `payway_transaction_id` has a `UNIQUE` database constraint in `template_payment_orders`.
- The database enforces that no two orders can reference the same transaction ID.

