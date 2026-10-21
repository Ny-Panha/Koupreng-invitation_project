import { useParams } from "react-router-dom";
import { useQrCode } from "./hooks/useQrCode";
import { QrPreview } from "./components/QrPreview";
import { QrDownloadButton } from "./components/QrDownloadButton";
import { ErrorState, SkeletonCard } from "@/shared/ui";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Copy, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "@/shared/ui/toast";
import "./QrPage.css";

export default function QrPage({ invitationId: propInvitationId, guestId: propGuestId }) {
  const params = useParams();
  const invitationId = propInvitationId || params.eventId || params.invitationId || params.id;
  const guestId = propGuestId || params.guestId;
  const en = useLanguageStore((s) => s.lang) === "en";
  const [copied, setCopied] = useState(false);

  const { qrData, loading, downloading, error, loadQr, downloadPng } = useQrCode(
    invitationId,
    guestId
  );

  const handleCopyLink = async () => {
    if (!qrData?.invitationUrl) return;
    try {
      await navigator.clipboard.writeText(qrData.invitationUrl);
      setCopied(true);
      toast.success(en ? "QR invitation link copied" : "បានចម្លងតំណភ្ជាប់ QR ជោគជ័យ");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(en ? "Could not copy link" : "មិនអាចចម្លងតំណភ្ជាប់បានទេ");
    }
  };

  const isGuestQr = Boolean(guestId || qrData?.guestName);

  return (
    <main className="dash-main qr-page workspace-page">
      <header className="dash-page-header qr-header">
        <div>
          <span className="dash-kicker">
            <QrCode size={14} className="inline mr-1" aria-hidden="true" />
            {en ? "QR Code Management" : "គ្រប់គ្រងកូដ QR"}
          </span>
          <h1>{isGuestQr ? (en ? "Personalized Guest QR" : "QR Code ភ្ញៀវផ្ទាល់ខ្លួន") : (en ? "Event Invitation QR Code" : "QR Code សម្រាប់កម្មវិធី")}</h1>
          <p>
            {isGuestQr
              ? (en ? "Scan or share this personalized QR for individualized RSVP and reception check-in." : "ស្កេន ឬចែករំលែកកូដ QR ផ្ទាល់ខ្លួននេះសម្រាប់ការឆ្លើយតប RSVP និងការកត់ត្រាវត្តមាន Check-in។")
              : (en ? "Share this QR on invitations or posters. For guest check-in, use a personalized guest ticket." : "ចែករំលែក QR នេះលើធៀប ឬបដា។ សម្រាប់ការកត់ត្រាវត្តមាន សូមប្រើកាតផ្ទាល់ខ្លួនរបស់ភ្ញៀវ។")}
          </p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={loadQr} />
      ) : loading ? (
        <div className="qr-skeleton-wrapper">
          <SkeletonCard height="360px" />
        </div>
      ) : (
        <div className="qr-page-content">
          {/* QR Type Context Box */}
          <div className="qr-type-indicator">
            <span className="qr-type-badge">
              {isGuestQr ? (en ? "Guest QR" : "QR ភ្ញៀវ") : (en ? "General Event QR" : "QR ធៀបទូទៅ")}
            </span>
            <p>
              {isGuestQr
                ? (en ? "Linked to specific guest record. Reuses authorized check-in token." : "ភ្ជាប់ជាមួយទិន្នន័យភ្ញៀវជាក់លាក់។ ប្រើប្រាស់សម្រាប់ផ្ទៀងផ្ទាត់វត្តមាន។")
                : (en ? "Directs scanning guests to the official public invitation page." : "នាំភ្ញៀវដែលស្កេនទៅកាន់ទំព័រធៀបការជាសាធារណៈផ្លូវការ។")}
            </p>
          </div>

          <QrPreview qrData={qrData} onRetry={loadQr} />

          <div className="qr-actions">
            <QrDownloadButton onDownload={downloadPng} downloading={downloading} />
            {qrData?.invitationUrl && (
              <button
                type="button"
                className="workspace-button"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? (en ? "Copied" : "បានចម្លង") : (en ? "Copy Link" : "ចម្លងតំណភ្ជាប់")}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
