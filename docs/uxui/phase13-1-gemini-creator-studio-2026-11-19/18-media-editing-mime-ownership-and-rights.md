# 18 — Media Editing, MIME Constraints, Ownership, and Rights

## 1. Media Constraints
- Permitted image types: `image/jpeg`, `image/png`, `image/webp`.
- Maximum file size: 5 MiB enforced at client and server.
- Object URL cleanup: `URL.revokeObjectURL` called on image replacement and unmount to prevent browser memory leaks.

## 2. Copyright & Rights
- Phase 13.1 uses authentic, licensed or user-supplied image assets.
- No synthetic third-party copyrighted photography injected into user fixtures.

See [Photo Media Policy](evidence/photo-media-type-and-rights.json).
