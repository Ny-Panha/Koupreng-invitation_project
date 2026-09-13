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

export function getTemplateById(id) {
    const rawId = String(id || "").trim();
    const mappedCode = DB_TEMPLATE_ID_MAP[rawId];
    const normalizedId = normalizeTemplateId(mappedCode || rawId);
    return TEMPLATES.find((template) =>
        template.id === normalizedId ||
        template.code === normalizedId ||
        template.slug === normalizedId ||
        String(template.id) === rawId
    ) || KEPT_TEMPLATE;
}

export function isTemplatePremium() {
    return false;
}
