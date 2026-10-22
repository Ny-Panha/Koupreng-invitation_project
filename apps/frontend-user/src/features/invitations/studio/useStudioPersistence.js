import { useContext, useEffect, useRef, useState } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";
import { registerUnsavedHistoryGuard } from "@/shared/navigation/unsavedHistoryGuard";

// One writer per mounted editor. A completion only acknowledges the snapshot it sent.
export function useStudioPersistence({ value, onRestore, persist, enabled, initialSaved = true, delay = 1500 }) {
  const navigation = useContext(UNSAFE_NavigationContext);
  const serialized = JSON.stringify(value);
  const initial = useRef(serialized);
  const acknowledged = useRef(initialSaved ? serialized : null);
  const latest = useRef({ serialized, persist });
  const running = useRef(null);
  const mounted = useRef(true);
  const history = useRef({ entries: [serialized], index: 0, restoring: false });
  const [state, setState] = useState({ phase: initialSaved ? "saved" : "unsaved", error: "", version: 0 });
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

  async function flush() {
    let saved = await save();
    while (saved && latest.current.serialized !== acknowledged.current) saved = await save();
    return saved;
  }

  useEffect(() => {
    if (!enabled || !dirty || state.phase === "failed" || state.phase === "offline") return;
    const timer = setTimeout(() => { void saveRef.current(); }, delay);
    return () => clearTimeout(timer);
  }, [serialized, dirty, enabled, delay, state.phase, state.version]);

  useEffect(() => {
    const navigator = navigation?.navigator;
    const originals = {};
    const wrappers = {};
    const changed = () => latest.current.serialized !== acknowledged.current;
    const mayLeave = () => !changed() || window.confirm("Changes have not reached the server. Leave this editor?");
    const historyGuard = registerUnsavedHistoryGuard(mayLeave);
    // BrowserRouter has no data-router blocker. Guard its shared navigation adapter,
    // including imperative event switching, and restore it when this editor unmounts.
    if (navigator) for (const method of ["push", "replace", "go"]) {
      originals[method] = navigator[method];
      wrappers[method] = function (...args) {
        if (!mayLeave()) return;
        const result = originals[method].apply(navigator, args);
        historyGuard.updateIndex();
        return result;
      };
      navigator[method] = wrappers[method];
    }
    function warn(event) { if (latest.current.serialized !== acknowledged.current) { event.preventDefault(); event.returnValue = ""; } }
    function guardLink(event) {
      if (navigator) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || event.defaultPrevented || anchor.target === "_blank" || latest.current.serialized === acknowledged.current) return;
      if (!window.confirm("Changes have not reached the server. Leave this editor?")) { event.preventDefault(); event.stopPropagation(); }
    }
    const offline = () => setState(s => ({ ...s, phase: "offline", error: "Offline. Reconnect and retry saving." }));
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("beforeunload", warn); historyGuard.release();
      document.removeEventListener("click", guardLink, true); window.removeEventListener("offline", offline);
      if (navigator) for (const method of Object.keys(originals)) if (navigator[method] === wrappers[method]) navigator[method] = originals[method];
    };
  }, [navigation]);

  function restore(index) {
    const h = history.current;
    if (running.current || index < 0 || index >= h.entries.length) return;
    h.index = index;
    onRestore(JSON.parse(h.entries[index]));
  }
  return { dirty, phase: state.phase === "saved" && dirty ? "unsaved" : state.phase, error: state.error,
    save, flush, undo: () => restore(history.current.index - 1), redo: () => restore(history.current.index + 1),
    canUndo: (history.current.index > 0 || history.current.entries[history.current.index] !== serialized) && state.phase !== "saving",
    canRedo: history.current.index < history.current.entries.length - 1 && state.phase !== "saving",
    reset: () => { if (state.phase !== "saving" && window.confirm("Restore the version loaded when this editor opened?")) onRestore(JSON.parse(initial.current)); },
  };
}
