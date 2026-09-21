const DEFAULT_STATE = {
    templateId: "garden-royal-khmer-wedding",
    language: "KH",
    title: "", // Changed from "សួនរាជហង្សខ្មែរ"
    subtitle: "", // Changed from "សូមគោរពអញ្ជើញ"
    hideCoupleNameOnCover: false,
    eventDateText: "", // Changed from "ថ្ងៃពុធ ២៨ មករា ២០២៦"
    eventDate: "", // Changed from "2026-01-28"
    eventTime: "", // Changed from "17:00"
    venueName: "", // Changed from "The Premier Center Sen Sok"
    venueAddress: "", // Changed from "អគារ A, សែនសុខ, ភ្នំពេញ"
    googleMapUrl: "",
    hostName: "", // Changed from "វណ្ណដា"
    partnerName: "", // Changed from "ស្រីពេជ្រ"
    groomName: "", // Changed from "វណ្ណដា"
    brideName: "", // Changed from "ស្រីពេជ្រ"
    guestName: "", // Changed from "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា"
    messageTitle: "", // Changed from "ដំណឹងអាពាហ៍ពិពាហ៍"
    messageText: "", // Changed from DEFAULT_INVITATION_TEXT
    schedule: [],
    // Styling
    openingStyle: "khmer-royal",
    frontColor: "#f9af59",
    bottomColor: "#B08E4F",
    coverImage: null, // Changed from "/facebook/all/03-card/cover-card.jpg"
    backgroundImage: null, // Changed from "/facebook/all/03-card/cover-card.jpg"
    sketchMapImage: null,
    // Gallery (5-10 photos)
    photos: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, url: null })), // Initialized with null URLs
    // Love Story (ដំណើរនៃក្ដីស្រឡាញ់ - no limit)
    showStory: true,
    storyChapters: [], // Changed from default story
    // Family & Wedding Party (គ្រួសារ និង ក្រុមអម)
    showParty: true,
    party: [], // Changed from DEFAULT_PARTY
    // Thank you
    thankYouTitle: "", // Changed from "សារថ្លែងអំណរគុណ"
    thankYouText: "", // Changed from DEFAULT_THANK_YOU_TEXT
    // KHQR
    khqrDollar: { qrUrl: null, bankName: "KHQR Dollar ($)", accountNumber: "" },
    khqrRiel: { qrUrl: null, bankName: "KHQR Riel (៛)", accountNumber: "" },
    // Music
    musicTrackId: "", // Changed from "waiting-day"
    musicUrl: "", // Changed from MUSIC_TRACKS[0]?.url || ""
    // Extra
    languageMode: "KH",
    visibility: "PUBLIC",
};

