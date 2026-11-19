# Chapter 09 — Guarded Host Browse, Entitlement & Checkout Decisions

## 1. Guarded Host Browse (`/templates/browse`)

- **Authentication:** Guarded by `RequireAuth`. Unauthenticated requests redirect to `/login?next=%2Ftemplates%2Fbrowse`.
- **KPI Summary Grid:** Displays Total Designs, Free Designs, and Purchased Templates backed by `paymentService.paidTemplates()`.
- **Dark Mode Support (P09-002):** Dark theme CSS tokens mapped across cards, summary metrics, and filter chips.

## 2. Template Checkout Decision (`/templates/:templateId/checkout`)

- **Transparent Order Summary:** Clear price breakdown, selected template thumbnail, and event association.
- **ABA PayWay Disclosure:** Explicitly states payment gateway provider and pending verification workflow.
- **Settlement Truth:** Redirect return from ABA PayWay marks transaction as "Pending verification" until verified by backend webhook. Never prematurely unlocks access.
