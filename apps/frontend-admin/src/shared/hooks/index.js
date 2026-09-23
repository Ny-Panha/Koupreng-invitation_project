import { useCallback, useEffect, useState } from "react";

export function useResource(loader) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loader());
      setError("");
    } catch (loadError) {
      setError(loadError?.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => { reload(); }, [reload]);
  return { data, setData, loading, error, reload };
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => setToast({ message, type }), []);
  const clear = useCallback(() => setToast(null), []);
  return { toast, show, clear };
}