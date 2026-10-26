# Resizable editing workspace

The sidebar stays at its established desktop width; editor and preview share the remaining width with a 24px pointer gutter. Default is 60/40, with Focus Editor 70/30, Balanced 50/50, Focus Preview 40/60 and Reset 60/40. Both Guided and Advanced modes use this rule. The hook measures actual grid/sidebar space, clamps to a 360px editor and 280px preview where they fit, and reapplies the preference on container resize.

Pointer capture supports mouse/touch pointer events. Transient movement changes a CSS variable without rerendering the form; release commits the ratio to a versioned, non-sensitive localStorage preference. Cancellation/blur restores the preference and removes drag state. Iframes cannot consume pointer events during dragging. Arrow keys use 2% steps, Shift uses 10%, Home/End use measured limits. The separator has a name, orientation, current value and bounds.

The existing ResizeObserver phone sizing, zoom and iframe instance are retained. Browser tests place an identity marker in the iframe, open its gate, change zoom, drag, apply presets and verify continuity. Mobile below 1024px keeps the single-pane/modal preview workflow, with no separator. Container-based form stacking now starts at 480px. Existing native fullscreen remains available.

Screenshots: `evidence/after/studio-preset-*.png`, six-tab phone/desktop captures. Physical touch devices and virtual-keyboard hardware remain a human review gate.

Native Chromium touch injection verifies pointer capture, release and cancellation; cancellation also restores transient ARIA values even when React state does not change. A child opening no longer steals focus from an immediate calendar action or a parent-editor handoff.
