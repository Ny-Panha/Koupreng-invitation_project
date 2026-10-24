import { useContext, useEffect, useRef, useState } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";
import { registerUnsavedHistoryGuard } from "@/shared/navigation/unsavedHistoryGuard";

// One writer per mounted editor. A completion only acknowledges the snapshot it sent.
export function useStudioPersistence({ value, onRestore, persist, enabled, initialSaved = true, delay = 1500, english = true }) {
  const navigation = useContext(UNSAFE_NavigationContext);
  const serialized = JSON.stringify(value);
  const initial = useRef(serialized);
  const acknowledged = useRef(initialSaved ? serialized : null);
  const latest = useRef({ serialized, persist });
  const running = useRef(null);
  const mounted = useRef(true);
  const blocked = useRef(false);
  const copy = useRef(null);
  copy.current = english ? {
    offline: "Offline. Reconnect and retry saving.", failed: "The server has not saved these changes. Retry saving.",
    conflict: "Another editor saved a newer version. Your edits are still here. Reopen the event to review the latest version before applying them.",
    expired: "Your session expired. Keep a copy of your changes, then sign in again.",
    leave: "Changes have not reached the server. Leave this editor?", reset: "Restore the version loaded when this editor opened?",
  } : {
    offline: "គ្មានអ៊ីនធឺណិត។ ភ្ជាប់ឡើងវិញ ហើយរក្សាទុកម្ដងទៀត។", failed: "ម៉ាស៊ីនមេមិនទាន់រក្សាទុកការកែប្រែ។ សូមព្យាយាមម្ដងទៀត។",
    conflict: "មានការរក្សាទុកកំណែថ្មីពីអ្នកកែសម្រួលផ្សេង។ ការកែប្រែរបស់អ្នកនៅទីនេះ។ បើកកម្មវិធីម្ដងទៀត ដើម្បីពិនិត្យកំណែថ្មីមុនបញ្ចូលការកែប្រែ។",
    expired: "វគ្គចូលប្រើបានផុតកំណត់។ ចម្លងការកែប្រែរបស់អ្នក រួចចូលប្រើម្ដងទៀត។",
    leave: "ការកែប្រែមិនទាន់ទៅដល់ម៉ាស៊ីនមេ។ ចាកចេញពីផ្ទាំងនេះ?", reset: "ស្ដារកំណែដែលបានបើកដំបូងវិញ?",
  };
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
    if (blocked.current) return false;
    if (globalThis.navigator?.onLine === false) {
      setState(s => ({ ...s, phase: "offline", error: copy.current.offline }));
      return false;
    }
    const snapshot = latest.current.serialized;
    setState(s => ({ ...s, phase: "saving", error: "" }));
    running.current = (async () => {
      try {
        const result = await latest.current.persist();
        if (!result?.synced) throw Object.assign(new Error(result?.error || copy.current.failed), { status: result?.status });
        acknowledged.current = snapshot;
        if (mounted.current) setState(s => ({ phase: "saved", error: "", version: s.version + 1 }));
        return true;
      } catch (error) {
        const phase = error.status === 409 ? "conflict" : error.status === 401 ? "expired" : "failed";
        blocked.current = phase === "conflict" || phase === "expired";
        if (mounted.current) setState(s => ({ ...s, phase, error: blocked.current ? copy.current[phase] : error.message || copy.current.failed }));
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
    if (!enabled || !dirty || ["failed", "offline", "conflict", "expired"].includes(state.phase)) return;
    const timer = setTimeout(() => { void saveRef.current(); }, delay);
    return () => clearTimeout(timer);
  }, [serialized, dirty, enabled, delay, state.phase, state.version]);

  useEffect(() => {
    const navigator = navigation?.navigator;
    const originals = {};
    const wrappers = {};
    const changed = () => latest.current.serialized !== acknowledged.current;
    const mayLeave = () => !changed() || window.confirm(copy.current.leave);
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
      if (!window.confirm(copy.current.leave)) { event.preventDefault(); event.stopPropagation(); }
    }
    const offline = () => { if (!blocked.current) setState(s => ({ ...s, phase: "offline", error: copy.current.offline })); };
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
  return { dirty, version: state.version, phase: state.phase === "saved" && dirty ? "unsaved" : state.phase, error: state.error,
    save, flush, undo: () => restore(history.current.index - 1), redo: () => restore(history.current.index + 1),
    canUndo: (history.current.index > 0 || history.current.entries[history.current.index] !== serialized) && state.phase !== "saving",
    canRedo: history.current.index < history.current.entries.length - 1 && state.phase !== "saving",
    reset: () => { if (state.phase !== "saving" && window.confirm(copy.current.reset)) onRestore(JSON.parse(initial.current)); },
  };
}
