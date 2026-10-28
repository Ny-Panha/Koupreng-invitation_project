import { normalizeTemplateIntentKey } from "./templateIntent";

// Explicit code/slug precedes numeric IDs, which may collide with static presets.
export function templateIdentity(template) {
  return String(template?.code || template?.slug || template?.id || "").trim();
}

export function templateUsePath(identity, isAuthenticated, targetPath = "/app/events/new") {
  // Building a link must never change a visitor's selection during React render.
  const origin = "https://koupreng.invalid";
  let target;
  try { target = new URL(targetPath, origin); } catch { /* Use the supported creation entry. */ }
  if (target?.origin !== origin || !["/app/events/new", "/templates/browse"].includes(target.pathname)) {
    target = new URL("/app/events/new", origin);
  }
  for (const alias of ["template", "templateCode", "templateId", "tpl"]) target.searchParams.delete(alias);
  const cleanId = normalizeTemplateIntentKey(identity);
  if (cleanId) target.searchParams.set("template", cleanId);
  const path = target.pathname + target.search + target.hash;
  return isAuthenticated ? path : `/login?next=${encodeURIComponent(path)}`;
}

export function templatePriceLabel(template, lang) {
  const offer = template?.checkoutEligible === true && template?.checkoutAmount != null;
  const price = Number(offer ? template.checkoutAmount : template?.price);
  const currency = String((offer ? template.checkoutCurrency : template?.currency) || "").toUpperCase();
  if (!Number.isFinite(price) || price <= 0 || !/^[A-Z]{3}$/.test(currency)) return null;
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "km-KH", {
      style: "currency", currency,
    }).format(price);
  } catch {
    return null;
  }
}
