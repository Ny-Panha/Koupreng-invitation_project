import musicWaitingDay from "../../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import musicInstrumental from "../../../assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";

export const KEEP_TEMPLATE_CODE = "garden-royal-khmer-wedding";
export const ROYAL_KHMER_TEMPLATE_CODE = "royal-khmer-wedding";
export const KHMER_GOLDEN_CANVA_INSPIRED_CODE = "khmer-golden-canva-inspired-wedding";
export const COVER_KHMER_GOLDEN_CODE = "cover-khmer-golden-wedding";
export const THE_DIGITAL_YES_TEMPLATE_CODE = "the-digital-yes-wedding";
export const WITHJOY_PORTAL_CODE = "withjoy-modern-portal";
export const BLISS_EDITORIAL_CODE = "bliss-editorial-wedding";

export const TEMPLATE_CATEGORIES = [
    { id: "all", label: "ទាំងអស់", labelEn: "All" },
    { id: "ancient", label: "បុរាណ", labelEn: "Ancient" },
    { id: "modern", label: "ទំនើប", labelEn: "Modern" },
];

const STORY_IMAGE_CLASSES = ["tpl-gallery-a", "tpl-gallery-b", "tpl-gallery-c", "tpl-gallery-d"];

function getSourceMedia(cardFolder = "03-card") {
    const prefix = cardFolder.slice(0, 2);
    return Array.from(
        { length: 4 },
        (_, index) => `/facebook/all/${cardFolder}/${prefix}-${String(index + 1).padStart(2, "0")}.jpg`
    );
}

function withTemplateMedia(template, cardFolder = "03-card") {
    const primaryImages = getSourceMedia(cardFolder);
    const coverImage = `/facebook/all/${cardFolder}/cover-card.jpg`;
    const fallbackMedia = [coverImage, ...primaryImages];

    return {
        ...template,
        mainImage: template.mainImage || coverImage,
        phoneCoverImage: template.phoneCoverImage || coverImage,
        slideshowImages: template.slideshowImages || fallbackMedia,
        storyImages: template.storyImages || fallbackMedia.slice(0, 4).map((src, imageIndex) => ({
            src,
            alt: `${template.style} ${imageIndex + 1}`,
            className: STORY_IMAGE_CLASSES[imageIndex % STORY_IMAGE_CLASSES.length],
        })),
        storyCards: template.storyCards || [
            {
                id: `${template.id}-${cardFolder}`,
                title: template.style,
                images: fallbackMedia,
            },
        ],
    };
}

const KEPT_TEMPLATE = withTemplateMedia({
    id: KEEP_TEMPLATE_CODE,
    name: "សួនរាជហង្សខ្មែរ",
    style: "Garden Royal Khmer Wedding",
    category: "ancient",
    popular: true,
    image: "/facebook/all/03-card/cover-card.jpg",
    mainImage: "/facebook/all/03-card/cover-card.jpg",
    phoneCoverImage: "/facebook/all/03-card/cover-card.jpg",
    music: { url: musicWaitingDay },
    groom: "វណ្ណដា",
    bride: "ស្រីពេជ្រ",
    dateText: "ថ្ងៃពុធ ២៨ មករា ២០២៦",
    targetDate: "2026-11-28T17:00:00+07:00",
    ceremonyTime: "០៧:០០",
    receptionTime: "១៧:០០",
    venueName: "ដឹប្រីមៀលែនដ៍ សែនសុខ",
    venueAddress: "អគារ A ភ្នំពេញ",
    mapQuery: "The Premier Land Sen Sok Phnom Penh Cambodia",
    bg: "#DFF4FF",
    paper: "#FFFDF7",
    color: "#D6A63C",
    accent: "#2D7FA6",
    dark: "#253F57",
    label: "GARDEN ROYAL KHMER",
    description: "គំរូសន្លឹកការរចនាបថសួនផ្កា និងទឹកពណ៌បែបព្រះរាជវង្សខ្មែរ ពណ៌ខៀវស្រាល បៃតង និងមាស។",
}, "03-card");

