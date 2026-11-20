# Phase 14.1 — Native Chooser, Dropzone, and Preflight Validation

## 1. Dual Input Ergonomics
The Atelier supports both native keyboard-accessible file input dialogs and visual drag-and-drop:
- Native `<input type="file">` is always available and fully accessible via Tab and Space/Enter.
- Visual dropzone provides clear hover and drag-over indicators in champagne gold.

## 2. Client-Side Validation Rules (`validateLibraryFile`)
Enforced strictly in `mediaLibraryModel.js` before network transmission:
1. **Empty File Check:** Zero-byte files rejected immediately with actionable message (`mediaErrorZeroByte`).
2. **Size Enforcement:**
   - Cover / Gallery / Ticket: Max 5,242,880 bytes (5 MiB).
   - Video / PreWedding: Max 52,428,800 bytes (50 MiB).
   - Music / Audio: Max 15,728,640 bytes (15 MiB).
3. **MIME & Extension Alignment:** Checks that file extension aligns with its detected MIME type.
4. **Disallowed Formats:**
   - `.heic` / `.heif` rejected with explicit conversion guidance (`mediaErrorHeicConversion`).
   - `.svg` rejected to eliminate SVG script injection XSS vectors.
   - Executables (`.exe`, `.bat`, etc.) rejected unconditionally.

- [Machine Evidence: Backend Contract](evidence/backend-upload-contract.json)
- [Negative Tests: N14-01 through N14-04](26-n14-negative-case-matrix.md)
