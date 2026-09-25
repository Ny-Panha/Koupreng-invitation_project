import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import TemplateImage from "../shared/TemplateImage";
import RibbonOpening from "@/features/templates/shared/Openings/RibbonOpening";
import CinematicVideoOpening from "@/features/templates/shared/Openings/CinematicVideoOpening";
import CelestialOpening from "@/features/templates/layouts/KhmerCelestial/components/CelestialOpening";
import "@/features/templates/layouts/KhmerCelestial/khmer-celestial.css";


function KhmerCornerOrnament({ position }) {
    return (
        <svg
            className={`tx-gate__corner tx-gate__corner--${position}`}
            viewBox="0 0 96 96"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M7 89V25C7 15 15 7 25 7h64" />
            <path d="M15 78V30c0-8 7-15 15-15h48" />
            <path d="M24 68c12-5 19-15 20-29 8 10 19 16 33 17-12 8-20 19-23 33-7-11-17-18-30-21Z" />
            <path d="M29 29c8 2 14 8 16 16M42 20c7 5 11 12 11 21M20 43c5 7 12 11 21 11" />
        </svg>
    );
}

function videoUrl(value) {
    return typeof value === "string" ? value : value?.url || "";
}

import { useLanguageStore } from "@/stores/useLanguageStore";

function GuestSeatPill({ table, seat }) {
    const lang = useLanguageStore((state) => state.lang);
    if (!table) return null;
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "6px",
            padding: "3px 12px",
            borderRadius: "20px",
            background: "rgba(185, 139, 66, 0.24)",
            border: "1px solid rgba(212, 175, 55, 0.45)",
            color: "#fff3cc",
            fontSize: "0.825rem",
            fontWeight: 700,
            textShadow: "0 1px 4px rgba(0,0,0,0.6)"
        }}>
            <span>{lang === "en" ? `🍽️ Table: ${table}` : `🍽️ តុ៖ ${table}`}</span>
            {seat && <span>{lang === "en" ? `• Seat ${seat}` : `• កៅអី ${seat}`}</span>}
        </span>
    );
}

/* =========================================================================
   STYLE 1: Theatrical Velvet Curtain (The Digital Yes "PRESTIGE" Style)
   ========================================================================= */
function CurtainGate({
    content,
    opening,
    state,
    onOpen,
    guestText,
}) {
    const lang = useLanguageStore((state) => state.lang);
    const isOpening = state === "opening";

    return (
        <div className={`tx-gate-curtain ${isOpening ? "is-opening" : ""}`}>
            {/* Spotlight Beam */}
            <div className="tx-curtain-spotlight" aria-hidden="true" />

            {/* Revealed Card Underneath Curtains */}
            <div className="tx-curtain-card-stage">
                <div className="tx-curtain-card">
                    <div className="tx-curtain-card-border" />
                    <p className="tx-gate__eyebrow">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                    <p className="tx-gate__invitation-text">{opening.invitationText || (lang === "en" ? "You are cordially invited to celebrate the wedding of" : "សូមគោរពអញ្ជើញជាអធិបតី និងភ្ញៀវកិត្តិយស")}</p>
                    <div className="tx-gate__crest" aria-label={`Monogram ${content.monogramText}`}>
                        <strong>{content.monogramText || "囍"}</strong>
                    </div>
                    <h1>
                        <span className="tx-foil-gold">{content.groom}</span>
                        <em aria-hidden="true">{content.amp || "♥"}</em>
                        <span className="tx-foil-gold">{content.bride}</span>
                    </h1>
                    <div className="tx-gate__separator" aria-hidden="true"><span /></div>
                    <p className="tx-gate__guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                    <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                    {content.dateText && <p className="tx-gate__date">{content.dateText}</p>}
                </div>
            </div>

            {/* Light burst beam when opening */}
            <div className="tx-curtain-light-beam" aria-hidden="true" />

            {/* Top Theatrical Valance & Fringe */}
            <div className="tx-curtain-valance" aria-hidden="true">
                <div className="tx-curtain-valance-scallop" />
                <div className="tx-curtain-gold-fringe" />
            </div>

            {/* Left Velvet Curtain */}
            <div className="tx-curtain-panel tx-curtain-panel--left" aria-hidden="true">
                <div className="tx-curtain-folds" />
                <div className="tx-curtain-side-tassel tx-curtain-side-tassel--left" />
            </div>

            {/* Right Velvet Curtain */}
            <div className="tx-curtain-panel tx-curtain-panel--right" aria-hidden="true">
                <div className="tx-curtain-folds" />
                <div className="tx-curtain-side-tassel tx-curtain-side-tassel--right" />
            </div>

            {/* Front Stage Display with Couple Names & Open Clasp */}
            <div className="tx-curtain-clasp-wrapper">
                <div className="tx-curtain-front-header" aria-hidden="true">
                    {content.badge && (
                        <span className="tx-curtain-front-badge">{content.badge}</span>
                    )}
                    <p className="tx-curtain-front-heading">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                    <h2 className="tx-curtain-front-names">
                        <span className="tx-foil-gold">{content.groom}</span>
                        <em className="tx-curtain-front-heart">{content.amp || "♥"}</em>
                        <span className="tx-foil-gold">{content.bride}</span>
                    </h2>
                    <p className="tx-curtain-front-guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                    <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                    {content.dateText && <p className="tx-curtain-front-date">{content.dateText}</p>}
                </div>

                <button
                    type="button"
                    className="tx-curtain-clasp"
                    onClick={onOpen}
                    disabled={state !== "closed"}
                    aria-label={opening.openButtonText}
                >
                    <div className="tx-curtain-clasp-ring" />
                    <div className="tx-curtain-clasp-crest">
                        <span>{content.monogramText || "囍"}</span>
                    </div>
                    <span className="tx-curtain-clasp-label">
                        {isOpening ? (lang === "en" ? "Opening..." : "កំពុងបើក...") : (opening.openButtonText || (lang === "en" ? "Open Invitation" : "ចុចបើកវាំងនន"))}
                    </span>
                    <span className="tx-curtain-tap-hint">{lang === "en" ? "✦ Tap to open invitation ✦" : "✦ ប៉ះដើម្បីបើកសិរីសួស្តី ✦"}</span>
                </button>
            </div>
        </div>
    );
}

