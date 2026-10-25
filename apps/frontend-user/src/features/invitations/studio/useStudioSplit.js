import { useCallback, useEffect, useRef, useState } from 'react';

export const STUDIO_SPLIT_KEY = 'koupreng.studio.split.v1';
export function splitBounds(width) {
  // Both panes remain usable even when the navigation consumes desktop space.
  return { min: Math.max(30, Math.min(60, 360 / width * 100)), max: Math.min(75, Math.max(60, (width - 280) / width * 100)) };
}
export function clampSplit(value, width) {
  const { min, max } = splitBounds(width);
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : 60));
}
function readPreference() {
  try {
    const value = JSON.parse(localStorage.getItem(STUDIO_SPLIT_KEY));
    return typeof value === 'number' && value >= 30 && value <= 75 ? value : 60;
  } catch { return 60; }
}

export function useStudioSplit(mode) {
  const gridRef = useRef(null), drag = useRef(null), available = useRef(1000);
  const [value, setValue] = useState(readPreference);
  const preference = useRef(value);
  const [bounds, setBounds] = useState({ min: 30, max: 75 });
  const apply = useCallback((next, commit = true) => {
    const clamped = clampSplit(next, available.current);
    gridRef.current?.style.setProperty('--studio-editor-width', `${available.current * clamped / 100}px`);
    if (commit) {
      preference.current = next;
      setValue(clamped);
      try { localStorage.setItem(STUDIO_SPLIT_KEY, JSON.stringify(next)); } catch { /* Layout still works with storage blocked. */ }
    }
    return clamped;
  }, []);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const sidebar = grid.querySelector('.studio-sections')?.getBoundingClientRect().width || 0;
      available.current = Math.max(1, grid.getBoundingClientRect().width - sidebar - 24);
      setBounds(splitBounds(available.current));
      setValue(apply(preference.current, false));
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(grid);
    return () => observer?.disconnect();
  }, [mode, apply]);
  const finish = useCallback((cancelled = false) => {
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    gridRef.current?.removeAttribute('data-resizing');
    const restored = apply(cancelled ? active.original : active.next);
    // A cancelled drag can restore the same React state; repair transient ARIA too.
    active.target.setAttribute('aria-valuenow', String(Math.round(restored)));
    active.target.setAttribute('aria-valuetext', `${Math.round(restored)}%`);
    if (active.target.hasPointerCapture?.(active.id)) active.target.releasePointerCapture(active.id);
  }, [apply]);
  useEffect(() => {
    const cancel = () => finish(true);
    window.addEventListener('blur', cancel);
    return () => { window.removeEventListener('blur', cancel); finish(true); };
  }, [finish]);
  const separator = {
      onPointerDown(event) {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault(); event.currentTarget.focus();
        drag.current = { id: event.pointerId, target: event.currentTarget, x: event.clientX, original: preference.current, start: value, next: value };
        event.currentTarget.setPointerCapture(event.pointerId);
        gridRef.current?.setAttribute('data-resizing', 'true');
      },
      onPointerMove(event) {
        if (!drag.current || drag.current.id !== event.pointerId) return;
        drag.current.next = apply(drag.current.start + (event.clientX - drag.current.x) / available.current * 100, false);
        // Update accessibility values without rendering the invitation on every movement.
        event.currentTarget.setAttribute('aria-valuenow', String(Math.round(drag.current.next)));
        event.currentTarget.setAttribute('aria-valuetext', `${Math.round(drag.current.next)}%`);
      },
      onPointerUp: () => finish(), onPointerCancel: () => finish(true), onLostPointerCapture: () => finish(),
      onKeyDown(event) {
        const next = { ArrowLeft: value - (event.shiftKey ? 10 : 2), ArrowRight: value + (event.shiftKey ? 10 : 2), Home: bounds.min, End: bounds.max }[event.key];
        if (next === undefined) return;
        event.preventDefault(); apply(clampSplit(next, available.current));
      },
  };
  return [gridRef, { value: Math.round(value), min: Math.round(bounds.min), max: Math.round(bounds.max), apply, separator }];
}
