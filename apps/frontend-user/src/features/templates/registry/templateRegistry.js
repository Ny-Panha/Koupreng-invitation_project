import DigitalYesLayout from "../layouts/DigitalYes/DigitalYesLayout";
import RoyalKhmerLayout from "../layouts/RoyalKhmer/RoyalKhmerLayout";
import EmeraldLuxeLayout from "../layouts/EmeraldLuxe/EmeraldLuxeLayout";
import WithJoyPortalLayout from "../layouts/WithJoyPortalLayout";
import BlissEditorialLayout from "../layouts/BlissEditorialLayout";
import DefaultTemplateLayout from "../layouts/DefaultTemplate/DefaultTemplateLayout";
import CanvaKhmerWeddingTemplate from "../experience/components/canva-khmer/CanvaKhmerWeddingTemplate";
import KhmerCelestialLayout from "../layouts/KhmerCelestial/KhmerCelestialLayout";

/**
 * 1 Template = 1 Dedicated UI Component Registry
 * Maps template slugs, IDs, and codes to their bespoke UI layout components.
 */
export const templateRegistry = {
  // Flagship Khmer Celestial (cinematic Cambodian editorial invitation)
  "khmer-celestial": KhmerCelestialLayout,
  "KHMER_CELESTIAL": KhmerCelestialLayout,

  // 1. The Digital Yes (Luxury Cinematic Digital Invitation - 3D Wax Seal Envelope + Falling Petals)
  "the-digital-yes-wedding": DigitalYesLayout,
  "7": DigitalYesLayout,
  "digital-yes": DigitalYesLayout,

  // 2. Royal Khmer (Cambodian Traditional Wedding - Golden Palace Gate + 8 Steps + Kbach)
  "royal-khmer-wedding": RoyalKhmerLayout,
  "1": RoyalKhmerLayout,
  "royal-khmer": RoyalKhmerLayout,

  // 3. Emerald Luxe (Luxury Modern Evening Wedding - Velvet Curtain + 3D Card Flip)
  "emerald-canva-luxe-wedding": EmeraldLuxeLayout,
  "emerald_royal_luxe": EmeraldLuxeLayout,
  "emerald-royal-luxe": EmeraldLuxeLayout,
  "emerald royal luxe": EmeraldLuxeLayout,
  "emerald-luxe-wedding": EmeraldLuxeLayout,
  "2": EmeraldLuxeLayout,
  "emerald-luxe": EmeraldLuxeLayout,

  // 4. WithJoy Modern App Portal (Sticky Glassmorphism Nav + Love Story Timeline + Lightbox Gallery)
  "withjoy-modern-portal": WithJoyPortalLayout,
  "3": WithJoyPortalLayout,

  // 5. Bliss & Bone High-Fashion Editorial (Vogue Magazine Spread + Asymmetrical Gallery + Slide-out RSVP Drawer)
  "bliss-editorial-wedding": BlissEditorialLayout,
  "4": BlissEditorialLayout,

  // 6. Canva Golden Khmer Luxury (Traditional Kbach Frames + Golden Card)
  "khmer-golden-canva-inspired-wedding": CanvaKhmerWeddingTemplate,
  "5": CanvaKhmerWeddingTemplate,

  // ── Admin Studio presetId-based mappings ──
  // These match the THEME_PRESETS.id values used in AdminTemplateEditPage.jsx
  "EMERALD_GREEN": EmeraldLuxeLayout,
  "RUBY_RED": RoyalKhmerLayout,
  "ROYAL_KHMER": RoyalKhmerLayout,
  "GOLD_LUXURY": DigitalYesLayout,
  "CHAMPAGNE": CanvaKhmerWeddingTemplate,
  "KHMER_GOLDEN": CanvaKhmerWeddingTemplate,
  // GARDEN_ROYAL intentionally omitted — renders through default TemplateExperience engine
};

// Alias for backward compatibility
export const TEMPLATE_UI_REGISTRY = templateRegistry;

// Export safe fallback layout
export { DefaultTemplateLayout };

/**
 * Resolves the dedicated UI component for a given template.
 * Checks slug, code, templateCode, templateId, id, and variant.
 * Returns null if no custom layout is mapped, allowing fallback to default layout engine.
 */
export function getDedicatedTemplateComponent(tpl, variant, useFallback = false) {
  if (tpl?.code === "garden-royal-khmer-wedding" || tpl?.slug === "garden-royal-khmer-wedding" || variant === "garden-royal-khmer-wedding") {
    return useFallback ? DefaultTemplateLayout : null;
  }

  // Ordered most-specific first. Exact slug/code and the Admin presetId win over
  // `variant` and the raw numeric DB id, because dynamic templates reuse the
  // backend's auto-increment id — which collides with the static "1"–"7" keys.
  const keysToCheck = [
    tpl?.slug,
    tpl?.code,
    tpl?.templateCode,
    // Admin-created templates carry a presetId (e.g. EMERALD_GREEN, RUBY_RED)
    tpl?.presetId,
    tpl?.design?.presetId,
    tpl?.design?.theme,
    variant,
    tpl?.variant,
    tpl?.templateId,
    tpl?.id ? String(tpl.id) : null,
  ].filter(Boolean);

  for (const key of keysToCheck) {
    if (templateRegistry[key]) {
      return templateRegistry[key];
    }
  }

  return useFallback ? DefaultTemplateLayout : null;
}

export default templateRegistry;
