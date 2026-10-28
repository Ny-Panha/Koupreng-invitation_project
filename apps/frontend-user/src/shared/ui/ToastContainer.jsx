import { useCallback, useEffect, useRef, useState } from "react";
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
  IoWarning,
  IoClose,
} from "react-icons/io5";
import "./Toast.css";
import { useUiCopy } from '../i18n/useUiCopy';

export default function ToastContainer() {
  const copy = useUiCopy();
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
      const { message, title, action, retry, type = "success", duration = type === 'error' ? 0 : 3000 } = event.detail || {};
      const key = event.detail?.id || `${type}:${message}`;
      if (!message || activeMessages.current.has(key)) return;

      const id = Date.now() + Math.random().toString(36).slice(2, 6);
      const newToast = { id, message, title, action: action || retry, type };
      activeMessages.current.set(key, id);

      setToasts((current) => {
        if (current.some((item) => item.message === message && item.type === type)) {
          return current;
        }
        return [...current, newToast];
      });

      if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
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
    <div className="k-toast-wrapper" role="region" aria-label={copy('សេចក្ដីជូនដំណឹង','Notifications')}>
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
          <div key={item.id} className={`k-toast k-toast-${item.type}`} role={item.type === 'error' ? 'alert' : 'status'} aria-live={item.type === 'error' ? 'assertive' : 'polite'}>
            <div className="k-toast-icon-wrapper">
              <Icon className="k-toast-icon" aria-hidden="true" />
            </div>
            <div className="k-toast-message">{item.title && item.title !== item.message && <strong>{item.title}</strong>}<span>{item.message}</span>{item.action && <button type="button" onClick={async event => {
              const button = event.currentTarget; if (button.disabled) return; button.disabled = true;
              try { await item.action(); dismiss(item.id); } catch { button.disabled = false; }
            }}>{copy('សាកម្តងទៀត','Try again')}</button>}</div>
            <button
              type="button"
              className="k-toast-close"
              onClick={() => dismiss(item.id)}
              aria-label={copy('បិទសេចក្ដីជូនដំណឹង', 'Dismiss toast')}
            >
              <IoClose aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
