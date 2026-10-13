# Reconciliation Invariants & Edge Cases

## 1. Multi-Candidate Collision

If two distinct orders for $5.00 USD are pending at the same time and both claim the same last 3 digits:
- **Action:** Automated confirmation is blocked (`autoConfirm = false`).
- **Status:** Both orders are placed into `PENDING_REVIEW`.
- **Resolution:** Administrator reviews payment timestamps, payer name, and bank alert remark manually in the Admin Console.

## 2. Underpayment / Overpayment

- If customer sends $4.00 for a $5.00 order:
  - System logs mismatch: `AMOUNT_MISMATCH`.
  - Order remains `PENDING`.
  - Admin notified to request balance or process refund.
- If customer sends $10.00 for a $5.00 order:
  - System logs overpayment: `OVERPAYMENT`.
  - Order flagged for admin review before access is confirmed.

## 3. Order Expiration Window

- Orders remain in `PENDING` state for a maximum of 24 hours (`order_expires_at`).
- Expired orders cannot be auto-reconciled. If a bank alert arrives after expiration, it moves to `EXPIRED_ALERT_NEEDS_REVIEW`.

