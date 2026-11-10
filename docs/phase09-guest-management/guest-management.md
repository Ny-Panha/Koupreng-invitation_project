# Workstream A — Premium Guest Management Architecture

## 1. Overview & Route Architecture

- **Primary Route:** `/app/events/:eventId/guests`
- **Key Modules:**
  - `GuestsPage.jsx`: Top-level orchestrator handling server-side pagination, overview stats, and filtering.
  - `GuestStats.jsx`: Summary KPI cards distinguishing between guest records and reserved seats.
  - `GuestFilters.jsx`: Search input, group selector, and category selector with quick filter clearing.
  - `GuestTable.jsx`: Dual-layout component rendering responsive cards on mobile (`< 820px`) and dense productive table on desktop (`>= 820px`).
  - `GuestRowActions.jsx`: Touch-friendly action disclosure with QR link, ticket, Telegram share, WhatsApp share, Native Web Share, copy message, and manual mark as shared.
  - `GuestInlineForm.jsx`: Accessible inline editor for quick additions and inline edits.

---

## 2. Distinction: Guest Records vs. Attendee Headcount

A crucial UX requirement in Cambodian wedding planning is distinguishing between **guest invitations** (e.g. 150 invitations issued) and **total allocated seats / party size** (e.g. 320 seats reserved, as many invitations include couples or families):
- **Guest Records (`កំណត់ត្រាភ្ញៀវ`):** Number of unique invitation records in the database.
- **Reserved Seats (`កៅអីកក់ / មនុស្ស`):** Sum of all party sizes (`guest.count || 1`).
- **Marked Sent / Opened (`បានសម្គាល់ផ្ញើ / បើក`):** Total records whose invitation links have been shared or viewed.
- **Responded (`បានឆ្លើយតប`):** Total records with completed RSVPs.

---

## 3. Responsive Card View for Mobile Phones

On screens below `820px`:
- The desktop table headers and colgroups are hidden via CSS (`display: none`).
- Each table row (`tr.guest-record-row`) transforms into a CSS Grid card (`display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; padding: 18px; border: 1px solid var(--guest-line); border-radius: 14px;`).
- The guest avatar, name, companion, and phone span the full width (`grid-column: 1 / -1`).
- Phone numbers are wrapped in `<a href="tel:..." className="guest-phone-link">` allowing host organizers to tap and dial directly from their mobile phones.
- Group tags and seat counts appear side by side.
- Action buttons have minimum touch dimensions of `44x44px` (with `46px` for primary buttons), ensuring zero missed taps.

---

## 4. Server-Side Search, Group Filtering & Pagination

- **Debounced Search:** 300ms debounce via `useDebouncedGuestQuery` prevents spamming backend REST endpoints during typing.
- **Pagination:** Server mode maintains page indices (`page`, `size: 25 | 50 | 100`), with page changes automatically resetting selection states to prevent stale bulk actions.
- **Bulk Selection:** Checkbox selection allows exporting only the selected guest records via `/export-selection` or exporting the full guest list.
