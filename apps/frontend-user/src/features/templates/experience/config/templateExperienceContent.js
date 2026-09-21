/**
 * templateExperienceContent — builds the full content model for the shared
 * TemplateExperience engine.
 *
 * Strategy (mirrors royalContent.js):
 *  - Always prefer REAL template values from `tpl` when present.
 *  - Fill story / schedule / party / gift / faq with tasteful DEMO content.
 *    This module powers the /templates/* demo pages only. It never writes
 *    fake data back into a user's real invitation.
 *
 * Per-variant copy (message, couple intros, dress note, badge text) lets each
 * style read with its own personality while keeping identical structure.
 */

import {
    COVER_KHMER_GOLDEN_CODE,
    getVariantTheme,
    KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    ROYAL_KHMER_TEMPLATE_CODE,
} from "./templateExperienceThemes";
import {
    normalizeOpeningCopy,
    normalizeOpeningDesign,
    resolveOpeningVideo,
} from "./openingConfig";
import defaultMusicUrl from "@/assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";

const DEMO_GALLERY = [
    { src: "/facebook/all/01-card/01-01.jpg", span: "tall" },
    { src: "/facebook/all/02-card/02-01.jpg", span: "wide" },
    { src: "/facebook/all/01-card/01-02.jpg", span: "small" },
    { src: "/facebook/all/03-card/03-01.jpg", span: "small" },
    { src: "/facebook/all/02-card/02-03.jpg", span: "tall" },
    { src: "/facebook/all/01-card/01-03.jpg", span: "small" },
    { src: "/facebook/all/03-card/03-02.jpg", span: "wide" },
    { src: "/facebook/all/02-card/02-05.jpg", span: "small" },
    { src: "/facebook/all/01-card/01-04.jpg", span: "small" },
    { src: "/facebook/all/03-card/03-04.jpg", span: "tall" },
];

const DEMO_STORY = [
    {
        id: "met",
        kicker: "ជំពូកទី ១",
        title: "ថ្ងៃដែលយើងជួបគ្នា",
        date: "មករា ២០២១",
        text: "ក្នុងពិធីបុណ្យមួយនៅទីក្រុង ភ្នែកទាំងពីរបានជួបគ្នាដំបូង ដោយមិននឹកស្មានថានឹងក្លាយជារឿងរ៉ាវមួយជីវិត។",
        image: "/facebook/all/01-card/01-01.jpg",
    },
    {
        id: "first-date",
        kicker: "ជំពូកទី ២",
        title: "ការណាត់ជួបលើកដំបូង",
        date: "មីនា ២០២១",
        text: "កាហ្វេមួយពែង ការសន្ទនាមួយយប់ ហើយយើងដឹងថា នេះគឺជាមនុស្សដែលយើងចង់នៅជាមួយ។",
        image: "/facebook/all/02-card/02-02.jpg",
    },
    {
        id: "proposal",
        kicker: "ជំពូកទី ៣",
        title: "ថ្ងៃសុំដៃ",
        date: "ធ្នូ ២០២៥",
        text: "នៅក្រោមពន្លឺថ្ងៃលិច ជាមួយចិត្តញាប់ញ័រ សំណួរមួយត្រូវបានសួរ ហើយចម្លើយគឺ បាទ/ចាស។",
        image: "/facebook/all/03-card/03-01.jpg",
    },
    {
        id: "wedding",
        kicker: "ជំពូកចុងក្រោយ",
        title: "ថ្ងៃមង្គលការ",
        date: "ធ្នូ ២០២៦",
        text: "ថ្ងៃនេះ យើងសូមអញ្ជើញអ្នកមកចែករំលែកនូវការចាប់ផ្ដើមនៃជីវិតថ្មីរបស់យើងទាំងពីរ។",
        image: "/facebook/all/01-card/01-03.jpg",
    },
];

const DEMO_PARTY = [
    { id: "best-man", role: "កូនកំលោះកិត្តិយស", roleEn: "Best Man", name: "សុខ វិបុល", image: "/facebook/all/02-card/02-04.jpg" },
    { id: "maid", role: "កូនក្រមុំកិត្តិយស", roleEn: "Maid of Honor", name: "ចាន់ ស្រីនិច", image: "/facebook/all/02-card/02-06.jpg" },
    { id: "family", role: "គ្រួសារ", roleEn: "Family", name: "ឪពុកម្ដាយទាំងសងខាង", image: "/facebook/all/03-card/03-03.jpg" },
    { id: "friends", role: "មិត្តភក្ដិ", roleEn: "Friends", name: "ក្រុមមិត្តជិតស្និទ្ធ", image: "/facebook/all/03-card/03-05.jpg" },
];

const DEMO_GIFT = [
    { id: "aba", bank: "ABA Bank", account: "ឈ្មោះម្ចាស់គណនី (គំរូ)", number: "000 000 000", note: "ABA PAY", qrImage: "" },
];

