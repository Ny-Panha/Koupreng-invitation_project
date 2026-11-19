# Report 07: Undo/Redo History & Transaction Stack Verification

> **Target:** Undo/Redo Mechanics, History Ring Buffer & Keyboard Shortcuts  
> **Auditor:** Codex (Senior Frontend Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Architecture of the History Stack

The undo/redo transaction stack is managed in `useStudioPersistence.js`:

```javascript
const history = useRef({ entries: [serialized], index: 0, restoring: false });
```

### Key Contract Guarantees
1. **Ring Buffer Sizing:** History is bounded to the last 25 discrete snapshots (`.slice(-25)`), preventing unbounded memory consumption during marathon editing sessions.
2. **De-duplication:** Keystrokes that result in identical serialized state do not push duplicate history entries.
3. **Branch Truncation:** Pushing an edit after an undo cleanly truncates the forward redo stack (`[...h.entries.slice(0, h.index + 1), serialized]`).
4. **Restoration Mutex:** While a save promise is in-flight (`running.current`), undo/redo calls are ignored to prevent race conditions.

---

## 2. Keyboard Event Isolation & Target Verification

A critical verification item was confirming whether global shortcuts (Ctrl+Z / Ctrl+Y) clobber native input typing undo.

### Code Implementation (`StudioToolbar.jsx` lines 50-75)
```javascript
const isTextEditable = event.target?.matches?.("input, textarea, select, [contenteditable=true]");

if ((event.ctrlKey || event.metaKey) && !isTextEditable) {
  if (event.key === 'z' || event.key === 'Z') {
    event.preventDefault();
    if (event.shiftKey) {
      if (studio.canRedo && canEdit) studio.redo();
    } else {
      if (studio.canUndo && canEdit) studio.undo();
    }
  } else if (event.key === 'y' || event.key === 'Y') {
    event.preventDefault();
    if (studio.canRedo && canEdit) studio.redo();
  }
}
```

### Test Evidence
In `StudioToolbar.test.jsx`:
- **Test 1:** When user is focused in `<input data-testid="title-input">`, pressing Ctrl+Z does NOT call `studio.undo()`. Native browser input undo operates normally.
- **Test 2:** When focus is on window/canvas, Ctrl+Z invokes `studio.undo()`, Ctrl+Shift+Z invokes `studio.redo()`, and Ctrl+Y invokes `studio.redo()`.

Both tests passed with 100% reliability.
