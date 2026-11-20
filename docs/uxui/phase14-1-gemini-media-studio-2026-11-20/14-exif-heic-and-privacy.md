# Phase 14.1 — EXIF, HEIC, and Metadata Privacy

## 1. HEIC Rejection Policy
Apple devices commonly shoot in HEIC format. However, the production Spring Boot JVM does not bundle native `libheif` binaries. Attempting server-side processing causes 500 errors.
- Preflight validator identifies `.heic` and `.heif` files immediately.
- Users receive clear guidance in English and Khmer to convert to JPEG or PNG before uploading.

## 2. EXIF Orientation & GPS Privacy
- Modern desktop and mobile browsers automatically respect the EXIF orientation tag during render.
- Complete server-side EXIF GPS metadata stripping is designated as a backend ingestion pipeline task.
- Gate **F14.1-35** is marked `PARTIALLY COMPLETE` with honest disclosure of frontend vs backend boundaries.

- [Machine Evidence: EXIF and HEIC Privacy](evidence/exif-heic-privacy.json)
- [Negative Tests: N14-04 and N14-34](26-n14-negative-case-matrix.md)
