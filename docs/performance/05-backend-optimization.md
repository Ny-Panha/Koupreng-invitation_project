# Backend optimization

Implemented one bounded change: `RsvpRepository.summarizeByInvitationId` returns
four scalar counts, and `RsvpService.summaryForInvitation` maps them into the
existing `RsvpSummaryResponse`.

Both public and owner summary entry points use this helper. API routes, response
field names/types, authorization, publication/moderation/visibility checks and
pending-guest semantics remain unchanged. No response entities are exposed, and
controllers still call application services rather than persistence directly.

The improvement targets a demonstrated repeated-query path. It does not alter
RSVP submissions, guest creation, notifications, purchases, prices, fulfillment,
transaction isolation or cache visibility. Existing count/sum repository methods
remain because other reporting callers still use them.

Verification covers service mapping/access checks, empty and nullable aggregates,
invitation isolation, actual MySQL results at multiple guest counts, query counts,
ArchUnit and the broader suite. The new repository tests run without MySQL; the
large benchmark is explicitly opt-in. Test results and any failed attempts are in
`08-qa-qc-results.md`.

Remaining backend priorities are projected owner dashboards, compatible bounded
guest/RSVP list contracts, import batching, and separately measured public media
lookups. Thread/connection pool increases, asynchronous payment fulfillment,
serialization substitutions and broad eager fetching are not justified by these
measurements and are not introduced.
