import { TEMPLATES } from "../data/templatesData";
import { templateIdentity } from "./templateIdentity";

// Describe the actual local design, never an entitlement or an invented feature.
const designNotes = {
  "silk-heritage": ["ក្របសូត្រពណ៌ក្រហមទុំ ក្រដាសភ្លុក និងលម្អពណ៌មាស។", "A burgundy silk folio, ivory paper and fine gold details."],
  "khmer-celestial": ["ផ្កាពណ៌ស ស្លឹកបៃតង និងលម្អពណ៌មាសលើក្រដាសភ្លុក។", "White flowers, green foliage and champagne gold on ivory."],
  "emerald-canva-luxe-wedding": ["ពណ៌បៃតងចាស់ ស៊ុមលម្អពណ៌មាស និងផ្កាអ័រគីដេ។", "Deep emerald, ornate gold borders and white orchids."],
};

export function localTemplateFor(template) {
  const keys = [template?.code, template?.slug].filter(Boolean);
  // A server numeric ID alone cannot identify a static design.
  return TEMPLATES.find((item) => keys.includes(item.id) || keys.includes(item.code) || keys.includes(item.slug));
}

export function templateDescription(description, lang, fallback = "") {
  let value = description;
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const config = JSON.parse(value);
      value = lang === "en" ? config.descriptionEn : config.description;
    } catch { value = ""; }
  }
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function presentTemplate(template, lang, live = true) {
  const local = live ? localTemplateFor(template) : template;
  const note = designNotes[local?.id]?.[lang === "en" ? 1 : 0];
  const category = String(template.category || local?.category || "other").toLowerCase();
  return {
    ...template,
    identity: templateIdentity(template),
    name: lang === "en" ? (template.nameEn || local?.style || template.name || "Invitation design") : (template.nameKm || template.name || local?.name || "គំរូសន្លឹកការ"),
    category: category === "traditional" ? "ancient" : category,
    image: template.thumbnailUrl || template.image || local?.image,
    description: templateDescription(lang === "en" ? template.descriptionEn : template.description, lang,
      note || (lang === "en" ? "Explore the invitation, celebration program and guest details in the full demo." : "មើលសន្លឹកការ កម្មវិធីពិធី និងព័ត៌មានភ្ញៀវ ក្នុងគំរូពេញលេញ។")),
    isPremium: Boolean(template.premium || template.isPremium || Number(template.price) > 0),
    live,
  };
}
