# 11 — save draft vs create truth and workspace routing

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Autosave keeps setup in the tab. **Save draft** creates a PRIVATE server DRAFT after acknowledgement and opens `/app/events/:id`; only a title is required. **Create event** validates essentials/photo/design, creates PRIVATE, uploads cover and opens `/app/events/:id/invitation?mode=guided`. Neither action publishes.

The review displays entered values and compatible design/access status. After an ambiguous submission, details are frozen to the original request and the recovery notice explains where edits can be made. A definite 400/422 permits correction. Photo retry preserves original mode; explicit Continue to invitation verifies ownership and opens the guided destination.

No local toast, stored ID or demo receipt is evidence of a successful backend write. Numeric acknowledgement and current authority are required. [Request matrix](evidence/request-idempotency-matrix.json), [upload recovery](evidence/upload-recovery-matrix.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
