export const FEATURED_TEMPLATE_CODES = ["royal-garden-cinematic", "silk-heritage", "khmer-celestial", "emerald-canva-luxe-wedding"];

export const RETIRED_TEMPLATE_CODES = new Set([
  "garden-royal-khmer-wedding",
  "khmer-royal-lotus",
]);

export const RETIRED_TEMPLATE_NAMES = new Set([
  "garden royal khmer wedding",
  "khmer royal lotus",
]);

export function isPublicCatalogTemplate(template) {
  const code = String(template?.code || "").toLowerCase();
  const slug = String(template?.slug || "").toLowerCase();
  const name = String(template?.name || "").toLowerCase();

  if (
    RETIRED_TEMPLATE_CODES.has(code) ||
    RETIRED_TEMPLATE_CODES.has(slug) ||
    RETIRED_TEMPLATE_NAMES.has(name)
  ) {
    return false;
  }
  return String(template?.status).toUpperCase() === "ACTIVE"
    && Number.isSafeInteger(Number(template?.backendId ?? template?.id))
    && Number(template?.backendId ?? template?.id) > 0
    && Boolean(template?.code || template?.slug);
}

export function requiresTemplateAccess(template) {
  return Boolean(template?.premium || template?.isPremium || template?.checkoutEligible || Number(template?.price) > 0);
}

export function matchesTemplateSearch(template, query) {
  const text = [template.name, template.title, template.code, template.slug, template.style,
    template.category, template.description, template.descriptionEn, template.descriptionKm,
    template.openingStyle, template.presetId].filter(Boolean).join(" ").toLocaleLowerCase();
  return !query.trim() || text.includes(query.trim().toLocaleLowerCase());
}

export function templateCategory(template) {
  const category = String(template.category || "OTHER").toUpperCase();
  return category === "ANCIENT" ? "TRADITIONAL" : category;
}
