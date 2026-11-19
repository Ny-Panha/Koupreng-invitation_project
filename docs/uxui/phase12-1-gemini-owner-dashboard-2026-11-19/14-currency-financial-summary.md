# 14 — Currency Separation & Financial Summaries

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Strict USD/KHR Currency Separation, Zero Conversion Rates, and Financial Permissions  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Zero Conversion Rate Rule

Cambodian weddings and formal events operate natively in a dual-currency ecosystem:
- Venue, hotel ballroom, catering, and photography contracts are predominantly priced in **USD**.
- Traditional music, fruit offerings, monks' blessings, and local vendor fees are frequently priced in **Khmer Riel (KHR)**.

The frontend **never** applies arbitrary exchange rates (e.g. 1 USD = 4,000 KHR or 4,100 KHR). Converting or blending currencies corrupts accounting truth and misleads hosts.

---

## 2. Formatting Engine (`currencyAmounts`)

`DashboardFeature.jsx` uses `currencyAmounts` from `@/features/budget/currencyTotals`:
- Groups raw expenses and gifts by currency code.
- Formats USD amounts with `$` and thousands commas (e.g., `USD $3,500`).
- Formats KHR amounts with `KHR` and grouping (e.g., `KHR 2,000,000`).
- Formats multi-currency sums with a clear separator:
  `USD $3,500 · KHR 2,000,000`.

---

## 3. Financial Permission Gating

- **Budget Metric Card:** Only rendered if `state.budgetItems.length > 0` and the user possesses `MANAGE_BUDGET` permission.
- **Gift Metric Card:** Only rendered if `state.gifts.length > 0` and the user possesses owner access. Unauthorized viewers and team members without budget permissions are denied financial visibility.
