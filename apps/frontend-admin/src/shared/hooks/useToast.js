import { useCallback, useState } from "react";

export function useToast() {
    const [toast, setToast] = useState(null);

    const show = useCallback((message, type = "info") => {
        setToast({ message, type, id: Date.now() });
    }, []);

    const clear = useCallback(() => setToast(null), []);

    return { toast, show, clear };
}
