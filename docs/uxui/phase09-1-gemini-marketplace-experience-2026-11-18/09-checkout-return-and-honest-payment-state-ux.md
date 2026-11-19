# Chapter 09 — Checkout, Return & Honest Payment State UX

## 1. Decision Surface at `/templates/:templateId/checkout`

- Displays verified template metadata and approved server price.
- Explains ABA PayWay reality: The QR code on subsequent screen opens an external PayWay link, not a dynamic KHQR with locked amount. User must check amount and recipient.
- Discloses that proof submission or provider return is not instant approval; server settlement verification is required before access is granted.
- Validates order creation response with regex `^[A-Za-z0-9_-]{1,100}$` before navigating to payment status.
