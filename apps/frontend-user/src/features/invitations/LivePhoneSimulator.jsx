import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Eye, Layers, Signal, Wifi, BatteryFull, Minus, Plus } from "lucide-react";
import "./LivePhoneSimulator.css";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { formatTime24toKhmer } from "@/shared/ui/TimePicker";
import { TemplateExperience } from "@/features/templates";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";
import { buildPreviewUrl, createPreviewSession, iframePreviewChannel, isTrustedPreviewMessage, postPreviewMessage } from "@/shared/preview/previewMessaging";
import { usePreviewSyncRetries } from "@/shared/hooks/usePreviewSyncRetries";

function displayKhmerDate(dateStr) {
    if (!dateStr) return "";
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

export default function LivePhoneSimulator({ data = {}, catalogVersion = 0 }) {
    const { text: t, lang } = useBackendMessages("invitations");
    const en = lang === "en";
    const iframeRef = useRef(null);
    const previewRef = useRef(null);
    const viewportRef = useRef(null);
    const [device, setDevice] = useState("mobile");
    const [zoom, setZoom] = useState("fit");
    const [availableSpace, setAvailableSpace] = useState({ width: 480, height: 720 });
    // Keep the 440 × 860 CSS content viewport stable, including during zoom.
    // The frame is a visual simulation; it does not emulate Safari/iOS hardware.
    const deviceSize = device === "mobile" ? { width: 456, height: 972 } : { width: 1216, height: 816 };
    const fitScale = Math.max(.2, Math.min(1, (availableSpace.width - 24) / deviceSize.width, (availableSpace.height - 24) / deviceSize.height));
    const scale = zoom === "fit" ? fitScale : Number(zoom) / 100;

    useEffect(() => {
        if (!viewportRef.current || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry.contentRect.width && entry.contentRect.height) setAvailableSpace({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(viewportRef.current);
        return () => observer.disconnect();
    }, []);
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
    const templateSlug = merged?.tpl?.code || merged?.tpl?.slug || "";

    // Start closed on Cover if template supports gate opening, identical to Admin
    const [isGateOpen, setIsGateOpen] = useState(false);

    const broadcastSync = useCallback(() => {
        if (!iframeRef.current?.contentWindow) return;
        try {
            const rawDate = data.eventDate ?? data.event?.date ?? data.weddingDate;
            const livePayload = {
                ...data,
                templateId: templateSlug,
                groomName: data.groomName ?? data.couple?.groom,
                brideName: data.brideName ?? data.couple?.bride,
                groom: data.groomName ?? data.couple?.groom,
                bride: data.brideName ?? data.couple?.bride,
                invitationTitle: data.title ?? data.invitationTitle,
                title: data.title ?? data.invitationTitle,
                invitationSubtitle: data.subtitle ?? data.invitationSubtitle ?? "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
                subtitle: data.subtitle ?? data.invitationSubtitle ?? "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
                messageTitle: data.messageTitle || "",
                messageText: data.messageText || data.message || "",
                message: data.messageText || data.message || "",
                blessingMessage: data.messageText || data.message || "",
                weddingDate: rawDate,
                dateText: rawDate !== undefined ? displayKhmerDate(rawDate) : (data.eventDateText || data.dateText || ""),
                weddingTime: formatTime24toKhmer(data.eventTime ?? data.event?.ceremonyTime ?? data.weddingTime ?? "") || "",
                receptionTime: formatTime24toKhmer(data.event?.receptionTime ?? data.eventTime ?? data.weddingTime ?? "") || "",
                eventTime: formatTime24toKhmer(data.eventTime ?? data.event?.ceremonyTime ?? data.weddingTime ?? "") || "",
                venueName: data.venueName ?? data.event?.venueName,
                venueAddress: data.venueAddress ?? data.event?.venueAddress,
                googleMapUrl: data.googleMapUrl,
                googleMapsUrl: data.googleMapUrl,
                fontKhmer: data.fontKhmer || "",
                fontLatin: data.fontLatin || "",
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

    if (!templateSlug) return <aside className="pe-preview-column" role="alert">Template unavailable / មិនអាចបើកគំរូបាន។ Please reload the catalog to recover your assigned template.</aside>;

    return (
        <aside ref={previewRef} className="pe-preview-column" aria-label="Live invitation preview">
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
                        <span>{en ? "Cover" : "ស្រោមសំបុត្រ"}</span>
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
                        <span>{en ? "Full invitation" : "មាតិកាពេញ"}</span>
                    </button>
                </div>
            </div>

            <div className="studio-preview-tools" aria-label="Preview controls">
                <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>iPhone 18 Pro Max</button>
                <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>{en ? "Desktop" : "កុំព្យូទ័រ"}</button>
                <label>{en ? "Zoom" : "ទំហំ"} <select aria-label="Preview zoom" value={zoom} onChange={event => setZoom(event.target.value)}>
                    <option value="fit">{en ? "Fit" : "សមនឹងផ្ទៃ"}</option>
                    {[...new Set([35, 50, 75, 100, 125, ...(zoom === "fit" ? [] : [Number(zoom)])])].sort((a,b)=>a-b).map(value => <option key={value} value={value}>{value}%</option>)}
                </select></label>
                <button type="button" aria-label="Zoom out" onClick={() => setZoom(String(Math.max(35, (zoom === "fit" ? Math.round(fitScale * 100) : Number(zoom)) - 10)))}><Minus size={16} /></button>
                <button type="button" aria-label="Zoom in" onClick={() => setZoom(String(Math.min(125, (zoom === "fit" ? Math.round(fitScale * 100) : Number(zoom)) + 10)))}><Plus size={16} /></button>
                <button type="button" onClick={() => { setZoom("fit"); setDevice("mobile"); handleSetGate(false); }}>{en ? "Reset view" : "កំណត់ទិដ្ឋភាពដើម"}</button>
                {typeof document !== "undefined" && document.fullscreenEnabled && <button type="button" onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen();
                    else previewRef.current?.requestFullscreen();
                }}>{en ? "Fullscreen" : "ពេញអេក្រង់"}</button>}
            </div>
            <div className="studio-device-caption">{device === "mobile" ? "iPhone frame · 440 × 860" : "Desktop · 1200 × 800"} · {Math.round(scale * 100)}%</div>
            <div ref={viewportRef} className="studio-preview-viewport">
            <div className="studio-device-stage" style={{ width: deviceSize.width * scale, height: deviceSize.height * scale }}>
            <div className="pe-phone-frame pe-device-frame" data-device={device}
                style={{ width: deviceSize.width, height: deviceSize.height, transform: `scale(${scale})` }}>
                {device === "mobile" && <div className="pe-device-status" aria-hidden="true"><span>9:41</span><span className="pe-dynamic-island" /><span className="pe-device-status-icons"><Signal size={17} /><Wifi size={17} /><BatteryFull size={23} /></span></div>}
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
                {device === "mobile" && <div className="pe-device-home" aria-hidden="true"><span /></div>}
            </div>
            </div>
            </div>
        </aside>
    );
}
