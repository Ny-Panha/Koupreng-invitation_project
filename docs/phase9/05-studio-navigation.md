# Six-group Studio navigation

`studio/studioNavigation.js` defines Event Information, Schedule & Venue, Media & Opening, Design & Cover, Guest Experience and Tickets & QR. Desktop shows six parent buttons; mobile uses the same six options in a native select. Template capabilities still filter the individual section registry. A group with no supported controls explains that its saved content remains retained.

The existing section keys remain unchanged. `?section=family`, `?tab=scheduleVenue` and initial section hashes resolve to their parent. Internal native disclosures keep editors mounted and retain their state when collapsed or when the parent changes. Navigation state is separate from invitation JSON and does not enter the save queue. Validation and publishing readiness select and expand the affected section through the existing field IDs.

Guided creation keeps its five steps and previous controls. Returning from the advanced ticket panel to Guided creation selects the appropriate editing step instead of leaving an empty panel. Existing serialization, undo/recovery, stale-write handling, permissions, preview iframe channels and publishing confirmation remain in place.

Tickets & QR is an editor panel with explicit save-and-open actions. It flushes pending invitation edits before entering the existing ticket or guest route. Ticket appearance stays owner-only; guest management follows its existing event permission. Guest administration and QR admission models are unchanged.

The Phase 9 browser tests verify six parents, legacy section entry, retained family/date edits, save/reload, scoped axe checks and phone/desktop geometry. Updated historical browser selectors now select the parent and disclosure; they continue to assert the underlying persistence, preview, concurrency and export behavior.
