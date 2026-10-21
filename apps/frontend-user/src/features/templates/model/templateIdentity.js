import { saveTemplateIntent } from "./templateIntent";

// Explicit code/slug precedes numeric IDs, which may collide with static presets.
export function templateIdentity(template) {
  return String(template?.code || template?.slug || template?.id || "").trim();
}

export function templateUsePath(identity, isAuthenticated, targetPath = "/templates/browse") {
  const cleanId = String(identity || "").trim();
  if (cleanId) {
    saveTemplateIntent(cleanId);
  }
  const basePath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  const separator = basePath.includes("?") ? "&" : "?";
  const path = `${basePath}${separator}template=${encodeURIComponent(cleanId)}`;
  return isAuthenticated ? path : `/login?next=${encodeURIComponent(path)}`;
}

export function templatePriceLabel(template, lang) {
  const price = Number(template?.price);
  const currency = String(template?.currency || "").toUpperCase();
  if (!Number.isFinite(price) || price <= 0 || !/^[A-Z]{3}$/.test(currency)) return null;
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "km-KH", {
      style: "currency", currency,
    }).format(price);
  } catch {
    return null;
  }
}
