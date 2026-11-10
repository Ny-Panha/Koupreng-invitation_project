# Guest Financial Contributions, Gift Ledger & Digital Cash Envelope

## 1. Complete Ledger Decoupling (Flow A vs Flow B)

In Cambodian wedding tradition, guests present cash gifts ("ចងដៃមង្គល") to bless the newlyweds and help offset celebration costs. Koupreng provides digital tooling to manage these gifts while maintaining an absolute firewall between platform commerce and guest contributions:

```text
┌────────────────────────────────────────────────────────┐
│           Flow A: Platform Purchases                   │
│  - User buys template or subscription                  │
│  - Money goes to Koupreng platform ABA PayWay          │
│  - Recorded in template_payment_orders / subscriptions │
│  - Platform Revenue = Yes                              │
│  - Digital Entitlement = Yes (Template/Subscription)   │
└────────────────────────────────────────────────────────┘

                           VS

┌────────────────────────────────────────────────────────┐
│           Flow B: Guest Wedding Gifts                  │
│  - Guest gives cash or KHQR transfer to the couple     │
│  - Money goes directly to Couple's personal account    │
│  - Recorded in wedding_gifts (scoped by invitation_id) │
│  - Platform Revenue = NO (0% platform cut)             │
│  - Digital Entitlement = NO (Does not unlock features) │
└────────────────────────────────────────────────────────┘
```

---

## 2. Host-Facing Gift Management Workspace (`/app/events/:eventId/gifts`)

Modernized in `apps/frontend-user/src/features/gifts/`:
1. **Explicit Manual Attribution:**
   Every gift entered by the host is explicitly labeled with:
   `<small className="gift-source-label">Manual record</small>` (or `"កំណត់ត្រាដោយដៃ"` in Khmer).
   The system never misrepresents host-entered records as bank-verified settlements.
2. **Dual-Currency Separation (No Guessing Exchange Rates):**
   In `GiftStatsCards.jsx`:
   - Summary statistics display totals separately: e.g. `$1,450.00 · 800,000 ៛`.
   - The platform never converts USD to KHR (or vice versa) using an arbitrary exchange rate.
3. **Idempotent Record Creation (`WeddingGiftService.java`):**
   - Uses `clientRequestId` to prevent duplicate submissions from double clicks.
   - Enforces non-negative amounts, guest association validation, and ownership authorization.

---

## 3. Digital Cash Envelope on Guest Invitations

For published public invitations (`PublicInvitationFeature.jsx`):
1. **Host-Controlled & Optional:**
   The gift/KHQR section is completely optional. It appears only if the host explicitly uploaded their personal payment QR images (`khqrDollar`, `khqrRiel`) in the Studio.
2. **Personal Host Accounts Only:**
   The platform's static merchant QR is **never reused** as the host's gift-receiving QR. Only host-provided images are rendered.
3. **RSVP Decoupling:**
   Responding to an invitation (RSVP) is completely free and never requires a financial gift.
4. **Guest Acknowledgement as Unverified Evidence:**
   If a guest submits a note indicating they sent money via mobile banking, it is logged as an unverified guest claim, not a verified bank settlement.
