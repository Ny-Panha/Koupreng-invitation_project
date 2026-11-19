# 07 — server creation idempotency duplicate suppression

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Idempotency is `clientRequestId` in JSON, not `X-Client-Request-Id`. A stable UUID, synchronous in-flight ref and disabled actions suppress overlapping submissions. Lost-response retry sends the original payload and identity, preventing the UI from claiming that edited values were applied to a deduplicated old event.

Backend source serializes retryable creates with a pessimistic authenticated-owner lock and looks up `(userId, clientRequestId)` before quota/creation. Deleted prior requests return conflict. The focused H2 tests confirm a serial retry returns the same owner event; they do not certify multi-instance MySQL contention or restarts.

The real Axios test queued a PRIVATE A draft, changed to B before the deferred credential interceptor, and observed A's title dispatched with B credentials before the fix. Session AbortSignal cancellation now prevents adapter dispatch. Optional API options preserve existing method arguments/endpoints and cover create, recovery GET and media.

[Request matrix](evidence/request-idempotency-matrix.json), C11-011 in [defects](evidence/defect-register.json). No shared auth or backend authority shortcut was added.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
