import { useLanguageStore } from "@/stores/useLanguageStore";
import { LOCAL_MESSAGES } from "@/shared/i18n/messagesDictionary";
import { useEffect, useState } from "react";
import { QRCode } from "react-qr-code";
import { Check, ChevronDown, Copy, Download, Link2, Send } from "lucide-react";
import { Modal } from "@/shared/ui";
import { guestService } from "@/features/guests/api/guestApi";
import { buildShareMessage, copyText, guestInviteUrl, normalizeBackendGuest } from "../model/guestMappers";
import "./GuestQrModal.css";

export default function GuestQrModal({
  guest,
  currentDraft,
  publicInvitation,
  onClose,
  onCopyLink,
  onMarkAsSent,
  saving = false,
  backendInvitationId = null,
  onGuestSynced,
  t,
}) {
  const lang = useLanguageStore(state => state.lang);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [syncedGuest, setSyncedGuest] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    setSyncedGuest(null);

    if (!guest) {
      setSyncing(false);
      return;
    }

    const existingToken =
      guest.inviteToken ||
      guest.token ||
      guest.invite_token ||
      guest.raw?.inviteToken ||
      guest.raw?.invite_token ||
      guest.raw?.token;

    const numericId =
      backendInvitationId != null &&
      !isNaN(Number(backendInvitationId)) &&
      Number(backendInvitationId) > 0
        ? Number(backendInvitationId)
        : null;

    if (existingToken || !numericId) {
      setSyncing(false);
      return;
    }

    let isMounted = true;
    setSyncing(true);

    const payload = {
      guestName: guest.name || guest.guestName || "Guest",
      phone: guest.phone || "",
      seatCount: Math.max(1, Number(guest.seatCount || guest.count) || 1),
    };

    const createFn = guestService.create || guestService.createForInvitation;

    createFn(numericId, payload)
      .then((created) => {
        if (!isMounted) return;
        const normalized = normalizeBackendGuest(created);
        const updated = {
          ...guest,
          ...normalized,
          inviteToken:
            created?.inviteToken ||
            normalized?.inviteToken ||
            created?.token ||
            "",
          backendId: created?.id || normalized?.id,
          id: guest.id || created?.id,
          source: "backend",
        };
        setSyncedGuest(updated);
        if (typeof onGuestSynced === "function") {
          onGuestSynced(updated);
        }
      })
      .catch((err) => {
        console.warn("Could not sync guest to backend for personal QR link:", err);
      })
      .finally(() => {
        if (isMounted) {
          setSyncing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [backendInvitationId, guest, onGuestSynced]);

  if (!guest) return null;

  const isMatchingGuest =
    syncedGuest &&
    (String(syncedGuest.id) === String(guest.id) ||
      syncedGuest.name === guest.name);

  const activeGuest = isMatchingGuest ? syncedGuest : guest;

  const inviteUrl = guestInviteUrl(currentDraft, activeGuest, publicInvitation);

  const text = (key, fallback) => t ? t(key) : LOCAL_MESSAGES.guests[lang][key] || fallback;

  const shareMessageText = buildShareMessage(activeGuest, currentDraft, publicInvitation, lang);
  const busy = syncing || saving;

  const recordShare = async () => {
    if (onMarkAsSent && await onMarkAsSent(activeGuest) === false) {
      setShareError(text("saveFailed", "មិនអាចរក្សាទុកភ្ញៀវបានទេ។"));
    }
  };

  const handleCopy = async (value, setCopied) => {
    if (busy) return;
    setShareError("");
    let copied = false;
    try {
      copied = onCopyLink ? await onCopyLink(value, activeGuest) : await copyText(value);
    } catch { /* A rejected clipboard request must not mark the guest as sent. */ }
    if (!copied) {
      setShareError(text("linkCopyFailed", "មិនអាចចម្លងតំណភ្ជាប់បានទេ"));
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    await recordShare();
  };

  const handleShareTelegram = async () => {
    if (busy) return;
    setShareError("");
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareMessageText)}`;
    window.open(tgUrl, "_blank", "noopener,noreferrer");
    await recordShare();
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById("guest-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngFile;
      downloadLink.download = `qr-${activeGuest.name.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <Modal
      isOpen={Boolean(guest)} onClose={onClose} title={activeGuest.name}
      size="md" className="guest-qr-dialog guest-form-modal" backdropClassName="guest-qr-backdrop"
    >
      <div className="guest-share-content" aria-busy={busy}>
        <div className="guest-share-link-heading"><Link2 size={17} aria-hidden="true" /><label htmlFor="guest-share-url">{text("copyLink", "តំណភ្ជាប់អញ្ជើញ")}</label></div>
        <div className="guest-share-link-field">
          <input id="guest-share-url" type="text" readOnly value={syncing ? text("preparingLink", "កំពុងរៀបចំ link...") : inviteUrl} onFocus={(event) => event.target.select()} />
          <button type="button" className="guest-button guest-button-primary" disabled={busy} onClick={() => handleCopy(inviteUrl, setCopiedUrl)}>
            {copiedUrl ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{copiedUrl ? text("copied", "បានចម្លង") : text("copyLink", "ចម្លងតំណភ្ជាប់")}
          </button>
        </div>
        {shareError && <p className="guest-field-error" role="alert">{shareError}</p>}
        <p className="guest-share-feedback" role="status" aria-live="polite">{copiedUrl ? text("linkCopied", "បានចម្លងតំណភ្ជាប់") : copiedMsg ? text("messageCopied", "បានចម្លងសារអញ្ជើញ") : syncing ? text("preparingLink", "កំពុងរៀបចំ link...") : ""}</p>
        <div className="guest-share-options">
          <button type="button" className="guest-button guest-button-secondary" disabled={busy} onClick={handleShareTelegram}><Send size={17} aria-hidden="true" />{text("shareTelegram", "ផ្ញើតាម Telegram")}</button>
          <button type="button" className="guest-button guest-button-secondary" disabled={busy} onClick={() => handleCopy(shareMessageText, setCopiedMsg)}>{copiedMsg ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{copiedMsg ? text("copied", "បានចម្លង") : text("copyMessage", "ចម្លងសារអញ្ជើញ")}</button>
        </div>
        <div className="guest-share-qr-section">
          <div className="guest-share-qr-code" style={{ opacity: syncing ? 0.5 : 1 }}><QRCode id="guest-qr-svg" value={inviteUrl} size={156} /></div>
          <div className="guest-share-qr-details"><h3>{text("qrModalTitle", "QR Code ធៀបការ")}</h3><p>{text("qrHelp", "រក្សាទុក QR Code ដើម្បីផ្ញើទៅភ្ញៀវ ឬដាក់លើធៀបអញ្ជើញ។")}</p>
            <button type="button" className="guest-button guest-button-secondary" disabled={syncing} onClick={handleDownloadQr}><Download size={16} aria-hidden="true" />{text("downloadQr", "ទាញយក QR")}</button>
          </div>
        </div>
        <details className="guest-share-preview"><summary>{text("messagePreview", "មើលសារអញ្ជើញ")}<ChevronDown size={16} aria-hidden="true" /></summary><p>{shareMessageText}</p></details>
      </div>
    </Modal>
  );
}
