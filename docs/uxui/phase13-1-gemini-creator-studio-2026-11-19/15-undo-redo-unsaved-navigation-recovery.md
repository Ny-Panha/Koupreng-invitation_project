# 15 — Undo/Redo, Unsaved Navigation, and Recovery

## 1. History Buffer
- Bounded history snapshot buffer (up to 25 entries).
- Document Undo/Redo via toolbar more-menu and shortcuts (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y).
- History pointer safely frozen during active save dispatch.

## 2. Navigation Protection
- Shared history guard hooks `push`, `replace`, and `go` on the router.
- Native `beforeunload` event prompts user if unsaved changes exist.

See [Negative Test Results](evidence/negative-test-results.json).
