import { useCallback, useEffect, useRef, useState } from 'react';

// Keep both desktop panes usable when the viewport or split changes.
export default function useStudioPanelLayout(ready) {
  const workspaceRef = useRef(null);
  const [width, setWidth] = useState(() => window.innerWidth);
  const [requestedPercent, setRequestedPercent] = useState(48);
  useEffect(() => {
    const element = workspaceRef.current;
    if (!ready || !element) return;
    let frame;
    const measure = () => setWidth(element.clientWidth);
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(element);
    schedule();
    window.addEventListener('resize', schedule);
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', schedule); };
  }, [ready]);
  const min = width >= 1024 ? Math.max(25, Math.ceil(320 / width * 100)) : 25;
  const max = width >= 1024 ? Math.min(75, Math.floor((width - 404) / width * 100)) : 75;
  const value = Math.min(max, Math.max(min, requestedPercent));
  const setValue = useCallback(next => setRequestedPercent(Math.min(max, Math.max(min, next))), [min, max]);
  return { workspaceRef, value, setValue, min, max };
}
