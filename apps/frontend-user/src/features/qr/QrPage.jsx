import { LoadingRegion } from '@/shared/ui/LoadingState';
import AccessFailureState from "@/shared/access/AccessFailureState";
import { useParams } from "react-router-dom";
import { useQrCode } from "./hooks/useQrCode";
import { QrPreview } from "./components/QrPreview";
import { QrDownloadButton } from "./components/QrDownloadButton";
import { SkeletonCard } from "@/shared/ui";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Copy, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { useEventWorkspace } from '@/features/events/workspace/EventContext';
import { toast } from "@/shared/ui/toast";
import "./QrPage.css";

export default function QrPage({ invitationId: propInvitationId, guestId: propGuestId }) {
  const params = useParams();
  const invitationId = propInvitationId || params.eventId || params.invitationId || params.id;
  const guestId = propGuestId || params.guestId;
  const en = useLanguageStore((s) => s.lang) === "en";
  const [copied, setCopied] = useState(false);
  const workspace = useEventWorkspace();

  const { qrData, loading, downloading, error, failure, loadQr, downloadPng } = useQrCode(
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

  const isGuestQr = Boolean(guestId);

  return (
    <main className="dash-main qr-page workspace-page">
      <header className="dash-page-header qr-header">
        <div>
          <span className="dash-kicker">
            <QrCode size={14} className="inline mr-1" aria-hidden="true" />
            {en ? "QR Code Management" : "គ្រប់គ្រងកូដ QR"}
          </span>
          <h1>{isGuestQr ? (en ? "Personalized Guest QR" : "QR Code ភ្ញៀវផ្ទាល់ខ្លួន") : (en ? "Event Invitation QR Code" : "QR Code សម្រាប់កម្មវិធី")}</h1>

        </div>
      </header>

      {error ? (
        <AccessFailureState error={failure || error} feature="QR_INVITATIONS" permission="MANAGE_INVITATION" onRetry={loadQr} />
      ) : loading ? (
        <div className="qr-skeleton-wrapper">
          <LoadingRegion><SkeletonCard height="360px" /></LoadingRegion>
        </div>
      ) : (
        <div className="qr-page-content">
          {/* QR Type Context Box */}
          <QrPreview qrData={qrData ? { ...qrData, title: qrData.title || workspace?.event?.title } : null} onRetry={loadQr} context={<div className="qr-type-indicator">
            <span className="qr-type-badge">
              {isGuestQr ? (en ? "Guest QR" : "QR ភ្ញៀវ") : (en ? "General Event QR" : "QR ធៀបទូទៅ")}
            </span>
            <p>
              {isGuestQr
                ? (en ? "Linked to specific guest record. Reuses authorized check-in token." : "ភ្ជាប់ជាមួយទិន្នន័យភ្ញៀវជាក់លាក់។ ប្រើប្រាស់សម្រាប់ផ្ទៀងផ្ទាត់វត្តមាន។")
                : (en ? "Directs scanning guests to the official public invitation page." : "នាំភ្ញៀវដែលស្កេនទៅកាន់ទំព័រធៀបការជាសាធារណៈផ្លូវការ។")}
            </p>
          </div>}>
            <QrDownloadButton onDownload={downloadPng} downloading={downloading} disabled={!qrData?.qrCodeDataUri} />
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
          </QrPreview>
        </div>
      )}
    </main>
  );
}
