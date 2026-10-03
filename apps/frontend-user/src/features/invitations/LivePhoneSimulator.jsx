import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Eye, Layers } from "lucide-react";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { formatTime24toKhmer } from "@/shared/ui/TimePicker";
import { TemplateExperience } from "@/features/templates";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";
import { buildPreviewUrl, createPreviewSession, iframePreviewChannel, isTrustedPreviewMessage, postPreviewMessage } from "@/shared/preview/previewMessaging";
import { usePreviewSyncRetries } from "@/shared/hooks/usePreviewSyncRetries";

function displayKhmerDate(dateStr) {
    if (!dateStr) return "ថ្ងៃពុធ ២៨ មករា ២០២៦";
    try {
        const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
        const d = new Date(`${clean}T00:00:00`);
        if (isNaN(d.getTime())) return dateStr;
        return new Intl.DateTimeFormat("km-KH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(d);
    } catch {
        return dateStr;
    }
}

function resolveTemplateSlug(data, merged) {
    const raw = data?.templateId || merged?.tpl?.id || merged?.tpl?.code || merged?.tpl?.slug || "khmer-celestial";
    const str = String(raw);
    if (str === "garden-royal-khmer-wedding" || str === "garden_royal") {
        return "garden-royal-khmer-wedding";
    }
    if (str === "10" || str === "khmer-celestial" || str === "KHMER_CELESTIAL" || str === "royal-khmer-wedding" || str === "1") {
        return "khmer-celestial";
    }
    if (str === "7" || str === "the-digital-yes-wedding" || str === "digital-yes") {
        return "the-digital-yes-wedding";
    }
    if (str === "2" || str === "emerald-canva-luxe-wedding" || str === "emerald-royal-luxe" || str === "26") {
        return "emerald-canva-luxe-wedding";
    }
    if (str === "3" || str === "withjoy-modern-portal") {
        return "withjoy-modern-portal";
    }
    if (str === "4" || str === "bliss-editorial-wedding") {
        return "bliss-editorial-wedding";
    }
    if (str === "5" || str === "khmer-golden-canva-inspired-wedding" || str === "cover-khmer-golden-wedding") {
        return "cover-khmer-golden-wedding";
    }
    return merged?.tpl?.slug || merged?.tpl?.code || str;
}

export default function LivePhoneSimulator({ data = {}, catalogVersion = 0 }) {
    const { text: t } = useBackendMessages("invitations");
    const iframeRef = useRef(null);
    const [previewSession] = useState(createPreviewSession);
    const sendPreview = useCallback((message) => postPreviewMessage(message,
        iframePreviewChannel(iframeRef.current, previewSession)), [previewSession]);

    // `catalogVersion` is a dependency because the first render runs while the
    // template catalog is still fetching — without it the memo keeps the stale
    // KEPT_TEMPLATE (Garden Royal) resolution forever.
    const merged = useMemo(() => {
        void catalogVersion;
        return draftToTemplate(data, data.photos?.map((p) => ({ preview: p.url || p, type: "image" })));
    }, [data, catalogVersion]);

    const templateName = merged?.tpl?.name || merged?.tpl?.style || t("previewTopInfo") || "គំរូសន្លឹកការ (Live Preview)";
    const templateSlug = useMemo(() => resolveTemplateSlug(data, merged), [data, merged]);

    // Start closed on Cover if template supports gate opening, identical to Admin
    const [isGateOpen, setIsGateOpen] = useState(false);

    const broadcastSync = useCallback(() => {
        if (!iframeRef.current?.contentWindow) return;
        try {
            const rawDate = data.eventDate || data.event?.date || data.weddingDate;
            const livePayload = {
                ...data,
                templateId: templateSlug,
                groomName: data.groomName || data.couple?.groom,
                brideName: data.brideName || data.couple?.bride,
                groom: data.groomName || data.couple?.groom,
                bride: data.brideName || data.couple?.bride,
                invitationTitle: data.title || data.invitationTitle,
                title: data.title || data.invitationTitle,
                invitationSubtitle: data.subtitle || data.invitationSubtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
                subtitle: data.subtitle || data.invitationSubtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
                messageTitle: data.messageTitle || "",
                messageText: data.messageText || data.message || "",
                message: data.messageText || data.message || "",
                blessingMessage: data.messageText || data.message || "",
                weddingDate: rawDate,
                dateText: (rawDate ? displayKhmerDate(rawDate) : "") || (data.eventDateText && !/^\d{4}-\d{2}-\d{2}$/.test(data.eventDateText) ? data.eventDateText : "") || (data.dateText && !/^\d{4}-\d{2}-\d{2}$/.test(data.dateText) ? data.dateText : "") || "ថ្ងៃពុធ ២៨ មករា ២០២៦",
                weddingTime: formatTime24toKhmer(data.eventTime || data.event?.ceremonyTime || data.weddingTime || "17:00") || "05:00 ល្ងាច",
                receptionTime: formatTime24toKhmer(data.event?.receptionTime || data.eventTime || data.weddingTime || "17:00") || "05:00 ល្ងាច",
                eventTime: formatTime24toKhmer(data.eventTime || data.event?.ceremonyTime || data.weddingTime || "17:00") || "05:00 ល្ងាច",
                venueName: data.venueName || data.event?.venueName,
                venueAddress: data.venueAddress || data.event?.venueAddress,
                googleMapUrl: data.googleMapUrl,
                googleMapsUrl: data.googleMapUrl,
                fontKhmer: data.fontKhmer || "Bayon",
                fontLatin: data.fontLatin || "Cinzel Decorative",
                elementFonts: data.elementFonts,
                brandMark: data.brandMarkUrl || data.brandMark,
                showBrandMark: data.showBrandMark !== false,
                guestName: data.guestName || "លោកអ្នក និងក្រុមគ្រួសារ",
                guestLabel: data.guestLabel || "ជូនចំពោះ:",
                showGuestBanner: data.showGuestBanner !== false,
                openingVideoEnabled: data.openingVideoEnabled !== false,
                enabledSections: data.enabledSections,
                groomFather: data.groomFather,
                groomMother: data.groomMother,
                brideFather: data.brideFather,
                brideMother: data.brideMother,
                schedule: data.schedule,
                photos: data.photos,
                galleryImages: (data.photos || []).map((p) => p?.url || p?.preview || (typeof p === "string" ? p : "")).filter(Boolean),
                khqrDollar: data.khqrDollar,
                khqrRiel: data.khqrRiel,
                thankYouTitle: data.thankYouTitle,
                thankYouText: data.thankYouText,
                apologyTitle: data.apologyTitle,
                apologyText: data.apologyText,
                faq: data.faq,
                party: data.party,
                dressCode: data.dressCode,
                dressColors: data.dressColors,
                storyChapters: data.storyChapters,
                storyText: data.storyText,
                musicUrl: data.musicUrl,
                sectionOrder: data.sectionOrder,
            };
            sendPreview({ type: "LIVE_PREVIEW_SYNC", data: livePayload });
        } catch {
            // ignore
        }
    }, [data, templateSlug, sendPreview]);
    const synchronizeLoadedPreview = usePreviewSyncRetries(broadcastSync);

    useEffect(() => {
        broadcastSync();
    }, [broadcastSync]);

    const handleSetGate = (shouldOpen) => {
        setIsGateOpen(shouldOpen);
        if (iframeRef.current?.contentWindow) {
            try {
                sendPreview({ type: "TOGGLE_GATE", open: shouldOpen, isOpen: shouldOpen });
            } catch {
                // The preview may navigate while the gate state is being sent.
            }
        }
    };

    useEffect(() => {
        const handleMsg = (event) => {
            if (!isTrustedPreviewMessage(event, iframePreviewChannel(iframeRef.current, previewSession))) return;
            if (event.data?.type === "GATE_STATE_CHANGE" || event.data?.type === "GATE_OPENED") {
                setIsGateOpen(Boolean(event.data.open ?? event.data.isOpen));
            }
            if (event.data?.type === "PREVIEW_READY") {
                broadcastSync();
                if (iframeRef.current?.contentWindow) {
                    try {
                        sendPreview({ type: "TOGGLE_GATE", open: isGateOpen, isOpen: isGateOpen });
                    } catch {
                        // The preview may navigate while the gate state is being sent.
                    }
                }
            }
        };
        window.addEventListener("message", handleMsg);
        return () => window.removeEventListener("message", handleMsg);
    }, [broadcastSync, isGateOpen, previewSession, sendPreview]);

    // Check if running in headless test environment (Vitest / HappyDOM)
    const isTest = import.meta.env.MODE === "test" || Boolean(globalThis.__vitest_worker__);

    return (
        <aside className="pe-preview-column">
            {/* Clean Studio Preview Top Bar */}
            <div className="pe-preview-top-bar">
                <div className="pe-preview-status-row">
                    <div className="pe-preview-status-left">
                        <span className="pe-live-dot">
                            <span className="pe-live-dot-ping"></span>
                            <span className="pe-live-dot-solid"></span>
                        </span>
                        <span className="pe-preview-live-title">{t("previewTitle") || "មើលគំរូជាមុន"}</span>
                    </div>
                    <span className="pe-preview-tag" title="គំរូនាពេលបច្ចុប្បន្ន">{templateName}</span>
                </div>

                {/* Clean, Full-Width Segmented Control - Easy to click */}
                <div className="pe-sim-gate-switcher" role="tablist" aria-label="ទិដ្ឋភាពធៀបការ">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isGateOpen}
                        onClick={() => handleSetGate(false)}
                        className={`pe-sim-gate-btn ${!isGateOpen ? "is-active" : ""}`}
                        title="មើលស្រោមសំបុត្រ / ក្របទំព័រដើម (Cover)"
                    >
                        <Layers size={16} />
                        <span>ស្រោមសំបុត្រ (Cover)</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isGateOpen}
                        onClick={() => handleSetGate(true)}
                        className={`pe-sim-gate-btn ${isGateOpen ? "is-active" : ""}`}
                        title="មើលមាតិកាធៀបពេញ (Full Template Content)"
                    >
                        <Eye size={16} />
                        <span>មាតិកាពេញ (Full)</span>
                    </button>
                </div>
            </div>

            {/* Interactive Phone Frame */}
            <div className="pe-phone-frame h-full flex flex-col rounded-[36px] border-4 border-zinc-800/90 bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-300 relative w-[380px] max-w-full">
                {/* Real-time Isolated Live Preview using exact same engine as Admin */}
                <div className="pe-canvas-wrapper flex-1 w-full h-full relative bg-zinc-950 overflow-hidden">
                    {isTest ? (
                        merged?.tpl ? (
                            <TemplateExperience
                                key={merged.tpl.id || merged.tpl.code}
                                tpl={merged.tpl}
                                variant={merged.variant}
                                preview={true}
                                previewStartClosed={!isGateOpen}
                                showBreadcrumb={false}
                                showActions={false}
                                showStickyCta={true}
                            />
                        ) : null
                    ) : (
                        <iframe
                            key={templateSlug}
                            ref={iframeRef}
                            allow="clipboard-write; clipboard-read; autoplay"
                            src={buildPreviewUrl(`/templates/${templateSlug}/preview?embed=true`, previewSession)}
                            className="w-full h-full border-0 bg-zinc-950"
                            title="Live User Template Preview"
                            onLoad={() => {
                                synchronizeLoadedPreview();
                                if (iframeRef.current?.contentWindow) {
                                    try {
                                        sendPreview({ type: "TOGGLE_GATE", open: isGateOpen, isOpen: isGateOpen });
                                    } catch {
                                        // The preview may navigate while the gate state is being sent.
                                    }
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </aside>
    );
}
