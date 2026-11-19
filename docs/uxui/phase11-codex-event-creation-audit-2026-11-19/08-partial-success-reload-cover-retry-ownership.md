# 08 — partial success reload cover retry ownership

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

An acknowledged numeric event ID is retained before uploading. An upload failure reports that the event exists and the photo remains pending. On reload, the stored ID is explicitly unverified: authenticated GET must return that same ID and current userId before any recovery upload or continuation.

The browser test intercepts exactly one PRIVATE POST, rejects the first upload, reloads, checks the owner, reselects lost File bytes and retries cover to the same ID. It asserts no second create. Foreign-owner fixture, malformed acknowledgement and late account-response tests prevent false completion. Original save mode survives recovery; incompatible draft/create actions are disabled. Continue to invitation opens the supported guided route after verification.

These are intercepted API outcomes and a separate H2 contract suite. No image-provider write or live saved production event is synthesized. [Recovery matrix](evidence/upload-recovery-matrix.json). Storage-denied reload and live MySQL concurrency remain open.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
