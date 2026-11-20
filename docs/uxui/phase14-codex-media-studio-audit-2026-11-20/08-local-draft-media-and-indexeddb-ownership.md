# Phase 14 Codex Audit — Report 08: Local Drafts and IndexedDB Ownership

## 1. Local Draft vs Server Persistence
- Local invitations created prior to server persistence utilize IDs such as `wed-1732000000`.
- In `mediaApi.js`, `isLocalDraftId(id)` identifies non-persisted invitations and returns in-memory blob structures backed by `weddingStorage.js`.
- In `InvitationMediaManager.jsx`, local draft assets display a clear status pill `statusLocalDraft` ("Local draft on this device"), preventing false claims of server synchronization (Defect D14-02 repair).

## 2. Legacy Ownerless Draft Boundary
As identified in Phase 12 and Phase 13 audits, cross-session migration of ownerless drafts remains an open boundary. Gate `F14.1-26` is graded `PARTIALLY COMPLETE` with explicit notes that local draft assets reside safely in local storage, but cross-device recovery requires cloud account binding.

- [Machine Evidence: Storage and Drafts](evidence/media-persistence-and-reconciliation.json)
