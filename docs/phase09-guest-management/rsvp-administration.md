# Workstream D — RSVP Administration & Privacy Architecture

## 1. Overview & Route Architecture

- **Primary Route:** `/app/events/:eventId/rsvp`
- **Key Modules:**
  - `RsvpDashboardPage.jsx`: Main view with mode switcher (`TABLE` vs `WISHES`).
  - `RsvpKpiCards.jsx`: High-level metrics for attending, declined, pending, and wishes.
  - `RsvpGuestTable.jsx`: Filterable guest table with manual response editing.
  - `RsvpWishesWall.jsx`: Dedicated wall for guest congratulatory wishes.
  - `RsvpOwnerActions.jsx`: Host correction modal for updating guest RSVP response.

---

## 2. Authoritative Headcount vs. Guest Records

The RSVP dashboard clearly distinguishes between:
- **Attending Invitations (`ចូលរួម`):** Number of invitation tokens that responded with `ATTENDING`.
- **Total Confirmed Attendees (`ចំនួនមនុស្សចូលរួមសរុប`):** Actual physical headcounts (`sum(attendeeCount)`), accounting for companions and children.
- **Declined Invitations (`មិនចូលរួម`):** Number of invitations that declined.
- **Pending Responses (`មិនទាន់ឆ្លើយតប`):** Unanswered invitations.

---

## 3. Public Wishes Wall Privacy & Security Boundaries

- **Public Protection:** Only approved wish texts and author names are displayed on the wishes wall.
- **Private Data Protection:** Private guest notes, dietary requirements, phone numbers, and email addresses are **never** displayed on the public wishes wall.
- **Moderation:** Hosts can delete or moderate inappropriate wishes via `/api/v1/invitations/{invitationId}/wishes/{wishId}`, which removes the wish text while preserving the attendance record.
