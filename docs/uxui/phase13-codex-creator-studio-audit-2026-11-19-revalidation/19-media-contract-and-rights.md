# Media limits, pending replacements and provenance

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The existing native chooser remains JPEG/PNG/WebP with the source-defined 5MiB limit and server signature validation. No HEIC support, crop redesign, new artwork or backend upload policy was introduced. Gallery request batching remains at five files. The independent source review found late upload callbacks could overwrite a newer selected reference and clear a newer pending file; acknowledgements now require the current field to match the sent field.

Inline media is not treated as a server-saved URL. Failed media keeps Save unsuccessful and the author’s current memory state; this is not a promise that all unsynced binary data survives an explicitly confirmed browser exit. Complete EXIF/orientation, object-URL/memory soak, cancel/retry UX and commercial asset provenance stay with Phase 14 and asset owners. The original direct revokeObjectURL test is not accepted as lifecycle proof.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [defect-register.json](evidence/defect-register.json)
- [historical-57-plus-new-ledger.json](evidence/historical-57-plus-new-ledger.json)

[Report index](README.md).
