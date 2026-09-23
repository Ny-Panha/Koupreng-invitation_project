import { getTemplateById, resolveVariant } from "@/features/templates";


function displayDate(date) {
    if (!date) return "";
    try {
        return new Intl.DateTimeFormat("km-KH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(`${date}T00:00:00`));
    } catch {
        return date;
    }
}

function initials(couple = {}) {
    const groom = couple.groomNickname || couple.groom || "";
    const bride = couple.brideNickname || couple.bride || "";
    if (!groom && !bride) return "";
    const g = groom.trim().charAt(0).toUpperCase();
    const b = bride.trim().charAt(0).toUpperCase();
    return [g, b].filter(Boolean).join(" & ");
}

/**
 * draftToTemplate — merge a host's wedding draft (+ uploaded gallery) onto the
 * chosen base template, producing the `tpl` object the shared
 * TemplateExperience engine reads.
 *
 * This is the single source of truth for the draft → preview mapping so every
 * surface that previews a draft (builder phone frame, dashboard "មើលជាមុន",
 * full-page preview) renders identically through TemplateExperience.
 *
 * @param {object} draft   wedding draft (see services/weddingStorage shape)
 * @param {Array}  gallery uploaded gallery items ({ preview, type, ... })
 * @returns {{ tpl: object, variant: string } | null} null when draft/template missing
 */
export function draftToTemplate(draft, gallery = []) {
    if (!draft) return null;

    const templateId = draft.templateId || "garden-royal-khmer-wedding";
    const baseTpl = getTemplateById(templateId);
    if (!baseTpl) return null;

    const sectionEnabled = (legacyValue, key, defaultValue = true) => {
        if (typeof draft.enabledSections?.[key] === "boolean") return draft.enabledSections[key];
        if (typeof legacyValue === "boolean") return legacyValue;
        if (typeof baseTpl.enabledSections?.[key] === "boolean") return baseTpl.enabledSections[key];
        return defaultValue;
    };

    // Hosted invitations must never inherit the template demo gallery. The
    // built-in catalog still owns its sample photography on /templates/*.
    const uploadedImages = (gallery || [])
        .filter((item) => (item?.preview || item?.url) && item.type !== "video")
        .map((item) => item.preview || item.url);

    const draftPhotos = (draft.photos || [])
        .filter((p) => p && (p.url || p.preview))
        .map((p) => p.url || p.preview);

    const effectiveGallery = uploadedImages.length > 0
        ? uploadedImages
        : draftPhotos;

    const eventDate = draft.event?.date || draft.eventDate || draft.eventDateText || "";
    const eventTime = draft.event?.ceremonyTime || draft.event?.receptionTime || draft.eventTime || "17:00";
    let targetDate = undefined;
    if (eventDate && typeof eventDate === "string") {
        try {
            const timeStr = eventTime && eventTime.length === 5 ? `${eventTime}:00` : (eventTime || "17:00:00");
            const combined = eventDate.includes("T") ? eventDate : `${eventDate}T${timeStr}`;
            const parsed = new Date(combined);
            if (!isNaN(parsed.getTime())) {
                targetDate = parsed.toISOString();
            }
        } catch {
            targetDate = undefined;
        }
    }

    const groomName = draft.couple?.groom || draft.groomName || draft.hostName || "";
    const brideName = draft.couple?.bride || draft.brideName || draft.partnerName || "";

    const initialsCouple = initials(draft.couple || { groom: groomName, bride: brideName });

    // KHQR and gifts
    const giftList = [
        ...(draft.gift || []),
        ...(draft.khqrDollar && (draft.khqrDollar.qrUrl || draft.khqrDollar.accountNumber) ? [{
            id: "khqr-dollar",
            type: "khqr",
            currency: "USD",
            bank: draft.khqrDollar.bankName || "KHQR Dollar ($)",
            account: draft.khqrDollar.accountName || draft.khqrDollar.bankName || "KHQR Dollar ($)",
            number: draft.khqrDollar.accountNumber || "",
            note: "USD ($)",
            qrImage: draft.khqrDollar.qrUrl || "",
            qrValue: draft.khqrDollar.accountNumber || "",
        }] : []),
        ...(draft.khqrRiel && (draft.khqrRiel.qrUrl || draft.khqrRiel.accountNumber) ? [{
            id: "khqr-riel",
            type: "khqr",
            currency: "KHR",
            bank: draft.khqrRiel.bankName || "KHQR Riel (៛)",
            account: draft.khqrRiel.accountName || draft.khqrRiel.bankName || "KHQR Riel (៛)",
            number: draft.khqrRiel.accountNumber || "",
            note: "KHR (៛)",
            qrImage: draft.khqrRiel.qrUrl || "",
            qrValue: draft.khqrRiel.accountNumber || "",
        }] : []),
    ];

    // Schedules
    let finalSchedule = draft.schedule || [];
    if ((!finalSchedule || finalSchedule.length === 0) && draft.agendaDays && draft.agendaDays.length > 0) {
        finalSchedule = draft.agendaDays.flatMap((day, dIdx) =>
            day.items.map((it) => ({
                dayTitle: day.title || `ថ្ងៃទី ${dIdx + 1}`,
                title: it.name || "កម្មវិធី",
                time: it.time || "07:00",
            }))
        );
    }

    const rawMapInput = draft.googleMapUrl || draft.event?.mapLink || draft.mapQuery || "";
    const normalizedGoogleMapsUrl = (() => {
        if (rawMapInput && typeof rawMapInput === "string" && rawMapInput.trim()) {
            const value = rawMapInput.trim();
            return /^https?:\/\//i.test(value)
                ? value
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
        }
        const vName = draft.venueName || draft.event?.venueName || "";
        const vAddr = draft.venueAddress || draft.event?.venueAddress || "";
        const q = [vName, vAddr].filter(Boolean).join(" ");
        return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
    })();

    const tpl = {
        ...baseTpl,
        title: draft.title || draft.event?.title || baseTpl.title || "",
        subtitle: draft.subtitle || "",
        messageTitle: draft.messageTitle || "",
        hideCoupleNameOnCover: Boolean(draft.hideCoupleNameOnCover),
        thankYouTitle: draft.thankYouTitle || "",
        thankYouText: draft.thankYouText || "",
        groom: groomName || baseTpl.groom,
        bride: brideName || baseTpl.bride,
        monogramText: draft.design?.monogramText || draft.monogramText || initialsCouple || (groomName && brideName ? `${groomName.trim().charAt(0).toUpperCase()} & ${brideName.trim().charAt(0).toUpperCase()}` : "N & P"),
        shortName: draft.design?.monogramText || draft.monogramText || initialsCouple || (groomName && brideName ? `${groomName.trim().charAt(0).toUpperCase()} & ${brideName.trim().charAt(0).toUpperCase()}` : "N & P"),
        dateText: eventDate ? displayDate(eventDate) : (draft.eventDateText || baseTpl.dateText),
        targetDate: targetDate || baseTpl.targetDate,
        eventTime: draft.eventTime || draft.event?.ceremonyTime || draft.event?.receptionTime || "",
        ceremonyTime: draft.event?.ceremonyTime || draft.eventTime || baseTpl.ceremonyTime || "០៧:០០",
        receptionTime: draft.event?.receptionTime || draft.eventTime || baseTpl.receptionTime || "១៧:០០",
        venueName: draft.event?.venueName || draft.venueName || baseTpl.venueName,
        venueAddress: draft.event?.venueAddress || draft.venueAddress || baseTpl.venueAddress,
        mapQuery: normalizedGoogleMapsUrl || baseTpl.mapQuery,
        googleMapsUrl: normalizedGoogleMapsUrl,
        googleMapUrl: normalizedGoogleMapsUrl,
        sketchMapImage: draft.sketchMapImage || null,
        venue: {
            ...(baseTpl.venue || {}),
            name: draft.event?.venueName || draft.venueName || baseTpl.venueName || "The Premier Center Sen Sok",
            address: draft.event?.venueAddress || draft.venueAddress || baseTpl.venueAddress || "",
            mapLink: normalizedGoogleMapsUrl,
            sketchMapImage: draft.sketchMapImage || null,
        },
        customMainImage: draft.coverImage || "",
        coverImage: draft.coverImage || "",
        backgroundImage: draft.backgroundImage || draft.design?.backgroundImage || "",
        message: draft.message || draft.messageText || "",
        storyText: (draft.storyChapters?.length || (draft.story && draft.story !== draft.messageText)) ? (draft.story || draft.storyText || "") : "",
        dressCode: draft.dressCode || (draft.dressColors?.length ? { colors: draft.dressColors } : undefined),
        dressColors: draft.dressColors || draft.design?.dressColors || [],
        enabledSections: {
            ...(baseTpl.enabledSections || {}),
            ...(draft.enabledSections || {}),
            countdown: sectionEnabled(draft.showCountdown, "countdown"),
            story: sectionEnabled(draft.showStory, "story"),
            party: sectionEnabled(draft.showParty, "party"),
            dressCode: sectionEnabled(draft.showDressCode, "dressCode"),
            faq: sectionEnabled(draft.showFaq, "faq"),
            rsvp: sectionEnabled(draft.rsvp?.enabled, "rsvp"),
        },
        presetId: draft.presetId || baseTpl.presetId || baseTpl.design?.presetId || "",
        design: {
            // Level 2 precedence — inherit the base template's design config
            // (ornamentTheme, palettes, accentColor, …) before the host's edits.
            ...(baseTpl.design || {}),
            ...(draft.design || {}),
            presetId: draft.presetId || draft.design?.presetId || baseTpl.presetId || baseTpl.design?.presetId || "",
            openingStyle: draft.openingStyle || draft.gateStyle || draft.design?.openingStyle || draft.design?.gateStyle || baseTpl.openingStyle || baseTpl.gateStyle || baseTpl.design?.openingStyle || "khmer-royal",
            gateStyle: draft.openingStyle || draft.gateStyle || draft.design?.openingStyle || draft.design?.gateStyle || baseTpl.openingStyle || baseTpl.gateStyle || baseTpl.design?.openingStyle || "khmer-royal",
            coverImage: draft.coverImage || draft.design?.coverImage || baseTpl.phoneCoverImage || baseTpl.mainImage || "/facebook/all/03-card/cover-card.jpg",
            frontColor: draft.frontColor || draft.primaryColor || draft.design?.frontColor || draft.design?.primaryColor || baseTpl.frontColor || baseTpl.primaryColor || baseTpl.design?.frontColor || baseTpl.design?.primaryColor || baseTpl.color || "#f9af59",
            bottomColor: draft.bottomColor || draft.secondaryColor || draft.design?.bottomColor || draft.design?.secondaryColor || baseTpl.bottomColor || baseTpl.secondaryColor || baseTpl.design?.bottomColor || baseTpl.design?.secondaryColor || baseTpl.accent || "#B08E4F",
            openingVideoEnabled:
                draft.openingVideoEnabled !== false && Boolean(draft.openingVideo || draft.design?.openingVideoUrl || baseTpl.openingVideo || baseTpl.design?.openingVideoUrl),
        },
        music: draft.musicUrl ? { url: draft.musicUrl } : (draft.music || null),
        openingVideo: draft.openingVideoEnabled === false ? null : (draft.openingVideo || baseTpl.openingVideo),
        opening: draft.opening || {},
        // Host-authored rich sections. Passed straight through so the content
        // builder can prefer them over its demo fallbacks (see hostContent).
        hostContent: {
            title: draft.title || draft.event?.title || "",
            subtitle: draft.subtitle || "",
            message: draft.message || draft.messageText || "",
            messageTitle: draft.messageTitle || "",
            hideCoupleNameOnCover: Boolean(draft.hideCoupleNameOnCover),
            thankYouTitle: draft.thankYouTitle || "",
            thankYouText: draft.thankYouText || "",
            dateText: eventDate ? displayDate(eventDate) : (draft.eventDateText || ""),
            dateTextEn: draft.extras?.dateTextEn || "",
            targetDate: targetDate || "",
            eventTime: draft.eventTime || draft.event?.ceremonyTime || draft.event?.receptionTime || "",
            couple: {
                groom: groomName,
                bride: brideName,
                ...(draft.couple || {}),
            },
            contact: draft.contact || {},
            coverImage: draft.coverImage || "",
            dressCode: draft.dressCode || null,
            dressColors: draft.dressColors || draft.design?.dressColors || [],
            storyText: (draft.storyChapters?.length || (draft.story && draft.story !== draft.messageText)) ? (draft.story || draft.storyText || "") : "",
            storyTextEn: draft.extras?.storyTextEn || "",
            languageMode: draft.languageMode || draft.extras?.languageMode || "both",
            storyChapters: draft.storyChapters || [],
            schedule: finalSchedule,
            party: (draft.party && draft.party.length > 0) ? draft.party : [],
            gift: giftList.length > 0 ? giftList : (draft.gift || []),
            gallery: effectiveGallery,
            wishMessage: draft.thankYouText || draft.extras?.guestNote || "",
            faq: draft.faq || [],
            enabledSections: {
                ...(draft.enabledSections || {}),
                countdown: sectionEnabled(draft.showCountdown, "countdown"),
                story: sectionEnabled(draft.showStory, "story"),
                party: sectionEnabled(draft.showParty, "party"),
                dressCode: sectionEnabled(draft.showDressCode, "dressCode"),
                faq: sectionEnabled(draft.showFaq, "faq"),
                rsvp: sectionEnabled(draft.rsvp?.enabled, "rsvp"),
            },
            eventTitle: draft.event?.title || draft.title || "",
            venueName: draft.event?.venueName || draft.venueName || "",
            venueAddress: draft.event?.venueAddress || draft.venueAddress || "",
            googleMapsUrl: normalizedGoogleMapsUrl,
            googleMapUrl: normalizedGoogleMapsUrl,
            sketchMapImage: draft.sketchMapImage || null,
            rsvp: draft.rsvp || {},
            opening: draft.opening || {},
            guest: draft.guestName ? { name: draft.guestName } : (draft.guest || null),
        },
        // When the host has uploaded photos, drive gallery + story from them.
        storyImages: effectiveGallery,
        storyCards: effectiveGallery.length
            ? [{ id: `${draft.id || "draft"}-uploads`, title: "Our Photos", images: effectiveGallery }]
            : [],
    };

    return { tpl, variant: resolveVariant(baseTpl) };
}
