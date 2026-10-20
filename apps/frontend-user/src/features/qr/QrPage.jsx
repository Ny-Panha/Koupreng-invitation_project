import { useParams } from "react-router-dom";
import { useQrCode } from "./hooks/useQrCode";
import { QrPreview } from "./components/QrPreview";
import { QrDownloadButton } from "./components/QrDownloadButton";
import { ErrorState, SkeletonCard } from "@/shared/ui";
import "./QrPage.css";

export default function QrPage({ invitationId: propInvitationId, guestId: propGuestId }) {
  const params = useParams();
  const invitationId = propInvitationId || params.eventId || params.invitationId || params.id;
  const guestId = propGuestId || params.guestId;

  const { qrData, loading, downloading, error, loadQr, downloadPng } = useQrCode(
    invitationId,
    guestId
  );

  return (
    <main className="dash-main qr-page">
      <header className="dash-page-header qr-header">
        <div>
          <span className="dash-kicker">QR Code Management</span>
          <h1>QR Code សម្រាប់កម្មវិធី</h1>
          <p>ស្កេន ឬទាញយក QR Code ដើម្បីផ្ញើទៅកាន់ភ្ញៀវ ឬប្រើប្រាស់សម្រាប់ការ Check-in។</p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={loadQr} />
      ) : loading ? (
        <div className="qr-skeleton-wrapper">
          <SkeletonCard height="320px" />
        </div>
      ) : (
        <div className="qr-page-content">
          <QrPreview qrData={qrData} />
          <div className="qr-actions">
            <QrDownloadButton onDownload={downloadPng} downloading={downloading} />
          </div>
        </div>
      )}
    </main>
  );
}
