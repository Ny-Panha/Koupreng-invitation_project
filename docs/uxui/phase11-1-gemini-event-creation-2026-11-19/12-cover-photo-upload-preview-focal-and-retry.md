# 12 — Cover Photo Upload, Preview, Focal Point, and Retry

**Phase:** `11.1`  
**Component:** `EventCreatePage.jsx`

---

## 1. File Upload Specifications

- **Accepted MIME Types:** `image/jpeg`, `image/png`, `image/webp`.
- **Max File Size:** 10MB (enforced client-side before preview generation).
- **Unsupported Formats:** Non-standard formats (e.g. HEIC/RAW) display an inline warning instructing the user to select JPEG or PNG.
- **Drag & Drop:** Fully accessible dropzone with visual drag-over indicator.

---

## 2. Memory Management & Object URLs

When an image file is selected, a preview is generated using `URL.createObjectURL(file)`. To prevent browser memory leaks:
- The previous Object URL is revoked using `URL.revokeObjectURL(prevUrl)` whenever a new file is chosen.
- A cleanup function in `useEffect` revokes the active Object URL when the component unmounts.

---

## 3. Focal Point Coordinates

The wizard supports an interactive focal point selector (X: 0–100%, Y: 0–100%, default 50%/50%). This ensures responsive card renders on mobile and landscape displays center on the bride and groom rather than cropping them awkwardly.
