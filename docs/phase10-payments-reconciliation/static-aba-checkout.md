# Static ABA PayWay Checkout & Banking App Handoff

## 1. Context and Rationale

Koupreng operates without enterprise banking API subscriptions to keep operational costs low. Rather than requiring dynamic API gateway keys with monthly minimum fees, the checkout flow leverages pre-configured, static ABA PayWay checkout URLs and merchant QR codes.

### Configured Link Scope

As verified in `PaymentProperties.java`:
- **Template Checkout Link:** `https://pay.ababank.com/oRF8/vx2dp884` (Default static link)
- **Subscription Basic Link:** `https://link.payway.com.kh/ABAPAYMu523385B`
- **Subscription Pro Link:** `https://link.payway.com.kh/ABAPAY9G523386h`
- **Subscription Premium Link:** `https://link.payway.com.kh/ABAPAYBo5233877`

---

## 2. Integrity and Anti-Fabrication Principles

1. **No Fake KHQR Synthesis:**
   A static ABA PayWay URL QR code represents the actual HTTPS web checkout URL (`https://pay.ababank.com/...` or `https://link.payway.com.kh/...`). The application never synthesizes arbitrary EMVCo / KHQR hex payloads pretending to be issued dynamically by ABA Bank or the National Bank of Cambodia (NBC Bakong).
2. **Strict Hostname Whitelisting (`khqr.js`):**
   ```javascript
   export function getPaymentQrValue(order) {
     const value = order?.paymentLink || order?.checkoutUrl;
     if (!value) return "";
     try {
       const url = new URL(value);
       return url.protocol === "https:" && ["pay.ababank.com", "link.payway.com.kh"].includes(url.hostname)
         ? url.href : "";
     } catch {
       return "";
     }
   }
   ```
   Any URL outside of the verified ABA PayWay domains is rejected from QR generation.
3. **No Query Parameter Injection:**
   The frontend never fabricates unverified deep links with custom query parameters (e.g. `?amount=...&remark=...`) unless supported and verified by the official bank contract.

---

## 3. Order Reservation vs Bank Link Validity

A crucial distinction communicated in the UI is the difference between the **Application Order Reservation Window** and the **Bank Payment Link Validity**:

- **Order Session Expiry (30 Minutes):**
  When an order is created, the server sets `expiresAt = createdAt + 30 minutes`. This window reserves the customer's intent and ensures that reconciliation checks consider only fresh transactions.
- **Bank Link Expiry:**
  The reusable static ABA PayWay payment link itself does not expire when the application timer reaches 00:00. 
- **Late Payment Handling:**
  If a customer completes a transfer after the 30-minute order timer has expired:
  - The order transitions to `EXPIRED`.
  - The payment alert is retained with outcome `REVIEW_REQUIRED`.
  - The customer is instructed to contact support or administrative review.
  - The system **never silently grants access** to an expired order.

---

## 4. Mobile Banking App Handoff UX

On mobile devices (iOS Safari, Android Chrome):
1. **Direct App Handoff Action:** An "Open PayWay link" (`IoOpenOutline`) button opens the native ABA Mobile app via universal links (`https://pay.ababank.com/...`).
2. **Order Code Copying:** The order code (e.g., `EVT261110101` or `SUB2611100001`) is displayed with a one-click copy button, allowing the user to paste it into the ABA transfer remark field.
3. **Transparent Review Notice:** The user is explicitly informed:
   > *"Include order code in the transfer remark if your banking app supports it. Submitting your payment details requests review; access is unlocked only upon verified server confirmation."*
4. **Resumable Checkout:** If the customer closes the browser, switches apps, or reloads, navigating back to `/payments/:orderCode/status` restores the exact pending state, remaining timer, and status check controls.
