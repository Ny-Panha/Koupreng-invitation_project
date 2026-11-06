import { useEffect, useState } from 'react';

const current = () => ({ hidden: document.hidden, saveData: navigator.connection?.saveData === true, slow: window.matchMedia?.('(update: slow)').matches === true });

/** Pause decorative work offscreen and keep data-saving guests on the static path. */
export default function useFloralEnvironment() {
  const [environment, setEnvironment] = useState(current);
  useEffect(() => {
    const connection = navigator.connection;
    const updateSpeed = window.matchMedia?.('(update: slow)');
    const refresh = () => setEnvironment(previous => {
      const next = current();
      return previous.hidden === next.hidden && previous.saveData === next.saveData && previous.slow === next.slow ? previous : next;
    });
    document.addEventListener('visibilitychange', refresh);
    connection?.addEventListener?.('change', refresh);
    updateSpeed?.addEventListener?.('change', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      connection?.removeEventListener?.('change', refresh);
      updateSpeed?.removeEventListener?.('change', refresh);
    };
  }, []);
  return environment;
}
