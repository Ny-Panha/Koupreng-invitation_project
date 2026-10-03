import { useCallback, useEffect, useRef } from "react";

// FE-010 / FE-011 / P2-NEW-011: retries must never restore an old form snapshot.
export function usePreviewSyncRetries(synchronize) {
  const latest = useRef(synchronize);
  const timers = useRef(new Set());

  useEffect(() => { latest.current = synchronize; }, [synchronize]);
  const cancel = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);
  useEffect(() => cancel, [cancel]);

  return useCallback(() => {
    cancel();
    latest.current();
    [100, 300, 600, 1200, 2000].forEach((delay) => {
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        latest.current();
      }, delay);
      timers.current.add(timer);
    });
  }, [cancel]);
}
