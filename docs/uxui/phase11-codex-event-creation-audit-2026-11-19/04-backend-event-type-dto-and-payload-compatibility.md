# 04 — backend event type dto and payload compatibility

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

The actual enum is `WEDDING, ENGAGEMENT, BIRTHDAY, ANNIVERSARY, CORPORATE, OTHER`. Wedding has groom/bride fields; engagement/anniversary use two participants; birthday, corporate and other use one host. No new backend type or silent ceremony-to-OTHER mapping was introduced.

Twelve parameterized wizard tests exercise all six types in English and Khmer, asserting PRIVATE request bodies and clearing unsupported partner fields. Separate type-switch tests preserve common details. The backend DTO uses LocalDate/LocalTime; creation binds the owner through authenticated current user and stores a DRAFT. The 11-test safe H2 suite passed, including serial retry identity and roundtrip contracts. This is narrower than all-six browser-to-live-MySQL persistence.

Unknown JSON overlays now merge instead of discarding extensions. Unsafe non-object merges fail visibly. [Backend snapshot](evidence/backend-contract-snapshot.json), [type compatibility](evidence/event-type-compatibility.json). Backend/domain owner retains real database/concurrency approval.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
