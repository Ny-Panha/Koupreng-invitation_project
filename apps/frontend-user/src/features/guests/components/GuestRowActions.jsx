import { useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Check, Copy, MoreHorizontal, Pencil, QrCode, Send, Trash2 } from "lucide-react";
import { needsInvitation } from "../model/guestStatus";

export default function GuestRowActions({ guest, saving, onShowQr, onShowTicket, deliveryPath, inviteUrl, onCopyLink, onMarkAsSent, onEdit, onDelete, onSave, onCancel, isEditing, shareMessage, t }) {
  const disclosure = useRef(null);
  const en = useLanguageStore(state => state.lang) === "en";
  const label = (key, fallback) => t ? t(key) : fallback;
  const act = (callback) => {
    disclosure.current?.removeAttribute("open");
    disclosure.current?.querySelector("summary")?.focus();
    callback?.(guest);
  };
  return (
    <div className="guest-row-actions">
      {onShowTicket && guest.source === "backend" && !isEditing && <button type="button" className="guest-invite-button" disabled={saving} onClick={() => onShowTicket(guest)}>{en ? "Ticket" : "កាតអញ្ជើញ"}</button>}
      {deliveryPath && guest.source === "backend" && !isEditing && <Link className="guest-text-button" to={deliveryPath} aria-label={en ? `Send or share for ${guest.name} in Delivery` : `ផ្ញើ ឬចែករំលែកសម្រាប់ ${guest.name}`}>{en ? "Send / share" : "ផ្ញើ / ចែករំលែក"}</Link>}
      {onShowQr && !isEditing && <button type="button" className="guest-invite-button" disabled={saving} onClick={() => onShowQr(guest)} title={label("showQr", "បង្ហាញ QR Code")}>
        <QrCode size={16} aria-hidden="true" /><span>{label("invitationAction", "ធៀបអញ្ជើញ")}</span>
      </button>}
      <button type="button" className="guest-icon-button" disabled={saving} onClick={isEditing ? onSave : () => onEdit(guest)} aria-label={isEditing ? label("save", "រក្សាទុក") : label("edit", "កែប្រែ")} title={isEditing ? label("save", "រក្សាទុក") : label("edit", "កែប្រែ")}>
        {isEditing ? <Check size={17} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}
      </button>
      {isEditing ? <button type="button" className="guest-text-button" onClick={onCancel}>{label("cancel", "បោះបង់")}</button> : (
        <details className="guest-row-menu" ref={disclosure} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.removeAttribute("open");
        }} onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); act(); }
        }}>
          <summary className="guest-icon-button" aria-label={`${label("moreActions", "សកម្មភាពផ្សេងទៀត")}: ${guest.name}`} title={label("moreActions", "សកម្មភាពផ្សេងទៀត")}><MoreHorizontal size={20} aria-hidden="true" /></summary>
          <div className="guest-tools-popover">
            {inviteUrl && <a href={`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareMessage || "")}`} target="_blank" rel="noopener noreferrer" title={en ? "Open Telegram sharing (delivery unconfirmed)" : "បើកការចែករំលែក Telegram (មិនបញ្ជាក់ការបញ្ជូន)"} aria-label={en ? `Share invitation for ${guest.name} via Telegram` : `ចែករំលែកធៀបសម្រាប់ ${guest.name} តាម Telegram`}>{en ? "Share via Telegram" : "ចែករំលែកតាម Telegram"}</a>}
            {onCopyLink && <button type="button" disabled={saving} onClick={() => act(() => onCopyLink(shareMessage, guest))}><Copy size={16} aria-hidden="true" />{label("copyMessage", "ចម្លងសារអញ្ជើញ")}</button>}
            {onMarkAsSent && needsInvitation(guest) && <button type="button" disabled={saving} onClick={() => act(onMarkAsSent)}><Send size={16} aria-hidden="true" />{label("markAsSent", "សម្គាល់ថាបានផ្ញើ")}</button>}
            {onDelete && <button type="button" className="guest-danger-action" disabled={saving} onClick={() => act(onDelete)}><Trash2 size={16} aria-hidden="true" />{label("delete", "លុប")}</button>}
          </div>
        </details>
      )}
    </div>
  );
}
