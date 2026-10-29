import { useCallback, useEffect, useRef, useState } from "react";
import { notificationsApi } from "../api/notificationsApi";

export function useNotifications() {
  const generation = useRef(0);
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(() => {
    const request = ++generation.current;
    setLoading(true);
    setError("");
    Promise.all([
      notificationsApi.list(),
      notificationsApi.summary(),
    ])
      .then(([items, counts]) => {
        if (request !== generation.current) return;
        setNotifications(items || []);
        setSummary(counts || null);
        setError("");
      })
      .catch((err) => {
        if (request !== generation.current) return;
        setError(err?.message || "Could not load notifications");
      })
      .finally(() => {
        if (request === generation.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
    return () => { generation.current += 1; };
  }, [loadData]);

  const markRead = async (notificationId) => {
    setBusyId(notificationId);
    try {
      const updated = await notificationsApi.markRead(notificationId);
      setNotifications((items) =>
        items.map((item) => (item.id === notificationId ? { ...item, ...updated } : item))
      );
      setSummary((current) => ({
        ...(current || {}),
        unread: Math.max(0, (current?.unread || 0) - 1),
      }));
    } catch (err) {
      setError(err?.message || "Could not mark notification as read");
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId("all");
    try {
      const updated = await notificationsApi.markAllRead();
      setNotifications(updated || []);
      setSummary((current) => ({ ...(current || {}), unread: 0 }));
    } catch (err) {
      setError(err?.message || "Could not mark notifications as read");
    } finally {
      setBusyId(null);
    }
  };

  return {
    notifications,
    summary,
    loading,
    error,
    busyId,
    loadData,
    markRead,
    markAllRead,
  };
}

export default useNotifications;
