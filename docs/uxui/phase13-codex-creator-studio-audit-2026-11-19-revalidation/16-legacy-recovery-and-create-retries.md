# Ownerless recovery and stable creation identity

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

Ownerless local records remain stored but cannot be loaded by an authenticated id/slug reader or reassigned through saveDraft. Owned records are also unavailable to anonymous readers. The legacy editor reports recovery required rather than silently replacing or deleting an unclaimed record. Listing may retain an ownerless record for recovery awareness; Phase 12 owner filtering still prevents account upload.

A legacy Studio create now retains one clientRequestId and immutable first payload for an ambiguous response retry. After the server returns an id, later edited bytes are applied by update on that same event. The request/attempt is retained in the local recovery draft. The new form test checks equal retry payloads and the subsequent update; canonical Phase 11 browser retries are independently replayed. No applied migration or server idempotency policy was changed.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [defect-register.json](evidence/defect-register.json)
- [source-routes.json](evidence/source-routes.json)

[Report index](README.md).
