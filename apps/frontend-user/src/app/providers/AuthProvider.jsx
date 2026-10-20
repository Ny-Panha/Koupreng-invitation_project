import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { isCookieAuthStorage } from "@/shared/storage/authStorage";

export default function AuthProvider({ children }) {
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const invalidateSession = useAuthStore((state) => state.invalidateSession);
  useEffect(() => {
    initializeSession();
    const handleStorage = event => {
      if (event.key !== "koupreng.auth.logout" || !event.newValue) return;
      try {
        const message = JSON.parse(event.newValue);
        if (message.userId != null && String(message.userId) === String(useAuthStore.getState().user?.id)) invalidateSession();
      } catch { /* Ignore malformed cross-tab metadata. */ }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isCookieAuthStorage()) initializeSession(true);
    };
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { window.removeEventListener("storage", handleStorage); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [initializeSession, invalidateSession]);
  useEffect(() => {
    if (!accessToken || isCookieAuthStorage()) return;
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      let timeout;
      const checkExpiry = () => {
        const delay = payload.exp * 1000 - Date.now();
        if (!Number.isFinite(delay) || delay <= 0) { invalidateSession(); return; }
        timeout = window.setTimeout(checkExpiry, Math.min(delay, 2_147_483_647));
      };
      checkExpiry();
      return () => window.clearTimeout(timeout);
    } catch { invalidateSession(); }
  }, [accessToken, invalidateSession]);
  return children;
}
