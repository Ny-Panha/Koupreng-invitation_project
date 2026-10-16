# Koupreng V8 Pricing & Subscription Business Rules

## 1. Core Business Model & Offerings

Koupreng provides Cambodian wedding organizers, couples, and hospitality planners with digital wedding invitation and event management suites. Plans are billed on a fixed 30-day billing cycle.

### Plan Matrix & Static Resolver Specifications

| Plan Code | Display Name | Static Price (USD) | Invitation Drafts | Guest RSVP Limit | Published Events | Target Audience | Public Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`BASIC`** | Basic Wedding Plan | **$0.01** | Up to 3 drafts | 100 guests | 1 active event | Entry-level couples / Sandbox live test | **Publicly Visible** |
| **`PRO`** | Pro Wedding Suite | **$199.00** | Unlimited drafts | 1,000 guests | 3 active events | Standard Cambodian wedding (10–100 tables) | **Publicly Visible** |
| **`PREMIUM`** | Premium Wedding & Concierge | **$499.00** | Unlimited drafts | 5,000 guests | 10 active events | Luxury / Multi-day wedding ceremonies | **Publicly Visible** |
| **`DEV_STARTER`** | Developer Sandbox Starter | N/A (Internal) | N/A | N/A | N/A | Platform engineers & CI testing | **Unlisted (Hidden)** |

---

## 2. Public vs. Host Business Invariants

### 2.1 Anonymous Conversion & Public Browsing

1. **Zero-Gate Access:** Any anonymous visitor navigating to `/pricing` can view real plans, prices, quotas, and feature breakdowns without logging in or creating an account.
2. **Dynamic Fallbacks:** If the backend catalog fails to load, graceful fallback plans are rendered with transparent communication, never crashing the page or showing an empty screen.
3. **CTA State Awareness:**
   - **Authenticated User:** Clicking "Choose Plan" / "Upgrade" links directly to `/dashboard/packages?package={CODE}` to proceed immediately with payment.
   - **Anonymous Visitor:** Clicking "Choose Plan" redirects to `/login?next=%2Fdashboard%2Fpackages%3Fpackage%3D{CODE}`, seamlessly carrying user intent through the authentication journey.

### 2.2 Host Subscription Lifecycle

1. **Graceful Multi-Resource Loading:** `/dashboard/packages` loads the active package catalog, the host's current subscription, and invoice history using `Promise.allSettled`. If invoice history is empty or fails, the catalog and current status remain fully functional.
2. **Current Plan Badge & Protection:** The host's active plan is clearly distinguished. Active subscribers cannot re-subscribe to their current active plan without expiration or upgrade.
3. **Deep-linking & Auto-selection:** Navigation with query param `?package=PRO` automatically expands and selects the Pro tier in checkout.

---

## 3. Payment Settlement & Suffix Validation

### 3.1 ABA PayWay Direct Transfer / QR Workflow

- When a host selects a plan, an official ABA PayWay payment prompt is displayed with:
  - Exact price in USD ($0.01, $199.00, or $499.00).
  - Merchant account name (`Koupreng Co., Ltd`).
  - ABA Account Number.
  - Suffix claimant input field.

### 3.2 3-Digit ABA Suffix Invariant

- Cambodian ABA bank push notifications and mobile app alerts truncate the transaction reference to the trailing 3 digits.
- To prevent user confusion and failed reconciliations, the claimant input enforces:
  - **Regex Rule:** `^\d{3}$` (strictly three numeric characters).
  - **Input Restriction:** `maxLength={3}`, non-digit keystrokes stripped.
  - **Client & Server Validation:** Submissions with fewer or more digits are rejected before creating pending orders.

### 3.3 Strict Reconciliation Order

- Submissions enter state `PENDING_VERIFICATION`.
- Orders are **never** self-approved by browser submissions.
- Settlement occurs exclusively when the automated Telegram bot / webhook receives the official ABA bank transaction alert matching the expected amount, currency, and 3-digit suffix.
