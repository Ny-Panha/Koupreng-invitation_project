import { TEMPLATES } from "../data/templatesData";
import { templateIdentity } from "./templateIdentity";

// Describe the actual local design, never an entitlement or an invented feature.
const designNotes = {
  "royal-garden-cinematic": ["ក្បាច់ខ្មែរពណ៌មាសលើផ្ទៃពណ៌ខៀវ ជាមួយកម្មវិធីមង្គលការ។", "Blue and gold Khmer ornaments, with a cinematic opening and wedding program."],
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

function hasKhmer(str) {
  return /[\u1780-\u17FF]/.test(String(str || ""));
}

export function presentTemplate(template, lang, live = true) {
  const local = live ? localTemplateFor(template) : template;
  const note = designNotes[local?.id]?.[lang === "en" ? 1 : 0];
  const category = String(template.category || local?.category || "other").toLowerCase();
  const fallbackDesc = note || (lang === "en" ? "Explore the invitation, celebration program and guest details in the full demo." : "មើលសន្លឹកការ កម្មវិធីពិធី និងព័ត៌មានភ្ញៀវ ក្នុងគំរូពេញលេញ។");
  const rawDesc = lang === "en"
    ? (template.descriptionEn || note || local?.description)
    : (template.descriptionKm || (hasKhmer(template.description) ? template.description : (local?.description || template.description)));

  return {
    ...template,
    identity: templateIdentity(template),
    name: lang === "en"
      ? (template.nameEn || local?.style || template.name || "Invitation design")
      : (template.nameKm || (hasKhmer(template.name) ? template.name : (local?.name || template.name || "គំរូសន្លឹកការ"))),
    category: category === "traditional" ? "ancient" : category,
    image: template.thumbnailUrl || template.image || local?.image,
    description: templateDescription(rawDesc, lang, fallbackDesc),
    isPremium: Boolean(template.premium || template.isPremium || Number(template.price) > 0),
    live,
  };
}
