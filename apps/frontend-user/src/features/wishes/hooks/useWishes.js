import { useCallback, useEffect, useRef, useState } from "react";
import { wishesApi } from "../api/wishesApi";

export function useWishes(invitationId) {
  const generation = useRef(0);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadWishes = useCallback(() => {
    const request = ++generation.current;
    if (!invitationId) { if (request === generation.current) setLoading(false); return; }
    setLoading(true);
    setError("");
    wishesApi
      .listByInvitation(invitationId)
      .then((items) => {
        if (request !== generation.current) return;
        setWishes(items || []);
      })
      .catch((err) => {
        if (request !== generation.current) return;
        setError(err?.message || "Could not load wishes");
      })
      .finally(() => { if (request === generation.current) setLoading(false); });
  }, [invitationId]);

  useEffect(() => {
    loadWishes();
    return () => { generation.current += 1; };
  }, [loadWishes]);

  const deleteWish = async (wishId) => {
    setDeletingId(wishId);
    try {
      await wishesApi.deleteWish(invitationId, wishId);
      setWishes((prev) => prev.filter((w) => w.id !== wishId));
    } catch (err) {
      setError(err?.message || "Could not delete wish");
    } finally {
      setDeletingId(null);
    }
  };

  return { wishes, loading, error, deletingId, loadWishes, deleteWish };
}

export default useWishes;
