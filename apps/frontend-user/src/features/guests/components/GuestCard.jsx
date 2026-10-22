import {
  IoCopyOutline,
  IoPencilOutline,
  IoQrCodeOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { StatusBadge } from "@/shared/ui";
import { buildShareMessage, guestInviteUrl } from "../model/guestMappers";

export default function GuestCard({
  guest,
  currentDraft,
  publicInvitation,
  onEdit,
  onDelete,
  onShowQr,
  onCopyLink,
  t,
}) {
  const inviteUrl = guestInviteUrl(currentDraft, guest, publicInvitation);
  const shareMessage = buildShareMessage(guest, currentDraft, publicInvitation);

  return (
    <article className="pe-guest-card">
      <div className="pe-card-top">
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>{guest.name}</h4>
          {guest.companionName && (
            <small style={{ color: "var(--brand-text-muted)" }}>
              + {guest.companionName}
            </small>
          )}
        </div>
        <div className="pe-guest-statuses">
          {guest.checkedIn && (
            <StatusBadge
              status="CHECKED_IN"
              label={t ? t("checkedIn") : "បានចូលរួម"}
              variant="success"
            />
          )}
          {guest.rsvpStatus && (
            <StatusBadge
              status={guest.rsvpStatus}
              label={`RSVP: ${guest.rsvpStatus.replaceAll("_", " ")}`}
            />
          )}
          {!guest.checkedIn && !guest.rsvpStatus && (
            <StatusBadge status={guest.sendStatus} />
          )}
          {(guest.checkedIn || guest.rsvpStatus) &&
          guest.sendStatus &&
          guest.sendStatus !== "មិនទាន់ផ្ញើ" &&
          guest.sendStatus !== "PENDING" &&
          guest.sendStatus !== "បានឆ្លើយតប" &&
          guest.sendStatus !== "RESPONDED" && (
            <StatusBadge status={guest.sendStatus} />
          )}
        </div>
      </div>

      <div className="pe-card-details">
        <div>
          <span>{t ? t("thPhone") : "ទូរស័ព្ទ"}:</span>
          <strong>{guest.phone || "-"}</strong>
        </div>
        <div>
          <span>{t ? t("thGroup") : "ក្រុម"}:</span>
          <strong>{guest.group || "-"}</strong>
        </div>
        <div>
          <span>{t ? t("thSeats") : "ចំនួន"}:</span>
          <strong>{guest.count || 1}</strong>
        </div>
      </div>

      <div className="pe-card-actions">
        <button
          type="button"
          className="pe-icon-btn"
          onClick={() => onShowQr(guest)}
          title={t ? t("showQr") : "QR Code"}
          aria-label={t ? t("showQr") : "QR Code"}
        >
          <IoQrCodeOutline aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pe-icon-btn"
          onClick={() => onCopyLink(shareMessage || inviteUrl, guest)}
          title={t ? t("copyMessage") : "ចម្លងសារអញ្ជើញ"}
          aria-label={t ? t("copyMessage") : "ចម្លងសារអញ្ជើញ"}
        >
          <IoCopyOutline aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pe-icon-btn"
          onClick={() => onEdit(guest)}
          title={t ? t("edit") : "កែប្រែ"}
          aria-label={t ? t("edit") : "កែប្រែ"}
        >
          <IoPencilOutline aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pe-icon-btn danger"
          onClick={() => onDelete(guest)}
          title={t ? t("delete") : "លុប"}
          aria-label={t ? t("delete") : "លុប"}
        >
          <IoTrashOutline aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
