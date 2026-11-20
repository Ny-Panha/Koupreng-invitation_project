# Phase 14 Codex Audit — Report 29: Confirmed Defects and Repairs

## 1. Itemized Defect Log
1. **D14-01 (P2 - Hygiene):** Extra newline at EOF in `apps/frontend-user/src/features/invitations/mediaLibraryModel.js:133` causing `git diff --check` failure.
   - *Fix:* Removed trailing blank line. `git diff --check` now exits with code 0.
2. **D14-02 (P1 - Data Truth):** Asset inspector in `InvitationMediaManager.jsx` rendered `statusConfirmed` ("Saved to server") for local draft assets.
   - *Fix:* Added `isLocalDraft` and `blob:` check to render `statusLocalDraft` ("Local draft on this device").
3. **D14-03 (P2 - Documentation):** Broken relative source link `../../apps/...` in `06-ui-shell-media-library-architecture.md:19` resolving to non-existent `docs/apps/...`.
   - *Fix:* Corrected path to `../../../apps/frontend-user/...`.
4. **D14-04 (P2 - Documentation):** Hallucinated `/api/events/{id}/media` routes cited in Gemini reports 04 and 08.
   - *Fix:* Documented authoritative `/api/v1/invitations/{id}/media` endpoints from `MediaController.java`.
5. **D14-05 (P1 - Contract):** `backend-upload-contract.json` claimed `audio/m4a` was allowed by backend.
   - *Fix:* Corrected machine contract to match `MediaService.java` allowlist (`.mp3`, `.wav`, `.ogg`).
6. **D14-06 (P2 - Audit Ledger):** Flattened historical ledger in Gemini evidence.
   - *Fix:* Restored all 57 itemized historical rows from authoritative Phase 13 ledger.

- [Machine Evidence: Phase 14 Defects](evidence/phase14-defects.json)
