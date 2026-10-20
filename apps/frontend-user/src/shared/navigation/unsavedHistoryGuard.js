let activeGuard = null;
let reverting = false;

// Installed before BrowserRouter subscribes, so rejected POPs cannot unmount
// the editor before its leave warning runs. No history entries are added.
if (typeof window !== "undefined") window.addEventListener("popstate", event => {
  if (reverting) { reverting = false; event.stopImmediatePropagation(); return; }
  if (!activeGuard) return;
  const index = window.history.state?.idx;
  const previous = activeGuard.index;
  if (typeof index !== "number" || typeof previous !== "number" || index === previous) return;
  if (activeGuard.mayLeave()) activeGuard.index = index;
  else { event.stopImmediatePropagation(); reverting = true; window.history.go(previous - index); }
}, true);

export function registerUnsavedHistoryGuard(mayLeave) {
  const guard = { mayLeave, index: window.history.state?.idx };
  activeGuard = guard;
  return {
    updateIndex: () => { guard.index = window.history.state?.idx; },
    release: () => { if (activeGuard === guard) activeGuard = null; },
  };
}
