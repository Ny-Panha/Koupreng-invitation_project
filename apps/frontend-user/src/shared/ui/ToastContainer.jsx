import { useEffect, useState } from "react";
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

  useEffect(() => {
    const handleToastEvent = (event) => {
      const { message, type = "success", duration = 3000 } = event.detail || {};
      if (!message) return;

      const id = Date.now() + Math.random().toString(36).slice(2, 6);
      const newToast = { id, message, type };

      setToasts((current) => {
        if (current.some((item) => item.message === message)) {
          return current;
        }
        return [...current, newToast];
      });

      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, duration);
    };

    window.addEventListener("koupreng:toast", handleToastEvent);
    window.addEventListener("toast", (e) => {
      handleToastEvent({ detail: { message: e.detail, type: "info" } });
    });

    return () => {
      window.removeEventListener("koupreng:toast", handleToastEvent);
      window.removeEventListener("toast", handleToastEvent);
    };
  }, []);

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
              onClick={() =>
                setToasts((current) =>
                  current.filter((toast) => toast.id !== item.id)
                )
              }
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
