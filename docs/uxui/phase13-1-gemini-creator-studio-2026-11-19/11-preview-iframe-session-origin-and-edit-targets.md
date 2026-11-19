# 11 — Preview Iframe Session, Origin, and Edit Targets

## 1. postMessage Protocol Security
- Strict origin validation (`parentOrigin === window.location.origin`).
- Cryptographic session nonce matching (`createPreviewSession`).
- Prototype pollution guards rejecting `__proto__`, `prototype`, and `constructor`.
- Reject oversized payloads (> 16 MiB strings, > 500 array elements).

## 2. Click-to-Edit Whitelist
- `EDIT_STUDIO_SECTION` strictly enforces membership in `STUDIO_EDIT_SECTIONS` allowlist.
- Interactive guest controls (RSVP, audio player, gallery) are never hijacked by editor click listeners.

See [Preview Negative Matrix](evidence/preview-message-negative-matrix.json).
