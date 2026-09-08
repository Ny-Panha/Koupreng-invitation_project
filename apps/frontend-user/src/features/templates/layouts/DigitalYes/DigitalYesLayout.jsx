import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  VolumeX,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Send,
  QrCode,
  Copy,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import defaultMusicUrl from "@/assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";
import { normalizeTemplateViewModel } from "../../services/templateService";
import FallingPetals from "./components/FallingPetals";
import WaxSealEnvelope from "./components/WaxSealEnvelope";
import TemplateOpeningGate from "../../experience/components/sections/TemplateOpeningGate";
import DigitalYesSchedule from "./components/DigitalYesSchedule";
import DigitalYesRsvpModal from "./components/DigitalYesRsvpModal";
import "../../experience/template-experience.css";
import "./digital-yes.css";

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

  // Envelope Opening States
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isCardEmerging, setIsCardEmerging] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Audio Ref
  const audioRef = useRef(null);

  // Gift QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const gateStyle = tpl.gateStyle || tpl.openingStyle || tpl.design?.openingStyle || "envelope-3d";
  const isCustomGate = Boolean(gateStyle && gateStyle !== "envelope-3d" && gateStyle !== "WAX_ENVELOPE");

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
    const target = new Date(tpl.targetDate || "2026-11-28T17:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tpl.targetDate]);

  // Handle Envelope Tap to Open
  const handleOpenEnvelope = () => {
    if (isFlapOpen) return;

    setIsFlapOpen(true);

    if (audioRef.current && !preview) {
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

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText?.(tpl.bankAccount?.accountNumber || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#110508] text-amber-100 font-sans selection:bg-amber-700 selection:text-white overflow-x-hidden">
      {/* Background Ambience and Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#400e19] via-[#20060d] to-[#0d0205] opacity-90 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Falling Flower Petals Canvas */}
      <FallingPetals />

      {/* Audio Element */}
      <audio ref={audioRef} src={tpl.music || defaultMusicUrl} loop preload="none" />

      {/* Floating Header Toolbar */}
      <div className="fixed top-4 inset-x-4 z-40 flex items-center justify-between pointer-events-auto max-w-2xl mx-auto">
        {showBack ? (
          <Link
            to={backTo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 text-xs font-medium text-amber-200 hover:bg-black/60 transition shadow-lg"
          >
            <span>{backLabel}</span>
          </Link>
        ) : <div />}

        <div className="flex items-center gap-2">
          {isFullView && (
            <button
              onClick={handleReplay}
              title="មើលចលនាបើកសំបុត្រម្តងទៀត"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200 hover:bg-black/60 transition shadow-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">បើកម្តងទៀត</span>
            </button>
          )}

          <button
            onClick={toggleMusic}
            title={isPlayingMusic ? "បិទភ្លេង" : "ចាក់ភ្លេង"}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/40 text-xs text-amber-200 hover:bg-black/70 transition shadow-lg"
          >
            {isPlayingMusic ? (
              <>
                <div className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5">
                  <span className="w-0.5 bg-amber-400 tdy-bar-1 rounded-full" />
                  <span className="w-0.5 bg-amber-400 tdy-bar-2 rounded-full" />
                  <span className="w-0.5 bg-amber-400 tdy-bar-3 rounded-full" />
                  <span className="w-0.5 bg-amber-400 tdy-bar-4 rounded-full" />
                </div>
                <span className="text-[11px] font-medium tracking-wide">ភ្លេងអាពាហ៍ពិពាហ៍</span>
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
            position: "fixed",
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
        <div className="relative z-20 max-w-lg mx-auto px-4 pt-16 pb-28 animate-fade-in">
          <div className="relative rounded-3xl bg-[#1d080e]/85 backdrop-blur-xl border border-amber-500/30 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center">
            {/* Corner Luxury Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl pointer-events-none" />

            {/* Top Royal Emblem */}
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 rounded-full border border-amber-400/50 flex items-center justify-center bg-gradient-to-b from-amber-400/20 to-transparent">
                <Heart className="h-5 w-5 text-amber-300 fill-amber-300/30 animate-pulse" />
              </div>
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-serif font-medium mb-1">
              សិរីសួស្តីអាពាហ៍ពិពាហ៍
            </p>
            <p className="text-[10px] tracking-[0.2em] text-amber-200/60 uppercase font-serif mb-6">
              THE WEDDING CELEBRATION OF
            </p>

            {/* Couple Names Hero */}
            <div className="space-y-2 my-4">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                {tpl.groom}
              </h1>
              {tpl.groomEn && (
                <p className="text-xs tracking-[0.2em] text-amber-300/80 uppercase font-serif">
                  {tpl.groomEn}
                </p>
              )}

              <div className="flex items-center justify-center gap-3 my-2">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
                <span className="text-amber-400 font-serif text-xl italic">&amp;</span>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                {tpl.bride}
              </h1>
              {tpl.brideEn && (
                <p className="text-xs tracking-[0.2em] text-amber-300/80 uppercase font-serif">
                  {tpl.brideEn}
                </p>
              )}
            </div>

            {/* Parents Honor Section */}
            {(tpl.groomParents || tpl.brideParents) && (
              <div className="my-6 p-4 rounded-2xl bg-white/5 border border-amber-500/20 text-xs">
                <p className="text-amber-400 font-serif font-semibold mb-2">មាតាបិតាទាំងសងខាង</p>
                <div className="grid grid-cols-2 gap-3 text-amber-100/90 text-center">
                  <div>
                    <span className="text-[10px] text-amber-300/70 block">ខាងប្រុស</span>
                    <p className="font-medium mt-0.5">{tpl.groomParents}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300/70 block">ខាងស្រី</span>
                    <p className="font-medium mt-0.5">{tpl.brideParents}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Blessing Message */}
            {tpl.blessingMessage && (
              <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed font-serif my-6 max-w-sm mx-auto">
                {tpl.blessingMessage}
              </p>
            )}

            {/* Wedding Date Pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold my-4">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>{tpl.dateText}</span>
            </div>

            {/* Live Countdown Grid */}
            <div className="my-6 p-4 rounded-2xl bg-black/40 border border-amber-500/25">
              <span className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80 block mb-3 font-serif">
                រាប់ថយក្រោយដល់ថ្ងៃពិសេស
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-black/40 rounded-xl p-2.5 border border-amber-500/20">
                  <span className="block text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-amber-200/60 uppercase tracking-wider">ថ្ងៃ</span>
                </div>
                <div className="bg-black/40 rounded-xl p-2.5 border border-amber-500/20">
                  <span className="block text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-amber-200/60 uppercase tracking-wider">ម៉ោង</span>
                </div>
                <div className="bg-black/40 rounded-xl p-2.5 border border-amber-500/20">
                  <span className="block text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-amber-200/60 uppercase tracking-wider">នាទី</span>
                </div>
                <div className="bg-black/40 rounded-xl p-2.5 border border-amber-500/20">
                  <span className="block text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-amber-200/60 uppercase tracking-wider">វិនាទី</span>
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <DigitalYesSchedule schedule={tpl.schedule} />

            {/* Venue Section */}
            <div className="rounded-2xl bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/30 p-5 my-6 text-center">
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-2">
                <MapPin className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1 font-serif">{tpl.venueName}</h4>
              <p className="text-xs text-amber-300 font-medium">{tpl.venueHall}</p>
              <p className="text-xs text-amber-100/70 mt-1 max-w-xs mx-auto leading-relaxed">
                {tpl.venueAddress}
              </p>

              {tpl.googleMapsUrl && (
                <a
                  href={tpl.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg transition transform hover:scale-105"
                >
                  <span>មើលទីតាំងលើ Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Dress Code Recommendation */}
            {tpl.dressCode && tpl.dressCode.length > 0 && (
              <div className="my-8">
                <h4 className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-3 font-serif">
                  ពណ៌សម្លៀកបំពាក់ (Dress Code)
                </h4>
                <div className="flex items-center justify-center gap-4">
                  {tpl.dressCode.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/40 shadow-md"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] text-amber-200/80">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery Grid */}
            {tpl.gallery && tpl.gallery.length > 0 && (
              <div className="my-8">
                <h4 className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-4 font-serif">
                  កម្រងរូបភាពអនុស្សាវរីយ៍
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {tpl.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-amber-500/20 group shadow-md"
                    >
                      <img
                        src={img.src}
                        alt={img.alt || `Moment ${i + 1}`}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Row: RSVP & Gift Button */}
            <div className="grid grid-cols-2 gap-3 my-6">
              <a
                href="#rsvp-section"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition"
              >
                <Send className="h-4 w-4" />
                <span>ឆ្លើយតប RSVP</span>
              </a>

              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-white/10 border border-amber-400/40 text-amber-200 font-bold text-xs hover:bg-white/20 transition shadow-lg cursor-pointer"
              >
                <QrCode className="h-4 w-4 text-amber-400" />
                <span>ចងដៃតាម QR</span>
              </button>
            </div>

            {/* RSVP Modal / Section */}
            <DigitalYesRsvpModal children={children} />

            {/* Footer Closing */}
            <div className="mt-12 pt-6 border-t border-amber-500/20 text-center">
              <p className="text-xs text-amber-200/60 font-serif">
                សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម
              </p>
              <p className="text-[10px] text-amber-400/40 mt-1 uppercase tracking-widest font-serif">
                WITH LOVE &amp; GRATITUDE
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA KHQR Gift Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-xs rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/40 p-6 text-center shadow-2xl text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-5 w-5" />
            </div>

            <h4 className="text-base font-serif font-bold text-amber-200 mb-0.5">
              ចងដៃតាម ABA KHQR
            </h4>
            <p className="text-xs text-stone-400 mb-4">
              ស្កេនដើម្បីជូនពរ និងចងដៃដល់គូស្វាមីភរិយា
            </p>

            <div className="relative mx-auto w-44 h-44 rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center mb-4">
              <div className="w-full h-full border-2 border-stone-800 rounded-xl flex flex-col items-center justify-center p-2 text-slate-950 text-center">
                <span className="text-[10px] font-bold text-red-600 tracking-wider">KHQR</span>
                <span className="text-[9px] font-semibold text-slate-800 mt-1">{tpl.bankAccount?.accountName}</span>
                <span className="text-[8px] text-slate-500 mt-0.5 font-mono">{tpl.bankAccount?.accountNumber}</span>
                <div className="mt-2 text-[18px]">📱💳</div>
              </div>
            </div>

            <div className="space-y-1 mb-4 text-xs">
              <p className="text-stone-300 font-medium">{tpl.bankAccount?.accountName}</p>
              <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-sm">
                <span>{tpl.bankAccount?.accountNumber}</span>
                <button
                  onClick={handleCopyAccount}
                  className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-white transition"
                  title="ចម្លងលេខគណនី"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied && <p className="text-[10px] text-emerald-400">បានចម្លងរួចរាល់!</p>}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-stone-200 transition"
            >
              បិទផ្ទាំង
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      {!preview && useTemplateLink && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-black/80 backdrop-blur-md border-t border-amber-500/20 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-serif text-amber-200">The Digital Yes • Luxury Reel</span>
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
