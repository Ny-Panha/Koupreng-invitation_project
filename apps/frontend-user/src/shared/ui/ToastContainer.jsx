import { useCallback, useEffect, useRef, useState } from "react";
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
  IoWarning,
  IoClose,
} from "react-icons/io5";
import "./Toast.css";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const activeMessages = useRef(new Map());
  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    for (const [message, activeId] of activeMessages.current) if (activeId === id) activeMessages.current.delete(message);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const { message, type = "success", duration = 3000 } = event.detail || {};
      if (!message || activeMessages.current.has(message)) return;

      const id = Date.now() + Math.random().toString(36).slice(2, 6);
      const newToast = { id, message, type };
      activeMessages.current.set(message, id);

      setToasts((current) => {
        if (current.some((item) => item.message === message)) {
          return current;
        }
        return [...current, newToast];
      });

      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    };
    const handleLegacyToast = (event) => handleToastEvent({ detail: { message: event.detail, type: "info" } });

    window.addEventListener("koupreng:toast", handleToastEvent);
    window.addEventListener("toast", handleLegacyToast);
    const activeTimers = timers.current;
    const messages = activeMessages.current;

    return () => {
      window.removeEventListener("koupreng:toast", handleToastEvent);
      window.removeEventListener("toast", handleLegacyToast);
      for (const timer of activeTimers.values()) clearTimeout(timer);
      activeTimers.clear(); messages.clear();
    };
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="k-toast-wrapper" aria-live="polite" role="region">
      {toasts.map((item) => {
        const Icon =
          item.type === "success"
            ? IoCheckmarkCircle
            : item.type === "error"
            ? IoAlertCircle
            : item.type === "warning"
            ? IoWarning
            : IoInformationCircle;

        return (
          <div key={item.id} className={`k-toast k-toast-${item.type}`}>
            <div className="k-toast-icon-wrapper">
              <Icon className="k-toast-icon" aria-hidden="true" />
            </div>
            <span className="k-toast-message">{item.message}</span>
            <button
              type="button"
              className="k-toast-close"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss toast"
            >
              <IoClose aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
