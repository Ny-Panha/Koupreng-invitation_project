import { useCallback, useEffect, useRef, useState } from 'react';

/** Keep verified records during refresh; a newer request always owns the result. */
export function useResource(fetcher) {
  const [state, setState] = useState({ data: null, pending: true, error: false, source: fetcher });
  const generation = useRef(0);
  const active = useRef(false);
  const run = useCallback(async () => {
    const request = ++generation.current;
    setState(current => ({ ...current, data: current.source === fetcher ? current.data : null, pending: true, error: false, source: fetcher }));
    try {
      const data = await fetcher();
      if (active.current && request === generation.current) setState({ data, pending: false, error: false, source: fetcher });
    } catch (failure) {
      if (active.current && request === generation.current) {
        // Never retain protected records after access loss or deletion.
        const status = failure?.response?.status ?? failure?.status;
        setState(current => ({ data: [401, 403, 404].includes(status) ? null : current.data, pending: false, error: true, source: fetcher }));
      }
    }
  }, [fetcher]);
  useEffect(() => {
    active.current = true;
    // A new fetcher can represent a different user/resource: discard old records.
    setState({ data: null, pending: true, error: false, source: fetcher });
    run();
    return () => { active.current = false; generation.current += 1; };
  }, [fetcher, run]);
  const setData = useCallback(value => setState(current => ({ ...current, data: typeof value === 'function' ? value(current.data) : value })), []);
  const visible = state.source === fetcher;
  return { data: visible ? state.data : null, setData, loading: !visible || (state.pending && state.data === null), refreshing: visible && state.pending && state.data !== null, error: visible && state.error, reload: run };
}
