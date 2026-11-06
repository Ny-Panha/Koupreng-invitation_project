import { useEffect, useState } from 'react';

const current = () => ({ hidden: document.hidden, saveData: navigator.connection?.saveData === true });

/** Pause decorative work offscreen and keep data-saving guests on the static path. */
export default function useFloralEnvironment() {
  const [environment, setEnvironment] = useState(current);
  useEffect(() => {
    const connection = navigator.connection;
    const refresh = () => setEnvironment(previous => {
      const next = current();
      return previous.hidden === next.hidden && previous.saveData === next.saveData ? previous : next;
    });
    document.addEventListener('visibilitychange', refresh);
    connection?.addEventListener?.('change', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      connection?.removeEventListener?.('change', refresh);
    };
  }, []);
  return environment;
}
