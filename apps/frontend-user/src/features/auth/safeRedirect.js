const DEFAULT_DESTINATION = "/app/events";
export function safeAuthRedirect(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")
      || [...value].some(char => char.charCodeAt(0) <= 32 || char === "\\")
      || /%(?:2f|5c|0[0-9a-f]|1[0-9a-f])/i.test(value)) return DEFAULT_DESTINATION;
  try {
    const url = new URL(value, "https://koupreng.invalid");
    if (url.origin !== "https://koupreng.invalid") return DEFAULT_DESTINATION;
    const path = url.pathname;
    if (!(/^\/(?:app|dashboard)(?:\/|$)/.test(path) || /^\/templates\/[^/]+\/(?:checkout|preview)$/.test(path)
        || /^\/templates\/browse(?:\/[^/]+)?$/.test(path) || /^\/(?:create\/wedding|event)\/[^/]+(?:\/manage)?$/.test(path))) return DEFAULT_DESTINATION;
    return url.pathname + url.search + url.hash;
  } catch { return DEFAULT_DESTINATION; }
}