/* =========================================================================
   STYLE 2: 3D Luxury Envelope with Embossed Wax Seal
   ========================================================================= */
function Envelope3DGate({
    content,
    opening,
    state,
    onOpen,
    guestText,
}) {
    const lang = useLanguageStore((state) => state.lang);
    const isOpening = state === "opening";

    return (
        <div className={`tx-gate-env3d ${isOpening ? "is-opening" : ""}`}>
            <div className="tx-env3d-ambient-glow" aria-hidden="true" />

            <div className="tx-env3d-container">
                {/* Header Over Envelope */}
                <div className="tx-env3d-header">
                    {content.badge && (
                        <span className="tx-env3d-front-badge">{content.badge}</span>
                    )}
                    <p className="tx-env3d-header-eyebrow">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                    <h1 className="tx-env3d-header-couple">
                        <span className="tx-foil-gold">{content.groom}</span>
                        <em aria-hidden="true">{content.amp || "♥"}</em>
                        <span className="tx-foil-gold">{content.bride}</span>
                    </h1>
                    <p className="tx-env3d-header-guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                    <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                    {content.dateText && <p className="tx-env3d-header-date">{content.dateText}</p>}
                </div>

                {/* 3D Envelope Body */}
                <div className="tx-env3d-envelope">
                    {/* Inner pocket background pattern */}
                    <div className="tx-env3d-lining" aria-hidden="true" />

                    {/* Gold Card Sliding Out */}
                    <div className="tx-env3d-card">
                        <div className="tx-env3d-card-inner">
                            <div className="tx-env3d-card-frame" />
                            <p className="tx-env3d-card-eyebrow">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                            <div className="tx-env3d-card-monogram">
                                <span>{content.monogramText || "囍"}</span>
                            </div>
                            <h2 className="tx-env3d-card-couple">
                                <span className="tx-foil-gold">{content.groom}</span>
                                <em aria-hidden="true">{content.amp || "♥"}</em>
                                <span className="tx-foil-gold">{content.bride}</span>
                            </h2>
                            <p className="tx-env3d-card-guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                            <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                            {content.dateText && <p className="tx-env3d-card-date">{content.dateText}</p>}
                        </div>
                    </div>

                    {/* Front Lower Pocket Flap */}
                    <div className="tx-env3d-pocket-front" aria-hidden="true">
                        <div className="tx-env3d-pocket-crest">
                            <span>{content.monogramText || "囍"}</span>
                        </div>
                    </div>

                    {/* Top Triangular Flap that unfolds 180° */}
                    <div className="tx-env3d-top-flap" aria-hidden="true">
                        <div className="tx-env3d-flap-shadow" />
                    </div>

                    {/* Wax Seal Stamp (Interactive trigger) */}
                    <button
                        type="button"
                        className="tx-env3d-wax-seal"
                        onClick={onOpen}
                        disabled={state !== "closed"}
                        aria-label={opening.openButtonText || (lang === "en" ? "Tap seal to open" : "ចុចលើត្រាក្រមួនដើម្បីបើក")}
                    >
                        <div className="tx-env3d-seal-body">
                            <div className="tx-env3d-seal-rim" />
                            <div className="tx-env3d-seal-center">
                                <span>{content.monogramText?.slice(0, 3) || "囍"}</span>
                            </div>
                        </div>
                        <span className="tx-env3d-seal-pulse" />
                    </button>
                </div>

                <div className="tx-env3d-actions">
                    <button
                        type="button"
                        className="tx-btn tx-btn--solid tx-env3d-open-btn"
                        onClick={onOpen}
                        disabled={state !== "closed"}
                    >
                        {isOpening ? (lang === "en" ? "Opening Envelope..." : "កំពុងបើកស្រោមសំបុត្រ...") : (opening.openButtonText || (lang === "en" ? "Open Invitation" : "ចុចបើកសំបុត្រអញ្ជើញ"))}
                    </button>
                    <p className="tx-env3d-hint-text">{lang === "en" ? "Tap seal or button to open" : "ចុចលើត្រាក្រមួន ឬប៊ូតុងដើម្បីបើក"}</p>
                </div>
            </div>
        </div>
    );
}

