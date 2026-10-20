# Prioritized optimization plan

1. Establish the MySQL RSVP summary baseline and production frontend build baseline.
2. Consolidate only repeated RSVP aggregates, validate identical results (including
   empty invitations, nullable guest/status/count data and isolated invitations),
   compare on the same dataset, and keep only a measured win.
3. Try direct template imports at public-entry dependency boundaries; compare actual
   production resources and render output. Revert if neutral or regressive.
4. Run risk-based correctness/security/concurrency regressions and document results.
5. Record remaining hypotheses and reproducible production-like profiling steps.

Do not redesign screens, add infrastructure/dependencies, tune pools speculatively,
cache private responses publicly, weaken payment confirmation, or change migrations.
Full user-scale, concurrent purchase, production soak and hardware-capacity claims
require representative isolated infrastructure and will be labeled untested if unavailable.

## Next increments

| Priority | Work | Evidence needed before implementation |
| --- | --- | --- |
| P1 | Owner dashboard projections and bounded recent histories | Profile SQL, heap and DTO results for owners with many invitations/guests/orders; preserve revenue by currency |
| P1 | Batch guest import candidate validation | MySQL collation/normalized contact parity, duplicate and concurrent import tests, statement counts and wall time |
| P1 | Compatible pagination for complete guest/RSVP lists and exports | Establish real payload/DOM/heap costs; keep existing clients working during contract evolution |
| P2 | Public invitation media/catalog dependency gate | Delayed media/catalog tests on custom admin templates; first cover, colors, music, RSVP and password/token parity |
| P2 | Per-template CSS/default engine splitting | Resource traces across all dedicated layouts and fallback layouts; visual checks beyond the Silk fixture |
| P2 | Production-like resource/load exercise | Isolated target hardware, explicit CPU/RAM limits, safe fixtures, HTTP/DB/JFR/GC/Hikari metrics and field vitals |

For payment work, retain manual review and the default disabled Telegram auto-confirm
unless authoritative provider verification is established. A detected message or
browser claim is not sufficient proof. Existing opt-in evidence paths warrant a
separate focused security review before use; they are not altered by this performance pass.

The measured optimizations require no schema rollback, infrastructure purchase or
deployment change. Their application-code rollback is the six-file diff (two backend
production files, three frontend production files, plus the adjusted service test).
Keep the new correctness tests/profiling tools useful when investigating the next increment.
