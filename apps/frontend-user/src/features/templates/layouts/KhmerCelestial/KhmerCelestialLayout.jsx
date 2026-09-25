import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  Clock3,
  ExternalLink,
  Flower2,
  Gem,
  HandHeart,
  MapPin,
  Music2,
  PackageOpen,
  RotateCcw,
  Scissors,
  Soup,
  Sparkles,
  UtensilsCrossed,
  UsersRound,
} from "lucide-react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import TemplateGift from "../../experience/components/sections/TemplateGift";
import TemplateRsvp from "../../experience/components/sections/TemplateRsvp";
import CelestialGallery from "./components/CelestialGallery";
import CelestialOpening from "./components/CelestialOpening";
import CelestialLiveGarden from "./components/CelestialLiveGarden";
import CinematicVideoOpening from "@/features/templates/shared/Openings/CinematicVideoOpening";
import {
  CelestialHeading,
  CelestialImage,
  CelestialReveal,
} from "./components/CelestialSection";
import { KHMER_CELESTIAL_ASSETS } from "./khmerCelestialAssets";
import "./khmer-celestial.css";

const ensureGoogleFontLoaded = (fontFamily) => {
  if (!fontFamily || typeof document === "undefined") return;
  const cleanName = fontFamily.trim().replace(/^['"]|['"]$/g, "");
  const fontId = `gfont-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}&display=swap`;
  document.head.appendChild(link);
};

const ensureCustomFontFace = (fontFamily, fontUrl) => {
  if (!fontFamily || !fontUrl || typeof document === "undefined" || typeof FontFace === "undefined") return;
  const cleanName = fontFamily.trim().replace(/^['"]|['"]$/g, "");
  try {
    const font = new FontFace(cleanName, `url("${fontUrl}")`);
    font.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch(() => {});
  } catch {}
};

const PROGRAM_ICONS = [
  Sparkles,
  UsersRound,
  PackageOpen,
  Gem,
  BookOpenText,
  Scissors,
  HandHeart,
  Soup,
  UtensilsCrossed,
];

const COUNTDOWN_LABELS = [
  ["ថ្ងៃ", "DAYS"],
  ["ម៉ោង", "HOURS"],
  ["នាទី", "MINUTES"],
  ["វិនាទី", "SECONDS"],
];

function useCountdown(targetDate) {
  const [now, setNow] = useState(() => Date.now());
  const target = useMemo(() => {
    const parsed = new Date(targetDate || "").getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }, [targetDate]);

  useEffect(() => {
    if (!target) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!target) return { valid: false, expired: false, values: ["00", "00", "00", "00"] };
  const remaining = Math.max(0, target - now);
  const values = [
    Math.floor(remaining / 86_400_000),
    Math.floor((remaining % 86_400_000) / 3_600_000),
    Math.floor((remaining % 3_600_000) / 60_000),
    Math.floor((remaining % 60_000) / 1000),
  ].map((value) => String(value).padStart(2, "0"));
  return { valid: true, expired: remaining === 0, values };
}

function CelestialCountdownSection({ content, calendarUrl, languageMode, enabled }) {
  const countdown = useCountdown(content.machineEventDate || content.targetDate);
  if (!enabled) return null;

  return (
    <section className="kc-section kc-countdown" data-tx-section="countdown" aria-labelledby="kc-countdown-title">
      <div className="kc-shell kc-shell--narrow">
        <CelestialHeading
          id="kc-countdown-title"
          khmer={countdown.expired ? "ថ្ងៃមង្គលបានមកដល់" : "រាប់ថយក្រោយដល់ថ្ងៃមង្គល"}
          english={countdown.expired ? "The celebration has begun" : "Until the wedding day"}
          eyebrow="SAVE THE DATE"
          languageMode={languageMode}
        />
        <CelestialReveal className="kc-countdown__grid" aria-live="polite">
          {countdown.values.map((value, index) => (
            <div key={COUNTDOWN_LABELS[index][1]}>
              <strong>{value}</strong>
              <span>{COUNTDOWN_LABELS[index][0]}</span>
              <small>{COUNTDOWN_LABELS[index][1]}</small>
            </div>
          ))}
        </CelestialReveal>
        <CelestialReveal className="kc-countdown__details" delay={0.08}>
          {content.dateText ? <p><CalendarDays aria-hidden="true" /> {content.dateText}</p> : null}
          {content.eventTime ? <p><Clock3 aria-hidden="true" /> {content.eventTime}</p> : null}
          {calendarUrl ? (
            <a className="kc-button kc-button--outline" href={calendarUrl} target="_blank" rel="noreferrer">
              <CalendarDays aria-hidden="true" /> Add to calendar
            </a>
          ) : null}
        </CelestialReveal>
      </div>
    </section>
  );
}

function buildCalendarUrl(content) {
  const start = new Date(content.machineEventDate || content.targetDate || "");
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const calendarDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: content.eventTitle || `${content.groom} & ${content.bride} Wedding`,
    dates: `${calendarDate(start)}/${calendarDate(end)}`,
    details: content.message || "Wedding invitation",
    location: [content.venue?.name, content.venue?.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatMusicSource(value) {
  if (typeof value === "string") return value;
  return value?.url || "";
}

function firstImage(item) {
  return typeof item === "string" ? item : item?.src || item?.image || item?.url || "";
}

function parentLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return [];
}

function FamilyGroup({ title, parents, label, name }) {
  return (
    <CelestialReveal as="article" className="kc-family__group">
      <p className="kc-family__side">{title}</p>
      <div className="kc-family__parents">
        {parentLines(parents).map((parent) => <p key={parent}>{parent}</p>)}
      </div>
      <span className="kc-family__sprig" aria-hidden="true"><Flower2 /></span>
      <p className="kc-family__label">{label}</p>
      <h3>{name}</h3>
    </CelestialReveal>
  );
}

export default function KhmerCelestialLayout({
  content,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  preview = false,
  previewStartClosed = false,
  useTemplateLink,
  primaryCtaLabel = "ប្រើគំរូនេះ",
  showActions = true,
  isHostedInvitation = false,
  children,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [opened, setOpened] = useState(preview && !previewStartClosed);
  const [openTransitionActive, setOpenTransitionActive] = useState(false);
  const [musicState, setMusicState] = useState("idle");
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const audioRef = useRef(null);
  const musicUrl = formatMusicSource(content.music)
    || (isHostedInvitation ? "" : KHMER_CELESTIAL_ASSETS.defaultMusic);
  const languageMode = content.languageMode || "both";
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroLogoY = useTransform(heroScrollProgress, [0, 1], [0, -12]);
  const heroLogoScale = useTransform(heroScrollProgress, [0, 1], [1, 0.96]);
  const heroLogoOpacity = useTransform(heroScrollProgress, [0, 0.85], [1, 0.88]);
  const calendarUrl = useMemo(() => buildCalendarUrl(content), [content]);
  const sectionEnabled = useCallback(
    (key) => content.enabledSections?.[key] !== false,
    [content.enabledSections]
  );
  const musicEnabled = Boolean(musicUrl) && sectionEnabled("music");
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData === true;
  const transitionEnabled = !reducedMotion && !saveData;
  const groomName = content.groom?.trim() || "វណ្ណដា";
  const brideName = content.bride?.trim() || "ស្រីពេជ្រ";
  const names = [content.groom, content.bride].filter(Boolean);
  const hasCoupleNames = names.length > 0;
  const showBrandMark = content.showBrandMark !== false;
  const effectiveBrandMark = showBrandMark
    ? (content.brandMark || KHMER_CELESTIAL_ASSETS.brandMark)
    : null;
  const logoAlt = `ស្លាកឈ្មោះ ${groomName} និង ${brideName}`;
  const heroAlt = `រូបភាពអាពាហ៍ពិពាហ៍ ${groomName} និង ${brideName}`;

  useEffect(() => {
    if (preview || opened) return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [opened, preview]);

  useEffect(() => {
    if (typeof window === "undefined" || opened) return;
    const img = new Image();
    img.src = KHMER_CELESTIAL_ASSETS.openButton;
  }, [opened]);

  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.type === "TOGGLE_GATE") {
        setOpened(Boolean(event.data.open ?? event.data.isOpen));
      }
      if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data.data) {
        setLiveData(event.data.data);
      }
    };
    window.addEventListener("message", onMessage);
    if (typeof window !== "undefined" && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "PREVIEW_READY" }, "*");
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!opened) return;
    window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }, [opened]);

  useEffect(() => {
    if (!openTransitionActive) return undefined;
    const timeout = window.setTimeout(() => setOpenTransitionActive(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [openTransitionActive]);

  const startMusic = useCallback(async () => {
    if (!musicEnabled || !audioRef.current) return;
    try {
      await audioRef.current.play();
      setMusicState("playing");
    } catch {
      setMusicState("error");
    }
  }, [musicEnabled]);

  const handleOpen = useCallback(() => {
    if (transitionEnabled) setOpenTransitionActive(true);
    setOpened(true);
    void startMusic();
  }, [startMusic, transitionEnabled]);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setMusicState("paused");
      return;
    }
    await startMusic();
  }, [startMusic]);

  const replay = useCallback(() => {
    setOpened(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const scrollToInvitation = useCallback(() => {
    document.querySelector("[data-kc-section='family']")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reducedMotion]);

  useEffect(() => {
    const fontsToLoad = new Set();
    const kFont = liveData?.fontKhmer || content?.fontKhmer;
    const lFont = liveData?.fontLatin || content?.fontLatin;
    if (kFont) fontsToLoad.add(kFont);
    if (lFont) fontsToLoad.add(lFont);

    const elemFonts = liveData?.elementFonts || content?.elementFonts || {};
    Object.values(elemFonts).forEach((f) => {
      if (f) fontsToLoad.add(f);
    });

    fontsToLoad.forEach((f) => ensureGoogleFontLoaded(f));

    const customList = liveData?.customFonts || content?.customFonts || [];
    if (Array.isArray(customList)) {
      customList.forEach((cf) => {
        if (cf.source === "google") {
          ensureGoogleFontLoaded(cf.value || cf.name);
        } else if (cf.source === "file" && cf.dataUrl) {
          ensureCustomFontFace(cf.value || cf.name, cf.dataUrl);
        }
      });
    }
  }, [
    liveData?.fontKhmer,
    liveData?.fontLatin,
    liveData?.elementFonts,
    liveData?.customFonts,
    content?.fontKhmer,
    content?.fontLatin,
    content?.elementFonts,
    content?.customFonts,
  ]);

  const schedule = Array.isArray(content.schedule) ? content.schedule : [];
  const party = Array.isArray(content.party) ? content.party : [];
  const dressColors = Array.isArray(content.dressCode?.colors) ? content.dressCode.colors : [];
  const faq = Array.isArray(content.faq) ? content.faq : [];
  const gift = Array.isArray(content.gift) ? content.gift : [];
  const galleryImages = Array.isArray(content.gallery) ? content.gallery : [];
  // Hero: always shows the cover image in the hero section
  const heroImage = content.coverImage || null;
  // Invitation portrait: dedicated upload, fallback to gallery only — NOT coverImage
  const invitationImage = content.invitationImage
    || firstImage(galleryImages[1])
    || firstImage(galleryImages[0])
    || (preview ? "/facebook/all/06-card/cover-card.jpg" : "");
  const invitationImage2 = content.invitationImage2 || null;

  const effectiveContent = useMemo(() => {
    const base = liveData ? { ...content, ...liveData } : { ...content };
    return {
      ...base,
      fontKhmer: base.fontKhmer || "Siemreap",
      fontLatin: base.fontLatin || "Cinzel Decorative",
      elementFonts: {
        ...(content.elementFonts || {}),
        ...(base.elementFonts || {}),
        ...(liveData?.elementFonts || {}),
      },
      selectedFontElement: liveData?.selectedFontElement || content.selectedFontElement || "couple",
      customFonts: base.customFonts || content.customFonts,
      openingStyle: base.openingStyle || base.gateStyle || content.openingStyle || content.gateStyle || content.design?.openingStyle,
      gateStyle: base.gateStyle || base.openingStyle || content.gateStyle || content.openingStyle || content.design?.openingStyle,
      groom: base.groomName || base.groom || content.groom,
      bride: base.brideName || base.bride || content.bride,
      title: base.invitationTitle || base.title || content.title,
      invitationTitle: base.invitationTitle || base.title || content.invitationTitle || content.title,
      subtitle: base.invitationSubtitle !== undefined ? base.invitationSubtitle : (base.subtitle !== undefined ? base.subtitle : (content.subtitle || content.invitationSubtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ")),
      invitationSubtitle: base.invitationSubtitle !== undefined ? base.invitationSubtitle : (base.subtitle !== undefined ? base.subtitle : (content.invitationSubtitle || content.subtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ")),
      backgroundImage: base.backgroundImage || base.bgImage || content.backgroundImage,
      openingVideo: base.openingVideo !== undefined ? base.openingVideo : (base.openingVideoUrl !== undefined ? base.openingVideoUrl : (base.videoUrl !== undefined ? base.videoUrl : content.openingVideo)),
      openingVideoUrl: base.openingVideoUrl !== undefined ? base.openingVideoUrl : (base.videoUrl !== undefined ? base.videoUrl : content.openingVideoUrl),
      videoUrl: base.videoUrl !== undefined ? base.videoUrl : (base.openingVideoUrl !== undefined ? base.openingVideoUrl : content.videoUrl),
      showCoverVideo: base.showCoverVideo !== undefined ? base.showCoverVideo : content.showCoverVideo,
      showBrandMark: base.showBrandMark !== undefined ? base.showBrandMark : content.showBrandMark,
      brandMark: base.showBrandMark === false || base.brandMark === "" ? "" : (base.brandMark !== undefined ? base.brandMark : content.brandMark),
      showGuestBanner: base.showGuestBanner !== undefined ? base.showGuestBanner : content.showGuestBanner,
      guestNameBanner: base.showGuestBanner === false || base.guestNameBanner === "" ? "" : (base.guestNameBanner !== undefined ? base.guestNameBanner : content.guestNameBanner),
      showOpenButton: base.showOpenButton !== undefined ? base.showOpenButton : content.showOpenButton,
      openButtonImage: base.showOpenButton === false || base.openButtonImage === "" ? "" : (base.openButtonImage !== undefined ? base.openButtonImage : content.openButtonImage),
      showButterflies: base.showButterflies !== undefined ? base.showButterflies : content.showButterflies,
      dateText: base.weddingDate || base.dateText || content.dateText || "ថ្ងៃពុធ ២៨ មករា ២០២៦",
      dateTextEn: base.weddingDateEn || base.dateTextEn || content.dateTextEn,
      weddingDate: base.weddingDate || base.dateText || content.weddingDate || content.dateText,
      weddingTime: base.weddingTime || base.receptionTime || content.weddingTime || content.receptionTime,
      receptionTime: base.weddingTime || base.receptionTime || content.receptionTime || "១៧:០០",
      guestLabel: (base.guestLabel && base.guestLabel.trim()) || (content.guestLabel && content.guestLabel.trim()) || (base.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ:"),
      guestName: (base.guestName && base.guestName.trim()) || (content.guestName && content.guestName.trim()) || "លោកអ្នក និងក្រុមគ្រួសារ",
      message: base.blessingMessage || base.message || content.message,
    };
  }, [content, liveData]);

  const elementFonts = effectiveContent.elementFonts || {};
  const globalKhmer = effectiveContent.fontKhmer || "Siemreap";
  const fontCouple = elementFonts.couple || globalKhmer;
  const fontDate = elementFonts.date || globalKhmer;
  const fontTime = elementFonts.time || globalKhmer;
  const fontSubtitle = elementFonts.subtitle || globalKhmer;
  const fontGuestLabel = elementFonts.guestLabel || globalKhmer;
  const fontGuestName = elementFonts.guestName || globalKhmer;

  const currentGateStyle = effectiveContent.gateStyle
    || effectiveContent.openingStyle
    || effectiveContent.design?.openingStyle
    || content.gateStyle
    || content.openingStyle
    || content.design?.openingStyle
    || "celestial-cover";

  const isCinematic = currentGateStyle === "cinematic-video" || currentGateStyle === "CINEMATIC_VIDEO";

  const botanicalFrame = effectiveContent.backgroundImage
    || effectiveContent.design?.backgroundImage
    || effectiveContent.coverBgImage
    || (typeof effectiveContent.tpl?.backgroundImage === "string" ? effectiveContent.tpl.backgroundImage : "")
    || KHMER_CELESTIAL_ASSETS.botanicalFrame;

  return (
    <div
      className={`kc-root${preview ? " kc-root--preview" : ""}`}
      data-variant="khmer-celestial"
      style={{
        "--kc-bg-frame": `url("${botanicalFrame}")`,
        "--kc-khmer-display": effectiveContent.fontKhmer
          ? `"${effectiveContent.fontKhmer}", "Bayon", "Moul", serif`
          : '"Bayon", "Moul", serif',
        "--kc-khmer-body": effectiveContent.fontKhmer
          ? `"${effectiveContent.fontKhmer}", "Battambang", sans-serif`
          : '"Battambang", sans-serif',
        "--kc-english-display": effectiveContent.fontLatin
          ? `"${effectiveContent.fontLatin}", "Cormorant Garamond", Georgia, serif`
          : undefined,
      }}
    >
      {musicEnabled ? (
        <audio
          ref={audioRef}
          src={musicUrl}
          preload="none"
          loop
          onPlay={() => setMusicState("playing")}
          onPause={() => setMusicState((state) => state === "error" ? state : "paused")}
          onError={() => setMusicState("error")}
        />
      ) : null}

      <AnimatePresence>
        {!opened ? (
          isCinematic ? (
            <motion.div
              key="opening-cinematic"
              className="kc-opening kc-opening--cinematic"
              role="dialog"
              aria-modal="true"
              aria-label="Cinematic Video Opening"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? { display: "none" } : { opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: reducedMotion ? 0 : 0.7 }}
            >
              <CinematicVideoOpening
                content={effectiveContent}
                videoUrl={
                  (typeof effectiveContent.openingVideo === "object" ? effectiveContent.openingVideo?.url : effectiveContent.openingVideo) ||
                  effectiveContent.openingVideoUrl ||
                  effectiveContent.videoUrl ||
                  "/invitations/khmer-celestial/burgundy-bokeh.mp4"
                }
                posterUrl={
                  (typeof effectiveContent.videoPoster === "object" ? effectiveContent.videoPoster?.url : effectiveContent.videoPoster) ||
                  "/invitations/khmer-celestial/burgundy-bokeh-poster.webp" ||
                  (typeof effectiveContent.coverImage === "object" ? effectiveContent.coverImage?.url : effectiveContent.coverImage)
                }
                groom={effectiveContent.groom || groomName}
                bride={effectiveContent.bride || brideName}
                weddingTitle={effectiveContent.weddingTitle || "វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍"}
                weddingDate={effectiveContent.dateText || "ត្រីសង្ក្រាន្តទី ២៨ ខែមករា ឆ្នាំ ២០២៦"}
                weddingTime={effectiveContent.receptionTime || "ម៉ោង ១៧:០០"}
                venueName={effectiveContent.venueName || "The Premier Center Sen Sok"}
                guestLabel={effectiveContent.guestLabel || "ជូនចំពោះ:"}
                guestName={effectiveContent.guestName || "លោកអ្នក និងក្រុមគ្រួសារ"}
                subtitle={effectiveContent.subtitle || effectiveContent.invitationSubtitle}
                onOpen={handleOpen}
                state={opened ? "opened" : "closed"}
                preview={preview}
              />
            </motion.div>
          ) : (
            <CelestialOpening
              key="opening-celestial"
              content={effectiveContent}
              onOpen={handleOpen}
              preview={preview}
            />
          )
        ) : null}
      </AnimatePresence>

      {openTransitionActive ? (
        <CelestialLiveGarden
          className="kc-opening__transition"
          variant="transition"
        />
      ) : null}

      <nav className="kc-toolbar" aria-label="Invitation controls" aria-hidden={!opened} inert={!opened}>
        {showBack ? (
          <Link className="kc-toolbar__button" to={backTo} aria-label={backLabel}>
            <ArrowLeft aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        ) : <span />}
        <div className="kc-toolbar__actions">
          {opened && !preview ? (
            <button type="button" className="kc-toolbar__button" onClick={replay} aria-label="បើកគម្របម្តងទៀត">
              <RotateCcw aria-hidden="true" />
              <span>Replay</span>
            </button>
          ) : null}
        </div>
      </nav>

      <main
        ref={mainRef}
        className="kc-main"
        tabIndex={-1}
        aria-hidden={!opened}
        inert={!opened}
        style={{ display: opened ? undefined : "none" }}
      >
        <CelestialLiveGarden className="kc-main__garden" variant="normal" />
        <section ref={heroRef} className="kc-hero" data-tx-section="hero" aria-labelledby="kc-hero-title">
          <motion.img
            className="kc-hero__botanical"
            src={botanicalFrame}
            alt=""
            aria-hidden="true"
            width="999"
            height="1575"
            initial={reducedMotion ? false : { scale: 1.02, filter: "blur(2px)" }}
            animate={opened ? { scale: 1, filter: "blur(0px)" } : { scale: 1.02, filter: "blur(2px)" }}
            transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="kc-hero__veil" aria-hidden="true" />
          <motion.div
            className="kc-hero__content"
            style={reducedMotion ? undefined : { y: heroLogoY, scale: heroLogoScale, opacity: heroLogoOpacity }}
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={opened ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: reducedMotion ? 0 : 0.88, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.15 }}
          >
            {(() => {
              const isGenericTitle = !content.title || content.title === "Khmer Celestial" || content.title.toLowerCase().includes("celestial");
              const heroEyebrowText = isGenericTitle ? "សិរីសួស្តីអាពាហ៍ពិពាហ៍" : content.title;
              const heroEyebrowLength = Array.from(heroEyebrowText.replace(/\s+/g, "")).length;
              const heroEyebrowClass = [
                "kc-hero__eyebrow",
                heroEyebrowLength > 20 ? "kc-hero__eyebrow--long" : "",
                heroEyebrowLength > 36 ? "kc-hero__eyebrow--very-long" : "",
              ].filter(Boolean).join(" ");
              return <p className={heroEyebrowClass}>{heroEyebrowText}</p>;
            })()}
            {effectiveBrandMark ? (
              <img className="kc-hero__brand" src={effectiveBrandMark} alt={logoAlt} width="768" height="512" />
            ) : null}
            {!content.hideCoupleNameOnCover && (
              <h1 id="kc-hero-title" className="kc-hero__couple-names" style={{ fontFamily: `"${fontCouple}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>
                <span className="kc-hero__groom" style={{ fontFamily: `"${fontCouple}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>{effectiveContent.groom || groomName}</span>
                <span className="kc-hero__amp"> &amp; </span>
                <span className="kc-hero__bride" style={{ fontFamily: `"${fontCouple}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>{effectiveContent.bride || brideName}</span>
              </h1>
            )}
            {heroImage ? (
              <div className="kc-hero__portrait">
                <CelestialImage src={heroImage} alt={heroAlt} />
              </div>
            ) : null}
            <span className="kc-hero__divider" aria-hidden="true"><i />◆<i /></span>
            <p className="kc-hero__date" style={{ fontFamily: `"${fontDate}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>{effectiveContent.dateText || "ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦"}</p>
            <p className="kc-hero__time" style={{ fontFamily: `"${fontTime}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>{effectiveContent.receptionTime || effectiveContent.eventTime || "វេលាម៉ោង ៥:០០ ល្ងាច"}</p>
            {content.venue?.name ? <p className="kc-hero__venue">{content.venue.name}</p> : null}
          </motion.div>
          <button type="button" className="kc-hero__scroll" onClick={scrollToInvitation} aria-label="រំកិលទៅព័ត៌មានគ្រួសារ">
            <span>សូមអញ្ជើញ</span>
            <ArrowDown aria-hidden="true" />
          </button>
        </section>

        {(() => {
          const defaultBodyOrder = [
            "family",
            "invitation",
            "countdown",
            "schedule",
            "map",
            "gallery",
            "party",
            "dressCode",
            "gift",
            "faq",
            "rsvp",
          ];
          const activeOrder = Array.isArray(effectiveContent.sectionOrder) && effectiveContent.sectionOrder.length > 0
            ? effectiveContent.sectionOrder
            : defaultBodyOrder;

          const renderSectionItem = (key) => {
            switch (key) {
              case "family":
                return (
                  <section key="family" className="kc-section kc-family" data-kc-section="family" aria-labelledby="kc-family-title">
                    <div className="kc-shell kc-shell--narrow">
                      <CelestialHeading
                        id="kc-family-title"
                        khmer={content.familyHeading || "គ្រួសារទាំងសងខាង"}
                        english="Together with our families"
                        eyebrow="FAMILY"
                        tone="ceremonial"
                        languageMode={languageMode}
                      />
                      <div className="kc-family__grid">
                        <FamilyGroup
                          title={content.family?.groomTitle || "ខាងកូនប្រុស"}
                          parents={content.family?.groomParents || content.couple?.groomParents}
                          label={content.family?.groomLabel || "កូនប្រុសនាម"}
                          name={effectiveContent.groom || groomName}
                        />
                        <span className="kc-family__seal" aria-hidden="true"><Flower2 /></span>
                        <FamilyGroup
                          title={content.family?.brideTitle || "ខាងកូនស្រី"}
                          parents={content.family?.brideParents || content.couple?.brideParents}
                          label={content.family?.brideLabel || "កូនស្រីនាម"}
                          name={effectiveContent.bride || brideName}
                        />
                      </div>
                    </div>
                  </section>
                );

              case "invitation":
                return (
                  <section key="invitation" className="kc-section kc-invitation" data-kc-section="invitation" aria-labelledby="kc-invitation-title">
                    <div className="kc-shell">
                      <div className="kc-invitation__layout">
                        {invitationImage2 ? (
                          /* Dual portrait: two photos side-by-side */
                          <div className="kc-invitation__dual-portraits">
                            <CelestialReveal className="kc-invitation__portrait kc-invitation__portrait--left">
                              <CelestialImage src={invitationImage} alt={heroAlt} />
                            </CelestialReveal>
                            <CelestialReveal className="kc-invitation__portrait kc-invitation__portrait--right" delay={0.12}>
                              <CelestialImage src={invitationImage2} alt={heroAlt} />
                            </CelestialReveal>
                          </div>
                        ) : (
                          <CelestialReveal className="kc-invitation__portrait">
                            <CelestialImage src={invitationImage} alt={heroAlt} />
                          </CelestialReveal>
                        )}
                        <div className="kc-invitation__copy">
                          <CelestialHeading
                            id="kc-invitation-title"
                            khmer={effectiveContent.messageTitle || "មានកិត្តិយសសូមគោរពអញ្ជើញ"}
                            english={effectiveContent.subtitle || "With joy and honor"}
                            eyebrow="THE INVITATION"
                            align="left"
                            tone="ceremonial"
                            languageMode={languageMode}
                          />
                          <CelestialReveal className="kc-invitation__guest">
                            <span style={{ fontFamily: `"${fontGuestLabel}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>
                              {effectiveContent.guestLabel || (effectiveContent.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ:")}
                            </span>
                            <strong style={{ fontFamily: `"${fontGuestName}", var(--kc-khmer-display), "Bayon", "Moul", serif` }}>
                              {effectiveContent.guestName?.trim() || "លោកអ្នក និងក្រុមគ្រួសារ"}
                            </strong>
                          </CelestialReveal>
                          <CelestialReveal as="p" className="kc-invitation__message" delay={0.08}>
                            {effectiveContent.message || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងញាតិមិត្តរាប់អានទាំងឡាយ សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យជូនកូនប្រុសកូនស្រីយើងខ្ញុំ ក្នុងកម្មវិធីមង្គលអាពាហ៍ពិពាហ៍ ដែលរៀបចំឡើងដោយក្តីរីករាយ។"}
                          </CelestialReveal>
                        </div>
                      </div>
                    </div>
                  </section>
                );

              case "countdown":
                return (
                  <CelestialCountdownSection
                    key="countdown"
                    content={content}
                    calendarUrl={calendarUrl}
                    languageMode={languageMode}
                    enabled={sectionEnabled("countdown")}
                  />
                );

              case "schedule":
                return sectionEnabled("schedule") && schedule.length ? (
                  <section key="schedule" className="kc-section kc-schedule" data-tx-section="schedule" aria-labelledby="kc-schedule-title">
                    <div className="kc-shell kc-shell--narrow">
                      <CelestialHeading
                        id="kc-schedule-title"
                        khmer={content.scheduleTitle || "កម្មវិធីមង្គលការ"}
                        english="The wedding programme"
                        eyebrow="CEREMONY"
                        languageMode={languageMode}
                      />
                      {content.scheduleDate ? <CelestialReveal as="p" className="kc-schedule__date">{content.scheduleDate}</CelestialReveal> : null}
                      <div className="kc-schedule__list">
                        {schedule.map((item, index) => {
                          const ProgrammeIcon = PROGRAM_ICONS[index % PROGRAM_ICONS.length];
                          return (
                            <CelestialReveal as="article" className="kc-schedule__item" key={item.id || `${item.time}-${index}`} delay={(index % 3) * 0.04}>
                              <time>{item.time}</time>
                              <span className="kc-schedule__marker" aria-hidden="true"><ProgrammeIcon /></span>
                              <div>
                                <h3>{item.title}</h3>
                                {item.titleEn ? <p className="kc-schedule__english">{item.titleEn}</p> : null}
                                {item.description ? <p>{item.description}</p> : null}
                                {item.location ? <small>{item.location}</small> : null}
                              </div>
                            </CelestialReveal>
                          );
                        })}
                      </div>
                      {content.scheduleEnding ? <CelestialReveal as="p" className="kc-schedule__ending">{content.scheduleEnding}</CelestialReveal> : null}
                    </div>
                  </section>
                ) : null;

              case "map":
              case "venue":
                return sectionEnabled("map") && (content.venue?.name || content.venue?.mapLink) ? (
                  <section key="map" className="kc-section kc-venue" data-tx-section="map" aria-labelledby="kc-venue-title">
                    <div className="kc-shell">
                      <div className="kc-venue__layout">
                        <div className="kc-venue__copy">
                          <CelestialHeading id="kc-venue-title" khmer="ទីតាំងប្រារព្ធពិធី" english="The celebration venue" eyebrow="LOCATION" align="center" languageMode={languageMode} />
                          <CelestialReveal>
                            {content.venue?.name ? <h3>{content.venue.name}</h3> : null}
                            {content.venue?.address ? <p>{content.venue.address}</p> : null}
                            {content.venue?.mapLink ? (
                              <a className="kc-button kc-button--gold" href={content.venue.mapLink} target="_blank" rel="noreferrer">
                                <MapPin aria-hidden="true" /> បើកផែនទី <ExternalLink aria-hidden="true" />
                              </a>
                            ) : null}
                            {(content.venue?.sketchMapImage || content.sketchMapImage) ? (
                              <div className="kc-venue__sketch-map">
                                <img
                                  src={content.venue?.sketchMapImage || content.sketchMapImage}
                                  alt={content.venue?.name || "ផែនទីទីតាំងប្រារព្ធពិធី"}
                                  className="kc-venue__sketch-img"
                                />
                              </div>
                            ) : null}
                          </CelestialReveal>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null;

              case "gallery":
                return sectionEnabled("gallery") ? (
                  <CelestialGallery key="gallery" images={content.gallery} languageMode={languageMode} preview={preview} />
                ) : null;

              case "party":
                return sectionEnabled("party") && party.length ? (
                  <section key="party" className="kc-section kc-party" data-tx-section="party" aria-labelledby="kc-party-title">
                    <div className="kc-shell">
                      <CelestialHeading id="kc-party-title" khmer="មនុស្សជាទីស្រឡាញ់" english="With those closest to us" eyebrow="WEDDING PARTY" languageMode={languageMode} />
                      <div className="kc-party__grid">
                        {party.map((member, index) => (
                          <CelestialReveal as="article" key={member.id || `${member.name}-${index}`} delay={(index % 4) * 0.05}>
                            <CelestialImage src={firstImage(member.image)} alt={member.name || `Wedding party ${index + 1}`} />
                            <p>{member.role}</p>
                            <h3>{member.name}</h3>
                          </CelestialReveal>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null;

              case "dressCode":
              case "dress":
                return sectionEnabled("dressCode") && dressColors.length ? (
                  <section key="dressCode" className="kc-section kc-dress" data-tx-section="dressCode" aria-labelledby="kc-dress-title">
                    <div className="kc-shell kc-shell--narrow">
                      <CelestialHeading id="kc-dress-title" khmer="សម្លៀកបំពាក់" english="Ceremonial palette" eyebrow="DRESS CODE" languageMode={languageMode} />
                      <CelestialReveal className="kc-dress__content">
                        <h3>{content.dressCode.name}</h3>
                        {content.dressCode.style ? <p>{content.dressCode.style}</p> : null}
                        <div className="kc-dress__colors">
                          {dressColors.map((color, index) => (
                            <div key={`${color.hex}-${index}`}>
                              <span style={{ backgroundColor: color.hex }} aria-hidden="true" />
                              <small>{color.name}</small>
                            </div>
                          ))}
                        </div>
                        {content.dressCode.description ? <p>{content.dressCode.description}</p> : null}
                      </CelestialReveal>
                    </div>
                  </section>
                ) : null;

              case "gift":
                return sectionEnabled("gift") && gift.length ? (
                  <div key="gift" className="kc-gift" data-kc-section="gift">
                    <TemplateGift content={content} />
                  </div>
                ) : null;

              case "faq":
                return sectionEnabled("faq") && faq.length ? (
                  <section key="faq" className="kc-section kc-faq" data-tx-section="faq" aria-labelledby="kc-faq-title">
                    <div className="kc-shell kc-shell--narrow">
                      <CelestialHeading id="kc-faq-title" khmer="សំណួរញឹកញាប់" english="Guest notes" eyebrow="DETAILS" languageMode={languageMode} />
                      <div className="kc-faq__list">
                        {faq.map((item, index) => (
                          <CelestialReveal as="details" key={item.id || `${item.q}-${index}`}>
                            <summary>{item.q}</summary>
                            <p>{item.a}</p>
                          </CelestialReveal>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null;

              case "rsvp":
                return sectionEnabled("rsvp") ? (
                  <section key="rsvp" className="kc-section kc-rsvp" data-tx-section="rsvp" aria-labelledby="kc-rsvp-title">
                    <div className="kc-shell kc-rsvp__layout">
                      <CelestialHeading id="kc-rsvp-title" khmer="សូមបញ្ជាក់ការចូលរួម" english="We hope you can join us" eyebrow="RSVP" align="left" languageMode={languageMode} />
                      <CelestialReveal className="kc-rsvp__form">
                        {children || <TemplateRsvp useTemplateLink={useTemplateLink} />}
                      </CelestialReveal>
                    </div>
                  </section>
                ) : null;

              default:
                return null;
            }
          };

          return activeOrder.map((key) => renderSectionItem(key));
        })()}

        <section className="kc-section kc-closing" aria-label="Closing messages">
          <CelestialLiveGarden className="kc-closing__garden" variant="closing" />
          <img className="kc-closing__botanical" src={botanicalFrame} alt="" aria-hidden="true" width="999" height="1575" loading="lazy" decoding="async" />
          <div className="kc-shell kc-shell--narrow kc-closing__inner">
            <CelestialReveal as="article" className="kc-closing__note">
              <Flower2 aria-hidden="true" />
              <h2>{content.thankYouTitle || "សេចក្តីថ្លែងអំណរគុណ"}</h2>
              <p>{content.thankYouText || content.wish?.message || "វត្តមាន និងពរជ័យរបស់លោកអ្នក គឺជាអំណោយដ៏មានតម្លៃសម្រាប់យើងខ្ញុំ។"}</p>
            </CelestialReveal>
            <CelestialReveal as="article" className="kc-closing__note kc-closing__note--apology" delay={0.08}>
              <HandHeart aria-hidden="true" />
              <h2>{content.apologyTitle || "លិខិតសូមអភ័យទោស"}</h2>
              <p>{content.apologyText || "យើងខ្ញុំសូមអភ័យទោសក្នុងករណីពុំបានជូនសំបុត្រអញ្ជើញដោយផ្ទាល់ និងសូមគោរពអញ្ជើញលោកអ្នកចូលរួមដោយមេត្រីភាព។"}</p>
            </CelestialReveal>
          </div>
        </section>

        <footer className="kc-footer">
          <img className="kc-footer__botanical" src={botanicalFrame} alt="" aria-hidden="true" width="999" height="1575" loading="lazy" decoding="async" />
          <CelestialReveal>
            {effectiveBrandMark ? (
              <img className="kc-footer__brand" src={effectiveBrandMark} alt={logoAlt} loading="lazy" decoding="async" width="768" height="512" />
            ) : null}
            <p className="kc-footer__khmer">សូមអរគុណដោយក្តីគោរព</p>
            <h2>{groomName} <em>&amp;</em> {brideName}</h2>
            <small>Koupreng · Khmer Celestial</small>
          </CelestialReveal>
        </footer>

        {showActions && useTemplateLink ? (
          <div className="kc-template-actions">
            <Link className="kc-button kc-button--gold" to={useTemplateLink}>{primaryCtaLabel}</Link>
            <Link className="kc-button kc-button--outline" to={backTo}>{backLabel}</Link>
          </div>
        ) : null}
      </main>

      {musicEnabled && opened && musicState !== "error" ? (
        <button
          type="button"
          className={`kc-music-fab${musicState === "playing" ? " is-playing" : ""}`}
          onClick={toggleMusic}
          aria-label={musicState === "playing" ? "ផ្អាកតន្ត្រី" : "បើកតន្ត្រី"}
          aria-pressed={musicState === "playing"}
        >
          <Music2 aria-hidden="true" />
          <span className="kc-sr-only">Wedding music</span>
        </button>
      ) : null}
    </div>
  );
}
