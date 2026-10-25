import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import "./Modal.css";
import { useUiCopy } from "../i18n/useUiCopy";

const modalStack = [];
const backgroundState = new Map();
let originalOverflow = "";
let originalFocus = null;
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

function focusableElements(dialog) {
  return Array.from(dialog.querySelectorAll(focusableSelector)).filter((element) => {
    if (element.tabIndex < 0 || element.matches(":disabled,[data-modal-focus-guard]")) return false;
    // A child can have display:flex while one of its parents has display:none.
    // Check ancestors too, so hidden sections never enter the dialog's Tab loop.
    for (let node = element; node && node !== dialog.parentElement; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (node.hidden || node.hasAttribute("inert") || style.display === "none"
        || style.visibility === "hidden" || style.visibility === "collapse") return false;
    }
    return true;
  });
}

function isolateBackground() {
  const current = modalStack.at(-1);
  if (current) {
    for (const child of document.body.children) {
      if (!backgroundState.has(child)) backgroundState.set(child, child.getAttribute("inert"));
      if (child === current.root) child.removeAttribute("inert");
      else child.setAttribute("inert", "");
    }
    document.body.style.overflow = "hidden";
  } else {
    for (const [child, inert] of backgroundState) {
      if (inert === null) child.removeAttribute("inert"); else child.setAttribute("inert", inert);
    }
    backgroundState.clear(); document.body.style.overflow = originalOverflow;
  }
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md", // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ariaLabel,
  closeLabel,
  showHeader = true,
  className = "",
  backdropClassName = "",
}) {
  const copy = useUiCopy();
  const modalRef = useRef(null);
  const closeOptions = useRef({ onClose, closeOnEscape });
  const [portalRoot] = useState(() => document.createElement("div"));
  useEffect(() => { closeOptions.current = { onClose, closeOnEscape }; }, [onClose, closeOnEscape]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = modalRef.current;
    const previousFocus = document.activeElement;
    if (!modalStack.length) { originalOverflow = document.body.style.overflow; originalFocus = previousFocus; }
    portalRoot.className = "k-modal-portal";
    document.body.appendChild(portalRoot);
    const entry = { root: portalRoot, dialog };
    modalStack.push(entry); isolateBackground();
    const focusFirst = () => (focusableElements(dialog)[0] || dialog).focus();
    if (!dialog.contains(document.activeElement)) focusFirst();

    const handleKeyDown = (event) => {
      if (modalStack.at(-1) !== entry) return;
      if (closeOptions.current.closeOnEscape && event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); closeOptions.current.onClose?.();
      }
      if (event.key === "Tab") {
        const elements = focusableElements(dialog);
        const first = elements[0]; const last = elements.at(-1);
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    const containFocus = (event) => {
      if (modalStack.at(-1) === entry && !dialog.contains(event.target)) focusFirst();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", containFocus);
    // Keyboard events do not bubble from an iframe into its parent document.
    // Same-origin previews forward Escape; native sentinels preserve their own Tab order.
    const frameKeys = new Map();
    const bindFrames = () => {
      for (const [frame,release] of frameKeys) {
        if (!dialog.contains(frame)) { release(); frameKeys.delete(frame); }
      }
      for (const frame of dialog.querySelectorAll('iframe')) {
        if (frameKeys.has(frame)) continue;
        let childDocument;
        const frameKey = event => {
          if (modalStack.at(-1) !== entry || event.defaultPrevented) return;
          if (event.key === 'Escape') { handleKeyDown(event); return; }
          if (event.key !== 'Tab' || !childDocument) return;
          const children = focusableElements(childDocument.documentElement);
          const active = childDocument.activeElement;
          const atBoundary = !children.length || (event.shiftKey
            ? active === children[0] || active === childDocument.body
            : active === children.at(-1));
          if (!atBoundary) return;
          const outer = focusableElements(dialog), index = outer.indexOf(frame);
          const target = outer[(index + (event.shiftKey ? -1 : 1) + outer.length) % outer.length] || dialog;
          event.preventDefault(); target.focus();
        };
        const loaded = () => {
          childDocument?.removeEventListener('keydown', frameKey);
          try { childDocument = frame.contentDocument; childDocument?.addEventListener('keydown', frameKey); }
          catch { childDocument = null; /* Cross-origin embeds keep the visible close control. */ }
        };
        frame.addEventListener('load', loaded); loaded();
        frameKeys.set(frame, () => { frame.removeEventListener('load', loaded); childDocument?.removeEventListener('keydown', frameKey); });
      }
      // Catalog loading/retry can replace a focused iframe. Removal does not
      // dispatch focusin in every browser; recover the modal's logical focus.
      if (modalStack.at(-1) === entry && !dialog.contains(document.activeElement)) focusFirst();
    };
    const frameObserver = new MutationObserver(bindFrames);
    frameObserver.observe(dialog, { childList:true, subtree:true }); bindFrames();

    return () => {
      frameObserver.disconnect(); for (const release of frameKeys.values()) release();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", containFocus);
      const wasTop = modalStack.at(-1) === entry;
      const index = modalStack.indexOf(entry); if (index >= 0) modalStack.splice(index, 1);
      portalRoot.remove(); isolateBackground();
      if (wasTop) {
        const restore = modalStack.length ? previousFocus : originalFocus;
        if (restore?.isConnected && !restore.closest("[inert]")) restore.focus({ preventScroll: true });
        else if (modalStack.length) (focusableElements(modalStack.at(-1).dialog)[0] || modalStack.at(-1).dialog).focus();
      }
    };
  }, [isOpen, portalRoot]);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className={`k-modal-backdrop ${backdropClassName}`.trim()}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`k-modal-container k-modal-${size} ${className}`.trim()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label={ariaLabel || title || "Modal Dialog"}
      >
        {/* Native focus sentinels also catch Tab leaving an embedded preview document. */}
        <span tabIndex={0} data-modal-focus-guard className="k-modal-focus-guard" onFocus={() => (focusableElements(modalRef.current).at(-1) || modalRef.current).focus()} />
        {showHeader && <div className="k-modal-header">
          <div className="k-modal-header-text">
            {title && <h2 className="k-modal-title">{title}</h2>}
            {subtitle && <p className="k-modal-subtitle">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              className="k-modal-close-btn"
              onClick={onClose}
              aria-label={closeLabel ?? copy("បិទប្រអប់", "Close modal")}
            >
              <IoClose aria-hidden="true" />
            </button>
          )}
        </div>}

        <div className="k-modal-body">{children}</div>

        {footer && <div className="k-modal-footer">{footer}</div>}
        <span tabIndex={0} data-modal-focus-guard className="k-modal-focus-guard" onFocus={() => (focusableElements(modalRef.current)[0] || modalRef.current).focus()} />
      </div>
    </div>, portalRoot
  );
}
