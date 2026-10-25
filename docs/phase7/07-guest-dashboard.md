# Guest dashboard

## Correctness and bounded reads

Previously the guest screen fetched every guest, RSVP and check-in row and filtered in the browser. The synchronized guest screen now requests `/guests/page` (25 by default, maximum 100) and `/guests/overview`. Search, group, category and RSVP/check-in filters run on the server. Page numbers are bounded to 0–10000; search is capped at 100 characters. SQL parameters bind filter values and escape literal LIKE wildcards. Rows load through three batched repository queries after a bounded ID page; totals are database aggregates. Legacy collection endpoints remain compatible for existing specialized tools.

The summary covers the entire event, independently of the fetched page. A guest record may reserve multiple seats. Attending/declined/maybe/unanswered counts refer to guest records with their current linked RSVP. Confirmed attendees sum the stored ATTENDING RSVP attendee counts. Active check-in records count checked-in guest records, **not individual people arriving**. Orphan/unlinked RSVPs are not included in this guest-record dashboard. Marked sent/opened represents stored flags/timestamps, not verified delivery.

## Safe bulk operation

Users can select rows on the current page and export up to 100 distinct IDs. Selection clears on a page/filter change. The backend checks MANAGE_GUESTS and every requested ID's event scope; mixed or missing IDs fail as one operation. CSV uses the existing formula-escaping utility and omits contacts, guest tokens, QR data, notes and money. An audit entry stores only the count and export scope. No destructive bulk operation was introduced. Existing inline create/edit/delete and the validated import/receipt workflow remain available. Collaborators do not receive owner-only ticket/delivery/financial controls.

## Verification

- `m4-guest-api.log`: 29 passing tests (10 real HTTP/MySQL, 14 OpenAPI, 5 ArchUnit), including totals from 4 records/10 seats/3 RSVP statuses/1 check-in; page limits, cross-user denial, cross-event selection failure, duplicate-ID rejection and CSV formula/contact/token protection.
- `m4-guest-user-verified.log`: 64 passing tests across 9 files, including the bounded hook, global totals and selected-export UI. Full user lint/build passed.
- `m4-guest-browser-final.log`: browser contract fixtures verify pages, selection, export, RSVP filtering, and the existing import download/mapping/duplicate/uncertain-retry flow. Both KH/EN screens captured at 320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920px. Fictional fixtures are distinct from the real HTTP database evidence above.
- Representative 390px capture inspected: stacked cards, paged controls, accessible selection and existing inline editor remain usable without page overflow.

These endpoints require no guest-data rewrite. The later V49 performance increment adds the scoped creation/ID index for stable bounded ordering; native tests and EXPLAIN verify it. Concurrent actions can change totals between separate page/overview requests; refreshing retrieves current data. Export reauthorizes on the server and does not trust a stale browser selection.
