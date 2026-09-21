import {
    KEEP_TEMPLATE_CODE,
    KHMER_CELESTIAL_TEMPLATE_CODE,
    ROYAL_KHMER_TEMPLATE_CODE,
    KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    COVER_KHMER_GOLDEN_CODE,
    THE_DIGITAL_YES_TEMPLATE_CODE,
} from "../../data/templatesData";

export { KEEP_TEMPLATE_CODE, KHMER_CELESTIAL_TEMPLATE_CODE, ROYAL_KHMER_TEMPLATE_CODE, KHMER_GOLDEN_CANVA_INSPIRED_CODE, COVER_KHMER_GOLDEN_CODE, THE_DIGITAL_YES_TEMPLATE_CODE };
export const TEMPLATE_VARIANTS = {
    [KHMER_CELESTIAL_TEMPLATE_CODE]: {
        className: "template-experience--khmer-celestial",
        mood: "light",
        badge: "Khmer Celestial",
        amp: "◆",
        dressColors: [
            { hex: "#541722", name: "ក្រហមទុំ" },
            { hex: "#B88A3A", name: "មាស" },
            { hex: "#EAD39E", name: "សាំប៉ាញ" },
            { hex: "#FFFAF2", name: "ភ្លុក" },
        ],
    },
    "emerald-canva-luxe-wedding": {
        className: "template-experience--emerald-luxe-wedding",
        mood: "dark",
        badge: "Emerald Luxe",
        amp: "❖",
        dressColors: [
            { hex: "#0F4C3A", name: "បៃតងចាស់" },
            { hex: "#2D8A6E", name: "បៃតងមរកត" },
            { hex: "#D4AF37", name: "មាស" },
            { hex: "#FFFDF7", name: "ស" },
        ],
    },
    [KEEP_TEMPLATE_CODE]: {
        className: "template-experience--garden-royal-khmer-wedding",
        mood: "light",
        badge: "Garden Royal",
        amp: "❀",
        dressColors: [
            { hex: "#2D7FA6", name: "ខៀវផ្កា" },
            { hex: "#6F9E2E", name: "បៃតងស្លឹក" },
            { hex: "#FFFDF7", name: "ស" },
            { hex: "#D6A63C", name: "មាស" },
        ],
    },
    [ROYAL_KHMER_TEMPLATE_CODE]: {
        className: "template-experience--garden-royal-khmer-wedding template-experience--royal-khmer-wedding",
        mood: "light",
        badge: "Royal Khmer",
        amp: "❖",
        dressColors: [
            { hex: "#8B1E2D", name: "ក្រហមទុំ" },
            { hex: "#D4AF37", name: "មាស" },
            { hex: "#FFFDF7", name: "ស" },
            { hex: "#4A151C", name: "ក្រហមចាស់" },
        ],
    },
    [KHMER_GOLDEN_CANVA_INSPIRED_CODE]: {
        className: "template-experience--khmer-golden-canva-inspired-wedding",
        mood: "light",
        badge: "Khmer Golden",
        amp: "✦",
        dressColors: [
            { hex: "#FFFDF7", name: "ivory" },
            { hex: "#C99A3D", name: "មាស" },
            { hex: "#E9D0A2", name: "champagne" },
            { hex: "#4B2F1A", name: "ត្នោត" },
        ],
    },
    [COVER_KHMER_GOLDEN_CODE]: {
        className: "template-experience--cover-khmer-golden-wedding",
        mood: "light",
        badge: "Cover Khmer",
        amp: "✦",
        dressColors: [
            { hex: "#C89B3C", name: "មាស" },
            { hex: "#FFF8E7", name: "ភ្លុក" },
            { hex: "#E8C98A", name: "សាំប៉ាញ" },
            { hex: "#5C3418", name: "ត្នោតចាស់" },
        ],
    },
    [THE_DIGITAL_YES_TEMPLATE_CODE]: {
        className: "template-experience--garden-royal-khmer-wedding template-experience--royal-khmer-wedding",
        mood: "light",
        badge: "Royal Luxury 2026",
        amp: "❀",
        dressColors: [
            { hex: "#8B1E2D", name: "ក្រហមទុំ" },
            { hex: "#D4AF37", name: "មាស" },
            { hex: "#FFFDF7", name: "ស" },
            { hex: "#4A151C", name: "ក្រហមចាស់" },
        ],
    },
};

