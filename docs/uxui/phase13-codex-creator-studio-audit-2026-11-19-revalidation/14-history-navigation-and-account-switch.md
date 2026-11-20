# Undo, navigation and document lifetimes

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

Document history is in memory only; no server version-history product is claimed. Undo/redo are unavailable while saving or in blocked/read-only states, and native text undo remains owned by editable controls. Existing beforeunload/router/history guards continue to ask before leaving dirty content. The misleading original N13-06 dirty boolean is not treated as complete navigation proof.

Account/event lifetimes are keyed in the canonical workspace and now the legacy loader. A Studio authority hook aborts synchronously when the auth store changes and invalidates old permission-grant requests. This catches the Axios microtask window as well as late responses. The old account’s closure cannot start uploads, acknowledge Save, write a cache or confirm publication for the new account. Reopening after a session/grant change is explicit recovery.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [defect-register.json](evidence/defect-register.json)
- [source-routes.json](evidence/source-routes.json)

[Report index](README.md).
