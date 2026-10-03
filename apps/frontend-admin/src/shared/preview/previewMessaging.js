// FE-010: the admin and user apps deploy independently; this is the editor side
// of the versioned invitation-preview protocol used by the user renderer.
const NONCE_PATTERN = /^[A-Za-z0-9_-]{24,128}$/;

export function createPreviewSession() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function buildPreviewUrl(path, sessionId, parentOrigin = window.location.origin) {
  const origin = new URL(parentOrigin);
  const url = new URL(path, window.location.origin);
  if (!NONCE_PATTERN.test(sessionId) || origin.origin !== parentOrigin
    || !["http:", "https:"].includes(origin.protocol)
    || !["http:", "https:"].includes(url.protocol)) throw new Error("Invalid preview session");
  url.searchParams.set("previewSession", sessionId);
  url.searchParams.set("previewOrigin", parentOrigin);
  return url.href;
}

function iframeChannel(iframe, sessionId) {
  if (!iframe?.contentWindow || !NONCE_PATTERN.test(sessionId || "")) return null;
  try {
    const url = new URL(iframe.src, window.location.origin);
    return ["http:", "https:"].includes(url.protocol)
      ? { source: iframe.contentWindow, origin: url.origin, sessionId } : null;
  } catch { return null; }
}

export function postIframePreview(iframe, sessionId, message) {
  const channel = iframeChannel(iframe, sessionId);
  if (!channel || !["LIVE_PREVIEW_SYNC", "TOGGLE_GATE"].includes(message.type)) return false;
  if (message.type === "TOGGLE_GATE" && typeof message.open !== "boolean") return false;
  if (message.type === "LIVE_PREVIEW_SYNC" && (!message.data || typeof message.data !== "object" || Array.isArray(message.data))) return false;
  channel.source.postMessage({ ...message, sessionId }, channel.origin);
  return true;
}

export function isTrustedPreviewReply(event, iframe, sessionId) {
  const channel = iframeChannel(iframe, sessionId);
  const data = event.data;
  if (!channel || event.origin !== channel.origin || event.source !== channel.source
    || data?.sessionId !== sessionId || typeof data !== "object" || Array.isArray(data)) return false;
  if (Object.keys(data).some((key) => !["type", "sessionId", "elementId", "open", "isOpen"].includes(key))) return false;
  if (["PREVIEW_READY", "REQUEST_PREVIEW_SYNC"].includes(data.type)) {
    return data.elementId === undefined && data.open === undefined && data.isOpen === undefined;
  }
  if (data.type === "SELECT_TARGET_ELEMENT") {
    return typeof data.elementId === "string" && /^[a-z][a-z0-9_-]{0,80}$/i.test(data.elementId);
  }
  return ["GATE_STATE_CHANGE", "GATE_OPENED"].includes(data.type)
    && (typeof data.open === "boolean" || typeof data.isOpen === "boolean")
    && (data.open === undefined || typeof data.open === "boolean")
    && (data.isOpen === undefined || typeof data.isOpen === "boolean");
}
