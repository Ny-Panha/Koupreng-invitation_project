import { createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import { IoArrowBackOutline, IoSparkles } from "react-icons/io5";
import { buildTemplateContent } from "./config/templateExperienceContent";
import {
    getVariantTheme,
    resolveVariant,
} from "./config/templateExperienceThemes";
import { getDedicatedTemplateComponent } from "../registry/templateRegistry";
import TemplateOpeningGate from "./components/sections/TemplateOpeningGate";
import TemplateHero from "./components/sections/TemplateHero";
import TemplateMessage from "./components/sections/TemplateMessage";
import TemplateCouple from "./components/sections/TemplateCouple";
import TemplateCountdown from "./components/sections/TemplateCountdown";
import TemplateStory from "./components/sections/TemplateStory";
import TemplateSchedule from "./components/sections/TemplateSchedule";
import TemplateVenue from "./components/sections/TemplateVenue";
import TemplateGallery from "./components/sections/TemplateGallery";
import TemplateGift from "./components/sections/TemplateGift";

import TemplateRsvp from "./components/sections/TemplateRsvp";
import TemplateDressCode from "./components/sections/TemplateDressCode";
import TemplateFaq from "./components/sections/TemplateFaq";

import TemplateFooter from "./components/sections/TemplateFooter";
import TemplateMusicControl from "./components/controls/TemplateMusicControl";
import { useTemplateMusicController } from "./hooks/useTemplateMusicController";
import TemplateQuickNav from "./components/controls/TemplateQuickNav";
import TemplateSectionHeader from "./components/shared/TemplateSectionHeader";
import { templateIcons } from "./config/templateIcons";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import "./template-experience.css";
import "./components/canva-khmer/canva-khmer-wedding.css";

/**
 * TemplateExperience — shared, themeable full-page wedding experience.
 *
 * The single engine behind every template detail page. All templates share the
 * same UX structure, section completeness, responsive quality and button/card
 * consistency — each gets its own visual identity driven entirely by a variant
 * CSS modifier + CSS variables.
 *
 * DEMO surface only. Reads real values from `tpl` where available, fills the
 * rest with tasteful demo content. Never writes back to a user's invitation.
 *
 * Props:
 *  - tpl              resolved template object (from getTemplateById)
 *  - useTemplateLink  route for the "use this template" CTA
 *  - variant          optional explicit variant override
 *  - content          optional pre-built content override
 *  - breadcrumbItems  optional breadcrumb override (defaults to the public
 *                     marketing trail). Pass dashboard-context items when the
 *                     experience is rendered inside the host shell.
 *  - backLink         optional "back to all templates" destination
 *  - backLabel        optional label for the back button
 *  - preview          when true, renders an embeddable preview: the marketing
 *                     chrome (breadcrumb, CTA row, sticky bar) is hidden so the
 *                     experience fits inside the wedding-builder phone frame.
 *                     The floating music control stays so the host can hear the
 *                     chosen track; it anchors to the phone frame.
 */
export default function TemplateExperience({
    tpl,
    useTemplateLink,
    variant,
    content: contentProp,
    backLink = "/templates/browse",
    backLabel = "ត្រឡប់ក្រោយ",
    primaryCtaLabel = "ប្រើគំរូនេះ",
    preview = false,
    previewStartClosed = false,
    showBreadcrumb = true,
    showActions = true,
    showStickyCta = true,
    children,
}) {
    const resolvedVariant = useMemo(() => resolveVariant(tpl, variant), [tpl, variant]);
    const theme = useMemo(() => getVariantTheme(resolvedVariant), [resolvedVariant]);
    const [liveData, setLiveData] = useState(null);

    const baseContent = useMemo(
        () => contentProp || buildTemplateContent(tpl, resolvedVariant),
        [contentProp, tpl, resolvedVariant]
    );

    const content = useMemo(() => {
        if (!liveData) return baseContent;
        return {
            ...baseContent,
            groom: liveData.groomName || baseContent.groom,
            bride: liveData.brideName || baseContent.bride,
            title: liveData.invitationTitle || baseContent.title,
            invitationTitle: liveData.invitationTitle || baseContent.invitationTitle,
            subtitle: liveData.invitationSubtitle || baseContent.subtitle,
            amp: liveData.ampSymbol || baseContent.amp || "♥",
            badge: liveData.badgeText || baseContent.badge,
            monogramText: liveData.groomName && liveData.brideName
                ? `${liveData.groomName[0]} & ${liveData.brideName[0]}`
                : baseContent.monogramText,
            venue: liveData.venueName ? {
                ...baseContent.venue,
                name: liveData.venueName,
                hall: liveData.venueHall,
                address: liveData.venueAddress || baseContent.venue?.address,
            } : baseContent.venue,
            coverImage: liveData.coverImage || baseContent.coverImage,
            message: (typeof liveData.blessingMessage === "string" && liveData.blessingMessage.trim())
                ? liveData.blessingMessage
                : (typeof baseContent.message === "string" ? baseContent.message : (baseContent.message?.text || "")),
            couple: (liveData.groomFather || liveData.brideFather || liveData.groomMother || liveData.brideMother) ? {
                ...baseContent.couple,
                groomParents: [liveData.groomFather, liveData.groomMother].filter(Boolean).join(" និង ") || baseContent.couple?.groomParents,
                brideParents: [liveData.brideFather, liveData.brideMother].filter(Boolean).join(" និង ") || baseContent.couple?.brideParents,
            } : baseContent.couple,
            design: {
                ...baseContent.design,
                openingStyle: liveData.gateStyle || liveData.openingStyle || baseContent.design?.openingStyle,
                primaryColor: liveData.primaryColor || baseContent.design?.primaryColor,
                secondaryColor: liveData.secondaryColor || baseContent.design?.secondaryColor,
                cardMotion: liveData.cardMotion || liveData.cardLayout || baseContent.design?.cardMotion,
                backgroundImage: liveData.backgroundImage || liveData.bgImage || baseContent.design?.backgroundImage,
                openingVideoUrl: liveData.openingVideoUrl || liveData.videoUrl || baseContent.design?.openingVideoUrl,
                showButterflies: liveData.showButterflies,
            },
            openingStyle: liveData.gateStyle || liveData.openingStyle || baseContent.openingStyle || baseContent.design?.openingStyle,
            gateStyle: liveData.gateStyle || liveData.openingStyle || baseContent.gateStyle || baseContent.design?.openingStyle,
            cardMotion: liveData.cardMotion || liveData.cardLayout || baseContent.cardMotion,
            videoUrl: liveData.videoUrl || liveData.openingVideoUrl || baseContent.videoUrl,
            openingVideo: liveData.openingVideoUrl || liveData.videoUrl || baseContent.openingVideo,
            openingVideoUrl: liveData.openingVideoUrl || liveData.videoUrl || baseContent.openingVideoUrl,
            brandMark: liveData.showBrandMark === false || liveData.brandMark === "" ? "" : (liveData.brandMark !== undefined ? liveData.brandMark : baseContent.brandMark),
            showBrandMark: liveData.showBrandMark !== undefined ? liveData.showBrandMark : (liveData.brandMark === "" ? false : baseContent.showBrandMark),
            guestNameBanner: liveData.showGuestBanner === false || liveData.guestNameBanner === "" ? "" : (liveData.guestNameBanner !== undefined ? liveData.guestNameBanner : baseContent.guestNameBanner),
            showGuestBanner: liveData.showGuestBanner !== undefined ? liveData.showGuestBanner : (liveData.guestNameBanner === "" ? false : baseContent.showGuestBanner),
            openButtonImage: liveData.showOpenButton === false || liveData.openButtonImage === "" ? "" : (liveData.openButtonImage !== undefined ? liveData.openButtonImage : baseContent.openButtonImage),
            showOpenButton: liveData.showOpenButton !== undefined ? liveData.showOpenButton : (liveData.openButtonImage === "" ? false : baseContent.showOpenButton),
            showButterflies: liveData.showButterflies,
            googleMapUrl: liveData.googleMapUrl || baseContent.googleMapUrl,
            bankAccount: {
                bank: liveData.bankName || baseContent.bankAccount?.bank || "ABA Bank",
                accountNumber: liveData.bankAccountNumber || baseContent.bankAccount?.accountNumber || "000 123 456",
                accountName: liveData.bankAccountName || baseContent.bankAccount?.accountName || "VANDA & SREYPICH Official",
                qrUrl: liveData.qrGiftUrl || baseContent.bankAccount?.qrUrl,
            },
            gift: (liveData.qrGiftUrl || liveData.bankName || liveData.bankAccountNumber || liveData.bankAccountName) ? [
                {
                    id: "gift-live",
                    bank: liveData.bankName || "ABA Bank",
                    account: liveData.bankAccountName || "VANDA & SREYPICH Official",
                    number: liveData.bankAccountNumber || "000 123 456",
                    note: liveData.bankName ? `${liveData.bankName} PAY` : "ABA PAY",
                    qrImage: liveData.qrGiftUrl || "",
                    qrValue: liveData.qrGiftUrl ? "" : [liveData.bankName || "ABA Bank", liveData.bankAccountName || "", liveData.bankAccountNumber || ""].filter(Boolean).join(" | "),
                }
            ] : baseContent.gift,
            enableFloatingBar: liveData.enableFloatingBar !== false,
            enabledSections: liveData.enabledSections ? {
                ...baseContent.enabledSections,
                ...liveData.enabledSections,
            } : baseContent.enabledSections,
            opening: {
                ...baseContent.opening,
                heading: liveData.invitationTitle || baseContent.opening?.heading,
                invitationText: liveData.invitationSubtitle || baseContent.opening?.invitationText,
                genericGuestText: liveData.guestName || baseContent.opening?.genericGuestText,
            },
            guestName: liveData.guestName || baseContent.guestName,
            dressCode: {
                name: liveData.dressCodeName || baseContent.dressCode?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)",
                style: liveData.dressCodeStyle || baseContent.dressCode?.style || "ខ្មែរប្រពៃណី / សម័យ",
                description: liveData.dressCodeDesc || baseContent.dressCode?.description || "សូមស្លៀកសម្លៀកបំពាក់ពណ៌តាមប្រធានបទ ឬពណ៌សមរម្យ",
                colors: (liveData.dressColors && liveData.dressColors.length)
                    ? liveData.dressColors
                    : (baseContent.dressCode?.colors || [
                        { hex: "#8B1E2D", name: "ក្រហមទុំ" },
                        { hex: "#D4AF37", name: "មាស" },
                        { hex: "#FFFDF7", name: "ស" },
                        { hex: "#4A151C", name: "ក្រហមចាស់" },
                    ]),
            },
            faq: (liveData.faq && liveData.faq.length)
                ? liveData.faq
                : (baseContent.faq && baseContent.faq.length ? baseContent.faq : [
                    { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់។" },
                    { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗទាំងអស់ក្នុងពិធីមង្គលការ។" },
                    { id: "f3", q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?", a: "កម្មវិធីទទួលភ្ញៀវចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។" },
                ]),
            gallery: (liveData.galleryImages && liveData.galleryImages.length)
                ? liveData.galleryImages.map((src, i) => ({ src, span: ["tall", "wide", "small", "small"][i % 4] }))
                : baseContent.gallery,
            story: (liveData.storyText) ? (
                baseContent.story?.map((c, i) => i === 0 ? { ...c, text: liveData.storyText } : c) || baseContent.story
            ) : baseContent.story,
            schedule: (liveData.schedule && liveData.schedule.length)
                ? liveData.schedule.map((s, i) => ({
                    id: s.id || `schedule-${i}`,
                    time: s.time || "07:00",
                    title: s.title || "កម្មវិធី",
                    description: s.desc || s.description || "",
                }))
                : baseContent.schedule,
            targetDate: liveData.targetDate || liveData.eventDate || baseContent.targetDate,
            dateText: liveData.weddingDate || liveData.eventDateText || liveData.dateText || baseContent.dateText,
            eventTime: liveData.weddingTime || liveData.eventTime || baseContent.eventTime,
            receptionTime: liveData.weddingTime || liveData.receptionTime || baseContent.receptionTime,
            music: liveData.musicUrl || liveData.music || baseContent.music,
            backgroundImage: liveData.backgroundImage || liveData.bgImage || baseContent.backgroundImage,
        };
    }, [baseContent, liveData]);
    const DedicatedComponent = getDedicatedTemplateComponent(tpl, variant);

    const reducedMotion = usePrefersReducedMotion();
    const [musicAudioRef, musicController] = useTemplateMusicController(content.music);
    const rootRef = useRef(null);
    const contentRef = useRef(null);
    const openingTimerRef = useRef(null);
    const openingInFlightRef = useRef(false);
    const [gateState, setGateState] = useState(preview && !previewStartClosed ? "opened" : "closed");
    const [heroOpened, setHeroOpened] = useState(false);
    const gateOpen = gateState === "opened";

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data.data) {
                setLiveData(event.data.data);
            }
            if (event.data?.type === "TOGGLE_GATE") {
                const shouldOpen = Boolean(event.data.open ?? event.data.isOpen);
                setGateState(shouldOpen ? "opened" : "closed");
                setHeroOpened(shouldOpen);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);


    const setContentNode = useCallback((node) => {
        contentRef.current = node;
        if (!node || preview) return;
        window.requestAnimationFrame(() => {
            if (node.isConnected) node.focus({ preventScroll: true });
        });
    }, [preview]);

    const scrollToTarget = useCallback((node) => {
        if (!node) return;
        node.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const openingStyle = content.design?.openingStyle || "khmer-royal";

    const handleOpen = useCallback(() => {
        if (openingInFlightRef.current || gateState !== "closed") return;
        openingInFlightRef.current = true;
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setGateState("opening");
        void musicController.play();

        let duration = 460;
        if (openingStyle === "curtain" || openingStyle === "CURTAIN") duration = 1300;
        else if (openingStyle === "envelope-3d" || openingStyle === "WAX_ENVELOPE") duration = 1600;
        else if (openingStyle === "magical-gate") duration = 1300;
        else if (openingStyle === "ribbon-untie" || openingStyle === "RIBBON_UNTIE") duration = 300;
        else if (openingStyle === "cinematic-video" || openingStyle === "CINEMATIC_VIDEO") duration = 300;

        openingTimerRef.current = window.setTimeout(() => {
            setGateState("opened");
            setHeroOpened(false);
        }, reducedMotion ? 0 : duration);
    }, [gateState, musicController, reducedMotion, openingStyle]);

    useEffect(() => () => {
        if (openingTimerRef.current !== null) {
            window.clearTimeout(openingTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (gateOpen) openingInFlightRef.current = false;
    }, [gateOpen]);

    useLayoutEffect(() => {
        if (!preview || !gateOpen) return;
        const scroller = rootRef.current?.closest(".pe-canvas-wrapper, .wb-phone-scroll");
        if (scroller) scroller.scrollTop = 0;
    }, [gateOpen, preview]);

    useEffect(() => {
        if (DedicatedComponent || heroOpened) return undefined;

        const handleUserScroll = () => {
            const top = window.scrollY || document.documentElement.scrollTop || 0;
            if (top > 20) {
                setHeroOpened(true);
            }
        };

        const handleWheel = (e) => {
            if (e.deltaY > 0) {
                setHeroOpened(true);
            }
        };

        const handleTouchMove = () => {
            setHeroOpened(true);
        };

        const handleKeyDown = (e) => {
            if (["ArrowDown", "PageDown", "Space"].includes(e.code)) {
                setHeroOpened(true);
            }
        };

        window.addEventListener("scroll", handleUserScroll, { passive: true });
        window.addEventListener("wheel", handleWheel, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("scroll", handleUserScroll);
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [DedicatedComponent, heroOpened]);

    const handleHeroOpen = useCallback(() => {
        setHeroOpened(true);
        if (!musicController.playing) {
            void musicController.play();
        }
        window.requestAnimationFrame(() => {
            setTimeout(() => {
                const next = rootRef.current?.querySelector('[data-tx-section="message"]');
                if (next) {
                    scrollToTarget(next);
                }
            }, 60);
        });
    }, [musicController, scrollToTarget]);

    const handleScrollTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
    const handleNavigate = useCallback(
        (section) => {
            if (section === "hero") {
                handleScrollTop();
                return;
            }
            scrollToTarget(rootRef.current?.querySelector(`[data-tx-section="${section}"]`));
        },
        [handleScrollTop, scrollToTarget]
    );
    const sectionEnabled = useCallback(
        (key) => content.enabledSections?.[key] !== false,
        [content.enabledSections]
    );
    const ornamentTheme = content.design?.ornamentTheme || "royal-floral";

    if (DedicatedComponent) {
        return createElement(DedicatedComponent, {
            tpl: content,
            content,
            showBack: !preview && showBreadcrumb,
            backTo: backLink,
            backLabel,
            preview,
            previewStartClosed,
            useTemplateLink,
            primaryCtaLabel,
            showActions,
            showStickyCta,
            isHostedInvitation: Boolean(tpl?.hostContent),
        }, children);
    }

    return (
        <div className={`tx-stage tx-stage--${resolvedVariant}${!heroOpened ? " tx-stage--hero-locked" : ""}${preview ? " tx-stage--preview" : ""}`}>
            <div
                className={`tx-root ${theme.className} tx-ornament--${ornamentTheme}${preview ? " tx-root--preview" : ""}`}
                data-theme="wed"
                data-variant={resolvedVariant}
                style={content.backgroundImage ? { "--tx-bg-custom": `url(${content.backgroundImage})` } : undefined}
                ref={rootRef}
            >
            {!preview && showBreadcrumb && (
                <header className="tx-preview-topbar" role="banner" aria-label="របារមើលគំរូ">
                    <div className="tx-preview-topbar__inner">
                        <Link to={backLink} className="tx-preview-topbar__back" title="ត្រឡប់ទៅបញ្ជីគំរូ">
                            <IoArrowBackOutline className="tx-preview-topbar__back-icon" aria-hidden="true" />
                            <span>{backLabel}</span>
                        </Link>
                        <div className="tx-preview-topbar__meta">
                            <span className="tx-preview-topbar__name">{tpl?.name || content?.title || "គំរូសន្លឹកការ"}</span>
                            {tpl?.isPremium ? (
                                <span className="tx-preview-topbar__badge tx-preview-topbar__badge--premium">Premium</span>
                            ) : (
                                <span className="tx-preview-topbar__badge tx-preview-topbar__badge--free">Free</span>
                            )}
                        </div>
                        {showActions && useTemplateLink && (
                            <Link to={useTemplateLink} className="tx-preview-topbar__cta">
                                <IoSparkles className="tx-preview-topbar__cta-icon" aria-hidden="true" />
                                <span>{primaryCtaLabel}</span>
                            </Link>
                        )}
                    </div>
                </header>
            )}

            <AnimatePresence mode="wait">
                {gateState !== "opened" ? (
                    <TemplateOpeningGate
                        key={`opening-gate-${content.design?.openingStyle || "gate"}`}
                        content={content}
                        lockDocumentScroll={!preview}
                        onOpen={handleOpen}
                        state={gateState}
                    />
                ) : (
                    <motion.div
                        key={`invitation-content-${content.cardMotion || "motion"}`}
                        className={`tx-experience${content.cardMotion ? ` tx-motion--${String(content.cardMotion).toLowerCase().replace(/_/g, "-")}` : ""}`}
                        ref={setContentNode}
                        tabIndex={-1}
                        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <TemplateHero content={content} onOpen={handleHeroOpen} />
                        <TemplateMessage content={content} />
                        <TemplateCouple content={content} />
                        {sectionEnabled("countdown") && <TemplateCountdown content={content} />}
                        {sectionEnabled("schedule") && <TemplateSchedule content={content} />}
                        {sectionEnabled("map") && <TemplateVenue content={content} />}
                        {sectionEnabled("gallery") && <TemplateGallery content={content} />}
                        {sectionEnabled("story") && content.story?.length > 0 && <TemplateStory content={content} />}
                        {sectionEnabled("gift") && <TemplateGift content={content} />}
                        {sectionEnabled("dressCode") && <TemplateDressCode content={content} />}
                        {sectionEnabled("faq") && <TemplateFaq content={content} />}

                        {sectionEnabled("rsvp") && (
                            children ? (
                                <div className="tx-children" data-tx-section="rsvp">
                                    <TemplateSectionHeader
                                        id="tx-rsvp-title"
                                        icon={templateIcons.invitation}
                                        kicker="ការឆ្លើយតប"
                                        title="សូមបញ្ជាក់ការចូលរួម"
                                        subtitle="RSVP"
                                    />
                                    {children}
                                </div>
                            ) : (
                                <TemplateRsvp useTemplateLink={useTemplateLink} />
                            )
                        )}

                        <TemplateFooter content={content} />
                    </motion.div>

                )}
            </AnimatePresence>

            {gateOpen && !preview && showActions && useTemplateLink && (
                <div className="tx-template-actions">
                    <Link to={useTemplateLink} className="tx-btn tx-btn--solid">{primaryCtaLabel}</Link>
                    <Link to={backLink} className="tx-btn tx-btn--ghost">{backLabel}</Link>
                </div>
            )}

            {content.music && <audio ref={musicAudioRef} src={content.music} loop preload="auto" />}
            {gateOpen && <TemplateMusicControl controller={musicController} />}
            {gateOpen && showStickyCta && heroOpened && (
                <TemplateQuickNav
                    enabledSections={content.enabledSections}
                    onNavigate={handleNavigate}
                />
            )}
            </div>
        </div>
    );
}
