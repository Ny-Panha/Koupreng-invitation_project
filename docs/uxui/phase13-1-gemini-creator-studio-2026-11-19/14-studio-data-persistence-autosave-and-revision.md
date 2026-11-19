# 14 — Studio Data Persistence, Autosave, and Revision

## 1. Autosave Architecture
- Debounced autosave (1500ms default) via `useStudioPersistence.js`.
- Snapshots are tracked per request; completion only acknowledges the snapshot dispatched.
- `flush({ deliberate: true })` loops until the latest serialized snapshot is acknowledged.

## 2. Conflict & Expiry Recovery
- HTTP 409 Conflict: Locks editing into conflict phase, offers draft download.
- HTTP 401 Expired: Locks editing into expired phase, offers draft download.
- Offline: Suspends requests, preserves dirty state, offers retry upon reconnection.

See [Autosave Concurrency Evidence](evidence/autosave-revision-and-conflict-races.json).
