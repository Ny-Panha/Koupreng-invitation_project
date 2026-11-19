# 13 — Split Pane Keyboard and Pointer Resize

## 1. Split Controls & Clamping
- `useStudioSplit.js` enforces strict min/max boundaries (30% to 75%).
- Pointer drag with setPointerCapture.
- Pointer cancel and window blur cleanly restore original position without layout collapse.
- WCAG 2.2 single-pointer alternative provided via split control buttons and keyboard arrow keys.

## 2. Keyboard Accessibility
- Separator has `role="separator"`, `tabIndex={0}`, `aria-orientation="vertical"`.
- `ArrowLeft` / `ArrowRight` (2% step), `Shift+Arrow` (10% step), `Home` (min), `End` (max).

See [Split Matrix](evidence/split-resize-state-matrix.json).
