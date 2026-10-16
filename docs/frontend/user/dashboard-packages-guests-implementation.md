# Koupreng Dashboard Packages & Guests Implementation Guide

## 1. Executive Summary

This document details the engineering transformation of the two core host management workspaces in `apps/frontend-user`:
1. `/dashboard/packages` — Subscription tier selection, active entitlement monitoring, fixed-link ABA PayWay checkout modal, order polling, and billing history.
2. `/dashboard/guests` — Wedding reception guest management, dynamic search & filtering, VIP/family segmentation, RSVP response tracking, table seat allocation, bulk actions, and safe link distribution.

Both pages were completely redesigned from stiff, low-contrast, boxy baseline layouts into an elevated, modern SaaS dashboard experience adhering to the **Koupreng Atelier** design system.

---

## 2. Workspaces & Component Architecture

### 2.1 Packages Workspace (`/dashboard/packages`)

- **Component:** [`SubscriptionPackagesPage.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/subscriptions/SubscriptionPackagesPage.jsx)
- **Design Tokens:** Soft warm ivory backdrop (`#FAF8F5`), crisp white cards with champagne borders (`#EADFCE`), gold accent highlights (`#B98B42`), and emerald trust surfaces (`#0F766E`).
- **Key Subcomponents:**
  - **Hero Header:** Badged title with crown icon, bilingual headline, and trust badge detailing fixed-link ABA PayWay checkout with server-authoritative confirmation.
  - **Active Subscription Banner:** High-contrast emerald gradient container (`#0F766E` to `#0A4B45`), displaying active tier name, validity timeline (`Intl.DateTimeFormat`), and quota guarantees without overlapping or clipping package cards.
  - **Plan Card Grid:** 3-column responsive layout (`grid-cols-1 md:grid-cols-3`). Featured packages (e.g. Pro/Gold) highlighted with gold border rings, badge chips, and elevation shadows. Features list with Lucide icons (`CheckCircle2`). Server-authoritative pricing via `formatMoney()`.
  - **Enterprise Checkout Modal:** Accessible modal with clear 2-step flow:
    - *Step 1: Payer Credentials:* ABA account holder name and last-3 digits validation with inline field constraints.
    - *Step 2: Payment Execution & Live Polling:* Fixed-link ABA PayWay redirect button, real-time polling with spinner, and immediate bilingual feedback on `ACTIVE`, `REVIEW_REQUIRED`, or `EXPIRED` status transitions.
  - **Subscription History Table:** Clean tabular layout with badge pills for status (`ACTIVE`, `PENDING_PAYMENT`, `EXPIRED`), order codes, and formatted amounts.
  - **Host FAQ Section:** 3-item accordion-style FAQ addressing common host questions (upgrades, QR check-in capabilities, and bank confirmation speed).

### 2.2 Guests Workspace (`/dashboard/guests`)

- **Component:** [`GuestsPage.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/guests/GuestsPage.jsx)
- **Supporting Components:**
  - [`GuestStats.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/guests/components/GuestStats.jsx): 4-card metric overview displaying Total Guests, Total Seats Reserved, Invitations Sent, and Confirmed Attending. Fixed RSVP calculation logic so `PENDING`/`UNKNOWN` is not falsely classified as a response.
  - [`GuestFilters.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/guests/components/GuestFilters.jsx): Search input with debounce, category/RSVP/side filter chips, "Export CSV" with localized dictionary support, and prominent `+ Add Guest` primary pill action.
  - [`GuestFormModal.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/guests/components/GuestFormModal.jsx): Accessible creation/editing modal with full validation, guest count clamp (1–10), category tags, dietary notes, and "Save & Add Another" batch mode.
  - [`GuestTable.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/guests/components/GuestTable.jsx): Roomy desktop table with sticky headers, color-coded RSVP badges (`ATTENDING`, `DECLINED`, `PENDING`), copyable invitation links, and responsive transformation into stacked mobile cards for screens under 768px.
  - [`GuestsPage.css`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/guests/GuestsPage.css): Full CSS foundation supporting card transitions, status pills, and mobile `@media (max-width: 767px)` table-to-card pseudo-element transformations.

---

## 3. Critical Bug Fixes & Invariant Protections

### 3.1 Top Whitespace Defect (~250px)
- **Root Cause:** `HostShell.css` supplies `padding-top: var(--host-nav-offset)` (104–132px). `SubscriptionPackagesPage.jsx` wrapped content in `.enterprise-page`, which added an additional `margin: 118px auto 64px` from `EnterprisePages.css`, doubling the offset.
- **Resolution:** Removed the redundant `.enterprise-page` wrapper and styled using standard utility classes (`dash-main max-w-6xl mx-auto py-8 sm:py-12`).

### 3.2 Dark Mode Bleed & Low Contrast
- **Root Cause:** Inadvertent `dark:` classes (`dark:bg-zinc-900`, `dark:text-zinc-100`) caused plan cards to render jet-black and text near-invisible when system dark mode was inherited.
- **Resolution:** Replaced all hardcoded/inherited dark tokens with Atelier explicit surface tokens (`bg-white`, `border-[#EADFCE]`, `text-[#1F2421]`, `text-[#5D665F]`).

### 3.3 Semantic Data Bug on Copy Invite Link
- **Root Cause:** Clicking the "Copy Link" button in `GuestTable.jsx` previously called `updateGuest(guest.id, { deliveryStatus: "SENT" })`, automatically and falsely mutating the guest's delivery status.
- **Resolution:** `handleCopyLink()` now strictly writes the URL to clipboard with confirmation toast without mutating delivery state. An explicit `handleMarkAsSent()` action was introduced.

### 3.4 RSVP Attendance Metric Inflation
- **Root Cause:** Metric cards previously calculated confirmed responses by filtering `status !== "DECLINED"`, thereby counting `PENDING` and `UNKNOWN` as confirmed attendees.
- **Resolution:** Re-anchored calculation: Confirmed Attending requires `rsvpStatus === "ATTENDING"` or `confirmed === true`.

### 3.5 Leaked Translation Key `exportBtn`
- **Root Cause:** `useBackendMessages` lacked key `exportBtn` in `messagesDictionary.js`, rendering raw key `exportBtn` on the CSV export button.
- **Resolution:** Added `exportBtn` ("ទាញយក CSV" / "Export CSV") to both Khmer and English dictionaries in `messagesDictionary.js`.

---

## 4. Mobile Responsiveness (<768px)

- **Packages:** Stacks into a single vertical column with generous touch targets (min 44px), card feature bullet points, and full-width checkout action.
- **Guests:** Uses `@media (max-width: 767px)` to transform the 8-column HTML `<table>` into native card components using `data-label` pseudo-elements. Avoids horizontal scrolling and prevents clipped table columns on 390px mobile viewports while preserving standard HTML table semantics for screen readers and Vitest assertions.

---

## 5. Security & Verification Guardrails

1. All package prices, quota limits, and entitlement decisions are authoritative on the Spring Boot backend (`PackagePlanRepository` / `SubscriptionService`).
2. Order creation and payment webhooks require ABA PayWay HMAC hash validation and admin reconciliation.
3. No customer browser client can self-promote or mark orders as `ACTIVE`.
4. Backward compatibility preserved: all existing unit tests in `apps/frontend-user` pass without skipping or weakening assertions.

