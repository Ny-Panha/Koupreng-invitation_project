// FE-010: preview channels are scoped to a deliberate editor session, never public invitations.
const NONCE_PATTERN = /^[A-Za-z0-9_-]{24,128}$/;
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const STRING_FIELDS = new Set([
  "groom", "bride", "groomName", "brideName", "fontKhmer", "fontLatin", "musicUrl",
  "title", "invitationTitle", "subtitle", "invitationSubtitle", "messageText", "messageTitle",
  "coverImage", "coverBackgroundImage", "openingVideoUrl", "videoUrl", "backgroundImage",
  "guestName", "guestLabel", "primaryColor", "secondaryColor", "bankName", "bankAccountName",
  "bankAccountNumber", "qrGiftUrl", "googleMapUrl", "venueName", "venueAddress", "storyText",
]);
const ARRAY_FIELDS = new Set([
  "photos", "galleryImages", "schedule", "faq", "party", "storyChapters", "sectionOrder",
  "customFonts", "dressColors",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function validData(value, depth = 0) {
  if (depth > 12) return false;
  if (value == null) return true;
  if (typeof value === "string") return value.length <= 16 * 1024 * 1024;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  // Local-draft photos can carry a File alongside their renderable URL.
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (Array.isArray(value)) return value.length <= 500 && value.every((item) => validData(item, depth + 1));
  if (!isRecord(value)) return false;
  const entries = Object.entries(value);
  return entries.length <= 256 && entries.every(([key, item]) =>
    !FORBIDDEN_KEYS.has(key) && validData(item, depth + 1)
  );
}

export function isPreviewMessage(data) {
  if (!isRecord(data) || !NONCE_PATTERN.test(data.sessionId || "")) return false;
  if (Object.keys(data).some((key) => !["type", "sessionId", "data", "open", "isOpen", "elementId"].includes(key))) return false;
  switch (data.type) {
    case "LIVE_PREVIEW_SYNC":
      return isRecord(data.data) && validData(data.data) && Object.entries(data.data).every(([key, value]) =>
        value == null || ((!STRING_FIELDS.has(key) || typeof value === "string")
          && (!ARRAY_FIELDS.has(key) || Array.isArray(value)))
      );
    case "TOGGLE_GATE":
    case "GATE_STATE_CHANGE":
    case "GATE_OPENED":
      return (typeof data.open === "boolean" || typeof data.isOpen === "boolean")
        && (data.open === undefined || typeof data.open === "boolean")
        && (data.isOpen === undefined || typeof data.isOpen === "boolean");
    case "SELECT_TARGET_ELEMENT":
      return typeof data.elementId === "string" && /^[a-z][a-z0-9_-]{0,80}$/i.test(data.elementId);
    case "PREVIEW_READY":
    case "REQUEST_PREVIEW_SYNC":
      return data.data === undefined && data.open === undefined && data.elementId === undefined;
    default:
      return false;
  }
}

function isOrigin(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.origin === value;
  } catch {
    return false;
  }
}

export function createPreviewSession() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function buildPreviewUrl(path, sessionId, parentOrigin = window.location.origin) {
  if (!NONCE_PATTERN.test(sessionId) || !isOrigin(parentOrigin)) throw new Error("Invalid preview session");
  const url = new URL(path, window.location.origin);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid preview URL");
  url.searchParams.set("previewSession", sessionId);
  url.searchParams.set("previewOrigin", parentOrigin);
  return url.href;
}

export function readEmbeddedPreviewChannel() {
  if (typeof window === "undefined" || window.parent === window) return null;
  const url = new URL(window.location.href);
  if (!/^\/templates\/[^/]+\/(preview|demo)\/?$/.test(url.pathname)) return null;
  const sessionId = url.searchParams.get("previewSession");
  const origin = url.searchParams.get("previewOrigin");
  if (!NONCE_PATTERN.test(sessionId || "") || !isOrigin(origin)) return null;
  if (document.referrer) {
    try { if (new URL(document.referrer).origin !== origin) return null; } catch { return null; }
  }
  return { sessionId, origin, source: window.parent };
}

export function isTrustedPreviewMessage(event, channel) {
  return Boolean(channel && event.origin === channel.origin && event.source === channel.source
    && event.data?.sessionId === channel.sessionId && isPreviewMessage(event.data));
}

export function postPreviewMessage(message, channel = readEmbeddedPreviewChannel()) {
  if (!channel) return false;
  const payload = { ...message, sessionId: channel.sessionId };
  if (!isPreviewMessage(payload) || !isOrigin(channel.origin)) return false;
  channel.source.postMessage(payload, channel.origin);
  return true;
}

export function iframePreviewChannel(iframe, sessionId) {
  if (!iframe?.contentWindow || !NONCE_PATTERN.test(sessionId || "")) return null;
  try {
    const url = new URL(iframe.src, window.location.origin);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return { source: iframe.contentWindow, origin: url.origin, sessionId };
  } catch {
    return null;
  }
}
