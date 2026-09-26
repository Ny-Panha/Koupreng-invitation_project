import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  VolumeX,
  Calendar,
  MapPin,
  Send,
  QrCode,
  Copy,
  RotateCcw,
  ExternalLink,
  X,
} from "lucide-react";
import defaultMusicUrl from "@/assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";
import { normalizeTemplateViewModel } from "../../model/templateModel";
import FallingPetals from "./components/FallingPetals";
import WaxSealEnvelope from "./components/WaxSealEnvelope";
import TemplateOpeningGate from "../../experience/components/sections/TemplateOpeningGate";
import DigitalYesSchedule from "./components/DigitalYesSchedule";
import DigitalYesRsvpModal from "./components/DigitalYesRsvpModal";
import "../../experience/template-experience.css";
import "./digital-yes.css";

const ensureGoogleFontLoaded = (fontFamily) => {
  if (!fontFamily || typeof document === "undefined" || (typeof process !== "undefined" && process.env?.NODE_ENV === "test")) return;
  const cleanName = fontFamily.trim().replace(/^['"]|['"]$/g, "");
  const fontId = `gfont-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}&display=swap`;
  document.head.appendChild(link);
};

const SectionDivider = () => (
  <div className="flex items-center justify-center gap-3 my-6 sm:my-8 opacity-70" aria-hidden="true">
    <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
    <span className="text-[10px] text-amber-400">❖</span>
    <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
  </div>
);

export default function DigitalYesLayout({
  tpl: tplProp,
  content: contentProp,
  showBack = true,
  backTo = "/templates",
  backLabel = "← ត្រឡប់ទៅគំរូទាំងអស់",
  preview = false,
  useTemplateLink,
  children,
}) {
  const [liveData, setLiveData] = useState(null);
  const tpl = useMemo(() => {
    return normalizeTemplateViewModel(tplProp, { ...contentProp, ...liveData });
  }, [tplProp, contentProp, liveData]);

  // Envelope Opening States - default open in preview
  const [isFlapOpen, setIsFlapOpen] = useState(preview ? true : false);
  const [isCardEmerging, setIsCardEmerging] = useState(preview ? true : false);
  const [isFullView, setIsFullView] = useState(preview ? true : false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Audio Ref
  const audioRef = useRef(null);

  // Gift QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Gallery Lightbox State
  const [lightboxImg, setLightboxImg] = useState(null);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const gateStyle = tpl.gateStyle || tpl.openingStyle || tpl.design?.openingStyle || "envelope-3d";
  const isCustomGate = Boolean(gateStyle && gateStyle !== "envelope-3d" && gateStyle !== "WAX_ENVELOPE");

  // Load Khmer & English Luxury Wedding Fonts
  useEffect(() => {
    ["Moul", "Kantumruy Pro", "Cinzel", "Playfair Display", "Battambang"].forEach(ensureGoogleFontLoaded);
    if (tpl.fontKhmer) ensureGoogleFontLoaded(tpl.fontKhmer);
    if (tpl.fontLatin) ensureGoogleFontLoaded(tpl.fontLatin);
  }, [tpl.fontKhmer, tpl.fontLatin]);

  // Sync postMessage with Admin Studio
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "TOGGLE_GATE") {
        const shouldOpen = Boolean(event.data.open ?? event.data.isOpen);
        if (shouldOpen) {
          setIsFlapOpen(true);
          setIsCardEmerging(true);
          setIsFullView(true);
        } else {
          setIsFullView(false);
          setIsCardEmerging(false);
          setIsFlapOpen(false);
        }
      }
      if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data.data) {
        setLiveData(event.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Countdown timer calculation
  useEffect(() => {
    let target = new Date(tpl.targetDate || "2026-11-28T17:00:00").getTime();
    if (Number.isNaN(target) || target <= Date.now()) {
      target = new Date("2026-11-28T17:00:00").getTime();
      if (target <= Date.now()) {
        target = Date.now() + 75 * 86400000 + 4 * 3600000 + 30 * 60000;
      }
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [tpl.targetDate]);

  // Handle Envelope Tap to Open
  const handleOpenEnvelope = () => {
    if (isFlapOpen) return;

    setIsFlapOpen(true);

    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {});
    }

    setTimeout(() => {
      setIsCardEmerging(true);
    }, 450);

    setTimeout(() => {
      setIsFullView(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1300);
  };

  const handleReplay = () => {
    setIsFullView(false);
    setIsCardEmerging(false);
    setIsFlapOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {});
    }
  };

  const handleCopyAccount = async () => {
    const text = tpl.bankAccount?.accountNumber || "";
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch {
      // Clipboard fallback
    }
    if (!success) {
      try {
        const input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand("copy");
        input.remove();
      } catch {
        // Optimistic fallback
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEnabled = (key) => tpl.enabledSections?.[key] !== false;
  const dressColors = Array.isArray(tpl.dressCode)
    ? tpl.dressCode
    : (Array.isArray(tpl.dressCode?.colors) ? tpl.dressCode.colors : (tpl.dressColors || []));
  const faqList = Array.isArray(tpl.faq) ? tpl.faq : [];

  return (
    <div className="tdy-page-root relative min-h-screen w-full bg-[#120308] text-amber-100 font-sans selection:bg-amber-700 selection:text-white overflow-x-hidden flex flex-col items-center justify-start">
      {/* Background Ambience and Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#400a18] via-[#1a030a] to-[#0a0104] opacity-95 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-500/15 via-rose-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Falling Flower Petals Canvas */}
      <FallingPetals />

      {/* Audio Element */}
      <audio ref={audioRef} src={tpl.music || defaultMusicUrl} loop preload="auto" />

      {/* Floating Header Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between pointer-events-auto w-full max-w-2xl px-4 sm:px-6">
        {showBack ? (
          <Link
            to={backTo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-xs font-medium text-amber-200 hover:bg-black/80 transition shadow-lg cursor-pointer"
          >
            <span>{backLabel}</span>
          </Link>
        ) : <div className="w-0" />}

        <div className="flex items-center gap-2 ml-auto">
          {isFullView && (
            <button
              onClick={handleReplay}
              title="មើលចលនាបើកសំបុត្រម្តងទៀត"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200 hover:bg-black/80 transition shadow-lg cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">បើកម្តងទៀត</span>
            </button>
          )}

          <button
            onClick={toggleMusic}
            title={isPlayingMusic ? "បិទភ្លេង" : "ចាក់ភ្លេង"}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200 hover:bg-black/80 transition shadow-lg cursor-pointer"
          >
            {isPlayingMusic ? (
              <>
                <div className="flex items-end gap-0.5 h-3.5 w-3 pb-0.5">
                  <span className="w-0.5 bg-amber-400 tdy-bar-1 rounded-full" />
                  <span className="w-0.5 bg-amber-400 tdy-bar-2 rounded-full" />
                  <span className="w-0.5 bg-amber-400 tdy-bar-3 rounded-full" />
                </div>
                <span className="text-[11px] font-medium">ភ្លេង</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-[11px] text-zinc-400">បើកភ្លេង</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STATE 1: DYNAMIC GATE OR 3D ENVELOPE OPENING STAGE */}
      {!isFullView && isCustomGate && (
        <div
          className="tx-root tx-root--preview"
          style={{
            position: preview ? "absolute" : "fixed",
            inset: 0,
            zIndex: 300,
            overflow: "hidden",
            backgroundColor: "#150306",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TemplateOpeningGate
            content={{
              ...tpl,
              groom: tpl.groom,
              bride: tpl.bride,
              dateText: tpl.dateText,
              design: {
                ...tpl.design,
                openingStyle: gateStyle,
                primaryColor: tpl.primaryColor || "#991b1b",
                secondaryColor: tpl.secondaryColor || "#d4af37",
              },
            }}
            lockDocumentScroll={false}
            onOpen={handleOpenEnvelope}
            state={isFullView ? "opened" : "closed"}
          />
        </div>
      )}

      {!isFullView && !isCustomGate && (
        <WaxSealEnvelope
          tpl={tpl}
          isFlapOpen={isFlapOpen}
          isCardEmerging={isCardEmerging}
          onOpenEnvelope={handleOpenEnvelope}
        />
      )}

      {/* STATE 2: FULL STORY WEDDING INVITATION REEL */}
      {isFullView && (
        <div className="relative z-20 tdy-card-container pt-16 pb-28 animate-fade-in tdy-font-kantumruy w-full">
          <div className="relative w-full rounded-3xl sm:rounded-[36px] tdy-card-glass border border-amber-400/35 p-6 sm:p-12 text-center space-y-8 sm:space-y-10 shadow-[0_25px_80px_rgba(0,0,0,0.95)]">
            
            {/* Top Emblem & Header */}
            <div className="pt-2">
              <div className="h-12 w-12 mx-auto rounded-full border border-amber-400/50 flex items-center justify-center bg-gradient-to-b from-amber-400/20 to-transparent shadow-[0_0_20px_rgba(212,175,55,0.25)] mb-3">
                <Heart className="h-5 w-5 text-amber-300 fill-amber-300/40 animate-pulse" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tdy-font-moul drop-shadow-sm">
                សិរីសួស្តីអាពាហ៍ពិពាហ៍
              </h2>
              <p className="text-[11px] tracking-[0.3em] text-amber-200/60 uppercase tdy-font-cinzel font-semibold mt-1.5">
                THE WEDDING CELEBRATION OF
              </p>
            </div>

            {/* Couple Names Hero */}
            <div className="space-y-3 py-2">
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white tdy-font-moul drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] leading-tight">
                  {tpl.groom}
                </h1>
                {tpl.groomEn && (
                  <p className="text-xs sm:text-sm tracking-[0.25em] text-amber-300/90 uppercase tdy-font-cinzel font-semibold mt-1">
                    {tpl.groomEn}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 my-3">
                <span className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                <span className="text-amber-400 tdy-font-playfair text-3xl italic font-light">&amp;</span>
                <span className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white tdy-font-moul drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] leading-tight">
                  {tpl.bride}
                </h1>
                {tpl.brideEn && (
                  <p className="text-xs sm:text-sm tracking-[0.25em] text-amber-300/90 uppercase tdy-font-cinzel font-semibold mt-1">
                    {tpl.brideEn}
                  </p>
                )}
              </div>
            </div>

            {/* Parents Honor Section */}
            {(tpl.groomParents || tpl.brideParents) && (
              <div className="py-5 px-4 sm:px-6 rounded-2xl bg-white/[0.04] border border-amber-400/25 text-center">
                <span className="inline-block text-xs uppercase text-amber-300 font-semibold mb-3">
                  ✦ មាតាបិតាទាំងសងខាង ✦
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm sm:divide-x sm:divide-amber-400/20">
                  <div className="px-2">
                    <span className="text-[11px] text-amber-300/80 font-medium block mb-1">
                      {tpl.groomParentsLabel || "មាតាបិតាខាងប្រុស"}
                    </span>
                    <p className="text-amber-100 font-medium leading-relaxed">{tpl.groomParents}</p>
                  </div>
                  <div className="px-2">
                    <span className="text-[11px] text-amber-300/80 font-medium block mb-1">
                      {tpl.brideParentsLabel || "មាតាបិតាខាងស្រី"}
                    </span>
                    <p className="text-amber-100 font-medium leading-relaxed">{tpl.brideParents}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Blessing / Invitation Message */}
            {tpl.blessingMessage && (
              <div className="py-2 px-2 text-center">
                <p className="text-xs sm:text-sm text-amber-100/90 leading-loose max-w-lg mx-auto">
                  {tpl.blessingMessage}
                </p>
              </div>
            )}

            {/* Wedding Date Pill */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-sm">
                <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{tpl.dateText}</span>
              </div>
            </div>

            {/* Live Countdown Grid */}
            {isEnabled("countdown") && (
              <div className="pt-2 text-center">
                <span className="text-xs text-amber-300/90 block mb-3.5 font-medium">
                  រាប់ថយក្រោយដល់ថ្ងៃមង្គលការ
                </span>
                <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto">
                  <div className="bg-white/[0.04] rounded-2xl p-3 sm:p-4 border border-amber-400/20 shadow-inner">
                    <span className="block text-2xl sm:text-4xl font-bold text-amber-300 font-mono">
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-amber-200/90 block font-medium mt-1">ថ្ងៃ</span>
                    <span className="text-[9px] text-amber-400/50 uppercase tracking-widest tdy-font-cinzel">DAYS</span>
                  </div>
                  <div className="bg-white/[0.04] rounded-2xl p-3 sm:p-4 border border-amber-400/20 shadow-inner">
                    <span className="block text-2xl sm:text-4xl font-bold text-amber-300 font-mono">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-amber-200/90 block font-medium mt-1">ម៉ោង</span>
                    <span className="text-[9px] text-amber-400/50 uppercase tracking-widest tdy-font-cinzel">HOURS</span>
                  </div>
                  <div className="bg-white/[0.04] rounded-2xl p-3 sm:p-4 border border-amber-400/20 shadow-inner">
                    <span className="block text-2xl sm:text-4xl font-bold text-amber-300 font-mono">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-amber-200/90 block font-medium mt-1">នាទី</span>
                    <span className="text-[9px] text-amber-400/50 uppercase tracking-widest tdy-font-cinzel">MINS</span>
                  </div>
                  <div className="bg-white/[0.04] rounded-2xl p-3 sm:p-4 border border-amber-400/20 shadow-inner">
                    <span className="block text-2xl sm:text-4xl font-bold text-amber-300 font-mono">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-amber-200/90 block font-medium mt-1">វិនាទី</span>
                    <span className="text-[9px] text-amber-400/50 uppercase tracking-widest tdy-font-cinzel">SECS</span>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Section */}
            {isEnabled("schedule") && (
              <>
                <SectionDivider />
                <DigitalYesSchedule schedule={tpl.schedule} />
              </>
            )}

            {/* Venue Section */}
            {isEnabled("map") && (
              <>
                <SectionDivider />
                <div className="pt-1 text-center max-w-md mx-auto w-full">
                  <div className="flex justify-center mb-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-b from-amber-500/25 to-amber-500/10 text-amber-400 border border-amber-400/35 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-300/80 font-semibold tdy-font-cinzel block mb-1">
                    ទីតាំងកម្មវិធីមង្គលការ
                  </span>
                  <h4 className="text-base sm:text-xl font-bold text-white mb-1.5 font-serif tracking-wide">
                    {tpl.venueName}
                  </h4>
                  {tpl.venueHall && (
                    <p className="text-xs sm:text-sm text-amber-300 font-medium mb-1">{tpl.venueHall}</p>
                  )}
                  {tpl.venueAddress && (
                    <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed max-w-md mx-auto px-4">
                      {tpl.venueAddress}
                    </p>
                  )}

                  {tpl.googleMapsUrl && (
                    <a
                      href={tpl.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition transform hover:scale-105 active:scale-95"
                    >
                      <span>មើលទីតាំងលើ Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {tpl.sketchMapImage && (
                    <div className="mt-5 pt-4 border-t border-amber-500/20">
                      <p className="text-xs text-amber-300 font-medium mb-2.5">
                        🗺️ គំនូសប្លង់ទីតាំង / Sketch Map
                      </p>
                      <img
                        src={tpl.sketchMapImage}
                        alt="Sketch Map"
                        className="max-h-56 w-auto mx-auto rounded-xl border border-amber-500/30 object-contain shadow-md"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Dress Code Recommendation */}
            {isEnabled("dressCode") && dressColors.length > 0 && (
              <>
                <SectionDivider />
                <div className="pt-1 text-center max-w-md mx-auto w-full">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-amber-300 font-semibold mb-4 tdy-font-cinzel">
                    {tpl.dressCode?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)"}
                  </h4>
                  <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                    {dressColors.map((c, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-amber-400/50 shadow-md transition hover:scale-110"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs text-amber-200/90 font-medium">{c.name}</span>
                      </div>
                    ))}
                  </div>
                  {tpl.dressCode?.description && (
                    <p className="text-xs text-amber-200/80 mt-4 max-w-sm mx-auto leading-relaxed px-3">
                      {tpl.dressCode.description}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Photo Gallery Grid */}
            {isEnabled("gallery") && tpl.gallery && tpl.gallery.length > 0 && (
              <>
                <SectionDivider />
                <div className="pt-1 max-w-md mx-auto w-full">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-amber-300 font-semibold mb-4 tdy-font-cinzel text-center">
                    កម្រងរូបភាពអនុស្សាវរីយ៍
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {tpl.gallery.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setLightboxImg(img.src)}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-amber-400/25 shadow-md group cursor-pointer"
                      >
                        <img
                          src={img.src}
                          alt={img.alt || `Moment ${i + 1}`}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-108"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-xs text-amber-200 font-medium px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-amber-400/30">
                            ពង្រីក
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* FAQ Accordion Section */}
            {isEnabled("faq") && faqList.length > 0 && (
              <>
                <SectionDivider />
                <div className="pt-1 text-left max-w-md mx-auto w-full">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-amber-300 font-semibold mb-4 tdy-font-cinzel text-center">
                    សំណួរដែលសួរញឹកញាប់ (FAQ)
                  </h4>
                  <div className="space-y-3">
                    {faqList.map((item) => (
                      <details
                        key={item.id || item.q}
                        className="group rounded-2xl border border-amber-400/25 bg-black/50 p-4 text-xs text-amber-100/90 transition shadow-sm hover:border-amber-400/40"
                      >
                        <summary className="cursor-pointer font-semibold text-amber-200 list-none flex items-center justify-between gap-3">
                          <span className="leading-snug">{item.q}</span>
                          <span className="text-amber-400 text-xs shrink-0 group-open:rotate-180 transition transform duration-200">▼</span>
                        </summary>
                        <p className="mt-3 text-amber-100/80 leading-relaxed text-xs pt-3 border-t border-amber-500/15">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Row: RSVP & Gift Button */}
            {(isEnabled("rsvp") || isEnabled("gift")) && (
              <>
                <SectionDivider />
                <div className="grid grid-cols-2 gap-3.5 pt-2 max-w-md mx-auto w-full">
                  {isEnabled("rsvp") && (
                    <a
                      href="#rsvp-section"
                      className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-98 transition"
                    >
                      <Send className="h-4 w-4" />
                      <span>ឆ្លើយតប RSVP</span>
                    </a>
                  )}

                  {isEnabled("gift") && (
                    <button
                      onClick={() => setShowQrModal(true)}
                      className={`flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-white/10 border border-amber-400/35 text-amber-200 font-bold text-xs sm:text-sm hover:bg-white/20 active:scale-98 transition shadow-sm cursor-pointer ${
                        !isEnabled("rsvp") ? "col-span-2" : ""
                      }`}
                    >
                      <QrCode className="h-4 w-4 text-amber-400" />
                      <span>ចងដៃតាម QR</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* RSVP Section */}
            {isEnabled("rsvp") && <DigitalYesRsvpModal children={children} />}

            {/* Footer Closing */}
            <div className="pt-6 border-t border-amber-400/15 text-center">
              <p className="text-xs sm:text-sm text-amber-200/70">
                សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម
              </p>
              <p className="text-[10px] text-amber-400/50 mt-1 uppercase tracking-widest tdy-font-cinzel font-semibold">
                WITH LOVE &amp; GRATITUDE
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Enlarged moment"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-amber-400/30"
          />
        </div>
      )}

      {/* Gift QR Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in tdy-font-kantumruy"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-xs rounded-3xl bg-[#1c080d] border border-amber-400/40 p-6 text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold tdy-font-cinzel">
                WEDDING GIFT
              </span>
              <h4 className="text-base font-bold text-amber-200 mb-0.5 tdy-font-moul">
                អំណោយអាពាហ៍ពិពាហ៍
              </h4>
              <p className="text-xs text-stone-300">ស្កេន KHQR ដើម្បីជូនពរគូស្វាមីភរិយា</p>
            </div>

            <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center border border-amber-400/30">
              {tpl.bankAccount?.qrUrl ? (
                <img
                  src={tpl.bankAccount.qrUrl}
                  alt="KHQR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full border border-stone-800 rounded-xl flex flex-col items-center justify-center p-2 text-slate-950 text-center">
                  <span className="text-[10px] font-bold text-red-600 tracking-wider">KHQR</span>
                  <span className="text-[9px] font-semibold text-slate-800 mt-1">{tpl.bankAccount?.accountName}</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-mono">{tpl.bankAccount?.accountNumber}</span>
                  <div className="mt-2 text-[16px]">📱💳</div>
                </div>
              )}
            </div>

            <div className="text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-amber-200">{tpl.bankAccount?.accountName}</p>
              <div className="flex items-center justify-center gap-1.5 font-mono text-stone-400">
                <span>{tpl.bankAccount?.accountNumber}</span>
                <button
                  onClick={handleCopyAccount}
                  className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-white transition cursor-pointer"
                  title="ចម្លងលេខគណនី"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-400 font-medium">ចម្លងបានជោគជ័យ!</span>}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-stone-200 transition cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      {!preview && useTemplateLink && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 p-3 bg-black/85 backdrop-blur-md border-t border-amber-500/25 flex items-center justify-between max-w-2xl w-full px-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs tdy-font-cinzel text-amber-200">The Digital Yes • Luxury Reel</span>
          </div>
          <Link
            to={useTemplateLink}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition"
          >
            ប្រើគំរូនេះ
          </Link>
        </div>
      )}
    </div>
  );
}
