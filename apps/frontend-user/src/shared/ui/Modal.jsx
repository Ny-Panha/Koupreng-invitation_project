import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import "./Modal.css";

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
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="k-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`k-modal-container k-modal-${size} ${className}`.trim()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
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
    </div>
  );
}
