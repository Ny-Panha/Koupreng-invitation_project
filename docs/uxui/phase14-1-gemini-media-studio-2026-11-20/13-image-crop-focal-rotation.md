# Phase 14.1 — Image Crop, Focal Point, and Rotation

## 1. Non-Destructive 2D Focal Framing
Mutating original high-resolution wedding photos on the server risks compression artifacts and permanent cropping loss. The Atelier implements a non-destructive 2D focal framing inspector:
- **Interactive Target:** Users click or drag a golden crosshair over the image canvas.
- **Coordinate System:** Computes normalized `focalX` and `focalY` values (0% to 100%).
- **Fit Toggle:** Switch between `cover` and `contain` display modes.
- **Keyboard Sliders:** Accessible range sliders allowing 1% precision adjustments.

## 2. CSS Output
The styling helper `focalPointStyle(focalX, focalY, fit)` converts coordinates to standard CSS properties:
```javascript
{
  objectPosition: `${focalX}% ${focalY}%`,
  objectFit: fit
}
```

- [Machine Evidence: Crop & Focal Roundtrip](evidence/crop-focal-roundtrip.json)
- [Visual: Focal Inspector Open](visuals/15-focal-inspector-open.png)
