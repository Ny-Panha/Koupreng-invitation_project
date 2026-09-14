import {
  IoCopyOutline,
  IoPencilOutline,
  IoQrCodeOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { ResponsiveTable, StatusBadge } from "@/shared/ui";
import { buildShareMessage, guestInviteUrl } from "../model/guestMappers";

export default function GuestTable({
  guests = [],
  currentDraft,
  publicInvitation,
  onEdit,
  onDelete,
  onShowQr,
  onCopyLink,
  t,
}) {
  return (
    <ResponsiveTable ariaLabel="Guests List Table">
      <thead>
        <tr>
          <th>{t ? t("thGuest") : "ឈ្មោះភ្ញៀវ"}</th>
          <th>{t ? t("thPhone") : "លេខទូរស័ព្ទ"}</th>
          <th>{t ? t("thGroup") : "ក្រុម"}</th>
          <th>{t ? t("thCategory") : "ប្រភេទ"}</th>
          <th>{t ? t("thSeats") : "ចំនួន"}</th>
          <th>{t ? t("thStatus") : "ស្ថានភាព"}</th>
          <th>{t ? t("thActions") : "សកម្មភាព"}</th>
        </tr>
      </thead>
      <tbody>
        {guests.map((guest) => {
          const inviteUrl = guestInviteUrl(currentDraft, guest, publicInvitation);
          const shareMessage = buildShareMessage(guest, currentDraft, publicInvitation);
          return (
            <tr key={guest.id}>
              <td>
                <div>
                  <strong>{guest.name}</strong>
                  {guest.companionName && (
                    <small style={{ display: "block", color: "var(--brand-text-muted)" }}>
                      + {guest.companionName}
                    </small>
                  )}
                </div>
              </td>
              <td>{guest.phone || "-"}</td>
              <td>{guest.group || "-"}</td>
              <td>{guest.category || "-"}</td>
              <td>{guest.count || 1}</td>
              <td>
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
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <button
                    type="button"
                    className="pe-icon-btn"
                    onClick={() => onShowQr(guest)}
                    title={t ? t("showQr") : "បង្ហាញ QR Code"}
                    aria-label={t ? t("showQr") : "បង្ហាញ QR Code"}
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
              </td>
            </tr>
          );
        })}
      </tbody>
    </ResponsiveTable>
  );
}