const ROYAL_KHMER_TEMPLATE = withTemplateMedia({
    id: ROYAL_KHMER_TEMPLATE_CODE,
    name: "រាជហង្សខ្មែរ",
    style: "Royal Khmer Wedding",
    category: "ancient",
    popular: true,
    image: "/facebook/all/01-card/cover-card.jpg",
    mainImage: "/facebook/all/01-card/cover-card.jpg",
    phoneCoverImage: "/facebook/all/01-card/cover-card.jpg",
    music: { url: musicInstrumental },
    groom: "សុខា",
    bride: "បុប្ផា",
    dateText: "ថ្ងៃពុធ ២៨ មករា ២០២៦",
    targetDate: "2026-11-28T17:00:00+07:00",
    ceremonyTime: "០៧:០០",
    receptionTime: "១៧:០០",
    venueName: "សណ្ឋាគារ សុខា ភ្នំពេញ",
    venueAddress: "ផ្លូវកែវចិន្តា, ជ្រោយចង្វារ, ភ្នំពេញ",
    mapQuery: "Sokha Phnom Penh Hotel",
    bg: "#FFF9F0",
    paper: "#FFFDF7",
    color: "#C49A45",
    accent: "#8B1E2D",
    dark: "#4A151C",
    label: "ROYAL KHMER",
    description: "គំរូសន្លឹកការអាពាហ៍ពិពាហ៍បែបប្រពៃណីខ្មែរពិតៗ ជាមួយឈុតសម្លៀកបំពាក់បុរាណប្រណិត និងស៊ុមរចនាបថរាជវង្ស។",
}, "01-card");

