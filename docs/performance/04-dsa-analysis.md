# Data structures and algorithm analysis

## Implemented: shared RSVP aggregation

Let G be guests in an invitation and R its RSVP rows. Actual database access can
also depend on table size, selectivity, indexes and the optimizer's plan.

| Property | Before | After |
| --- | --- | --- |
| Algorithm | Three status scans and an attending-count sum, plus guest/pending counts | One conditional aggregate, plus the same guest/pending counts |
| RSVP aggregation work | Four independent filtered aggregates | One aggregate computes four outputs |
| Time complexity | O(R), with repeated scans; guest/pending work also remains | O(R); fewer scans and round trips, no claimed asymptotic improvement |
| Application result space | O(1) scalar counts | O(1) projection and response DTO |
| Public call SQL statements | 7 | 4 |
| Correctness | Independent status, attendee, guest and pending semantics | Same semantics, including null guest/status/count data and invitation isolation |

Benchmarks use real migrated MySQL and the real service/projection, not a hash-map
microbenchmark. The paired experiment alternates the original algorithm and the
new one in one JVM on identical fixtures. See `02-baseline-benchmarks.md` and
`09-before-after-comparison.md` for conditions and measurements.

## Other audited paths

| Path | Existing approach / finding | Decision |
| --- | --- | --- |
| Guest and RSVP matching | Scoped repository/token lookups; MySQL uniqueness constraints | Keep work in the database |
| Guest UI merge | `guestMappers.mergeBackendGuestsWithRsvps` uses maps keyed by guest ID | Already linear in guest/response/check-in inputs; no speculative rewrite |
| Import preview | Hash sets for duplicate emails/phones within the file; repository validation per row | Batch candidate queries only after measuring collation-compatible behavior |
| Seating | Assignments grouped once with a memoized map | Keep; repeated table finds during position saves are a lower-priority candidate |
| Template resolution/filtering | Small static registry plus dynamic catalog scans | No unsupported claim that catalog indexing improves current workloads |
| Section ordering | Small fixed section lists | No reason to replace them with more complex structures |
| Owner dashboard | Complete histories hydrated, counted and sorted for summary/recent data | Prefer SQL aggregates and bounded recent queries over application-side structures |
| Payment matching and permissions | Database queries, authoritative state, uniqueness/transaction checks | Do not trade correctness or fresh authorization for in-memory lookup speed |

No `memo`, cache, set, tree, queue or parallel stream is introduced merely to
change a complexity label. The frontend improvement changes dependency loading,
not the product's data processing algorithm.
