export const DEFAULT_OPENING_COPY = Object.freeze({
    heading: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
    invitationText: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
    genericGuestText: "លោកអ្នក និងក្រុមគ្រួសារ",
    openButtonText: "បើកសំបុត្រអញ្ជើញ",
});

export const DEFAULT_OPENING_DESIGN = Object.freeze({
    monogramText: "",
    primaryColor: "#6f1d2b",
    accentColor: "#c99a3d",
    openingStyle: "khmer-royal",
    openingVideoEnabled: false,
    openingOverlayOpacity: 0.48,
    frameStyle: "double-gold",
    ornamentStyle: "khmer-corner-01",
});

function cleanText(value, fallback = "", maxLength = 160) {
    if (typeof value !== "string") return fallback;
    const cleaned = Array.from(value)
        .filter((character) => {
            const code = character.charCodeAt(0);
            return code >= 32 && code !== 127 && character !== "<" && character !== ">";
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength);
    return cleaned || fallback;
}

function color(value, fallback) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
        ? value.trim()
        : fallback;
}

function opacity(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_OPENING_DESIGN.openingOverlayOpacity;
    return Math.min(0.8, Math.max(0.2, parsed));
}

export function normalizeOpeningCopy(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    return {
        heading: cleanText(source.heading, DEFAULT_OPENING_COPY.heading, 90),
        invitationText: cleanText(source.invitationText, DEFAULT_OPENING_COPY.invitationText, 180),
        genericGuestText: cleanText(source.genericGuestText, DEFAULT_OPENING_COPY.genericGuestText, 120),
        openButtonText: cleanText(source.openButtonText, DEFAULT_OPENING_COPY.openButtonText, 72),
    };
}

export function normalizeOpeningDesign(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const allowedOpeningStyles = new Set([
        "khmer-royal",
        "paper",
        "monogram",
        "cinematic",
        "cinematic-video",
        "celestial-cover",
        "royal-stage",
        "curtain",
        "envelope-3d",
        "magical-gate",
    ]);
    const allowedFrameStyles = new Set(["double-gold", "single-gold", "minimal-gold"]);
    const allowedOrnaments = new Set(["khmer-corner-01", "khmer-line", "minimal-gold"]);

    return {
        ...source,
        monogramText: cleanText(source.monogramText, "", 24),
        primaryColor: color(source.primaryColor, DEFAULT_OPENING_DESIGN.primaryColor),
        accentColor: color(source.accentColor, DEFAULT_OPENING_DESIGN.accentColor),
        openingStyle: allowedOpeningStyles.has(source.openingStyle)
            ? source.openingStyle
            : DEFAULT_OPENING_DESIGN.openingStyle,
        openingVideoEnabled: source.openingVideoEnabled === true,
        openingOverlayOpacity: opacity(source.openingOverlayOpacity),
        frameStyle: allowedFrameStyles.has(source.frameStyle)
            ? source.frameStyle
            : DEFAULT_OPENING_DESIGN.frameStyle,
        ornamentStyle: allowedOrnaments.has(source.ornamentStyle)
            ? source.ornamentStyle
            : DEFAULT_OPENING_DESIGN.ornamentStyle,
    };
}

export function resolveOpeningVideo({ mediaVideo, configuredVideo, contentVideo, enabled = true } = {}) {
    if (!enabled) return null;
    return mediaVideo || configuredVideo || contentVideo || null;
}
