import { templateIntentFromParams } from "../templates/model/templateIntent";

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

export function resolveAuthDestination(searchParams) {
  const safe = safeAuthRedirect(searchParams.get("next") || searchParams.get("redirect"));
  const direct = templateIntentFromParams(searchParams);
  if (!direct) return safe;
  const url = new URL(safe, "https://koupreng.invalid");
  if (!["/app/events", "/app/events/new", "/templates/browse"].includes(url.pathname)) return safe;
  if (url.pathname === "/app/events") url.pathname = "/app/events/new";
  for (const alias of ["templateCode", "templateId", "tpl"]) url.searchParams.delete(alias);
  url.searchParams.set("template", direct);
  return url.pathname + url.search + url.hash;
}
