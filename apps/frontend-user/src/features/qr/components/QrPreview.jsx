import { QrCode, ExternalLink } from "lucide-react";
import { useLanguageStore } from "@/stores/useLanguageStore";

export function QrPreview({ qrData, onRetry, context, children }) {
  const en = useLanguageStore(state => state.lang) === "en";
  if (!qrData) {
    return (
      <div className="qr-empty">
        <p>{en ? "No QR code is available yet." : "មិនទាន់មានកូដ QR នៅឡើយទេ។"}</p>
      </div>
    );
  }

  const qrImageUrl = qrData.qrCodeDataUri || qrData.qrImageUrl || qrData.qrUrl || qrData.imageUrl;

  return (
    <div className="qr-card">
      <div className="qr-frame">
        {qrImageUrl ? (
          <img src={qrImageUrl} alt="QR Code" className="qr-image" />
        ) : (
          <div className="qr-placeholder">
            <QrCode size={56} className="qr-icon-placeholder" aria-hidden="true" />
            <p>{en ? "The QR image is unavailable. Reload it before printing or sharing." : "មិនមានរូបភាព QR ទេ។ សូមផ្ទុកឡើងវិញ មុនបោះពុម្ព ឬចែករំលែក។"}</p>
            {onRetry && <button type="button" className="workspace-button" onClick={onRetry}>{en ? "Reload QR" : "ផ្ទុក QR ឡើងវិញ"}</button>}
          </div>
        )}
      </div>

      <div className="qr-details">
        {context}
        {qrData.title && <h3 className="qr-title">{qrData.title}</h3>}
        {qrData.guestName && (
          <p className="qr-guest">
            {en ? "Guest:" : "ភ្ញៀវកិត្តិយស៖"} <strong>{qrData.guestName}</strong>
          </p>
        )}
        {qrData.invitationUrl && <p className="qr-destination">{(() => { try { const url = new URL(qrData.invitationUrl); return `${url.host}${url.pathname}`; } catch { return ''; } })()}</p>}
        <div className="qr-actions">{children}{qrData.invitationUrl && (
          <a
            href={qrData.invitationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="workspace-button"
          >
            <span>{en ? "Open invitation" : "បើកធៀបអញ្ជើញ"}</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}</div>
      </div>
    </div>
  );
}

export default QrPreview;
