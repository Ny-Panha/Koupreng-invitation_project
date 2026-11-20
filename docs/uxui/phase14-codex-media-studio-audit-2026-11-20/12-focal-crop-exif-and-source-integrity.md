# Phase 14 Codex Audit — Report 12: Focal Framing, Crop, and EXIF Integrity

## 1. 2D Focal Point Inspector Modal
The Media Atelier provides an accessible 2D focal calibration modal:
- Range sliders for Horizontal (`focalX`, 0-100%) and Vertical (`focalY`, 0-100%) positioning.
- Framing mode selector: Cover (Fill & Crop) vs Contain (Full View).
- Function `focalPointStyle(focalPoint, fit)` clamps values between 0% and 100% and generates valid CSS `objectPosition` and `objectFit` (verified in `N14-33`).

## 2. Persistence and EXIF Truth
- Applied framing is reflected immediately in the local preview. The modal notice informs the user: *"Framing applied to preview. Remember to save in Studio."*
- Gate `F14.1-33` is graded `PARTIALLY COMPLETE` because persistent database framing requires backend schema support.
- Gate `F14.1-35` is graded `PARTIALLY COMPLETE`: EXIF orientation is handled automatically by the browser, but server-side EXIF GPS metadata stripping remains a backend-owned task.

- [Visual: Focal Inspector Open](visuals/15-focal-inspector-open.png)
