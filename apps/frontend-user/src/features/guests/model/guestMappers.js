import { createHostRecordId } from "@/shared/storage/hostPlanningStorage";
import { DEFAULT_CATEGORIES, DEFAULT_GROUPS, SEND_STATUS } from "./guestConstants";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeManualGuest(guest) {
  const name = guest.name || guest.guestName || "Guest";
  return {
    ...guest,
    id: guest.id || createHostRecordId("guest"),
    name,
    companionName: guest.companionName || "",
    phone: guest.phone === "-" ? "" : guest.phone || "",
    group: guest.group || guest.guestGroup || DEFAULT_GROUPS[0].name,
    category:
      guest.category ||
      guest.sideType ||
      guest.status ||
      DEFAULT_CATEGORIES[0].name,
    sendStatus: guest.sendStatus || SEND_STATUS.pending,
    count: Math.max(1, Number(guest.count) || 1),
    seat: guest.seat === "-" ? "" : guest.seat || "",
    note: guest.note || "",
    source: guest.source || "manual",
  };
}

export function normalizeBackendGuest(guest) {
  const name = guest.guestName || guest.name || "Guest";
  const id = guest.id || guest.guestId;
  return {
    id,
    backendId: id,
    raw: guest,
    name,
    companionName: "",
    phone: guest.phone === "-" ? "" : guest.phone || "",
    group: guest.guestGroup || DEFAULT_GROUPS[0].name,
    category: guest.sideType || DEFAULT_CATEGORIES[0].name,
    sendStatus: guest.sendStatus || SEND_STATUS.pending,
    count: Math.max(1, Number(guest.seatCount) || 1),
    seat: guest.tableNumber || "",
    note: guest.note || "",
    inviteToken: guest.inviteToken || guest.invite_token || guest.token || guest.raw?.inviteToken || guest.raw?.token || "",
    qrCodeUrl: guest.qrCodeUrl || guest.qr_code_url || "",
    source: "backend",
  };
}

export function normalizeBackendRsvp(entry) {
  return {
    id: entry.id,
    guestId: entry.guestId,
    name: entry.name || entry.guestName || "RSVP Guest",
    companionName: "",
    phone: entry.phone || "",
    group: "RSVP",
    category: "RSVP",
    sendStatus: SEND_STATUS.responded,
    amount: "-",
    seat: "",
    count: Number(entry.attendeeCount ?? entry.count) || 1,
    note: entry.message || "",
    rsvpStatus: entry.responseStatus || entry.status || "",
    respondedAt: entry.respondedAt || "",
    source: "rsvp",
  };
}

export function mergeBackendGuestsWithRsvps(guests = [], rsvps = [], checkIns = []) {
  const rsvpByGuestId = new Map(
    rsvps
      .filter((rsvp) => rsvp?.guestId != null)
      .map((rsvp) => [String(rsvp.guestId), rsvp])
  );
  const checkInByGuestId = new Map(
    checkIns
      .filter((ci) => ci?.guestId != null)
      .map((ci) => [String(ci.guestId), ci])
  );

  return guests.map((guest) => {
    const guestKey = String(guest.backendId ?? guest.id);
    const rsvp = rsvpByGuestId.get(guestKey);
    const checkIn = checkInByGuestId.get(guestKey);

    const hasRsvp = Boolean(rsvp?.rsvpStatus);
    const isCheckedIn = Boolean(checkIn);

    let sendStatus = guest.sendStatus;
    if (
      (hasRsvp || isCheckedIn) &&
      (!sendStatus || sendStatus === SEND_STATUS.pending || sendStatus === "PENDING")
    ) {
      sendStatus = SEND_STATUS.responded;
    }

    return {
      ...guest,
      sendStatus,
      rsvpStatus: rsvp ? rsvp.rsvpStatus : guest.rsvpStatus,
      rsvpAttendeeCount: rsvp ? rsvp.count : guest.rsvpAttendeeCount,
      rsvpRespondedAt: rsvp ? rsvp.respondedAt : guest.rsvpRespondedAt,
      checkedIn: isCheckedIn || Boolean(guest.checkedIn),
      checkedInAt: checkIn?.checkedInAt || guest.checkedInAt || null,
      checkInSource: checkIn?.source || guest.checkInSource || null,
    };
  });
}

