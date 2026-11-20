# Phase 14 Codex Audit — Report 05: Native Chooser and Preflight Validation

## 1. Native File Chooser Integration
The Media Atelier employs an accessible native `<input type="file" ref={picker} style={{ display: 'none' }} />` triggered programmatically by accessible `<button type="button" className="workspace-button primary">` elements.
- Single file selection for Cover, Video, Music, Ticket Image, and Replace actions.
- Multi-file selection (`multiple={true}`) enabled specifically when Category is `gallery`.

## 2. Client-Side Preflight Validation Rules
Validation function `validateLibraryFile(file, category)` in `mediaLibraryModel.js` checks:
- **Zero-byte files:** Returns `emptyError` (N14-02).
- **Exact size limits:** 5 MiB for images/tickets, 50 MiB for video, 15 MiB for audio. Exactly 5 MiB accepted; 5 MiB + 1 byte rejected (N14-01, N14-17, N14-18).
- **Format & Extension pairs:** Verified against `CONTENT_TYPES_BY_EXTENSION`. Mismatched pairs rejected (N14-03).
- **Blocked formats:** Executable extensions (`.exe`, `.sh`, `.bat`, etc.) return `executableError` (N14-04).
- **HEIC/HEIF files:** Rejected pre-network with user advice modal (N14-04, N14-34).
- **Filename sanitization:** Traversal characters (`..`, `/`, `\`) and filenames exceeding 255 chars return `filenameError` (N14-13).

- [Machine Evidence: Type Signature Boundaries](evidence/media-type-signature-boundaries.json)