export const DEFAULT_VARIANT = KEEP_TEMPLATE_CODE;

export const TEMPLATE_VARIANT_BY_ID = {
    [KHMER_CELESTIAL_TEMPLATE_CODE]: KHMER_CELESTIAL_TEMPLATE_CODE,
    [KEEP_TEMPLATE_CODE]: KEEP_TEMPLATE_CODE,
    [ROYAL_KHMER_TEMPLATE_CODE]: ROYAL_KHMER_TEMPLATE_CODE,
    [KHMER_GOLDEN_CANVA_INSPIRED_CODE]: KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    [COVER_KHMER_GOLDEN_CODE]: COVER_KHMER_GOLDEN_CODE,
    [THE_DIGITAL_YES_TEMPLATE_CODE]: THE_DIGITAL_YES_TEMPLATE_CODE,
};

export const VARIANT_ROUTE_ALIASES = {
    "khmer-celestial": KHMER_CELESTIAL_TEMPLATE_CODE,
    classic: KEEP_TEMPLATE_CODE,
    luxury: KEEP_TEMPLATE_CODE,
    royal: ROYAL_KHMER_TEMPLATE_CODE,
    "modern-khmer": KEEP_TEMPLATE_CODE,
    "royal-khmer": ROYAL_KHMER_TEMPLATE_CODE,
    "royal-khmer-wedding": ROYAL_KHMER_TEMPLATE_CODE,
    "vintage-gold": KEEP_TEMPLATE_CODE,
    "the-digital-yes": THE_DIGITAL_YES_TEMPLATE_CODE,
    "the-digital-yes-wedding": THE_DIGITAL_YES_TEMPLATE_CODE,
    // Admin Studio presetId aliases
    EMERALD_GREEN: "emerald-canva-luxe-wedding",
    RUBY_RED: ROYAL_KHMER_TEMPLATE_CODE,
    ROYAL_KHMER: ROYAL_KHMER_TEMPLATE_CODE,
    GOLD_LUXURY: THE_DIGITAL_YES_TEMPLATE_CODE,
    CHAMPAGNE: COVER_KHMER_GOLDEN_CODE,
    KHMER_GOLDEN: KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    GARDEN_ROYAL: KEEP_TEMPLATE_CODE,
    KHMER_CELESTIAL: KHMER_CELESTIAL_TEMPLATE_CODE,
};

export function resolveVariant(tpl = {}, explicitVariant) {
    if (explicitVariant) {
        if (TEMPLATE_VARIANTS[explicitVariant]) return explicitVariant;
        if (VARIANT_ROUTE_ALIASES[explicitVariant]) return VARIANT_ROUTE_ALIASES[explicitVariant];
    }

    const candidate = tpl.variant || tpl.templateId || tpl.id || tpl.slug || tpl.code || tpl.templateCode;
    if (candidate) {
        if (TEMPLATE_VARIANTS[candidate]) return candidate;
        if (TEMPLATE_VARIANT_BY_ID[candidate]) return TEMPLATE_VARIANT_BY_ID[candidate];
        if (VARIANT_ROUTE_ALIASES[candidate]) return VARIANT_ROUTE_ALIASES[candidate];
    }

    // Check Admin presetId / theme for dynamic templates
    const presetCandidate = tpl.presetId || tpl.design?.presetId || tpl.design?.theme;
    if (presetCandidate && VARIANT_ROUTE_ALIASES[presetCandidate]) {
        return VARIANT_ROUTE_ALIASES[presetCandidate];
    }

    return DEFAULT_VARIANT;
}

export function getVariantTheme(variant = DEFAULT_VARIANT) {
    const resolvedVariant = TEMPLATE_VARIANTS[variant]
        ? variant
        : (TEMPLATE_VARIANT_BY_ID[variant] || VARIANT_ROUTE_ALIASES[variant] || DEFAULT_VARIANT);
    return TEMPLATE_VARIANTS[resolvedVariant] || TEMPLATE_VARIANTS[DEFAULT_VARIANT];
}
