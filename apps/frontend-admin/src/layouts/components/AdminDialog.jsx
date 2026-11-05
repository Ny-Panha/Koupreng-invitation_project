import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Native modal dialogs provide browser-managed inertness and a keyboard focus loop.
// Keeping closed dialogs unmounted also removes their links from the Tab order.
export default function AdminDialog({ children, label, className = "", onClose, initialFocusRef, returnFocusRef, id }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = returnFocusRef?.current || document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    (initialFocusRef?.current || dialog.querySelector("button, input, a[href]") || dialog).focus();
    // Native modality makes the page inert, but Tab can still reach browser chrome.
    // Wrap at the dialog's boundaries so long operational flows retain their place.
    const wrapFocus = event => {
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter(node => !node.matches(":disabled") && node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", wrapFocus);
    return () => {
      dialog.removeEventListener("keydown", wrapFocus);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      // Safari can restore its pre-dialog focus after close(); finish after that native step.
      requestAnimationFrame(() => {
        if (previousFocus?.isConnected && !document.querySelector("dialog[open]")) previousFocus.focus({ preventScroll: true });
      });
    };
  }, [initialFocusRef, returnFocusRef]);

  return createPortal(
    <dialog
      id={id}
      ref={dialogRef}
      aria-label={label}
      aria-modal="true"
      className={`admin-dialog ${className}`.trim()}
      onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); } }}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      {children}
    </dialog>, document.body,
  );
}
