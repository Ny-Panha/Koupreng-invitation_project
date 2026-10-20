# Database investigation and optimization

## Workload and schema

MySQL 8.0.39 was initialized in a new ignored local directory, bound to loopback,
and migrated through V36. No existing schema or applied migration was edited.
`rsvps.invitation_id` has an index; `rsvps.guest_id` has a unique index. Guest
invitation and contact indexes already support scoped lookups. Historical
invitation owner/status/deleted indexes, payment transaction/evidence uniqueness,
and separate financial currency fields are retained.

`RsvpService.summaryForInvitation` originally ran:

1. Guest count for the invitation.
2. Three separate RSVP status counts.
3. Pending guest count using `NOT EXISTS` against RSVP guests.
4. Attending-only attendee sum.

The status counts and attendee sum now share one `SUM(CASE WHEN …)` projection,
filtered by invitation ID. MySQL still performs the aggregation; the application
does not fetch response rows into memory. The public invitation authorization
lookup is separate and unchanged. Total statements per public service call fall
from **7 to 4**; summary aggregation statements fall from **6 to 3**.

The pending anti-join remains independent: an RSVP can have a null guest, and an
invitation can have guests without responses. Joining everything into a single
guest-based aggregate could silently lose anonymous responses or multiply counts.
The projection coalesces empty and all-null sums to zero. Only attending responses
contribute attendee counts, regardless of counts stored on declined/maybe rows.

## Plans and index decision

The opt-in MySQL benchmark captures `EXPLAIN ANALYZE` for the old status count,
old attendee sum, combined query and pending anti-join at 100,000 guests. See
the generated `evidence/rsvp-paired-quiet.json.plans.json` (and earlier run plans). Actual plans are evidence
for this isolated fixture only; they do not establish production cardinality.

No new index is added. Consolidating scans/round trips is sufficient for the
measured change; adding an invitation/status/attendee covering index would add
storage and write amplification and needs a separate production-like experiment.
Leading-wildcard guest/admin search will not become a B-tree seek merely by adding
an index. Bulk import contact checks and complete-history owner dashboard reads
remain future workload-specific work.

## Integrity and recovery

No migration is necessary, so recovery is an application rollback with no schema
or data conversion. Do not edit V1–V36. A later justified schema change must use
V37 or the next unused migration version, validate an upgrade from existing
history, and measure insert/update cost as well as read latency.

RSVP uniqueness, transaction boundaries, locks, ownership checks, payment
confirmation and USD/KHR accounting are unchanged. Read-only summaries at the
existing isolation level are not a new atomic cross-query snapshot guarantee.
