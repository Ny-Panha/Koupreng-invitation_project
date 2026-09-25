/**
 * Template Form Flow Configuration
 * 
 * Maps template IDs / preset IDs to their customized form section order
 * and contextual labels so the builder on the left flows synchronously
 * with the visual layout in the Live Preview on the right.
 */

export const DEFAULT_SECTION_ORDER = [
    "cover",
    "invitation",
    "couplePhoto",
    "countdown",
    "schedule",
    "venue",
    "family",
    "gallery",
    "story",
    "dressCode",
    "party",
    "faq",
    "khqr",
    "closing",
    "languageMode",
];

export const TEMPLATE_FORM_FLOWS = {
    // Khmer Celestial (Flagship Editorial Layout)
    // 1. Cover (Gate & Hero Title/Couple)
    // 2. Family (Together with our families / Parents)
    // 3. Invitation (With joy and honor / Portrait Photo / Message)
    // 4. Schedule (The wedding programme)
    // 5. Countdown (Save the date / Countdown)
    // 6. Venue (The celebration venue)
    // 7. Gallery (Photo memories)
    // 8. DressCode (Ceremonial palette)
    // 9. Party (Wedding Party)
    // 10. Faq (Details / Notes)
    // 11. Khqr (KHQR & gifts)
    // 12. Closing (Thank You & Apology)
    // 13. LanguageMode
    "khmer-celestial": {
        sectionOrder: [
            "cover",
            "family",
            "invitation",
            "schedule",
            "countdown",
            "venue",
            "gallery",
            "dressCode",
            "party",
            "faq",
            "khqr",
            "closing",
            "languageMode",
        ],
        labels: {
            coverSection: "ក្របទំព័រដើម (Celestial Cover & Hero)",
            coverImage: "រូបភាពក្របមុខ (Cover Photo)",
            coverSectionDesc: "ព័ត៌មានលេចធ្លោលើក្របបើក និងទំព័រដើម (Hero)",
            familySection: "មាតាបិតាទាំងសងខាង (Together with our families)",
            invitationSection: "សារលិខិតអញ្ជើញ & រូបថតធៀបការ (The Invitation)",
            invitationImage: "រូបថតទី១ — ប្តី/ប្រពន្ធ (Portrait Photo #1)",
            scheduleSection: "កម្មវិធីមង្គលការ (Wedding Programme)",
            countdownSection: "រាប់ថយក្រោយដល់ថ្ងៃមង្គល (Save The Date)",
            venueSection: "ទីតាំងប្រារព្ធពិធី (Celebration Venue)",
            gallerySection: "វិចិត្រសាលរូបថត (Photo Memories)",
            dressCodeSection: "សម្លៀកបំពាក់ (Ceremonial Palette)",
            partySection: "ក្រុមអម & មនុស្សជាទីស្រឡាញ់ (Wedding Party)",
            faqSection: "ព័ត៌មានលម្អិត & សំណួរ (Details & Notes)",
            khqrSection: "KHQR ផ្ញើរចំណងដៃ (Gift & KHQR)",
            closingSection: "សារថ្លែងអំណរគុណ (Thank You & Apology)",
        },
        hints: {
            coverImage: "បង្ហាញលើក្របទំព័រដើម / Hero (Front Cover)",
        },
        placePhotoInInvitation: true,
    },
};

/**
 * Resolves form flow and label overrides for any given templateId or template object.
 * Returns default configuration if no bespoke flow is registered.
 */
export function getTemplateFormFlow(templateIdOrTpl) {
    const rawKey = typeof templateIdOrTpl === "string"
        ? templateIdOrTpl
        : (templateIdOrTpl?.code || templateIdOrTpl?.slug || templateIdOrTpl?.presetId || templateIdOrTpl?.templateId || templateIdOrTpl?.id);

    const key = String(rawKey || "").trim().toLowerCase();

    let matched = TEMPLATE_FORM_FLOWS[key];
    if (!matched) {
        if (key.includes("celestial")) {
            matched = TEMPLATE_FORM_FLOWS["khmer-celestial"];
        }
    }

    if (matched) {
        return {
            sectionOrder: matched.sectionOrder || DEFAULT_SECTION_ORDER,
            labels: matched.labels || {},
            hints: matched.hints || {},
            placePhotoInInvitation: Boolean(matched.placePhotoInInvitation),
        };
    }

    return {
        sectionOrder: DEFAULT_SECTION_ORDER,
        labels: {},
        hints: {},
        placePhotoInInvitation: false,
    };
}