const KHMER_GOLDEN_CANVA_INSPIRED_TEMPLATE = withTemplateMedia({
    id: KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    name: "មាសប្រណិតអាពាហ៍ពិពាហ៍ខ្មែរ",
    style: "Khmer Golden Elegant Wedding",
    category: "modern",
    popular: true,
    image: "/invitations/khmer-golden-canva-inspired/cover-card.svg",
    mainImage: "/invitations/khmer-golden-canva-inspired/cover-card.svg",
    phoneCoverImage: "/invitations/khmer-golden-canva-inspired/cover-card.svg",
    slideshowImages: [
        "/invitations/khmer-golden-canva-inspired/cover-card.svg",
        "/facebook/all/05-card/05-01.jpg",
        "/facebook/all/05-card/05-02.jpg",
        "/facebook/all/05-card/05-03.jpg",
        "/facebook/all/05-card/05-04.jpg",
        "/facebook/all/05-card/05-05.jpg",
        "/facebook/all/05-card/05-06.jpg",
    ],
    storyImages: [
        "/facebook/all/05-card/05-01.jpg",
        "/facebook/all/05-card/05-02.jpg",
        "/facebook/all/05-card/05-03.jpg",
        "/facebook/all/05-card/05-04.jpg",
    ],
    storyCards: [
        {
            id: "khmer-golden-canva-inspired-card",
            title: "Khmer Golden Elegant Wedding",
            images: [
                "/invitations/khmer-golden-canva-inspired/cover-card.svg",
                "/facebook/all/05-card/05-01.jpg",
                "/facebook/all/05-card/05-02.jpg",
                "/facebook/all/05-card/05-03.jpg",
                "/facebook/all/05-card/05-04.jpg",
                "/facebook/all/05-card/05-05.jpg",
                "/facebook/all/05-card/05-06.jpg",
            ],
        },
    ],
    music: { url: musicWaitingDay },
    groom: "វណ្ណដា",
    bride: "ស្រីពេជ្រ",
    dateText: "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦",
    targetDate: "2026-11-28T17:00:00+07:00",
    ceremonyTime: "០៧:០០",
    receptionTime: "១៧:០០",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "អគារ A, សែនសុខ, ភ្នំពេញ",
    mapQuery: "The Premier Center Sen Sok Phnom Penh Cambodia",
    bg: "#F8F0E3",
    paper: "#FFFDF7",
    color: "#B88A2E",
    accent: "#C99A3D",
    dark: "#3A2514",
    label: "KHMER GOLDEN",
    description: "គំរូសន្លឹកការអាពាហ៍ពិពាហ៍ខ្មែរបែបមាសលើក្រដាស ivory មានស៊ុមលម្អ និងអារម្មណ៍ប្រណិតស្នេហា។",
    message:
        "ដោយក្តីសោមនស្សរីករាយ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នក និងក្រុមគ្រួសារ មកចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។",
    storyText:
        "ពីការជួបគ្នាដំបូង រហូតដល់ថ្ងៃសន្យារួមដំណើរជីវិត យើងបានរៀនថាសេចក្តីស្រឡាញ់ពិតប្រាកដ គឺកើតពីការគោរព ការយកចិត្តទុកដាក់ និងស្នាមញញឹមរៀងរាល់ថ្ងៃ។",
    gift: [
        {
            id: "aba-sample",
            bank: "ABA Bank",
            account: "VVVVV & PPPPP",
            number: "000 000 000",
            note: "Wedding Gift",
            qrValue: "ABA Bank | VVVVV & PPPPP | 000 000 000 | Wedding Gift",
        },
    ],
    schedule: [
        { id: "procession", time: "០៧:០០", title: "ពិធីហែជំនូន", titleEn: "Procession", description: "ស្វាគមន៍ក្រុមគ្រួសារទាំងសងខាង និងភ្ញៀវកិត្តិយស។" },
        { id: "fruit", time: "០៧:៣០", title: "ពិធីរៀបរាប់ផ្លែឈើ", titleEn: "Fruit Ceremony", description: "រៀបចំជំនូនតាមប្រពៃណីខ្មែរ។" },
        { id: "rings", time: "០៨:១៥", title: "ពិធីបំពាក់ចិញ្ចៀន", titleEn: "Ring Ceremony", description: "ពេលវេលាសន្យាស្នេហ៍របស់គូស្វាមីភរិយា។" },
        { id: "blessing", time: "០៨:៣០", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", titleEn: "Blessing Ceremony", description: "ទទួលពរជ័យ និងសុភមង្គលសម្រាប់ជីវិតថ្មី។" },
        { id: "hair", time: "០៩:៣០", title: "ពិធីកាត់សក់ បង្កក់សិរី", titleEn: "Hair Cutting", description: "ពិធីប្រពៃណីដ៏ពិសិដ្ឋសម្រាប់គូស្វាមីភរិយា។" },
        { id: "palms", time: "១០:២៥", title: "ពិធីសំពះផ្ទឹម", titleEn: "Sompeas Ptem", description: "គោរពដល់មាតាបិតា និងចាស់ទុំទាំងសងខាង។" },
        { id: "lunch", time: "១២:០០", title: "អញ្ជើញភ្ញៀវពិសាអាហារថ្ងៃត្រង់", titleEn: "Lunch", description: "អាហារថ្ងៃត្រង់ជាមួយក្រុមគ្រួសារ និងភ្ញៀវកិត្តិយស។" },
        { id: "welcome", time: "១៧:០០", title: "ទទួលបដិសណ្ឋារកិច្ចភ្ញៀវកិត្តិយស", titleEn: "Guest Welcome", description: "ចុះឈ្មោះ ថតរូប និងទទួលភ្ញៀវ។" },
        { id: "reception", time: "១៨:០០", title: "ពិធីជប់លៀងមង្គលការ", titleEn: "Reception Dinner", description: "អាហារពេលល្ងាច តន្ត្រី និងពាក្យជូនពរ។" },
    ],
});

const COVER_KHMER_GOLDEN_TEMPLATE = withTemplateMedia({
    id: COVER_KHMER_GOLDEN_CODE,
    name: "សំបុត្រអញ្ជើញមាសខ្មែរ",
    style: "Cover Khmer Golden Wedding",
    category: "modern",
    popular: true,
    image: "/templates/cover-khmer-golden-wedding/cover-preview.svg",
    mainImage: "/templates/cover-khmer-golden-wedding/cover-bg.svg",
    phoneCoverImage: "/templates/cover-khmer-golden-wedding/cover-bg.svg",
    slideshowImages: [
        "/templates/cover-khmer-golden-wedding/cover-bg.svg",
        "/facebook/all/03-card/03-01.jpg",
        "/facebook/all/03-card/03-02.jpg",
        "/facebook/all/03-card/03-03.jpg",
    ],
    storyImages: [
        "/facebook/all/03-card/03-01.jpg",
        "/facebook/all/03-card/03-02.jpg",
        "/facebook/all/03-card/03-03.jpg",
        "/facebook/all/03-card/03-04.jpg",
    ],
    storyCards: [
        {
            id: "cover-khmer-golden-card",
            title: "Cover Khmer Golden Wedding",
            images: [
                "/templates/cover-khmer-golden-wedding/cover-bg.svg",
                "/facebook/all/03-card/03-01.jpg",
                "/facebook/all/03-card/03-02.jpg",
                "/facebook/all/03-card/03-03.jpg",
                "/facebook/all/03-card/03-04.jpg",
            ],
        },
    ],
    music: { url: musicInstrumental },
    groom: "វណ្ណដា",
    bride: "ស្រីពេជ្រ",
    guestName: "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា",
    dateText: "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦",
    targetDate: "2026-11-28T17:00:00+07:00",
    ceremonyTime: "០៧:០០",
    receptionTime: "១៧:០០",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "អគារ A, សែនសុខ, ភ្នំពេញ",
    mapQuery: "The Premier Center Sen Sok Phnom Penh Cambodia",
    bg: "#FFF7E8",
    paper: "#FFFDF7",
    color: "#C89B3C",
    accent: "#8A5A20",
    dark: "#3B220F",
    label: "COVER KHMER GOLDEN",
    description: "គំរូសំបុត្រអញ្ជើញបែបខ្មែរមាស ប្រណិត មានស៊ុមលម្អ ផ្កា និងទំព័របើកសំបុត្របែបអនិមេសិន។",
});

export const THE_DIGITAL_YES_TEMPLATE = withTemplateMedia({
    id: THE_DIGITAL_YES_TEMPLATE_CODE,
    name: "មន្តស្នេហ៍ស្រោមសំបុត្រ 3D (The Digital Yes)",
    style: "The Digital Yes Magical 3D Envelope Wedding",
    category: "modern",
    popular: true,
    image: "/templates/canva-luxury/emerald-luxury.jpg",
    mainImage: "/templates/canva-luxury/emerald-luxury.jpg",
    phoneCoverImage: "/templates/canva-luxury/emerald-luxury.jpg",
    music: { url: musicInstrumental },
    groom: "វណ្ណដា",
    groomEn: "Vanda Chea",
    bride: "ស្រីពេជ្រ",
    brideEn: "Sreypich Sok",
    dateText: "ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦",
    dateTextEn: "Saturday, November 28, 2026",
    targetDate: "2026-11-28T17:00:00+07:00",
    ceremonyTime: "០៧:០០",
    receptionTime: "១៧:០០",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "អគារ A, សែនសុខ, ភ្នំពេញ",
    mapQuery: "The Premier Center Sen Sok Phnom Penh Cambodia",
    bg: "#0d261e",
    paper: "#FFFDF7",
    color: "#D4AF37",
    accent: "#13382c",
    dark: "#081c15",
    label: "THE DIGITAL YES",
    description: "គំរូធៀបការបែប Modern Luxury ដែលមានចលនាបើកស្រោមសំបុត្រ 3D ត្រាបោះពុម្ព Wax Seal ផ្កាធ្លាក់ និងចាក់ភ្លេងស្វ័យប្រវត្តិ។",
    design: {
        openingStyle: "envelope-3d",
        primaryColor: "#13382c",
        accentColor: "#D4AF37",
    },
}, "03-card");

export const EMERALD_CANVA_LUXE_CODE = "emerald-canva-luxe-wedding";

export const EMERALD_CANVA_LUXE_TEMPLATE = withTemplateMedia({
    id: EMERALD_CANVA_LUXE_CODE,
    name: "សិរីមង្គលត្បូងមរកត (Emerald Royal Luxe)",
    style: "Emerald Royal Luxe 3D Wedding",
    category: "modern",
    popular: true,
    image: "/templates/canva-luxury/emerald-luxury.jpg",
    mainImage: "/templates/canva-luxury/emerald-luxury.jpg",
    phoneCoverImage: "/templates/canva-luxury/emerald-luxury.jpg",
    music: { url: musicInstrumental },
    groom: "វណ្ណដា",
    groomEn: "Vanda Chea",
    bride: "ស្រីពេជ្រ",
    brideEn: "Sreypich Sok",
    dateText: "ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦",
    dateTextEn: "Saturday, November 28, 2026",
    targetDate: "2026-11-28T17:00:00+07:00",
    ceremonyTime: "០៧:០០",
    receptionTime: "១៧:០០",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "អគារ A, សែនសុខ, ភ្នំពេញ",
    mapQuery: "The Premier Center Sen Sok Phnom Penh Cambodia",
    bg: "#0d261e",
    paper: "#FFFDF7",
    color: "#D4AF37",
    accent: "#13382c",
    dark: "#081c15",
    label: "EMERALD ROYAL LUXE",
    description: "គំរូធៀបការបែប Modern Emerald & Gold Luxury ដែលមានចលនាបើកវាំងននល្ខោន ផ្កាអ័រគីដេ និងពន្លឺមាសចែងចាំង។",
    design: {
        openingStyle: "curtain",
        primaryColor: "#13382c",
        accentColor: "#D4AF37",
    },
}, "03-card");

export const WITHJOY_PORTAL_TEMPLATE = withTemplateMedia({
    id: WITHJOY_PORTAL_CODE,
    name: "អាពាហ៍ពិពាហ៍ទំនើប WithJoy (Modern App Portal)",
    style: "Modern WithJoy App Portal Wedding",
    category: "modern",
    popular: true,
    image: "/facebook/all/03-card/cover-card.jpg",
    mainImage: "/facebook/all/03-card/cover-card.jpg",
    phoneCoverImage: "/facebook/all/03-card/cover-card.jpg",
    music: { url: musicWaitingDay },
    groom: "វណ្ណដា",
    bride: "ស្រីពេជ្រ",
    dateText: "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦",
    targetDate: "2026-11-28T17:00:00+07:00",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "អគារ A, សែនសុខ, ភ្នំពេញ",
    label: "WITHJOY PORTAL",
    description: "គំរូធៀបការបែប Interactive Web App ទំនើប មាន Navigation Bar, Love Story, Schedule, Lightbox Gallery និង RSVP។",
}, "03-card");

export const BLISS_EDITORIAL_TEMPLATE = withTemplateMedia({
    id: BLISS_EDITORIAL_CODE,
    name: "ទស្សនាវដ្តីស្នេហា (Bliss & Bone Editorial)",
    style: "Bliss & Bone High-Fashion Editorial",
    category: "modern",
    popular: true,
    image: "/facebook/all/03-card/03-01.jpg",
    mainImage: "/facebook/all/03-card/03-01.jpg",
    phoneCoverImage: "/facebook/all/03-card/03-01.jpg",
    music: { url: musicInstrumental },
    groom: "វណ្ណដា",
    groomEn: "Vanda Chea",
    bride: "ស្រីពេជ្រ",
    brideEn: "Sreypich Sok",
    dateText: "ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦",
    dateTextEn: "Saturday, November 28, 2026",
    targetDate: "2026-11-28T17:00:00+07:00",
    venueName: "The Premier Center Sen Sok",
    venueAddress: "ផ្លូវ 1003, សែនសុខ, ភ្នំពេញ",
    label: "BLISS EDITORIAL",
    description: "គំរូធៀបការបែប High-Fashion Vogue Editorial អក្សរ Serif ថ្លៃថ្នូរ Asymmetrical Gallery និង Slide-out RSVP Drawer។",
}, "03-card");

export const TEMPLATES = [
    THE_DIGITAL_YES_TEMPLATE,
    EMERALD_CANVA_LUXE_TEMPLATE,
    WITHJOY_PORTAL_TEMPLATE,
    BLISS_EDITORIAL_TEMPLATE,
    KEPT_TEMPLATE,
    ROYAL_KHMER_TEMPLATE,
    COVER_KHMER_GOLDEN_TEMPLATE,
    KHMER_GOLDEN_CANVA_INSPIRED_TEMPLATE,
];

export const FACEBOOK_TEMPLATE_CARDS = TEMPLATES;

export function normalizeTemplateId(id) {
    return id || KEEP_TEMPLATE_CODE;
}

const DB_TEMPLATE_ID_MAP = {
    "1": ROYAL_KHMER_TEMPLATE_CODE,
    "2": EMERALD_CANVA_LUXE_CODE,
    "3": WITHJOY_PORTAL_CODE,
    "4": BLISS_EDITORIAL_CODE,
    "5": KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    "7": THE_DIGITAL_YES_TEMPLATE_CODE,
};

let dynamicTemplates = [];

/**
 * Bumped every time registerDynamicTemplates() replaces the catalog.
 *
 * The catalog is fetched asynchronously, so a component's first render resolves
 * template IDs against an empty registry (and would silently fall back to
 * KEPT_TEMPLATE). Components depend on this counter to recompute those lookups
 * once the real catalog lands.
 */
let catalogVersion = 0;

export function getCatalogVersion() {
    return catalogVersion;
}

/**
 * Maps Admin Studio THEME_PRESETS.id → frontend-user template slug (variant).
 * This ensures dynamic templates render through the correct dedicated layout
 * component and theme variant (CSS class, colors, opening gate style, etc.).
 */
const PRESET_TO_VARIANT = {
    EMERALD_GREEN: "emerald-canva-luxe-wedding",
    RUBY_RED: "royal-khmer-wedding",
    ROYAL_KHMER: "royal-khmer-wedding",
    GOLD_LUXURY: "the-digital-yes-wedding",
    CHAMPAGNE: "cover-khmer-golden-wedding",
    KHMER_GOLDEN: "khmer-golden-canva-inspired-wedding",
    GARDEN_ROYAL: "garden-royal-khmer-wedding",
};

export function registerDynamicTemplates(catalogList) {
    if (!Array.isArray(catalogList)) return;
    dynamicTemplates = catalogList.map((item) => {
        let parsedConfig = {};
        if (item.description && typeof item.description === "string") {
            try {
                if (item.description.trim().startsWith("{")) {
                    parsedConfig = JSON.parse(item.description);
                }
            } catch {
                // ignore json error
            }
        }

        const presetId = parsedConfig.presetId || parsedConfig.theme || "";
        const resolvedVariant = PRESET_TO_VARIANT[presetId] || "";

        const cover = item.thumbnailUrl || parsedConfig.coverImage || "/facebook/all/03-card/cover-card.jpg";
        const primaryColor = parsedConfig.primaryColor || item.primaryColor || "#D4AF37";
        const secondaryColor = parsedConfig.secondaryColor || item.secondaryColor || "#F3E5AB";
        const openingStyle = parsedConfig.openingStyle || parsedConfig.gateStyle || (
            String(item.code || item.name || "").toLowerCase().includes("curtain") || String(item.code || item.name || "").toLowerCase().includes("emerald")
                ? "curtain"
                : (String(item.code || item.name || "").toLowerCase().includes("envelope") || String(item.code || item.name || "").toLowerCase().includes("yes")
                    ? "envelope-3d"
                    : "khmer-royal")
        );

        return {
            ...item,
            ...parsedConfig,
            id: String(item.id),
            backendId: item.id,
            code: item.code || String(item.id),
            slug: item.slug || item.code || resolvedVariant || String(item.id),
            name: item.name || parsedConfig.invitationTitle || "គំរូធៀបការ",
            title: item.name || parsedConfig.invitationTitle || "គំរូធៀបការ",
            style: item.name || "Wedding Template",
            category: item.category || "wedding",
            image: cover,
            mainImage: cover,
            phoneCoverImage: cover,
            thumbnailUrl: cover,
            price: item.price ?? 0,
            currency: item.currency || "USD",
            premium: Boolean(item.premium || item.isPremium),
            isPremium: Boolean(item.premium || item.isPremium),
            // Admin preset & variant — critical for layout component resolution
            presetId,
            variant: resolvedVariant || undefined,
            openingStyle,
            gateStyle: openingStyle,
            frontColor: primaryColor,
            bottomColor: secondaryColor,
            color: primaryColor,
            accent: secondaryColor,
            primaryColor,
            secondaryColor,
            dark: parsedConfig.backgroundColor || "#1A1A1A",
            bg: parsedConfig.backgroundColor || "#FFFDF7",
            music: parsedConfig.bgMusicUrl ? { url: parsedConfig.bgMusicUrl } : { url: musicWaitingDay },
            groom: parsedConfig.groomName || "វណ្ណដា",
            bride: parsedConfig.brideName || "ស្រីពេជ្រ",
            groomName: parsedConfig.groomName || "វណ្ណដា",
            brideName: parsedConfig.brideName || "ស្រីពេជ្រ",
            groomFather: parsedConfig.groomFather || "",
            groomMother: parsedConfig.groomMother || "",
            brideFather: parsedConfig.brideFather || "",
            brideMother: parsedConfig.brideMother || "",
            groomParents: [parsedConfig.groomFather, parsedConfig.groomMother].filter(Boolean).join(" និង "),
            brideParents: [parsedConfig.brideFather, parsedConfig.brideMother].filter(Boolean).join(" និង "),
            dateText: parsedConfig.weddingDate || "ថ្ងៃពុធ ២៨ មករា ២០២៦",
            targetDate: parsedConfig.weddingDate ? `${parsedConfig.weddingDate}T17:00:00+07:00` : "2026-11-28T17:00:00+07:00",
            receptionTime: parsedConfig.weddingTime || "17:00",
            ceremonyTime: "07:00",
            venueName: parsedConfig.venueName || "The Premier Center Sen Sok",
            venueAddress: parsedConfig.venueAddress || "អគារ A, សែនសុខ, ភ្នំពេញ",
            mapQuery: parsedConfig.googleMapUrl || "",
            googleMapUrl: parsedConfig.googleMapUrl || "",
            message: parsedConfig.blessingMessage || "សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី...",
            messageText: parsedConfig.blessingMessage || "សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី...",
            description: (parsedConfig.blessingMessage || item.description?.trim().startsWith("{") ? (parsedConfig.blessingMessage || item.name) : item.description) || "គំរូធៀបការ",
            schedule: parsedConfig.schedule || [],
            dressColors: parsedConfig.dressColors || [],
            design: {
                // Admin JSON first, then normalized values — so an empty or null
                // property in the stored config cannot clobber what we computed.
                ...parsedConfig,
                openingStyle,
                gateStyle: openingStyle,
                coverImage: cover,
                frontColor: primaryColor,
                bottomColor: secondaryColor,
                primaryColor,
                secondaryColor,
                presetId: presetId || parsedConfig.presetId || "",
                theme: presetId || parsedConfig.theme || "",
            },
        };
    });

    // Tell subscribers their cached template lookups are stale.
    catalogVersion++;
}

export function getTemplateById(id) {
    const rawId = String(id || "").trim();
    if (!rawId) return KEPT_TEMPLATE;

    // 1. Check dynamic templates from backend/admin first
    const dyn = dynamicTemplates.find((template) =>
        String(template.id) === rawId ||
        String(template.backendId) === rawId ||
        template.code === rawId ||
        template.slug === rawId
    );
    if (dyn) return dyn;

    // 2. Check static templates
    const mappedCode = DB_TEMPLATE_ID_MAP[rawId];
    const normalizedId = normalizeTemplateId(mappedCode || rawId);
    return TEMPLATES.find((template) =>
        template.id === normalizedId ||
        template.code === normalizedId ||
        template.slug === normalizedId ||
        String(template.id) === rawId
    ) || KEPT_TEMPLATE;
}

export function getAllTemplates() {
    const seen = new Set();
    const result = [];
    for (const t of dynamicTemplates) {
        const idKey = String(t.id || t.code);
        if (!seen.has(idKey)) {
            seen.add(idKey);
            result.push(t);
        }
    }
    for (const t of TEMPLATES) {
        const idKey = String(t.id);
        const codeKey = String(t.code || "");
        if (!seen.has(idKey) && (!codeKey || !seen.has(codeKey))) {
            seen.add(idKey);
            result.push(t);
        }
    }
    return result;
}

export function getTemplatePreset(tpl) {
    if (!tpl) return null;

    const tplId = String(tpl.id || tpl.code || "").toLowerCase();
    const presetCandidate = tpl.presetId || tpl.design?.presetId || tpl.design?.theme || "";

    // Opening Style
    let openingStyle = tpl.openingStyle || tpl.design?.openingStyle || tpl.gateStyle;
    if (!openingStyle) {
        if (presetCandidate === "EMERALD_GREEN" || tplId.includes("emerald") || tplId.includes("curtain")) {
            openingStyle = "curtain";
        } else if (presetCandidate === "GOLD_LUXURY" || tplId === "7" || tplId.includes("digital-yes") || tplId.includes("envelope")) {
            openingStyle = "envelope-3d";
        } else {
            openingStyle = "khmer-royal";
        }
    }

    // Front & Bottom Colors
    let frontColor = tpl.frontColor || tpl.design?.primaryColor || tpl.primaryColor || tpl.design?.frontColor || tpl.color;
    let bottomColor = tpl.bottomColor || tpl.design?.accentColor || tpl.design?.secondaryColor || tpl.secondaryColor || tpl.design?.bottomColor || tpl.accent;

    if (!frontColor) {
        if (presetCandidate === "EMERALD_GREEN" || tplId.includes("emerald")) {
            frontColor = "#0F4C3A";
        } else if (presetCandidate === "RUBY_RED" || presetCandidate === "ROYAL_KHMER" || tplId === "1" || tplId.includes("royal-khmer")) {
            frontColor = "#8B1E2D";
        } else if (presetCandidate === "GOLD_LUXURY" || tplId === "7" || tplId.includes("digital-yes")) {
            frontColor = "#D4AF37";
        } else if (presetCandidate === "CHAMPAGNE") {
            frontColor = "#C5A880";
        } else if (tplId === "4" || tplId.includes("bliss")) {
            frontColor = "#111827";
        } else {
            frontColor = "#f9af59";
        }
    }

    if (!bottomColor) {
        if (presetCandidate === "EMERALD_GREEN" || tplId.includes("emerald")) {
            bottomColor = "#2D8A6E";
        } else if (presetCandidate === "RUBY_RED" || presetCandidate === "ROYAL_KHMER" || tplId === "1" || tplId.includes("royal-khmer")) {
            bottomColor = "#D4AF37";
        } else if (presetCandidate === "GOLD_LUXURY" || tplId === "7" || tplId.includes("digital-yes")) {
            bottomColor = "#F3E5AB";
        } else if (presetCandidate === "CHAMPAGNE") {
            bottomColor = "#E8D8C8";
        } else if (tplId === "4" || tplId.includes("bliss")) {
            bottomColor = "#4B5563";
        } else {
            bottomColor = "#B08E4F";
        }
    }

    const coverImage = tpl.phoneCoverImage || tpl.mainImage || tpl.thumbnailUrl || tpl.image || "/facebook/all/03-card/cover-card.jpg";
    const musicUrl = typeof tpl.music === "string" ? tpl.music : (tpl.music?.url || tpl.bgMusicUrl || "");

    const photos = tpl.galleryImages?.length
        ? tpl.galleryImages.map((img, i) => ({ id: `p${i + 1}`, url: typeof img === "string" ? img : (img.src || img.url) }))
        : (tpl.storyImages?.length
            ? tpl.storyImages.map((img, i) => ({ id: `p${i + 1}`, url: typeof img === "string" ? img : (img.src || img.url) }))
            : null);

    return {
        templateId: String(tpl.id || tpl.code || ""),
        presetId: presetCandidate,
        variant: tpl.variant || "",
        name: tpl.name || tpl.style || "គំរូធៀបការ",
        title: tpl.name || tpl.title || "គំរូធៀបការ",
        openingStyle,
        frontColor,
        bottomColor,
        coverImage,
        musicUrl,
        photos,
        groom: tpl.groom || "វណ្ណដា",
        bride: tpl.bride || "ស្រីពេជ្រ",
        venueName: tpl.venueName || "The Premier Center Sen Sok",
        venueAddress: tpl.venueAddress || "អគារ A, សែនសុខ, ភ្នំពេញ",
        messageText: tpl.message || tpl.description || "",
        schedule: tpl.schedule || [],
        dressColors: tpl.dressColors || tpl.design?.dressColors || [],
        dressCode: tpl.dressCode || (tpl.dressColors?.length ? { colors: tpl.dressColors } : null),
    };
}

export function isTemplatePremium() {
    return false;
}