export function toManualGuest(form, existingId) {
  return {
    id: existingId || createHostRecordId("guest"),
    name: form.name.trim(),
    companionName: form.companionName.trim(),
    phone: form.phone.trim(),
    group: form.group,
    category: form.category,
    sendStatus: form.sendStatus,
    amount: "-",
    seat: form.seat.trim(),
    count: Math.max(1, Number(form.count) || 1),
    note: form.note.trim(),
    source: "manual",
    updatedAt: Date.now(),
  };
}

export function toBackendGuestPayload(form) {
  return {
    guestName: cleanText(form.name),
    phone: cleanText(form.phone) || null,
    guestGroup: form.group || null,
    sideType: form.category || null,
    tableNumber: cleanText(form.seat) || null,
    sendStatus: form.sendStatus || null,
    seatCount: Math.max(1, Number(form.count) || 1),
    note: cleanText(form.note) || null,
  };
}

export function initials(name) {
  return (
    (name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

export function guestInviteUrl(draftOrGuest, guestOrDraft, publicInvitation) {
  const base = typeof window === "undefined" ? "" : window.location.origin;

  // Flexible argument handling if called as (guest, draft) or (draft, guest, publicInvitation)
  const isFirstGuest = draftOrGuest && (draftOrGuest.name || draftOrGuest.guestName || draftOrGuest.inviteToken);
  const guest = isFirstGuest ? draftOrGuest : guestOrDraft;
  const draft = isFirstGuest ? (guestOrDraft?.slug ? guestOrDraft : null) : draftOrGuest;

  const candidateSlug = publicInvitation?.slug || draft?.slug || guest?.invitationSlug;
  const isCleanSlug = candidateSlug && /^[a-zA-Z0-9_-]+$/.test(candidateSlug);
  const cleanPath = isCleanSlug
    ? candidateSlug
    : (publicInvitation?.id || draft?.backendInvitationId || draft?.id || "invitation");

  let token =
    guest?.inviteToken ||
    guest?.token ||
    guest?.invite_token ||
    guest?.raw?.inviteToken ||
    guest?.raw?.invite_token ||
    guest?.raw?.token;

  if (!token && guest?.qrCodeUrl && guest.qrCodeUrl.includes("token=")) {
    try {
      const parsed = new URL(guest.qrCodeUrl, "http://dummy");
      token = parsed.searchParams.get("token");
    } catch {
      const match = guest.qrCodeUrl.match(/[?&]token=([^&]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  const url = `${base}/w/${cleanPath}`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}


export function buildShareMessage(guest, draft, publicInvitation) {
  if (!guest) return "";
  const inviteUrl = guestInviteUrl(draft, guest, publicInvitation);
  const groomName = publicInvitation?.groomName || draft?.groomName || "";
  const brideName = publicInvitation?.brideName || draft?.brideName || "";
  const coupleText = groomName && brideName ? `(${groomName} ❤️ ${brideName})` : "";
  const weddingTitle = publicInvitation?.title || draft?.title || "លិខិតអញ្ជើញអាពាហ៍ពិពាហ៍";
  const eventDate = publicInvitation?.eventDate || draft?.eventDate || draft?.date || "";
  const venueName = publicInvitation?.venueName || draft?.venueName || draft?.venue || "";

  const guestSalutation = guest.companionName
    ? `សូមគោរពអញ្ជើញ៖ ${guest.name} និង ${guest.companionName}`
    : `សូមគោរពអញ្ជើញ៖ ${guest.name}`;

  const dateText = eventDate ? `\n📅 កាលបរិច្ឆេទ៖ ${eventDate}` : "";
  const venueText = venueName ? `\n📍 ទីតាំង៖ ${venueName}` : "";
  const noteText = guest.note?.trim() ? `\n📝 កំណត់ចំណាំ៖ ${guest.note.trim()}` : "";

  return `💌 ${weddingTitle} ${coupleText ? `${coupleText}\n` : ""}${guestSalutation}
ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។${dateText}${venueText}${noteText}

👉 សូមចុចតំណភ្ជាប់ដើម្បីមើលធៀបការ និង RSVP:
${inviteUrl}`;
}

export async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "-9999px";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(field);
  return copied;
}