const KHMER_GOLDEN_DEMO_SCHEDULE = [
    { id: "procession", time: "០៧:០០", title: "ពិធីហែជំនូន", titleEn: "Procession", description: "ស្វាគមន៍ក្រុមគ្រួសារទាំងសងខាង និងភ្ញៀវកិត្តិយស។" },
    { id: "fruit", time: "០៧:៣០", title: "ពិធីរៀបរាប់ផ្លែឈើ", titleEn: "Fruit Ceremony", description: "រៀបចំជំនូនតាមប្រពៃណីខ្មែរ។" },
    { id: "rings", time: "០៨:១៥", title: "ពិធីបំពាក់ចិញ្ចៀន", titleEn: "Ring Ceremony", description: "ពេលវេលាសន្យាស្នេហ៍របស់គូស្វាមីភរិយា។" },
    { id: "blessing", time: "០៨:៣០", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", titleEn: "Blessing Ceremony", description: "ទទួលពរជ័យ និងសុភមង្គលសម្រាប់ជីវិតថ្មី។" },
    { id: "hair", time: "០៩:៣០", title: "ពិធីកាត់សក់ បង្កក់សិរី", titleEn: "Hair Cutting", description: "ពិធីប្រពៃណីដ៏ពិសិដ្ឋសម្រាប់គូស្វាមីភរិយា។" },
    { id: "palms", time: "១០:២៥", title: "ពិធីសំពះផ្ទឹម", titleEn: "Sompeas Ptem", description: "គោរពដល់មាតាបិតា និងចាស់ទុំទាំងសងខាង។" },
    { id: "lunch", time: "១២:០០", title: "អញ្ជើញភ្ញៀវពិសាអាហារថ្ងៃត្រង់", titleEn: "Lunch", description: "អាហារថ្ងៃត្រង់ជាមួយក្រុមគ្រួសារ និងភ្ញៀវកិត្តិយស។" },
    { id: "welcome", time: "១៧:០០", title: "ទទួលបដិសណ្ឋារកិច្ចភ្ញៀវកិត្តិយស", titleEn: "Guest Welcome", description: "ចុះឈ្មោះ ថតរូប និងទទួលភ្ញៀវ។" },
    { id: "reception", time: "១៨:០០", title: "ពិធីជប់លៀងមង្គលការ", titleEn: "Reception Dinner", description: "អាហារពេលល្ងាច តន្ត្រី និងពាក្យជូនពរ។" },
];

const DEMO_WISH =
    "សូមឱ្យសេចក្ដីស្រឡាញ់របស់យើងកាន់តែរីកចម្រើន និងពោរពេញដោយសុភមង្គល។ យើងខ្ញុំរីករាយទទួលពាក្យជូនពរពីលោកអ្នកក្នុងថ្ងៃដ៏មានន័យនេះ។";

const DEMO_FAQ = [
    {
        id: "faq-parking",
        q: "តើមានចំណតរថយន្ត និងម៉ូតូដែរឬទេ?",
        a: "បាទ/ចាស មានចំណតរថយន្ត និងម៉ូតូធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់នៅទីតាំងកម្មវិធី។",
    },
    {
        id: "faq-kids",
        q: "តើអាចនាំកុមារតូចៗមកចូលរួមបានទេ?",
        a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗ និងក្រុមគ្រួសារទាំងអស់ក្នុងការចូលរួមពិធីមង្គលការ។",
    },
    {
        id: "faq-time",
        q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?",
        a: "ពិធីសិរីមង្គលពេលព្រឹកចាប់ផ្ដើមពីម៉ោង ០៧:០០ ព្រឹក ហើយពិធីជប់លៀងពេលល្ងាចចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។",
    },
];

/**
 * Single-template copy. The experience engine still accepts a variant arg, but
 * routing now resolves every template/demo alias to this kept template.
 */
const VARIANT_COPY = {
    "garden-royal-khmer-wedding": {
        message:
            "ដោយក្តីសោមនស្សរីករាយ និងសេចក្ដីស្រឡាញ់ដ៏ជ្រាលជ្រៅ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកមកចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងទាំងពីរ។",
        groomIntro: "កូនកំលោះដ៏សុភាពរាបសា ស្រឡាញ់គ្រួសារ និងត្រៀមចាប់ផ្តើមជីវិតថ្មីដោយក្តីទទួលខុសត្រូវ។",
        brideIntro: "កូនក្រមុំដ៏ទន់ភ្លន់ មានស្នាមញញឹមកក់ក្ដៅ និងសេចក្តីស្រឡាញ់ចំពោះគ្រួសារ។",
        dressName: "ខៀវផ្កា បៃតងស្លឹក ស និងមាស",
        dressStyle: "ខ្មែរផ្លូវការ / Garden formal",
        dressNote: "ពណ៌ខៀវ ស បៃតងស្លឹក និងមាសស្រាល សមរម្យសម្រាប់បរិយាកាសសួនផ្កាផ្លូវការនិងរូបថតអនុស្សាវរីយ៍។",
    },
    [ROYAL_KHMER_TEMPLATE_CODE]: {
        message:
            "ដោយក្តីសោមនស្សរីករាយ និងកិត្តិយសដ៏ខ្ពង់ខ្ពស់ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកមកចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការប្រពៃណីបុរាណខ្មែររបស់យើងខ្ញុំ។",
        groomIntro: "កូនកំលោះសុភាពរាបសា មានចិត្តថ្លៃថ្នូរ ស្រឡាញ់ទំនៀមទម្លាប់ប្រពៃណីខ្មែរ។",
        brideIntro: "កូនក្រមុំទន់ភ្លន់ ស្រស់សោភា មានស្នាមញញឹមកក់ក្ដៅ និងសេចក្តីស្រឡាញ់ចំពោះគ្រួសារ។",
        dressName: "ក្រហមទុំ មាស ស និងក្រហមចាស់",
        dressStyle: "ខ្មែរប្រពៃណីបុរាណ / Traditional Khmer Royal",
        dressNote: "ពណ៌ក្រហមទុំ មាស និងស សមរម្យបំផុតសម្រាប់បរិយាកាសអាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ។",
    },
    [KHMER_GOLDEN_CANVA_INSPIRED_CODE]: {
        message:
            "ដោយក្តីសោមនស្សរីករាយ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នក និងក្រុមគ្រួសារ មកចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។ វត្តមានរបស់លោកអ្នកគឺជាកិត្តិយសដ៏ខ្ពង់ខ្ពស់សម្រាប់គ្រួសារយើងខ្ញុំ។",
        groomIntro: "កូនកំលោះសុភាព មានចិត្តថ្លៃថ្នូរ និងស្រឡាញ់ការរួមដំណើរជីវិតដោយការគោរពគ្នាទៅវិញទៅមក។",
        brideIntro: "កូនក្រមុំមានស្នាមញញឹមទន់ភ្លន់ ចិត្តកក់ក្ដៅ និងសេចក្តីស្រឡាញ់ចំពោះគ្រួសារយ៉ាងជ្រាលជ្រៅ។",
        dressName: "Ivory មាស Champagne និងត្នោតខ្ចី",
        dressStyle: "Khmer formal / Golden evening elegant",
        dressNote: "សូមជ្រើសរើសពណ៌ស្រាលប្រណិតដូចជា ivory, champagne, មាស និងត្នោតខ្ចី ដើម្បីសមនឹងបរិយាកាសពិធីខ្មែរបែបមាស។",
        giftNote: "វត្តមាន និងពរជ័យរបស់លោកអ្នកមានន័យជាងអ្វីៗទាំងអស់។ សម្រាប់ភ្ញៀវដែលចង់ផ្ញើចំណងដៃ យើងបានរៀបចំព័ត៌មានគណនីគំរូខាងក្រោម។",
        footerThanks: "សូមអរគុណចំពោះវត្តមាន ក្ដីស្រឡាញ់ និងពរជ័យដ៏កក់ក្ដៅរបស់លោកអ្នក",
        footerThanksEn: "With love, gratitude, and golden memories",
        wishMessage:
            "សូមឱ្យថ្ងៃមង្គលនេះក្លាយជាការចាប់ផ្តើមដ៏ភ្លឺរលោង សម្រាប់ជីវិតគូពោរពេញដោយសេចក្តីស្រឡាញ់ ការគោរព និងសុភមង្គល។",
    },
    [COVER_KHMER_GOLDEN_CODE]: {
        message:
            "ដោយក្តីសោមនស្សរីករាយ និងកិត្តិយសដ៏ខ្ពង់ខ្ពស់ យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកមកចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។",
        groomIntro: "កូនកំលោះសុភាពរាបសា មានចិត្តថ្លៃថ្នូរ និងត្រៀមចាប់ផ្តើមជីវិតគូដោយក្តីគោរព។",
        brideIntro: "កូនក្រមុំទន់ភ្លន់ មានស្នាមញញឹមកក់ក្ដៅ និងសេចក្តីស្រឡាញ់ចំពោះគ្រួសារ។",
        dressName: "មាស ភ្លុក សាំប៉ាញ និងត្នោតចាស់",
        dressStyle: "Khmer formal / Golden wedding elegance",
        dressNote: "សូមជ្រើសរើសសម្លៀកបំពាក់ពណ៌ភ្លុក សាំប៉ាញ មាស ឬត្នោតចាស់ ដើម្បីសមនឹងបរិយាកាសសំបុត្រអញ្ជើញខ្មែរបែបមាសប្រណិត។",
        giftNote: "វត្តមាន និងពរជ័យរបស់លោកអ្នកជាកិត្តិយសដ៏ខ្ពង់ខ្ពស់សម្រាប់គ្រួសារយើងខ្ញុំ។",
        footerThanks: "សូមអរគុណចំពោះវត្តមាន និងពរជ័យដ៏កក់ក្ដៅរបស់លោកអ្នក",
        footerThanksEn: "With gratitude and golden memories",
        wishMessage:
            "សូមឱ្យពិធីមង្គលនេះពោរពេញដោយពន្លឺមាស សេចក្ដីស្រឡាញ់ និងសុភមង្គលសម្រាប់ជីវិតគូរបស់យើង។",
    },
};

const VARIANT_STORY = {
    [ROYAL_KHMER_TEMPLATE_CODE]: [
        {
            id: "royal-met",
            kicker: "ជំពូកទី ១",
            title: "ថ្ងៃដែលយើងជួបគ្នា",
            date: "មករា ២០២១",
            text: "ក្នុងពិធីបុណ្យមួយនៅទីក្រុង ភ្នែកទាំងពីរបានជួបគ្នាដំបូង ដោយមិននឹកស្មានថានឹងក្លាយជារឿងរ៉ាវមួយជីវិត។",
            image: "/facebook/all/01-card/01-01.jpg",
        },
        {
            id: "royal-first-date",
            kicker: "ជំពូកទី ២",
            title: "ការណាត់ជួបលើកដំបូង",
            date: "មីនា ២០២១",
            text: "កាហ្វេមួយពែង ការសន្ទនាមួយយប់ ហើយយើងដឹងថា នេះគឺជាមនុស្សដែលយើងចង់នៅជាមួយ។",
            image: "/facebook/all/01-card/01-02.jpg",
        },
        {
            id: "royal-proposal",
            kicker: "ជំពូកទី ៣",
            title: "ថ្ងៃសុំដៃ",
            date: "ធ្នូ ២០២៥",
            text: "នៅក្រោមពន្លឺថ្ងៃលិច ជាមួយចិត្តញាប់ញ័រ សំណួរមួយត្រូវបានសួរ ហើយចម្លើយគឺ បាទ/ចាស។",
            image: "/facebook/all/01-card/01-03.jpg",
        },
        {
            id: "royal-wedding",
            kicker: "ជំពូកចុងក្រោយ",
            title: "ថ្ងៃមង្គលការ",
            date: "ធ្នូ ២០២៦",
            text: "ថ្ងៃនេះ យើងសូមអញ្ជើញអ្នកមកចែករំលែកនូវការចាប់ផ្ដើមនៃជីវិតថ្មីរបស់យើងទាំងពីរ។",
            image: "/facebook/all/01-card/01-04.jpg",
        },
    ],
    [KHMER_GOLDEN_CANVA_INSPIRED_CODE]: [
        {
            id: "first-light",
            kicker: "OUR STORY",
            title: "ថ្ងៃដែលស្នេហាចាប់ផ្តើម",
            date: "២០២១",
            text: "ពីការជួបគ្នាដំបូង រហូតដល់ថ្ងៃសន្យារួមដំណើរជីវិត យើងបានរៀនថាសេចក្តីស្រឡាញ់ពិតប្រាកដ គឺកើតពីការគោរព ការយកចិត្តទុកដាក់ និងស្នាមញញឹមរៀងរាល់ថ្ងៃ។",
            image: "/facebook/all/05-card/05-01.jpg",
        },
        {
            id: "promise",
            kicker: "PROMISE",
            title: "ពាក្យសន្យាមួយជីវិត",
            date: "២០២៥",
            text: "ពាក្យសន្យារបស់យើងគឺរស់នៅជាមួយគ្នាដោយចិត្តស្មោះ តស៊ូជាមួយគ្នា និងថែរក្សាអនុស្សាវរីយ៍ល្អៗជារៀងរហូត។",
            image: "/facebook/all/05-card/05-02.jpg",
        },
        {
            id: "golden-day",
            kicker: "WEDDING DAY",
            title: "ថ្ងៃមាសរបស់យើង",
            date: "២៨ មករា ២០២៦",
            text: "ថ្ងៃនេះ យើងសូមអញ្ជើញលោកអ្នកមកចែករំលែកសុភមង្គល និងធ្វើជាសាក្សីដ៏មានតម្លៃក្នុងការចាប់ផ្តើមជីវិតថ្មីរបស់យើង។",
            image: "/facebook/all/05-card/05-03.jpg",
        },
    ],
    [COVER_KHMER_GOLDEN_CODE]: [
        {
            id: "golden-cover",
            kicker: "COVER KHMER",
            title: "ទំព័រអញ្ជើញមាសខ្មែរ",
            date: "២៨ មករា ២០២៦",
            text: "ពីសំបុត្របើកដំបូង រហូតដល់ពេលវេលាពិធី យើងសូមចែករំលែកសុភមង្គលជាមួយលោកអ្នកក្នុងថ្ងៃដ៏មានន័យនេះ។",
            image: "/templates/cover-khmer-golden-wedding/cover-bg.svg",
        },
        {
            id: "family-honor",
            kicker: "FAMILY",
            title: "កិត្តិយសគ្រួសារ",
            date: "ថ្ងៃមង្គល",
            text: "វត្តមានរបស់លោកអ្នកគឺជាកិត្តិយស និងពរជ័យដ៏សំខាន់សម្រាប់គ្រួសារទាំងសងខាង។",
            image: "/facebook/all/03-card/03-01.jpg",
        },
    ],
};

const DEFAULT_CONTENT_VARIANT = "garden-royal-khmer-wedding";

const GALLERY_SPANS = ["tall", "wide", "small", "small", "small"];

/**
 * Collect a template's OWN images (from its primary story card / folder) so the
 * gallery + story show only that card's photos — never a mix from other cards.
 * Returns null when the template carries no media, so callers fall back to demo.
 */
function getTemplateOwnImages(tpl) {
    const fromStoryCard = Array.isArray(tpl.storyCards) && tpl.storyCards[0]?.images?.length
        ? tpl.storyCards[0].images
        : null;
    const fromStoryImages = Array.isArray(tpl.storyImages) && tpl.storyImages.length
        ? tpl.storyImages.map((img) => (typeof img === "string" ? img : img.src)).filter(Boolean)
        : null;
    const images = fromStoryCard || fromStoryImages;
    if (!images || !images.length) return null;
    // De-duplicate while preserving order (cover image can repeat).
    return [...new Set(images)];
}

/** Build the gallery from the template's own images (no cross-card mixing). */
function buildGallery(tpl) {
    const own = getTemplateOwnImages(tpl);
    if (!own) return DEMO_GALLERY;
    return own.map((src, index) => ({ src, span: GALLERY_SPANS[index % GALLERY_SPANS.length] }));
}

/** Build the story timeline using the template's own images, demo copy intact. */
function buildStory(tpl, variant) {
    const own = getTemplateOwnImages(tpl);
    const story = VARIANT_STORY[variant] || DEMO_STORY;
    const storyWithTemplateText = tpl.storyText && story.length
        ? story.map((chapter, index) => (index === 0 ? { ...chapter, text: tpl.storyText } : chapter))
        : story;
    if (!own) return storyWithTemplateText;
    return storyWithTemplateText.map((chapter, index) => ({
        ...chapter,
        image: own[index % own.length],
    }));
}

function normalizeScheduleItems(schedule) {
    if (!Array.isArray(schedule)) return null;
    const items = schedule
        .map((s, index) => ({
            id: s.id || `schedule-${index}`,
            time: s.time || s.startTime || s.timeText || "",
            title: s.title || s.name || s.label || "",
            titleEn: s.titleEn || "",
            description: s.description || "",
            location: s.location || "",
        }))
        .filter((item) => item.time || item.title || item.description);
    return items.length ? items : null;
}

function buildSchedule(tpl, variant) {
    const templateSchedule = normalizeScheduleItems(tpl.schedule);
    if (templateSchedule) return templateSchedule;
    if (variant === KHMER_GOLDEN_CANVA_INSPIRED_CODE || variant === COVER_KHMER_GOLDEN_CODE) return KHMER_GOLDEN_DEMO_SCHEDULE;

    return [
        {
            id: "ceremony",
            time: tpl.ceremonyTime || "០៩:០០",
            title: "ពិធីសូត្រមន្ត",
            titleEn: "Ceremony",
            description: "ពិធីបុណ្យតាមប្រពៃណីខ្មែរ ស្វាគមន៍ភ្ញៀវកិត្តិយស។",
        },
        {
            id: "reception",
            time: tpl.receptionTime || "១៧:០០",
            title: "ពិធីជប់លៀង",
            titleEn: "Reception",
            description: "ស្វាគមន៍ភ្ញៀវ ការថតរូប និងពាក្យជូនពរ។",
        },
        {
            id: "dinner",
            time: "១៨:៣០",
            title: "អាហារពេលល្ងាច",
            titleEn: "Dinner",
            description: "ម្ហូបអាហារ និងតន្ត្រីរីករាយជាមួយគ្រួសារ និងមិត្តភក្ដិ។",
        },
        {
            id: "after",
            time: "២០:៣០",
            title: "ថតរូបជាមួយគ្រួសារ",
            titleEn: "Family Photo",
            description: "ពេលវេលាពិសេសសម្រាប់ការចងចាំ និងថតរូបអនុស្សាវរីយ៍។",
        },
    ];
}

function normalizeGiftAccounts(gift) {
    const accounts = Array.isArray(gift) ? gift : (gift ? [gift] : []);
    return accounts
        .map((g, index) => ({
            id: g.id || `gift-${index}`,
            bank: g.bank || "",
            account: g.account || g.accountName || g.name || "",
            number: g.number || g.accountNumber || g.phone || "",
            note: g.note || "",
            qrImage: g.qrImage || g.qr || g.qrUrl || "",
            qrValue: g.qrValue || g.qrPayload || "",
        }))
        .filter((account) => account.bank || account.account || account.number || account.qrImage || account.qrValue);
}

function buildGift(tpl) {
    const templateGift = normalizeGiftAccounts(tpl.gift);
    return templateGift.length ? templateGift : DEMO_GIFT;
}

function sanitizeDisplayText(value, maxLength = 80) {
    if (typeof value !== "string") return "";
    return Array.from(value)
        .filter((char) => {
            const code = char.charCodeAt(0);
            return code >= 32 && code !== 127 && char !== "<" && char !== ">";
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength);
}

const KHMER_HEX_NAMES = {
    "#0F4C3A": "បៃតងចាស់",
    "#2D8A6E": "បៃតងមរកត",
    "#D4AF37": "មាស",
    "#FFFDF7": "ស",
    "#8B1E2D": "ក្រហមទុំ",
    "#4A151C": "ក្រហមចាស់",
    "#C5A880": "សាំប៉ាញ",
    "#E8D8C8": "ភ្លុក",
    "#2D7FA6": "ខៀវផ្កា",
    "#6F9E2E": "បៃតងស្លឹក",
    "#D6A63C": "មាស",
    "#0F172A": "ខ្មៅប្រណិត",
    "#94A3B8": "ប្រផេះ",
    "#FFFFFF": "ស",
    "#F59E0B": "មាសខ្ចី",
    "#1A1A1A": "ខ្មៅ",
    "#F3E5AB": "សាំប៉ាញ",
    "#111827": "ខ្មៅប្រណិត",
    "#4B5563": "ប្រផេះ",
    "#E9D0A2": "សាំប៉ាញ",
    "#4B2F1A": "ត្នោត",
    "#C89B3C": "មាស",
    "#FFF8E7": "ភ្លុក",
    "#E8C98A": "សាំប៉ាញ",
    "#5C3418": "ត្នោតចាស់",
};

export function normalizeDressColors(rawColors = []) {
    if (!Array.isArray(rawColors) || !rawColors.length) return [];
    return rawColors.map((item) => {
        if (typeof item === "string") {
            const hex = item.trim();
            const upper = hex.toUpperCase();
            return {
                hex,
                name: KHMER_HEX_NAMES[upper] || hex,
            };
        }
        if (item && typeof item === "object") {
            const hex = item.hex || item.color || "#D4AF37";
            const upper = String(hex).toUpperCase();
            return {
                hex,
                name: item.name || KHMER_HEX_NAMES[upper] || hex,
            };
        }
        return { hex: "#D4AF37", name: "មាស" };
    });
}

/**
 * Build the full content model for a template experience.
 * @param {object} tpl resolved template object (from getTemplateById)
 * @param {string} variant variant key, resolved to the kept template variant.
 */
export function buildTemplateContent(tpl = {}, variant = DEFAULT_CONTENT_VARIANT) {
    const copy = VARIANT_COPY[variant] || VARIANT_COPY[DEFAULT_CONTENT_VARIANT];
    const theme = getVariantTheme(variant);

    // Host-authored content (from the wedding builder). When present, these
    // real values are preferred over the demo fallbacks below. The demo pages
    // pass no hostContent, so they keep showing tasteful sample data.
    const host = tpl.hostContent || {};
    const hostCouple = host.couple || {};
    const hostContact = host.contact || {};
    const hostEnabledSections = {
        ...(tpl.enabledSections || {}),
        ...(host.enabledSections || {}),
    };
    const hasHostContent = Boolean(tpl.hostContent) || Object.keys(host).length > 0;
    const nonEmpty = (arr) => (Array.isArray(arr) && arr.length ? arr : null);
    const nonBlank = (value) => (typeof value === "string" && value.trim() ? value.trim() : "");

    const venueName = hasHostContent ? nonBlank(host.venueName) : (tpl.venueName || "");
    const venueAddress = (hasHostContent ? nonBlank(host.venueAddress) : (tpl.venueAddress || "")).replace(/\n/g, ", ");
    const mapValue = nonBlank(
        hasHostContent
            ? (host.googleMapUrl || host.googleMapsUrl)
            : tpl.mapQuery
    );
    const mapValueIsUrl = /^https?:\/\//i.test(mapValue);
    const mapSearch = (mapValueIsUrl ? `${venueName} ${venueAddress}` : (mapValue || `${venueName} ${venueAddress}`))
        .replace(/\s+/g, " ")
        .trim();
    const hasMap = Boolean(mapValue || mapSearch);
    const mapLink = hasMap
        ? (mapValueIsUrl
            ? mapValue
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearch)}`)
        : null;
    const mapEmbedUrl = mapSearch
        ? `https://www.google.com/maps?q=${encodeURIComponent(mapSearch)}&output=embed`
        : null;

    const themeDressColors = theme?.dressColors || [
        { hex: "#8B1E2D", name: "ក្រហមទុំ" },
        { hex: "#D4AF37", name: "មាស" },
        { hex: "#FFFDF7", name: "ស" },
        { hex: "#4A151C", name: "ក្រហមចាស់" },
    ];

    const hostedDressCode = host.dressCode || {};
    const rawDressColors = hasHostContent
        ? ((Array.isArray(hostedDressCode.colors) && hostedDressCode.colors.length)
            ? hostedDressCode.colors
            : (Array.isArray(host.dressColors) && host.dressColors.length ? host.dressColors : null))
        : ((tpl.dressCode && Array.isArray(tpl.dressCode.colors) && tpl.dressCode.colors.length)
            ? tpl.dressCode.colors
            : (Array.isArray(tpl.dressColors) && tpl.dressColors.length)
                ? tpl.dressColors
                : (Array.isArray(tpl.design?.dressColors) && tpl.design.dressColors.length)
                    ? tpl.design.dressColors
                    : null);

    const resolvedColors = rawDressColors
        ? normalizeDressColors(rawDressColors)
        : (hasHostContent ? [] : normalizeDressColors(themeDressColors));

    const hasAdminColors = Boolean(rawDressColors && rawDressColors.length);
    const colorNames = resolvedColors.map((c) => c.name).filter(Boolean);
    const dynamicDressName = colorNames.length > 0 ? colorNames.join(" ") : "";
    const dynamicDressNote = dynamicDressName
        ? `សូមជ្រើសរើសសម្លៀកបំពាក់ពណ៌ ${dynamicDressName} ដើម្បីសមនឹងបរិយាកាសនៃពិធីមង្គលការ។`
        : "";

    const dressCodeSource = hasHostContent ? hostedDressCode : (tpl.dressCode || {});
    const dressCode = {
        name: dressCodeSource.name || (hasAdminColors && dynamicDressName ? dynamicDressName : (hasHostContent ? "" : copy.dressName || "ពណ៌សម្លៀកបំពាក់ (Dress Code)")),
        description: dressCodeSource.description || (hasAdminColors && dynamicDressNote ? dynamicDressNote : (hasHostContent ? "" : copy.dressNote || "សូមស្លៀកសម្លៀកបំពាក់ពណ៌តាមប្រធានបទ ឬពណ៌សមរម្យ")),
        style: dressCodeSource.style || (hasHostContent ? "" : (tpl.style && tpl.style !== "Wedding Template" ? tpl.style : copy.dressStyle) || "ខ្មែរប្រពៃណី / សម័យ"),
        colors: resolvedColors,
    };

    const coverImage = hasHostContent
        ? nonBlank(host.coverImage)
        : (nonBlank(tpl.customMainImage)
            || nonBlank(tpl.coverImage)
            || tpl.phoneCoverImage
            || tpl.mainImage
            || "/facebook/all/03-card/cover-card.jpg");

    const backgroundImage = nonBlank(tpl.backgroundImage)
        || nonBlank(host.backgroundImage)
        || "";

    // Map host story chapters onto the timeline shape, layering template images.
    const ownImages = getTemplateOwnImages(tpl);
    const hostGallery = nonEmpty(host.gallery)
        ? host.gallery
            .map((item, index) => ({
                src: typeof item === "string" ? item : item?.src || item?.preview || "",
                span: GALLERY_SPANS[index % GALLERY_SPANS.length],
            }))
            .filter((item) => item.src)
        : null;
    const hostedMedia = (hostGallery || []).map((item) => item.src).filter(Boolean);
    const hostedImageAt = (index = 0) => hostedMedia.length
        ? hostedMedia[index % hostedMedia.length]
        : coverImage;
    const hostStoryText = nonBlank(hasHostContent ? host.storyText : (host.storyText || tpl.storyText));
    const hostStoryTextEn = nonBlank(host.storyTextEn);
    const languageMode = host.languageMode || tpl.languageMode || "both";
    const combinedStoryText = languageMode === "en"
        ? (hostStoryTextEn || hostStoryText)
        : languageMode === "both" && hostStoryTextEn
            ? [hostStoryText, hostStoryTextEn].filter(Boolean).join("\n\n")
            : hostStoryText;
    const hostStoryChapters = nonEmpty(host.storyChapters);
    const hostStory = hostStoryChapters
        ? hostStoryChapters.map((c, index) => ({
            id: c.id || `chapter-${index}`,
            kicker: c.kicker || `រឿងរ៉ាវស្នេហា`,
            title: c.title || `ដំណើររបស់យើង`,
            date: c.date || "",
            text: c.text || "",
            image: c.image || (hasHostContent
                ? hostedImageAt(index)
                : (ownImages ? ownImages[index % ownImages.length] : undefined)),
        }))
        : combinedStoryText
            ? [{
                id: "story-text",
                kicker: "រឿងរ៉ាវស្នេហា",
                title: "ដំណើររបស់យើង",
                date: tpl.dateText || "",
                text: combinedStoryText,
                image: hasHostContent ? hostedImageAt() : (ownImages ? ownImages[0] : coverImage),
            }]
        : null;

    const hostSchedule = nonEmpty(host.schedule)
        ? host.schedule.map((s, index) => ({
            id: s.id || `sched-${index}`,
            time: s.time || "",
            title: s.title || "",
            titleEn: s.titleEn || "",
            description: s.description || "",
            location: s.location || "",
        }))
        : null;

    const hostParty = nonEmpty(host.party)
        ? host.party.map((m, index) => ({
            id: m.id || `member-${index}`,
            role: m.role || "",
            roleEn: m.roleEn || "",
            name: m.name || "",
            image: m.image || (hasHostContent
                ? hostedImageAt(index)
                : (ownImages ? ownImages[index % ownImages.length] : DEMO_PARTY[index % DEMO_PARTY.length].image)),
        }))
        : null;

    const hostGift = nonEmpty(host.gift)
        ? host.gift.map((g, index) => ({
            id: g.id || `gift-${index}`,
            bank: g.bank || "",
            account: g.account || g.accountName || g.name || "",
            number: g.number || g.accountNumber || "",
            note: g.note || "",
            qrImage: g.qrImage || g.qr || g.qrUrl || "",
            qrValue: g.qrValue || g.qrPayload || "",
        }))
        : null;

    const hostFaq = nonEmpty(host.faq)
        ? host.faq.map((f, index) => ({
            id: f.id || `faq-${index}`,
            q: f.q || "",
            a: f.a || "",
        }))
        : null;

    const contactTelegram = hostContact.telegram
        ? (/^https?:\/\//i.test(hostContact.telegram)
            ? hostContact.telegram
            : `https://t.me/${hostContact.telegram.replace(/^@/, "")}`)
        : (hasHostContent ? "" : "https://t.me/koupreng");
    const contactFacebook = hostContact.facebook
        ? (/^https?:\/\//i.test(hostContact.facebook)
            ? hostContact.facebook
            : `https://www.facebook.com/${hostContact.facebook.replace(/^@/, "")}`)
        : "";
    const design = normalizeOpeningDesign(tpl.design || {});
    const opening = normalizeOpeningCopy(tpl.opening || host.opening || {});
    const personalizedGuestName = sanitizeDisplayText(
        tpl.guestName ||
        tpl.invitedGuestName ||
        host.guestName ||
        host.invitedGuestName ||
        host.guest?.guestName ||
        host.guest?.name ||
        ""
    );
    const guestName = personalizedGuestName || opening.genericGuestText || "លោកអ្នក និងក្រុមគ្រួសារ";
    const effectiveGroom = tpl.groom || hostCouple.groom || "";
    const effectiveBride = tpl.bride || hostCouple.bride || "";
    const computedInitials = (effectiveGroom && effectiveBride)
        ? `${effectiveGroom.trim().charAt(0).toUpperCase()} & ${effectiveBride.trim().charAt(0).toUpperCase()}`
        : "";

    const monogramText = sanitizeDisplayText(
        tpl.monogramText ||
        tpl.shortName ||
        design.monogramText ||
        computedInitials,
        24
    ) || computedInitials || "N & P";

    return {
        variant,
        amp: theme.amp,
        badge: theme.badge,
        enabledSections: hostEnabledSections,
        monogramText,
        shortName: monogramText,
        guestName,
        isPersonalizedGuest: Boolean(personalizedGuestName),
        guestTable: host.guest?.tableName || host.guest?.tableNumber || tpl.guestTable || "",
        guestSeat: host.guest?.seatLabel || tpl.guestSeat || "",
        guestSeatsCount: host.guest?.seatCount || tpl.guestSeatsCount || null,
        guestGroup: host.guest?.guestGroup || tpl.guestGroup || "",
        groom: hasHostContent ? nonBlank(hostCouple.groom) : (tpl.groom || "វណ្ណដា"),
        bride: hasHostContent ? nonBlank(hostCouple.bride) : (tpl.bride || "ស្រីពេជ្រ"),
        groomEn: nonBlank(hasHostContent ? hostCouple.groomEn : tpl.groomEn),
        brideEn: nonBlank(hasHostContent ? hostCouple.brideEn : tpl.brideEn),
        groomNickname: nonBlank(hostCouple.groomNickname),
        brideNickname: nonBlank(hostCouple.brideNickname),
        eventTitle: nonBlank(host.eventTitle || tpl.eventTitle) || "WEDDING INVITATION",
        title: nonBlank(host.title || tpl.title) || "សិរីមង្គលអាពាហ៍ពិពាហ៍",
        subtitle: nonBlank(tpl.subtitle || host.subtitle),
        messageTitle: nonBlank(tpl.messageTitle || host.messageTitle),
        hideCoupleNameOnCover: Boolean(tpl.hideCoupleNameOnCover || host.hideCoupleNameOnCover),
        thankYouTitle: nonBlank(tpl.thankYouTitle || host.thankYouTitle),
        thankYouText: nonBlank(tpl.thankYouText || host.thankYouText || host.wishMessage),
        dateText: hasHostContent ? nonBlank(host.dateText) : (tpl.dateText || "ថ្ងៃពុធ ២៨ មករា ២០២៦"),
        dateTextEn: nonBlank(hasHostContent ? host.dateTextEn : tpl.dateTextEn),
        languageMode,
        eventTime: nonBlank(hasHostContent ? host.eventTime : (tpl.eventTime || tpl.ceremonyTime)),
        targetDate: hasHostContent ? nonBlank(host.targetDate) : (tpl.targetDate || "2026-11-28T17:00:00+07:00"),
        ceremonyTime: tpl.ceremonyTime || "០៧:០០",
        receptionTime: tpl.receptionTime || "១៧:០០",
        coverImage,
        portraitImage: coverImage,
        backgroundImage,
        message: hasHostContent
            ? nonBlank(host.message)
            : (nonBlank(tpl.message) || nonBlank(tpl.messageText) || nonBlank(tpl.blessingMessage) || copy.message),
        families: nonBlank(tpl.subtitle || host.subtitle) || "សូមគោរពអញ្ជើញ លោកអ្នក និងក្រុមគ្រួសារ",
        couple: {
            groomIntro: hostCouple.groomIntro || (hasHostContent ? "" : copy.groomIntro),
            brideIntro: hostCouple.brideIntro || (hasHostContent ? "" : copy.brideIntro),
            groomParents: hostCouple.groomParents || "",
            brideParents: hostCouple.brideParents || "",
        },
        venue: {
            name: venueName || (hasHostContent ? "" : tpl.venueName || "The Premier Center Sen Sok"),
            address: venueAddress || (hasHostContent ? "" : "អគារ A, សែនសុខ, ភ្នំពេញ"),
            mapLink,
            mapEmbedUrl,
            image: coverImage,
        },
        gallery: hasHostContent ? (hostGallery || []) : buildGallery(tpl),
        story: (hostStory && hostStory.length) ? hostStory : (hasHostContent ? [] : buildStory(tpl, variant)),
        schedule: (hostSchedule && hostSchedule.length) ? hostSchedule : (hasHostContent ? (host.schedule || []) : buildSchedule(tpl, variant)),
        party: (hostParty && hostParty.length) ? hostParty : (hasHostContent ? [] : DEMO_PARTY),
        dressCode,
        gift: (hostGift && hostGift.length) ? hostGift : (hasHostContent ? normalizeGiftAccounts(tpl.gift) : buildGift(tpl)),
        giftNote: tpl.giftNote || (hasHostContent ? "" : copy.giftNote || ""),
        wish: {
            message: nonBlank(host.wishMessage) || (hasHostContent ? "" : copy.wishMessage || DEMO_WISH),
        },
        faq: hostFaq && hostFaq.length ? hostFaq : (hasHostContent ? [] : DEMO_FAQ),
        contact: {
            telegram: contactTelegram,
            phone: hostContact.phone || (hasHostContent ? "" : "+855 12 345 678"),
            email: hostContact.email || "",
            facebook: contactFacebook,
        },
        footerThanks: copy.footerThanks,
        footerThanksEn: copy.footerThanksEn,
        design,
        opening,
        music: (typeof tpl.music === "string" && tpl.music)
            ? tpl.music
            : (tpl.music?.url || (hasHostContent ? "" : defaultMusicUrl)),
        openingVideo: resolveOpeningVideo({
            mediaVideo: tpl.openingVideo,
            configuredVideo: design.openingVideoUrl,
            enabled: design.openingVideoEnabled || Boolean(tpl.openingVideo),
        }),
        rsvpDeadline: nonBlank(host.rsvp?.deadline),
    };
}
