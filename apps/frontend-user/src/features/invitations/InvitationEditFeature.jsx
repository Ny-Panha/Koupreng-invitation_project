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
            const localDraft = targetId ? getDraft(targetId, ownerUserId) : null;

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
                const isDefaultCouple = (!localDraft.couple?.groom && (!localDraft.groomName || localDraft.groomName === "វណ្ណដា")) &&
                                        (!localDraft.couple?.bride && (!localDraft.brideName || localDraft.brideName === "ស្រីពេជ្រ"));

                const contentPayload = {
                    title: (!isDefaultTitle && (localDraft.event?.title || localDraft.title)) ? (localDraft.event?.title || localDraft.title) : (preset.title || "សួនរាជហង្សខ្មែរ"),
                    subtitle: "សូមគោរពអញ្ជើញ",
                    groomName: (!isDefaultCouple && (localDraft.couple?.groom || localDraft.groomName)) ? (localDraft.couple?.groom || localDraft.groomName) : (preset.groom || "វណ្ណដា"),
                    brideName: (!isDefaultCouple && (localDraft.couple?.bride || localDraft.brideName)) ? (localDraft.couple?.bride || localDraft.brideName) : (preset.bride || "ស្រីពេជ្រ"),
                    eventDateText: localDraft.event?.date || localDraft.eventDate || tpl?.dateText || "ថ្ងៃពុធ ២៨ មករា ២០២៦",
                    schedule: localDraft.schedule?.length ? localDraft.schedule : (preset.schedule || []),
                    agendaDays: localDraft.agendaDays || [],
                    venueName: localDraft.event?.venueName || localDraft.venueName || preset.venueName || "The Premier Center Sen Sok",
                    venueAddress: localDraft.event?.venueAddress || localDraft.venueAddress || preset.venueAddress || "អគារ A, សែនសុខ, ភ្នំពេញ",
                    googleMapUrl: localDraft.googleMapUrl || tpl?.mapQuery || "",
                    sketchMapImage: localDraft.sketchMapImage || null,
                    messageText: localDraft.message || preset.messageText || "",
                    thankYouText: localDraft.thankYouText || "",
                };

                const mappedInvitation = {
                    id: localDraft.backendInvitationId || localDraft.id,
                    templateId: chosenTemplateId,
                    presetId: preset.presetId || tpl?.presetId || "",
                    title: contentPayload.title,
                    groomName: contentPayload.groomName,
                    brideName: contentPayload.brideName,
                    eventDate: localDraft.event?.date || localDraft.eventDate || (tpl?.targetDate ? tpl.targetDate.split("T")[0] : "2026-01-28"),
                    eventTime: localDraft.event?.receptionTime || localDraft.eventTime || tpl?.receptionTime || "17:00",
                    venueName: contentPayload.venueName,
                    venueAddress: contentPayload.venueAddress,
                    googleMapUrl: localDraft.googleMapUrl || tpl?.mapQuery || "",
                    sketchMapImage: localDraft.sketchMapImage || null,
                    openingStyle,
                    frontColor,
                    bottomColor,
                    coverImage: cover,
                    storyText: localDraft.message || preset.messageText || "",
                    designJson: JSON.stringify(designPayload),
                    contentJson: JSON.stringify(contentPayload),
                };

                if (active) {
                    setInvitation(mappedInvitation);
                    setLoading(false);
                    return;
                }
            }

            // 2. If not found locally, query backend API
            if (id) {
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

