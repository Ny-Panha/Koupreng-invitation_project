export const EVENT_MODULES = ["invitation", "tickets/design", "guests", "rsvp", "gifts", "budget", "seating", "check-in", "reports", "settings", "preview", "delivery", "media", "qr", "wishes", "assistant", "team", "analytics"];
export function backendEventId(event) {
  const id = event?.backendInvitationId || event?.invitationId || event?.id;
  return /^[1-9]\d*$/.test(String(id || "")) ? String(id) : null;
}
export function eventPath(id, module = "") {
  return `/app/events/${encodeURIComponent(id)}${EVENT_MODULES.includes(module) ? `/${module}` : ""}`;
}
