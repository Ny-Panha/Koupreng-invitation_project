import { IoFolderOpenOutline } from "react-icons/io5";
import "./EmptyState.css";
import { useUiCopy } from "../i18n/useUiCopy";

export default function EmptyState({
  icon: Icon = IoFolderOpenOutline,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  const copy = useUiCopy();
  const detail = description === undefined ? copy("ចាប់ផ្ដើមដោយបង្កើតកំណត់ត្រាថ្មី។", "Get started by creating a new entry.") : description;
  return (
    <div className={`k-empty-state ${className}`}>
      <div className="k-empty-icon-wrap">
        <Icon className="k-empty-icon" aria-hidden="true" />
      </div>
      <h3 className="k-empty-title">{title ?? copy("រកមិនឃើញទិន្នន័យ", "No items found")}</h3>
      {detail && <p className="k-empty-description">{detail}</p>}
      {actionLabel && onAction && (
        <button type="button" className="k-empty-action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
