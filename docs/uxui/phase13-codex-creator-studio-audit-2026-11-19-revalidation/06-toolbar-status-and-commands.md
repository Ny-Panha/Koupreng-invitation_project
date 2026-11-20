# Toolbar status and real keyboard ownership

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

Saved means the persistence hook has acknowledged the serialized snapshot sent by its writer. Edits made during that request remain dirty and a deliberate flush continues until the newer snapshot is acknowledged. Offline, saving, unsaved, failed, conflict, expired and denied are distinct. HTTP 403 now suspends writes and keeps recovery text instead of presenting an unrestricted retry as generic failure.

Real keyboard dispatch exposed interception during IME composition, Alt combinations, already handled events, modal commands, inherited contenteditable descendants and blocked/read-only actions. The toolbar now leaves those events to their owner. Native text undo is exercised in the browser. Focus is placed on the actual Studio modal invoker before opening, fixing WebKit’s pointer-focus difference without changing the shared modal implementation.

Evidence:

- [defect-register.json](evidence/defect-register.json)
- [negative-tests.json](evidence/negative-tests.json)
- [test-runs.json](evidence/test-runs.json)

[Report index](README.md).