/* =========================================================================
   STYLE 3: Magical Portal Gate with Floating Petals & Light Rays
   ========================================================================= */
function MagicalGate({
    content,
    opening,
    state,
    onOpen,
    guestText,
}) {
    const lang = useLanguageStore((state) => state.lang);
    const isOpening = state === "opening";

    return (
        <div className={`tx-gate-magical ${isOpening ? "is-opening" : ""}`}>
            {/* Background Aura & Light Radiance */}
            <div className="tx-magical-aura" aria-hidden="true" />
            <div className="tx-magical-light-burst" aria-hidden="true" />

            {/* Floating Ethereal Lotus Petals & Sparkles */}
            <div className="tx-magical-petals" aria-hidden="true">
                <span className="tx-magic-petal tx-magic-petal--1" />
                <span className="tx-magic-petal tx-magic-petal--2" />
                <span className="tx-magic-petal tx-magic-petal--3" />
                <span className="tx-magic-petal tx-magic-petal--4" />
                <span className="tx-magic-petal tx-magic-petal--5" />
                <span className="tx-magic-petal tx-magic-petal--6" />
                <span className="tx-magic-sparkle tx-magic-sparkle--1" />
                <span className="tx-magic-sparkle tx-magic-sparkle--2" />
                <span className="tx-magic-sparkle tx-magic-sparkle--3" />
            </div>

            {/* Stage Portal Architecture */}
            <div className="tx-magical-arch" aria-hidden="true">
                <div className="tx-magical-arch-glow" />
            </div>

            {/* Revealed Card Content */}
            <div className="tx-magical-card-stage">
                <div className="tx-magical-card">
                    <p className="tx-gate__eyebrow">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                    <p className="tx-gate__invitation-text">{opening.invitationText || (lang === "en" ? "You are cordially invited to celebrate the wedding of" : "សូមគោរពអញ្ជើញជាអធិបតី និងភ្ញៀវកិត្តិយស")}</p>
                    <div className="tx-gate__crest" aria-label={`Monogram ${content.monogramText}`}>
                        <strong>{content.monogramText || "囍"}</strong>
                    </div>
                    <h1>
                        <span className="tx-foil-gold">{content.groom}</span>
                        <em aria-hidden="true">{content.amp || "♥"}</em>
                        <span className="tx-foil-gold">{content.bride}</span>
                    </h1>
                    <div className="tx-gate__separator" aria-hidden="true"><span /></div>
                    <p className="tx-gate__guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                    <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                    {content.dateText && <p className="tx-gate__date">{content.dateText}</p>}
                </div>
            </div>

            {/* Left 3D Temple Door */}
            <div className="tx-magical-door tx-magical-door--left" aria-hidden="true">
                <div className="tx-magical-door-glow" />
            </div>

            {/* Right 3D Temple Door */}
            <div className="tx-magical-door tx-magical-door--right" aria-hidden="true">
                <div className="tx-magical-door-glow" />
            </div>

            {/* Front Stage Display with Couple Names & Magic Trigger Medallion */}
            <div className="tx-magical-trigger-wrapper">
                <div className="tx-magical-front-header" aria-hidden="true">
                    {content.badge && (
                        <span className="tx-magical-front-badge">{content.badge}</span>
                    )}
                    <p className="tx-magical-front-heading">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                    <h2 className="tx-magical-front-names">
                        <span className="tx-foil-gold">{content.groom}</span>
                        <em className="tx-magic-front-heart">{content.amp || "♥"}</em>
                        <span className="tx-foil-gold">{content.bride}</span>
                    </h2>
                    <p className="tx-magical-front-guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                    <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                    {content.dateText && <p className="tx-magical-front-date">{content.dateText}</p>}
                </div>

                <button
                    type="button"
                    className="tx-magical-seal"
                    onClick={onOpen}
                    disabled={state !== "closed"}
                    aria-label={opening.openButtonText}
                >
                    <div className="tx-magical-seal-ring" />
                    <div className="tx-magical-seal-gem">
                        <span>{content.monogramText || "✦"}</span>
                    </div>
                    <span className="tx-magical-seal-text">
                        {isOpening ? (lang === "en" ? "Opening Gate..." : "កំពុងបើកទ្វារ...") : (opening.openButtonText || (lang === "en" ? "Open Invitation" : "បើកខ្លោងទ្វារមង្គល"))}
                    </span>
                    <span className="tx-magical-tap-subtext">{lang === "en" ? "✨ Tap to open ✨" : "✨ ប៉ះដើម្បីបើក ✨"}</span>
                </button>
            </div>
        </div>
    );
}

