# 04 — Route Inventory & Navigation Contracts

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Authoritative Route Contracts, Query Parameter Specifications, and Legacy Aliases  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Route Map

| Canonical Route | Handler Component | Guard | Description |
| :--- | :--- | :--- | :--- |
| `/app/events` | `EventsFeature` | `RequireAuth` | Owner event discovery, card grid, search/filter bar, and inline calendar |
| `/app/events/new` | `EventCreatePage` | `RequireAuth` | Single-page event creation wizard (Phase 11.1) |
| `/app/events/:eventId` | `EventWorkspace -> DashboardFeature` | `RequireAuth` | Authoritative owner dashboard and event operations workspace |
| `/app/events/:eventId/invitation` | `EventWorkspace -> InvitationStudio` | `RequireAuth` | Digital invitation design studio |
| `/app/events/:eventId/guests` | `EventWorkspace -> GuestsPage` | `RequireAuth` | Guest list and group management |
| `/app/events/:eventId/rsvp` | `EventWorkspace -> RsvpDashboardPage` | `RequireAuth` | Live RSVP tracking and guest responses |
| `/app/events/:eventId/budget` | `EventWorkspace -> BudgetPage` | `RequireAuth` | Dual-currency budget management |
| `/app/events/:eventId/gifts` | `EventWorkspace -> WeddingGiftPage` | `RequireAuth` | Traditional envelope and digital gift tracking |
| `/app/events/:eventId/check-in` | `EventWorkspace -> InvitationCheckInPage` | `RequireAuth` | Reception QR check-in and attendance |
| `/app/events/:eventId/preview` | `PublicInvitationPage` | Public/Auth | Live guest-facing invitation preview |

---

## 2. Legacy Route Redirections & Aliases

To preserve existing bookmarks, links, and backwards compatibility:
- `/dashboard/invitations/:id/edit` -> Loads `InvitationEditFeature` for uncommitted or legacy local drafts.
- `/dashboard/events` -> Redirects to `/app/events`.
- `/dashboard/reports` -> Handled by `InvitationScopedRedirect`; redirects to `/app/events` when ambiguous or prompts event selection.
- `/preview/:id` -> Loads `PublicInvitationPage` with local or server draft ID.

---

## 3. Query Parameter Specifications (`/app/events`)

The `/app/events` route synchronizes all user interactions with the URL search query using `replace: true`:
- `q`: Search string normalized using Unicode NFC.
- `status`: Filter by status (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`).
- `type`: Filter by event type (`WEDDING`, `BIRTHDAY`, `ANNIVERSARY`, `CORPORATE`).
- `period`: Filter by event timing (`all`, `upcoming`, `past`).
- `sort`: Ordering criterion (`newest`, `date`, `title`).
- `view`: Active display mode (`list`, `calendar`).
- `page`: 1-based pagination index clamped against filtered results length.
