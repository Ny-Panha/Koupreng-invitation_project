# Report 14: Mobile Virtual Keyboard & visualViewport Adaptation Audit

> **Target:** Software Keyboard Detection, Viewport Shrinking & Action Obscuration  
> **Auditor:** Codex (Senior Mobile UX Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. The Mobile Keyboard Dilemma

On mobile devices, when an author taps an `<input>` or `<textarea>`, the virtual software keyboard slides up from the bottom of the screen, occupying 300px to 450px of vertical space. 
In many web editors, sticky bottom toolbars or floating action buttons remain fixed on screen, directly obscuring the active text input and confusing the user.

---

## 2. Dual-Engine Detection Architecture

In `StudioToolbar.jsx` lines 13-28, Gemini implemented a hybrid listener:

```javascript
useEffect(() => {
  const viewport = window.visualViewport;
  const update = () => {
    const isShrunk = Boolean(viewport && window.innerHeight - viewport.height > 150);
    const isInputActive = Boolean(document.activeElement?.matches("input,textarea,select,[contenteditable=true]"));
    setKeyboardOpen(isShrunk && isInputActive);
  };
  viewport?.addEventListener("resize", update);
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", update);
  return () => {
    viewport?.removeEventListener("resize", update);
    document.removeEventListener("focusin", update);
    document.removeEventListener("focusout", update);
  };
}, []);
```

And in CSS:
```css
.studio-toolbar-actions[data-keyboard-open=true] {
  visibility: hidden;
  pointer-events: none;
}
```

### OS-Specific Nuances Analyzed
- **iOS Safari:** When the virtual keyboard appears, `window.innerHeight` remains unchanged, but `window.visualViewport.height` shrinks drastically. The formula `window.innerHeight - viewport.height > 150` evaluates to `true`.
- **Android Chrome:** In some Android modes, both `window.innerHeight` and `visualViewport.height` resize simultaneously. The addition of `document.addEventListener("focusin")` ensures that active text inputs are tracked regardless of how the Android window handles keyboard resize.
- **Result:** Floating action buttons hide cleanly while typing, leaving the full viewport for the input and virtual keyboard. When the keyboard closes (`focusout`), the toolbar reappears instantly.
