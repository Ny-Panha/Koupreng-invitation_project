import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { workspaceText } from "../reportWorkspace";
import { trapDialogTab } from "../reportFocus";

export default function ReportDrawer({ open, onClose, title, lang, children }) {
  const dialog = useRef(null),
    opener = useRef(null),
    id = useId();
  useEffect(() => {
    if (open && !dialog.current.open) {
      opener.current = document.activeElement;
      dialog.current.showModal();
    } else if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="report-drawer"
      aria-labelledby={id}
      onKeyDown={trapDialogTab}
      onClose={() => {
        onClose();
        opener.current?.focus();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) {
          const box = dialog.current.getBoundingClientRect();
          if (event.clientX < box.left || event.clientX > box.right)
            dialog.current.close();
        }
      }}
    >
      <header className="report-drawer-header">
        <h3 id={id}>{title}</h3>
        <button
          type="button"
          className="report-icon-button"
          aria-label={workspaceText("close", lang)}
          onClick={() => dialog.current.close()}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      {children}
    </dialog>
  );
}
