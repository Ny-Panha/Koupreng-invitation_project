# Snapshots, conflicts and acknowledgements

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

useStudioPersistence has one writer, a bounded 25-entry history, a 1500ms autosave delay and an acknowledgement serialized independently from the latest form. Deferred-promise tests demonstrate that an old success cannot acknowledge a newer edit and that flush sends the next snapshot. A new real Axios adapter test edits the actual form during a pending save and verifies final sent bytes, retained value and focus.

HTTP 401/403/409 block further writes while preserving dirty text; 503 allows an explicit retry. The form passes expectedUpdatedAt through both initial and media-reference updates, using returned revisions. Scope cancellation is checked after every asynchronous stage before subsequent requests or local writes. These are frontend adapter/fixture and backend unit/H2 observations, not live MySQL concurrent-editor proof.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [defect-register.json](evidence/defect-register.json)
- [test-runs.json](evidence/test-runs.json)

[Report index](README.md).
