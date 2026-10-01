import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InvitationForm from "./InvitationForm";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { getDraft } from "@/shared/storage/weddingStorage";
import { getTemplateById, getTemplatePreset, registerDynamicTemplates } from "../templates/data/templatesData";
import { templateCatalogService } from "../templates/api/templateCatalogApi";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { useAuth } from "@/features/auth/hooks/useAuth";
import "@/features/events/EventsFeature.css";

export default function InvitationEditPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { text: t } = useBackendMessages("invitations");
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            // 0. Fetch dynamic catalog from backend to register any admin-created templates
            try {
                const catalogItems = await templateCatalogService.list();
                if (catalogItems && catalogItems.length > 0) {
                    registerDynamicTemplates(catalogItems);
                }
            } catch {
                // Ignore catalog fetch failure
            }

            const ownerUserId = user?.id || user?.userId;
            const targetId = id;
            const localDraft = targetId ? (getDraft(targetId, ownerUserId) || getDraft(targetId)) : null;

            // 1. Check local wedding draft storage first
            if (localDraft) {
                const chosenTemplateId = localDraft.templateId || "garden-royal-khmer-wedding";
                const tpl = getTemplateById(chosenTemplateId);
                const preset = getTemplatePreset(tpl) || {};

                const isDefaultGold = localDraft.frontColor === "#f9af59" && localDraft.bottomColor === "#B08E4F";
                const isDefaultOpening = !localDraft.openingStyle || localDraft.openingStyle === "khmer-royal";
                const isDefaultCover = !localDraft.coverImage || localDraft.coverImage.includes("/facebook/all/03-card/cover-card.jpg");

                const cover = (!isDefaultCover && localDraft.coverImage) ? localDraft.coverImage : (preset.coverImage || "/facebook/all/03-card/cover-card.jpg");
                const frontColor = (!isDefaultGold && localDraft.frontColor) ? localDraft.frontColor : (preset.frontColor || "#f9af59");
                const bottomColor = (!isDefaultGold && localDraft.bottomColor) ? localDraft.bottomColor : (preset.bottomColor || "#B08E4F");
                const openingStyle = (!isDefaultOpening && localDraft.openingStyle) ? localDraft.openingStyle : (preset.openingStyle || "khmer-royal");

                const designPayload = {
                    coverImage: cover,
                    coverBackgroundImage: localDraft.coverBackgroundImage || localDraft.design?.coverBackgroundImage || "",
                    backgroundImage: localDraft.backgroundImage || localDraft.design?.backgroundImage || "",
                    frontColor,
                    bottomColor,
                    openingStyle,
                    templateId: chosenTemplateId,
                    presetId: preset.presetId || tpl?.presetId || "",
                    musicUrl: localDraft.musicUrl || preset.musicUrl || "",
                    photos: localDraft.photos?.length ? localDraft.photos : (preset.photos || []),
                    khqrDollar: localDraft.khqrDollar || null,
                    khqrRiel: localDraft.khqrRiel || null,
                };

                const isDefaultTitle = !localDraft.event?.title && (!localDraft.title || localDraft.title === "សួនរាជហង្សខ្មែរ" || localDraft.title === "Garden Royal Khmer Wedding");
                const isDefaultCouple = !localDraft.couple?.groom && !localDraft.groomName &&
                                        !localDraft.couple?.bride && !localDraft.brideName;

                const contentPayload = {
                    title: (!isDefaultTitle && (localDraft.event?.title || localDraft.title)) ? (localDraft.event?.title || localDraft.title) : (preset.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍"),
                    subtitle: "សូមគោរពអញ្ជើញ",
                    coverBackgroundImage: localDraft.coverBackgroundImage || localDraft.design?.coverBackgroundImage || "",
                    backgroundImage: localDraft.backgroundImage || localDraft.design?.backgroundImage || "",
                    groomName: (!isDefaultCouple && (localDraft.couple?.groom || localDraft.groomName)) ? (localDraft.couple?.groom || localDraft.groomName) : "",
                    brideName: (!isDefaultCouple && (localDraft.couple?.bride || localDraft.brideName)) ? (localDraft.couple?.bride || localDraft.brideName) : "",
                    eventDateText: localDraft.event?.date || localDraft.eventDate || tpl?.dateText || "",
                    schedule: localDraft.schedule?.length ? localDraft.schedule : (preset.schedule || []),
                    agendaDays: localDraft.agendaDays || [],
                    venueName: (localDraft.event?.venueName && localDraft.event.venueName !== "The Premier Center Sen Sok") ? localDraft.event.venueName : ((localDraft.venueName && localDraft.venueName !== "The Premier Center Sen Sok") ? localDraft.venueName : ""),
                    venueAddress: (localDraft.event?.venueAddress && localDraft.event.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ") ? localDraft.event.venueAddress : ((localDraft.venueAddress && localDraft.venueAddress !== "អគារ A, សែនសុខ, ភ្នំពេញ") ? localDraft.venueAddress : ""),
                    googleMapUrl: localDraft.googleMapUrl || tpl?.mapQuery || "",
                    sketchMapImage: localDraft.sketchMapImage || null,
                    messageText: localDraft.message || preset.messageText || "",
                    thankYouText: localDraft.thankYouText || "",
                    khqrDollar: localDraft.khqrDollar || null,
                    khqrRiel: localDraft.khqrRiel || null,
                };

                const mappedInvitation = {
                    // Spread the full draft first so ALL saved fields are present
                    ...localDraft,
                    id: localDraft.backendInvitationId || localDraft.id,
                    backendInvitationId: localDraft.backendInvitationId || null,
                    slug: localDraft.slug || null,
                    templateId: chosenTemplateId,
                    presetId: localDraft.presetId || preset.presetId || tpl?.presetId || "",
                    title: localDraft.title || contentPayload.title,
                    groomName: localDraft.groomName || localDraft.couple?.groom || contentPayload.groomName,
                    brideName: localDraft.brideName || localDraft.couple?.bride || contentPayload.brideName,
                    eventDate: localDraft.eventDate || localDraft.event?.date || (tpl?.targetDate ? tpl.targetDate.split("T")[0] : "2026-01-28"),
                    eventTime: localDraft.eventTime || localDraft.event?.receptionTime || tpl?.receptionTime || "17:00",
                    venueName: localDraft.venueName || localDraft.event?.venueName || contentPayload.venueName,
                    venueAddress: localDraft.venueAddress || localDraft.event?.venueAddress || contentPayload.venueAddress,
                    googleMapUrl: localDraft.googleMapUrl || tpl?.mapQuery || "",
                    sketchMapImage: localDraft.sketchMapImage || null,
                    openingStyle,
                    frontColor,
                    bottomColor,
                    coverImage: cover,
                    coverBackgroundImage: localDraft.coverBackgroundImage || localDraft.design?.coverBackgroundImage || "",
                    backgroundImage: localDraft.backgroundImage || localDraft.design?.backgroundImage || "",
                    storyText: localDraft.messageText || localDraft.message || preset.messageText || "",
                    // Use saved designJson/contentJson if available (written by handleSave),
                    // otherwise fall back to the minimal reconstructed versions
                    designJson: localDraft.designJson || JSON.stringify(designPayload),
                    contentJson: localDraft.contentJson || JSON.stringify(contentPayload),
                };

                if (active) {
                    setInvitation(mappedInvitation);
                    setLoading(false);
                    return;
                }
            }

            // 2. If not found locally, query backend API (only for numeric backend IDs)
            if (id && /^\d+$/.test(String(id))) {
                try {
                    const [data, media] = await Promise.all([
                        invitationService.get(id),
                        mediaService.list(id).catch(() => null),
                    ]);
                    if (active && data) {
                        setInvitation({
                            ...data,
                            coverUrl: media?.coverImage?.fileUrl || data.coverUrl || null,
                            media,
                        });
                        setLoading(false);
                        return;
                    }
                } catch {
                    // Not found in backend
                }
            }

            // 3. No event created yet -> set null to show empty state with Go to Create Events
            if (active) {
                setInvitation(id ? null : { status: "DRAFT", templateId: null });
                setLoading(false);
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [id, user?.id, user?.userId]);

    if (loading) {
        return (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                <div>{t("loading") || "កំពុងទាញយក..."}</div>
            </div>
        );
    }

    // A route without an id is a local, unsaved editor draft.
    if (!invitation) {
        return (
            <main className="events-page">
                <header className="events-page-header">
                    <div>
                        <span>{t("brand") || "គូព្រេង INVITATIONS"}</span>
                        <h1>{t("title") || "គម្រូធៀប"}</h1>
                        <p>{t("subtitle") || "គ្រប់គ្រង និងកែសម្រួលគំរូធៀបអាពាហ៍ពិពាហ៍"}</p>
                    </div>
                    <span>{t("createBtn") || "+ បង្កើតកម្មវិធី"}</span>
                </header>

                <section className="events-empty">
                    <div className="events-empty-icon">{t("emptyIcon") || "គម្រោង"}</div>
                    <h2>{t("emptyTitle") || "មិនទាន់មានកម្មវិធី"}</h2>
                    <p>{t("emptyText") || "សូមចាប់ផ្តើមបង្កើតកម្មវិធីជាមុនសិន ដើម្បីកែសម្រួលគំរូធៀបឌីជីថល។"}</p>
                    <span>{t("emptyActionBtn") || "+ បង្កើតកម្មវិធី"}</span>
                </section>
            </main>
        );
    }

    return <InvitationForm invitation={invitation} />;
}

