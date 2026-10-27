// Pages
export { default as BrowseTemplatesFeature } from "./pages/BrowseTemplatesFeature";
export { default as HostTemplateDemoFeature } from "./pages/HostTemplateDemoFeature";
export { default as TemplateDemoFeature } from "./pages/TemplateDemoFeature";
export { default as TemplatesFeature } from "./pages/TemplatesFeature";

// Components
export { default as TemplateGrid } from "./components/TemplateGrid";

// Experience Engine
export { default as TemplateExperience } from "./experience/TemplateExperience";

// Template Registry & Dedicated Layouts
export {
    templateRegistry,
    TEMPLATE_UI_REGISTRY,
    getDedicatedTemplateComponent,
    DefaultTemplateLayout,
} from "./registry/templateRegistry";
export { default as DigitalYesLayout } from "./layouts/DigitalYes/DigitalYesLayout";
export { default as RoyalKhmerLayout } from "./layouts/RoyalKhmer/RoyalKhmerLayout";
export { default as EmeraldLuxeLayout } from "./layouts/EmeraldLuxe/EmeraldLuxeLayout";
export { default as KhmerCelestialLayout } from "./layouts/KhmerCelestial/KhmerCelestialLayout";

// Shared Primitives
export {
    CountdownTimer,
    GalleryGrid,
    RsvpContainer,
    ScheduleList,
    FloatingAudioPlayer,
    RibbonOpening,
    CinematicVideoOpening,
    FloatingActionBar,
} from "./shared";

// Models
export { normalizeTemplateViewModel } from "./model/templateModel";

// API Services
export { templateCatalogService } from "./api/templateCatalogApi";
export { templateService } from "./api/templateService";

// Data & Constants
export {
    TEMPLATES,
    FACEBOOK_TEMPLATE_CARDS,
    KEEP_TEMPLATE_CODE,
    KHMER_CELESTIAL_TEMPLATE_CODE,
    KHMER_CELESTIAL_TEMPLATE,
    KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    COVER_KHMER_GOLDEN_CODE,
    TEMPLATE_CATEGORIES,
    getTemplateById,
    getAllTemplates,
    getTemplatePreset,
    registerDynamicTemplates,
    normalizeTemplateId,
    resolveNumericTemplateId,
    isTemplatePremium,
} from "./data/templatesData";

// Experience Config & Themes
export {
    TEMPLATE_VARIANTS,
    DEFAULT_VARIANT,
    TEMPLATE_VARIANT_BY_ID,
    VARIANT_ROUTE_ALIASES,
    resolveVariant,
    getVariantTheme,
} from "./experience/config/templateExperienceThemes";

export {
    DEFAULT_OPENING_DESIGN,
    DEFAULT_OPENING_COPY,
    normalizeOpeningCopy,
    normalizeOpeningDesign,
    resolveOpeningVideo,
} from "./experience/config/openingConfig";

export { buildTemplateContent } from "./experience/config/templateExperienceContent";
export { templateIcons } from "./experience/config/templateIcons";
