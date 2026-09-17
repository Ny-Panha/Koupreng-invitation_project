import Modal from "./Modal";
import LoadingButton from "./LoadingButton";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  isDestructive = false,
  isLoading = false,
  className = "",
}) {
  const cleanCancel = String(cancelLabel || "").replace(/^[✕xX]\s*/, "");
  const cleanConfirm = String(confirmLabel || "").replace(/^[✓✔]\s*/, "");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={`k-confirm-dialog ${className}`.trim()}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="k-confirm-body">
        {message && <p className="k-confirm-message">{message}</p>}
        <div className="k-confirm-actions">
          <button
            type="button"
            className="k-btn k-confirm-btn k-confirm-btn-cancel k-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            <span className="k-confirm-icon" aria-hidden="true">✕</span>
            <span>{cleanCancel}</span>
          </button>
          <LoadingButton
            type="button"
            className={`k-btn k-confirm-btn ${
              isDestructive
                ? "k-btn-danger k-confirm-btn-danger"
                : "k-btn-primary k-confirm-btn-primary"
            }`}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {!isLoading && <span className="k-confirm-icon" aria-hidden="true">✓</span>}
            <span>{cleanConfirm}</span>
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
}
