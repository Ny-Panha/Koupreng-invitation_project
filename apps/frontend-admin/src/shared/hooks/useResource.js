import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useResource — loads async data on mount and exposes a reload() for refresh.
 *
 * The fetcher is expected to be a stable reference (e.g. a service method or a
 * module-level function). Results are only committed while mounted, and all
 * state updates happen after an await so no synchronous cascading renders occur.
 */
export function useResource(fetcher) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const activeRef = useRef(true);

    // Manual refresh from event handlers — shows the loading state.
    const reload = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await fetcher();
            if (activeRef.current) setData(result);
        } catch {
            if (activeRef.current) setError(true);
        } finally {
            if (activeRef.current) setLoading(false);
        }
    }, [fetcher]);

    useEffect(() => {
        activeRef.current = true;
        // State already starts as `loading`, so updates only happen after the await.
        (async () => {
            try {
                const result = await fetcher();
                if (activeRef.current) setData(result);
            } catch {
                if (activeRef.current) setError(true);
            } finally {
                if (activeRef.current) setLoading(false);
            }
        })();
        return () => {
            activeRef.current = false;
        };
    }, [fetcher]);

    return { data, setData, loading, error, reload };
}
