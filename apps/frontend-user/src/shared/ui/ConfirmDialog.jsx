import Modal from "./Modal";
import LoadingButton from "./LoadingButton";
import "./ConfirmDialog.css";
import { useUiCopy } from "../i18n/useUiCopy";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelLabel,
  confirmLabel,
  isDestructive = false,
  isLoading = false,
  className = "",
}) {
  const copy = useUiCopy();
  const cleanCancel = String(cancelLabel ?? copy("បោះបង់", "Cancel")).replace(/^[✕xX]\s*/, "");
  const cleanConfirm = String(confirmLabel ?? copy("បញ្ជាក់", "Confirm")).replace(/^[✓✔]\s*/, "");
  const detail = message === undefined ? copy("តើអ្នកពិតជាចង់បន្តសកម្មភាពនេះមែនទេ?", "Are you sure you want to proceed with this action?") : message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? copy("បញ្ជាក់សកម្មភាព", "Confirm Action")}
      size="sm"
      className={`k-confirm-dialog ${className}`.trim()}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="k-confirm-body">
        {detail && <p className="k-confirm-message">{detail}</p>}
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
