import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import "./Modal.css";

const modalStack = [];
const backgroundState = new Map();
let originalOverflow = "";
let originalFocus = null;
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableElements(dialog) {
  return Array.from(dialog.querySelectorAll(focusableSelector)).filter((element) =>
    element.tabIndex >= 0 && !element.closest("[hidden]") && getComputedStyle(element).display !== "none"
    && getComputedStyle(element).visibility !== "hidden");
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
  className = "",
  backdropClassName = "",
}) {
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

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", containFocus);
      const wasTop = modalStack.at(-1) === entry;
      const index = modalStack.indexOf(entry); if (index >= 0) modalStack.splice(index, 1);
      portalRoot.remove(); isolateBackground();
      if (wasTop) {
        const restore = modalStack.length ? previousFocus : originalFocus;
        if (restore?.isConnected && !restore.closest("[inert]")) restore.focus();
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
        <div className="k-modal-header">
          <div className="k-modal-header-text">
            {title && <h2 className="k-modal-title">{title}</h2>}
            {subtitle && <p className="k-modal-subtitle">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              className="k-modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <IoClose aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="k-modal-body">{children}</div>

        {footer && <div className="k-modal-footer">{footer}</div>}
      </div>
    </div>, portalRoot
  );
}
