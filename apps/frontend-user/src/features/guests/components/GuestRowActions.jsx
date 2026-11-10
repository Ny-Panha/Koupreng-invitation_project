import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { LOCAL_MESSAGES } from "@/shared/i18n/messagesDictionary";
import { Check, Copy, MessageSquare, MoreHorizontal, Pencil, QrCode, Send, Share2, Trash2 } from "lucide-react";
import { needsInvitation } from "../model/guestStatus";

export default function GuestRowActions({ guest, saving, onShowQr, onShowTicket, deliveryPath, inviteUrl, onCopyLink, onMarkAsSent, onEdit, onDelete, onSave, onCancel, isEditing, shareMessage, t }) {
  const disclosure = useRef(null);
  const en = useLanguageStore(state => state.lang) === "en";
  const label = (key, fallback) => t ? t(key) : LOCAL_MESSAGES.guests[en ? "en" : "km"][key] || fallback;
  const act = (callback) => {
    disclosure.current?.removeAttribute("open");
    disclosure.current?.querySelector("summary")?.focus();
    callback?.(guest);
  };
  return (
    <div className="guest-row-actions">
      {onShowQr && !isEditing && <button type="button" className="guest-invite-button" disabled={saving} onClick={() => onShowQr(guest)} title={label("showQr", "បង្ហាញ QR Code")}>
        <QrCode size={16} aria-hidden="true" /><span>{label("invitationAction", "ធៀបអញ្ជើញ")}</span>
      </button>}
      <button type="button" className="guest-icon-button" disabled={saving} onClick={isEditing ? onSave : () => onEdit(guest)} aria-label={isEditing ? label("save", "រក្សាទុក") : label("edit", "កែប្រែ")} title={isEditing ? label("save", "រក្សាទុក") : label("edit", "កែប្រែ")}>
        {isEditing ? <Check size={17} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}
      </button>
      {isEditing ? <button type="button" className="guest-text-button" onClick={onCancel}>{label("cancel", "បោះបង់")}</button> : (
        <details className="guest-row-menu" ref={disclosure} onMouseDown={(event) => {
          const action = event.target.closest('button, a');
          if (event.button === 0 && action && event.currentTarget.contains(action)) {
            // Safari does not focus clicked buttons. Keep focus inside the menu
            // until its action runs, rather than closing it on the preceding blur.
            event.preventDefault();
            action.focus({ preventScroll: true });
          }
        }} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.removeAttribute("open");
        }} onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); act(); }
        }}>
          <summary className="guest-icon-button" aria-label={`${label("moreActions", "សកម្មភាពផ្សេងទៀត")}: ${guest.name}`} title={label("moreActions", "សកម្មភាពផ្សេងទៀត")}><MoreHorizontal size={20} aria-hidden="true" /></summary>
          <div className="guest-tools-popover">
            {onShowTicket && guest.source === "backend" && !isEditing && <button type="button" className="guest-invite-button" disabled={saving} onClick={() => act(onShowTicket)}>{en ? "Ticket" : "កាតអញ្ជើញ"}</button>}
            {deliveryPath && guest.source === "backend" && !isEditing && <Link className="guest-text-button" to={`${deliveryPath}?guestId=${guest.backendId || guest.id}`} aria-label={en ? `Send or share for ${guest.name} in Delivery` : `ផ្ញើ ឬចែករំលែកសម្រាប់ ${guest.name}`}>{en ? "Send / share" : "ផ្ញើ / ចែករំលែក"}</Link>}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && inviteUrl && (
              <button type="button" disabled={saving} onClick={() => act(async () => {
                try {
                  await navigator.share({ title: guest.name, text: shareMessage || inviteUrl, url: inviteUrl });
                  await onMarkAsSent?.(guest);
                } catch (e) {
                  if (e.name !== "AbortError") throw e;
                }
              })} title={en ? "Share via apps..." : "ចែករំលែកតាមកម្មវិធី..."} aria-label={en ? `Share invitation for ${guest.name}` : `ចែករំលែកធៀបសម្រាប់ ${guest.name}`}>
                <Share2 size={16} aria-hidden="true" />{en ? "Share via apps..." : "ចែករំលែកតាមកម្មវិធី..."}
              </button>
            )}
            {inviteUrl && <a href={`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareMessage || "")}`} target="_blank" rel="noopener noreferrer" aria-disabled={saving || undefined} onClick={event => { if (saving) event.preventDefault(); else act(onMarkAsSent); }} title={en ? "Share via Telegram" : "ចែករំលែកតាម Telegram"} aria-label={en ? `Share invitation for ${guest.name} via Telegram` : `ចែករំលែកធៀបសម្រាប់ ${guest.name} តាម Telegram`}><Send size={16} aria-hidden="true" />{en ? "Share via Telegram" : "ចែករំលែកតាម Telegram"}</a>}
            {inviteUrl && <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent((shareMessage ? `${shareMessage}\n` : '') + inviteUrl)}`} target="_blank" rel="noopener noreferrer" aria-disabled={saving || undefined} onClick={event => { if (saving) event.preventDefault(); else act(onMarkAsSent); }} title={en ? "Share via WhatsApp" : "ចែករំលែកតាម WhatsApp"} aria-label={en ? `Share invitation for ${guest.name} via WhatsApp` : `ចែករំលែកធៀបសម្រាប់ ${guest.name} តាម WhatsApp`}><MessageSquare size={16} aria-hidden="true" />{en ? "Share via WhatsApp" : "ចែករំលែកតាម WhatsApp"}</a>}
            {onCopyLink && <button type="button" disabled={saving} onClick={() => act(async () => { if (await onCopyLink(shareMessage, guest)) await onMarkAsSent?.(guest); })}><Copy size={16} aria-hidden="true" />{label("copyMessage", "ចម្លងសារអញ្ជើញ")}</button>}
            {onMarkAsSent && needsInvitation(guest) && <button type="button" disabled={saving} onClick={() => act(onMarkAsSent)} title={en ? "Mark as shared (manual record)" : "សម្គាល់ថាបានចែករំលែក (កត់ត្រាដោយដៃ)"}><Send size={16} aria-hidden="true" />{label("markAsSent", "សម្គាល់ថាបានផ្ញើ")}</button>}
            {onDelete && <button type="button" className="guest-danger-action" disabled={saving} onClick={() => act(onDelete)}><Trash2 size={16} aria-hidden="true" />{label("delete", "លុប")}</button>}
          </div>
        </details>
      )}
    </div>
  );
}
