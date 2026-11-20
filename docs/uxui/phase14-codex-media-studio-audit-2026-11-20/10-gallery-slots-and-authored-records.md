# Phase 14 Codex Audit — Report 10: Gallery Slots and Authored Records

## 1. Ten Studio Slots vs Backend Capacity
- Studio UI presents a recommended layout capacity of 10 photo slots for optimal wedding template rendering.
- The backend configuration `app.security.upload.max-gallery-files-per-invitation` defaults to `0` (unlimited).
- In `InvitationMediaManager.jsx`, the UI displays a clear slot notice:
  `{t('slotLimitNotice', { count: records.length })}` ("Showing all {count} retained photos. Up to 5 files per upload batch.")

## 2. Preservation of Legacy Authored Records
Existing invitations with more than 10 gallery photos are preserved in full. Neither the UI nor the serialization logic truncates, drops, or hides photos beyond index 10 (verified in `N14-06`).

- [Machine Evidence: Gallery Slot Preservation](evidence/f14-1-58-acceptance.json)
