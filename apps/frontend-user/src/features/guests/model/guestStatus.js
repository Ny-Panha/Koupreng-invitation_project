import { SEND_STATUS } from "./guestConstants";

export function hasGuestResponded(guest) {
  const status = String(guest.rsvpStatus || "").trim().toUpperCase();
  return guest.sendStatus === SEND_STATUS.responded ||
    String(guest.sendStatus).toUpperCase() === "RESPONDED" ||
    Boolean(status && !["PENDING", "UNKNOWN", "AWAITING"].includes(status));
}

export function needsInvitation(guest) {
  return !guest.checkedIn && !hasGuestResponded(guest) &&
    (!guest.sendStatus || guest.sendStatus === SEND_STATUS.pending ||
      String(guest.sendStatus).toUpperCase() === "PENDING");
}

export function matchesGuestStatus(guest, status) {
  if (status === "pending") return needsInvitation(guest);
  if (status === "responded") return hasGuestResponded(guest);
  if (status === "checkedIn") return Boolean(guest.checkedIn);
  return true;
}