/* =========================================================================
   STYLE 4: Classic Khmer Royal Gate
   ========================================================================= */
function KhmerRoyalGate({
    content,
    opening,
    state,
    onOpen,
    guestText,
    openingVideoUrl,
    videoRef,
    videoFailed,
    setVideoFailed,
}) {
    const lang = useLanguageStore((state) => state.lang);

    return (
        <>
            {openingVideoUrl && !videoFailed ? (
                <video
                    ref={videoRef}
                    className="tx-gate__media"
                    src={openingVideoUrl}
                    poster={content.coverImage || undefined}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setVideoFailed(true)}
                    aria-hidden="true"
                />
            ) : (
                <TemplateImage
                    className="tx-gate__media"
                    src={content.coverImage}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                />
            )}
            <div className="tx-gate__veil" aria-hidden="true" />
            <div className="tx-gate__paper" aria-hidden="true" />
            <div className="tx-gate__frame" aria-hidden="true" />
            <KhmerCornerOrnament position="top-left" />
            <KhmerCornerOrnament position="top-right" />
            <KhmerCornerOrnament position="bottom-left" />
            <KhmerCornerOrnament position="bottom-right" />

            <div className="tx-gate__content">
                <p className="tx-gate__eyebrow">{opening.heading || (lang === "en" ? "WEDDING INVITATION" : "សិរីសួស្តី អាពាហ៍ពិពាហ៍")}</p>
                <p className="tx-gate__invitation-text">{opening.invitationText || (lang === "en" ? "You are cordially invited to celebrate the wedding of" : "សូមគោរពអញ្ជើញជាអធិបតី និងភ្ញៀវកិត្តិយស")}</p>
                <div className="tx-gate__crest" aria-label={`Monogram ${content.monogramText}`}>
                    <strong>{content.monogramText}</strong>
                </div>
                <h1>
                    <span className="tx-foil-gold">{content.groom}</span>
                    <em aria-hidden="true">{content.amp}</em>
                    <span className="tx-foil-gold">{content.bride}</span>
                </h1>
                <div className="tx-gate__separator" aria-hidden="true"><span /></div>
                <p className="tx-gate__guest">{lang === "en" ? `Cordially Inviting ${guestText}` : `សូមគោរពអញ្ជើញ ${guestText}`}</p>
                <GuestSeatPill table={content.guestTable} seat={content.guestSeat} />
                {content.dateText && <p className="tx-gate__date">{content.dateText}</p>}
                <button
                    type="button"
                    className="tx-btn tx-btn--solid tx-gate__button"
                    onClick={onOpen}
                    disabled={state !== "closed"}
                >
                    {state === "opening" ? (lang === "en" ? "Opening..." : "កំពុងបើក...") : (opening.openButtonText || (lang === "en" ? "Open Invitation" : "ចុចបើកសំបុត្រអញ្ជើញ"))}
                </button>
            </div>
        </>
    );
}