export default function InvitationForm({ invitation }) {
    // ... existing code ...

    // Initial state parser
    const [form, setForm] = useState(() => {
        let customParsed = {};
        if (invitation) {
            try {
                if (invitation.designJson) {
                    const parsed = typeof invitation.designJson === "string" ? JSON.parse(invitation.designJson) : invitation.designJson;
                    customParsed = { ...customParsed, ...parsed };
                }
                if (invitation.contentJson) {
                    const parsed = typeof invitation.contentJson === "string" ? JSON.parse(invitation.contentJson) : invitation.contentJson;
                    customParsed = { ...customParsed, ...parsed };
                }
            } catch {
                // ignore JSON error
            }
        }

        const activeTplId = invitation?.templateId || customParsed.templateId || searchParams.get("templateId") || DEFAULT_STATE.templateId;
        const tpl = getTemplateById(activeTplId);
        const preset = getTemplatePreset(tpl) || {};

        // Determine if the draft is empty or if it contains placeholder data that needs to be cleared.
        // This is crucial for new drafts created without explicit user input or when switching templates.
        const isDefaultGold = (customParsed.frontColor === "#f9af59" && customParsed.bottomColor === "#B08E4F") ||
                              (invitation?.frontColor === "#f9af59" && invitation?.bottomColor === "#B08E4F");
        const isDefaultOpening = (customParsed.openingStyle === "khmer-royal" || invitation?.openingStyle === "khmer-royal");
        const isDefaultCover = !customParsed.coverImage || customParsed.coverImage.includes("/facebook/all/03-card/cover-card.jpg");
        const isDefaultTitle = !customParsed.title || customParsed.title === "សួនរាជហង្សខ្មែរ" || customParsed.title === "Garden Royal Khmer Wedding" || customParsed.title.includes("W01");
        const isDefaultCouple = (!customParsed.groomName || customParsed.groomName === "វណ្ណដា") && (!customParsed.brideName || customParsed.brideName === "ស្រីពេជ្រ");
        // Prioritize user_uploaded_image (invitation.coverUrl) first
        const uploadedCover = invitation?.coverUrl || invitation?.media?.coverImage?.fileUrl || null; // Use null for empty

        const frontColor = (!isDefaultGold && (customParsed.frontColor || invitation?.frontColor)) || preset.frontColor || DEFAULT_STATE.frontColor;
        const bottomColor = (!isDefaultGold && (customParsed.bottomColor || invitation?.bottomColor)) || preset.bottomColor || DEFAULT_STATE.bottomColor;
        const openingStyle = (!isDefaultOpening && (customParsed.openingStyle || invitation?.openingStyle)) || preset.openingStyle || DEFAULT_STATE.openingStyle;
        const coverImage = uploadedCover || ((!isDefaultCover && customParsed.coverImage) ? customParsed.coverImage : (preset.coverImage || DEFAULT_STATE.coverImage)); // Fallback to preset or default if no uploaded cover and not a default placeholder
        const title = (!isDefaultTitle && (invitation?.title || customParsed.title)) ? (invitation?.title || customParsed.title) : (preset.title || DEFAULT_STATE.title);
        const groomName = (!isDefaultCouple && (invitation?.groomName || customParsed.groomName)) ? (invitation?.groomName || customParsed.groomName) : (preset.groom || DEFAULT_STATE.groomName);
        const brideName = (!isDefaultCouple && (invitation?.brideName || customParsed.brideName)) ? (invitation?.brideName || customParsed.brideName) : (preset.bride || DEFAULT_STATE.brideName);
        const venueName = (invitation?.venueName || customParsed.venueName) && (invitation?.venueName !== "The Premier Center Sen Sok" && customParsed.venueName !== "The Premier Center Sen Sok")
            ? (invitation?.venueName || customParsed.venueName)
            : (preset.venueName || DEFAULT_STATE.venueName);
        const venueAddress = (invitation?.venueAddress || customParsed.venueAddress) && (invitation?.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ" && customParsed.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ")
            ? (invitation?.venueAddress || customParsed.venueAddress)
            : (preset.venueAddress || DEFAULT_STATE.venueAddress);
        const isEmptyDraft = Boolean(
            invitation
            && String(invitation.status || "").toUpperCase() === "DRAFT"
            && !invitation.title
            && !invitation.groomName
            && !invitation.brideName
            && !invitation.eventDate
            && !invitation.storyText
            && !customParsed.title
            && !customParsed.groomName
            && !customParsed.brideName
            && !customParsed.eventDate
            && !uploadedCover // Also check if a cover image has been uploaded
        );

        const rawDate = invitation?.eventDate || customParsed.eventDate || DEFAULT_STATE.eventDate;
        const rawTime = invitation?.eventTime ? invitation.eventTime.slice(0, 5) : (customParsed.eventTime || tpl?.receptionTime || DEFAULT_STATE.eventTime);

        return {
            ...DEFAULT_STATE,
            ...customParsed,
            templateId: activeTplId,
            presetId: customParsed.presetId || invitation?.presetId || preset.presetId || tpl?.presetId || "",
            openingStyle,
            frontColor,
            bottomColor,
            title,
            groomName,
            brideName,
            hostName: groomName,
            partnerName: brideName,
            eventDate: toStandardDate(rawDate),
            eventDateText: customParsed.eventDateText || tpl?.dateText || DEFAULT_STATE.eventDateText,
            eventTime: toStandardTime(rawTime),
            venueName,
            venueAddress,
            googleMapUrl: invitation?.googleMapUrl || invitation?.event?.mapLink || customParsed.googleMapUrl || preset.mapQuery || "",
            sketchMapImage: invitation?.sketchMapImage || customParsed.sketchMapImage || DEFAULT_STATE.sketchMapImage || null,
            coverImage, // Ensure this uses the calculated coverImage
            messageText: (invitation?.storyText && invitation.storyText !== DEFAULT_INVITATION_TEXT)
                ? invitation.storyText
                : ((customParsed.messageText && customParsed.messageText !== DEFAULT_INVITATION_TEXT)
                    ? customParsed.messageText
                    : (preset.messageText || DEFAULT_STATE.messageText)),
            schedule: (customParsed.schedule && customParsed.schedule.length > 0) ? customParsed.schedule : (preset.schedule?.length ? preset.schedule : (tpl?.schedule || [])),
            languageMode: invitation?.languageMode || customParsed.languageMode || "KH",
            visibility: invitation?.visibility || "PUBLIC",
            photos: (() => {
                let list = (customParsed.photos && customParsed.photos.length > 0 && customParsed.photos.some(p => p.url))
                    ? [...customParsed.photos]
                    : (preset.photos && preset.photos.length > 0
                        ? preset.photos
                        : (tpl?.galleryImages && tpl.galleryImages.length > 0
                            ? tpl.galleryImages.map((url, i) => ({ id: `p${i + 1}`, url: typeof url === "string" ? url : url.src }))
                            : [...DEFAULT_STATE.photos]));
                while (list.length < 5) {
                    list.push({ id: `p${list.length + 1}`, url: null }); // Use null for empty photo slots
                }
                if (list.length > 10) {
                    list = list.slice(0, 10);
                }
                return list;
            })(),
            storyChapters: (customParsed.storyChapters && customParsed.storyChapters.length > 0)
                ? customParsed.storyChapters
                : DEFAULT_STATE.storyChapters, // Use DEFAULT_STATE.storyChapters which is now empty
            party: (customParsed.party && customParsed.party.length > 0)
                ? customParsed.party
                : DEFAULT_STATE.party, // Use DEFAULT_STATE.party which is now empty
            // This block ensures an auto-created draft with no real data starts completely blank.
            // It overrides any fallback values from template presets if it's truly an empty draft.
            ...(isEmptyDraft ? {
                title: "",
                subtitle: "",
                eventDateText: "",
                eventDate: "",
                eventTime: "",
                venueName: "",
                venueAddress: "",
                hostName: "",
                partnerName: "",
                groomName: "",
                brideName: "",
                guestName: "",
                messageTitle: "",
                messageText: "",
                coverImage: null, // Ensure coverImage is null for empty drafts
                backgroundImage: null,
                photos: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, url: null })),
                storyChapters: [],
                party: [],
                musicTrackId: "",
                musicUrl: "",
                khqrDollar: { qrUrl: null, bankName: "KHQR Dollar ($)", accountNumber: "" },
                khqrRiel: { qrUrl: null, bankName: "KHQR Riel (៛)", accountNumber: "" },
                thankYouTitle: "",
                thankYouText: "",
            } : {}),
        };
    });

    // ... rest of the code ...
