# Report 06: Deep Form State & Split-Pane Architecture Audit

> **Target:** `useStudioSplit.js`, Split Pane Layout & Form State Binding  
> **Auditor:** Codex (Senior Frontend Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Split Pane Architecture

The studio environment provides a two-column desktop workstation layout:
- **Left Column:** Deep section form editor (`.pe-editor-scroll-body`).
- **Right Column:** Live Phone Simulator (`LivePhoneSimulator.jsx`) running the real invitation template iframe.
- **Divider:** Interactive pointer-draggable resizer (`StudioSplitControls.jsx`).

```text
┌────────────────────────────────────────────────────────────────────────┐
│ StudioToolbar (h=80px / h=54px landscape)                             │
├───────────────────────────────────┬─┬──────────────────────────────────┤
│ Section Editor (Left)             │ │ Live Phone Simulator (Right)     │
│ [Event Info] [Schedule] [Family]  │ │ ┌──────────────────────────────┐ │
│ [Map] [Gallery] [Story] [Notes]   │ │ │  Template Iframe             │ │
│                                   │ │ │  (Live PostMessage sync)     │ │
│ Form Fields:                      │ │ │                              │ │
│ - Couple Names (KM / EN)          │ │ │                              │ │
│ - Venue & Map                     │ │ │                              │ │
│ - Timeline Program                │ │ │                              │ │
│ - Media & Background              │ │ └──────────────────────────────┘ │
│ Split Range: 30% - 75%            │ │ Default: 60% / 40%               │
└───────────────────────────────────┴─┴──────────────────────────────────┘
```

---

## 2. Divider Clamping & Resilience Audit

The split logic in `useStudioSplit.js` was audited for numerical edge cases:

1. **Boundary Clamping:**
   - Minimum width clamp: 30%.
   - Maximum width clamp: 75%.
   - Below 30% drag: clamped to 30% to prevent form inputs from collapsing.
   - Above 75% drag: clamped to 75% to prevent preview iframe from being squashed.
2. **NaN Protection:**
   - If `NaN` or invalid float is passed (e.g. from broken pointer calculation during zero-width window), `clampSplit` safely falls back to default 60%.
3. **Pointer Cancel Handling:**
   - In `N13-14` test, triggering `pointercancel` cleanly unbinds window listeners and restores the pre-drag split position without layout thrashing.