/* =========================================================================
   MAIN COMPONENT: TemplateOpeningGate
   ========================================================================= */
export default function TemplateOpeningGate({
    content,
    lockDocumentScroll = true,
    onOpen,
    state = "closed",
}) {
    const reduced = usePrefersReducedMotion();
    const videoRef = useRef(null);
    const [videoFailed, setVideoFailed] = useState(false);
    const openingVideoUrl = videoUrl(content.openingVideo);
    const design = content.design || {};
    const opening = content.opening || {};
    const openingStyle = content.gateStyle || content.openingStyle || design.openingStyle || "khmer-royal";
    const frameStyle = design.frameStyle || "double-gold";
    const ornamentStyle = design.ornamentStyle || "khmer-corner-01";
    const guestText = content.guestName || opening.genericGuestText;

    useEffect(() => {
        if (!lockDocumentScroll) return undefined;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [lockDocumentScroll]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !openingVideoUrl) return undefined;
        let active = true;
        const playPromise = video.play?.();
        if (playPromise?.catch) {
            playPromise.catch(() => {
                if (active) setVideoFailed(true);
            });
        }

        return () => {
            active = false;
            video.pause?.();
            video.removeAttribute("src");
            video.load?.();
        };
    }, [openingVideoUrl]);

    const motionProps = reduced
        ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
            initial: { opacity: 0, scale: 1.015 },
            animate: { opacity: 1, scale: state === "opening" ? 1.025 : 1 },
            exit: { opacity: 0, scale: 1.04 },
            transition: { duration: state === "opening" ? 0.42 : 0.65, ease: [0.22, 1, 0.36, 1] },
        };

    return (
        <motion.section
            className={`tx-gate tx-gate--${openingStyle} tx-gate--frame-${frameStyle} tx-gate--ornament-${ornamentStyle}${state === "opening" ? " is-opening" : ""}`}
            aria-label={opening.openButtonText}
            aria-busy={state === "opening"}
            style={{
                "--tx-gate-overlay-opacity": design.openingOverlayOpacity,
                "--tx-gate-primary": design.primaryColor,
                "--tx-gate-accent": design.accentColor,
            }}
            {...motionProps}
        >
            {openingStyle === "celestial-cover" || openingStyle === "CELESTIAL_COVER" ? (
                <CelestialOpening
                    content={content}
                    onOpen={onOpen}
                    preview={state !== "closed"}
                />
            ) : openingStyle === "ribbon-untie" || openingStyle === "RIBBON_UNTIE" ? (
                <RibbonOpening
                    groom={content.groom}
                    bride={content.bride}
                    ribbonColor={design.primaryColor || "#D4AF37"}
                    ribbonColor2={design.secondaryColor || "#B8860B"}
                    onOpen={onOpen}
                    state={state}
                />
            ) : openingStyle === "cinematic-video" || openingStyle === "CINEMATIC_VIDEO" ? (
                <CinematicVideoOpening
                    videoUrl={content.videoUrl || openingVideoUrl}
                    posterUrl={content.coverImage}
                    groom={content.groom}
                    bride={content.bride}
                    onOpen={onOpen}
                    state={state}
                />
            ) : openingStyle === "curtain" || openingStyle === "CURTAIN" ? (
                <CurtainGate
                    content={content}
                    opening={opening}
                    state={state}
                    onOpen={onOpen}
                    guestText={guestText}
                />
            ) : openingStyle === "envelope-3d" || openingStyle === "WAX_ENVELOPE" ? (
                <Envelope3DGate
                    content={content}
                    opening={opening}
                    state={state}
                    onOpen={onOpen}
                    guestText={guestText}
                />
            ) : openingStyle === "magical-gate" ? (
                <MagicalGate
                    content={content}
                    opening={opening}
                    state={state}
                    onOpen={onOpen}
                    guestText={guestText}
                />
            ) : openingStyle === "khmer-royal" || openingStyle === "KHMER_ROYAL" ? (
                <KhmerRoyalGate
                    content={content}
                    opening={opening}
                    state={state}
                    onOpen={onOpen}
                    guestText={guestText}
                    openingVideoUrl={openingVideoUrl}
                    videoRef={videoRef}
                    videoFailed={videoFailed}
                    setVideoFailed={setVideoFailed}
                />
            ) : (
                <CelestialOpening
                    content={content}
                    onOpen={onOpen}
                    preview={state !== "closed"}
                />
            )}
        </motion.section>
    );
}
