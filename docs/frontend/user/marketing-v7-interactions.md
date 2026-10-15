# Koupreng V7 — Motion & Interactive Mechanics
**Principle:** Purposeful, compositor-friendly, accessible CSS & spring animations. No visual noise.

---

## 1. 3D Perspective Tilt Mechanics

The interactive device preview in `PublicTemplateDevicePreview.jsx` provides a realistic 3-dimensional physical feel for desktop users:

### Pointer Tracking Algorithm
```javascript
// Calculate normalized offsets from container center [-1, 1]
const rect = containerRef.current.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;

const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

// Bounded max tilt to prevent distortion
const maxTilt = 5.5; // degrees
setTilt({
  x: -normY * maxTilt,
  y: normX * maxTilt,
  isHovered: true,
});
```

### Motion Easing & Damping
- **Active tracking:** `transform 0.12s ease-out` follows the cursor without perceived lag.
- **Return to rest:** `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)` smoothly returns the device level when the cursor leaves the frame.
- **Reset button:** An explicit button labeled *"កំណត់ទិដ្ឋភាពឡើងវិញ"* / *"Reset 3D view"* resets coordinates to `(0, 0)` for keyboard and accessibility navigation.

---

## 2. Accessibility & Reduced Motion Compliance

In accordance with WCAG 2.2 Criterion 2.3.3 (Animation from Interactions):
- The `usePrefersReducedMotion()` hook detects operating system reduced-motion preferences.
- When `prefers-reduced-motion: reduce` is active:
  - 3D perspective transforms are completely disabled.
  - The melody pulse animation (`kpPulse`) is frozen.
  - The device remains in a crisp, elegant static 2D elevation.
- On touch viewports (`<768px`) or mobile devices, 3D tilt tracking is automatically suppressed to ensure native vertical scrolling performance.

---

## 3. Responsive Editorial Split-Screen Flow

The `AuthLayout` component provides continuity between the public brand and the authentication journey:

- **Desktop Viewports (≥960px):**
  - **Left Panel (Atelier Showcase):** 50% split with subtle champagne gradient, brand emblem, floating smartphone mockup, and value proof badges.
  - **Right Panel (Form Card):** Centered 440px soft-luxe card with 50px rounded inputs, 52px pill action button, floating home link, and language switcher.
- **Mobile Viewports (<960px):**
  - The left showcase panel gracefully collapses.
  - The form card occupies the primary viewport with generous touch targets (min 48px), preventing pinch-zoom and input clipping.

---

## 4. Query Parameter Continuity (`next` / `redirect`)

To ensure seamless template adoption:
- When an anonymous user clicks *"ប្រើគំរូនេះ"* (*Use this design*) on a template, they are routed to `/login?next=/editor?template=...` or `/register?next=/editor?template=...`.
- Both `LoginFeature.jsx` and `RegisterFeature.jsx` now implement `getSafeRedirect(searchParams)`:
  - Validates that the redirect begins with a single `/` and does not begin with `//` (preventing open redirect attacks).
  - Defaults safely to `/dashboard/events` when no redirect is provided.
  - Cross-links between login and register pass the `next` parameter, preserving user context regardless of which auth flow they choose.

