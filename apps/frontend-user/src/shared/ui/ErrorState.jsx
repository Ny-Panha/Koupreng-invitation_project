import { IoAlertCircleOutline, IoRefreshOutline } from "react-icons/io5";
import "./ErrorState.css";
import { useUiCopy } from "../i18n/useUiCopy";

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  className = "",
}) {
  const copy = useUiCopy();
  const detail = message === undefined ? copy("មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ។ សូមព្យាយាមម្ដងទៀត។", "An error occurred while fetching data. Please try again.") : message;
  return (
    <div className={`k-error-state ${className}`} role="alert">
      <div className="k-error-icon-wrap">
        <IoAlertCircleOutline className="k-error-icon" aria-hidden="true" />
      </div>
      <h3 className="k-error-title">{title ?? copy("មានបញ្ហាកើតឡើង", "Something went wrong")}</h3>
      {detail && <p className="k-error-message">{detail}</p>}
      {onRetry && (
        <button type="button" className="k-error-retry-btn" onClick={onRetry}>
          <IoRefreshOutline aria-hidden="true" />
          <span>{retryLabel ?? copy("ព្យាយាមម្ដងទៀត", "Retry")}</span>
        </button>
      )}
    </div>
  );
}
