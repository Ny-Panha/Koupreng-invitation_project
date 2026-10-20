import { useEffect, useRef, useState } from "react";

// One writer per mounted editor. A completion only acknowledges the snapshot it sent.
export function useStudioPersistence({ value, onRestore, persist, enabled, delay = 1500 }) {
  const serialized = JSON.stringify(value);
  const initial = useRef(serialized);
  const acknowledged = useRef(serialized);
  const latest = useRef({ serialized, persist });
  const running = useRef(null);
  const mounted = useRef(true);
  const history = useRef({ entries: [serialized], index: 0, restoring: false });
  const [state, setState] = useState({ phase: "saved", error: "", version: 0 });
  latest.current = { serialized, persist };
  const dirty = serialized !== acknowledged.current;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const h = history.current;
    if (h.entries[h.index] === serialized) return;
    h.entries = [...h.entries.slice(0, h.index + 1), serialized].slice(-25);
    h.index = h.entries.length - 1;
  }, [serialized]);

  async function save() {
    if (running.current) return running.current;
    if (globalThis.navigator?.onLine === false) {
      setState(s => ({ ...s, phase: "offline", error: "Offline. Reconnect and retry saving." }));
      return false;
    }
    const snapshot = latest.current.serialized;
    setState(s => ({ ...s, phase: "saving", error: "" }));
    running.current = (async () => {
      try {
        const result = await latest.current.persist();
        if (!result?.synced) throw new Error(result?.error || "The server has not saved these changes. Retry saving.");
        acknowledged.current = snapshot;
        if (mounted.current) setState(s => ({ phase: "saved", error: "", version: s.version + 1 }));
        return true;
      } catch (error) {
        if (mounted.current) setState(s => ({ ...s, phase: "failed", error: error.message || "Save failed. Retry saving." }));
        return false;
      } finally {
        running.current = null;
      }
    })();
    return running.current;
  }
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!enabled || !dirty || state.phase === "failed" || state.phase === "offline") return;
    const timer = setTimeout(() => { void saveRef.current(); }, delay);
    return () => clearTimeout(timer);
  }, [serialized, dirty, enabled, delay, state.phase, state.version]);

  useEffect(() => {
    function warn(event) { if (latest.current.serialized !== acknowledged.current) { event.preventDefault(); event.returnValue = ""; } }
    function guardLink(event) {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || event.defaultPrevented || anchor.target === "_blank" || latest.current.serialized === acknowledged.current) return;
      if (!window.confirm("Changes have not reached the server. Leave this editor?")) { event.preventDefault(); event.stopPropagation(); }
    }
    const offline = () => setState(s => ({ ...s, phase: "offline", error: "Offline. Reconnect and retry saving." }));
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    window.addEventListener("offline", offline);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", guardLink, true); window.removeEventListener("offline", offline); };
  }, []);

  function restore(index) {
    const h = history.current;
    if (running.current || index < 0 || index >= h.entries.length) return;
    h.index = index;
    onRestore(JSON.parse(h.entries[index]));
  }
  return { dirty, phase: state.phase === "saved" && dirty ? "unsaved" : state.phase, error: state.error,
    save, undo: () => restore(history.current.index - 1), redo: () => restore(history.current.index + 1),
    canUndo: (history.current.index > 0 || history.current.entries[history.current.index] !== serialized) && state.phase !== "saving",
    canRedo: history.current.index < history.current.entries.length - 1 && state.phase !== "saving",
    reset: () => { if (state.phase !== "saving" && window.confirm("Restore the version loaded when this editor opened?")) onRestore(JSON.parse(initial.current)); },
  };
}
