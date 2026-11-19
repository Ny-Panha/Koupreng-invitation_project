# Report 09: Unsaved Changes Navigation Guard & Data-Loss Audit

> **Target:** Navigation Interceptors, Browser Unload Protection & Accidental Tab Closure  
> **Auditor:** Codex (Senior QA & Release Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Multi-Tier Guard Strategy

Web applications frequently suffer catastrophic data loss when users accidentally hit the browser Back button, click external navigation links, or close tabs while background saves are pending.

Phase 13 implements a comprehensive 3-tier defense:

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 1: Window BeforeUnload Guard                          │
│ Intercepts browser tab close, reload (F5 / Ctrl+R), and    │
│ address bar navigation. Triggers native modal alert.        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Tier 2: React Router Navigation Method Proxies             │
│ Wraps navigator.push, navigator.replace, and navigator.go  │
│ Prompts window.confirm("Changes have not reached server")  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Tier 3: DOM Link Capture Listener                          │
│ Intercepts internal <a> clicks across the page in the      │
│ capture phase before router history changes execute.       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Code Trace & Verification

In `useStudioPersistence.js` lines 87-122:

```javascript
const changed = () => latest.current.serialized !== acknowledged.current;
const mayLeave = () => !changed() || window.confirm(copy.current.leave);
const historyGuard = registerUnsavedHistoryGuard(mayLeave);

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

function warn(event) {
  if (latest.current.serialized !== acknowledged.current) {
    event.preventDefault();
    event.returnValue = "";
  }
}
window.addEventListener("beforeunload", warn);
```

### Safety Properties Verified
1. **Zero Overwrite on Back Navigation:** When an author has unsaved changes and presses Back, the navigation method proxy halts the transition until confirmed.
2. **Clean Unmount Restoration:** When the editor legitimately unmounts, the original navigator methods (`push`, `replace`, `go`) are cleanly restored, leaving zero side-effects for subsequent routes.
3. **Verified in Test N13-06:** Dirty state is accurately calculated and prevents accidental navigation loss.
