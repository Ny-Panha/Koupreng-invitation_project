import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Clock,
  Calendar,
  MapPin,
  Music,
  VolumeX,
  ExternalLink,
  ChevronDown,
  Sparkles,
  QrCode,
  Check,
  Send,
  X,
  Share2,
} from "lucide-react";
import defaultMusicUrl from "../../../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import "./template-boilerplate.css";

export default function TemplateBoilerplateLayout({
  content = {},
  preview = false,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  useTemplateLink,
  children,
}) {
  // Live sync from Admin simulator iframe
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data?.data) {
        setLiveData(event.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    try {
      window.parent?.postMessage({ type: "PREVIEW_READY" }, "*");
    } catch {
      // ignore
    }
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Merge base content + live admin edits
  const effectiveContent = useMemo(() => {
    const base = liveData ? { ...content, ...liveData } : { ...content };
    return {
      ...base,
      groom: base.groomName || base.groom || "វណ្ណដា",
      bride: base.brideName || base.bride || "ស្រីពេជ្រ",
      title: base.invitationTitle || base.title || "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
      subtitle: base.invitationSubtitle || base.subtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
      dateText: base.weddingDate || base.dateText || "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦",
      receptionTime: base.weddingTime || base.receptionTime || "វេលាម៉ោង ៥:០០ ល្ងាច",
      coverImage: base.coverImage || "/facebook/all/03-card/cover-card.jpg",
      gallery: Array.isArray(base.galleryImages) && base.galleryImages.length > 0
        ? base.galleryImages
        : (Array.isArray(base.gallery) ? base.gallery : [
            "/facebook/all/03-card/03-01.jpg",
            "/facebook/all/03-card/03-02.jpg",
            "/facebook/all/03-card/03-03.jpg",
            "/facebook/all/03-card/03-04.jpg",
          ]),
      musicUrl: base.bgMusicUrl || content.music?.url || content.music || defaultMusicUrl,
      primaryColor: base.primaryColor || "#D4AF37",
      secondaryColor: base.secondaryColor || "#F3E5AB",
      fontKhmer: base.fontKhmer || "Siemreap",
    };
  }, [content, liveData]);

  // Gate / Opening State
  const [opened, setOpened] = useState(!preview);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleOpenInvitation = () => {
    setOpened(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Lightbox Modal for Gallery
  const [lightboxImg, setLightboxImg] = useState(null);

  // Section visibility check
  const sectionEnabled = (key) => effectiveContent.enabledSections?.[key] !== false;

  // Custom CSS variables injection
  const dynamicStyles = {
    "--tpl-primary": effectiveContent.primaryColor,
    "--tpl-secondary": effectiveContent.secondaryColor,
    "--tpl-font-khmer": `"${effectiveContent.fontKhmer}", sans-serif`,
  };

  return (
    <div className="tpl-boilerplate" style={dynamicStyles}>
      {/* Background Audio */}
      <audio ref={audioRef} src={effectiveContent.musicUrl} loop preload="auto" />

      {/* Floating Audio Toggle Button (When Opened) */}
      {opened && (
        <button
          type="button"
          onClick={toggleMusic}
          className={`tpl-music-toggle ${isPlaying ? "is-playing" : ""}`}
          title={isPlaying ? "បិទសំឡេង" : "ចាក់ភ្លេង"}
        >
          {isPlaying ? <Music className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      )}

      {/* Main Container Shell */}
      <div className="tpl-shell">
        {/* ================= 1. OPENING COVER SCREEN ================= */}
        {!opened ? (
          <div className="min-h-screen flex flex-col justify-between p-6 text-center relative overflow-hidden bg-zinc-950">
            <div className="pt-8">
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                WEDDING INVITATION
              </span>
              <h2 className="text-xl font-moul text-white mt-2 leading-relaxed">
                {effectiveContent.title}
              </h2>
            </div>

            {/* Couple Cover Photo */}
            <div className="my-auto py-6">
              <div className="relative mx-auto w-64 h-80 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10">
                <img
                  src={effectiveContent.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/facebook/all/03-card/cover-card.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white leading-tight font-moul">
                    {effectiveContent.groom} & {effectiveContent.bride}
                  </h3>
                  <p className="text-xs text-amber-300 font-mono mt-1">
                    {effectiveContent.dateText}
                  </p>
                </div>
              </div>
            </div>

            {/* Open Button */}
            <div className="pb-8 space-y-3">
              <button
                type="button"
                onClick={handleOpenInvitation}
                className="tpl-btn-primary w-full max-w-xs mx-auto text-base py-3"
              >
                <Sparkles className="h-4 w-4" />
                <span>សូមបើកធៀបការ (Open Invitation)</span>
              </button>
              <p className="text-[11px] text-zinc-500">
                ចុចដើម្បីអានសេចក្តីអញ្ជើញ និងចាក់ភ្លេងមង្គលការ
              </p>
            </div>
          </div>
        ) : (
          /* ================= 2. FULL INVITATION CONTENT ================= */
          <div className="space-y-6 p-4 sm:p-6 pb-24 animate-in fade-in duration-700">
            {/* Top Hero Banner */}
            <div className="tpl-card text-center space-y-4 pt-6">
              <span className="tpl-heading__eyebrow">
                {effectiveContent.subtitle}
              </span>
              <h1 className="text-2xl font-moul text-white leading-snug">
                {effectiveContent.groom} & {effectiveContent.bride}
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-mono">
                <Calendar className="h-3.5 w-3.5" />
                <span>{effectiveContent.dateText}</span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{effectiveContent.receptionTime}</span>
              </div>
            </div>

            {/* Dynamic Body Sections */}
            {(() => {
              const defaultOrder = [
                "family",
                "schedule",
                "gallery",
                "story",
                "map",
                "gift",
                "rsvp",
              ];
              const activeOrder =
                Array.isArray(effectiveContent.sectionOrder) &&
                effectiveContent.sectionOrder.length > 0
                  ? effectiveContent.sectionOrder
                  : defaultOrder;

              return activeOrder.map((key) => {
                switch (key) {
                  case "family":
                    return (
                      <div key="family" className="tpl-card">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">FAMILY & PARENTS</span>
                          <h3 className="tpl-heading__title">មាតាបិតាទាំងសងខាង</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center text-xs text-zinc-300 divide-x divide-zinc-800">
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold block mb-1">
                              ខាងកូនប្រុស
                            </span>
                            <p className="font-semibold text-white">លោក ឪពុក & អ្នកម្តាយ</p>
                            <p className="text-amber-300 mt-2 font-bold font-moul">
                              {effectiveContent.groom}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold block mb-1">
                              ខាងកូនស្រី
                            </span>
                            <p className="font-semibold text-white">លោក ឪពុក & អ្នកម្តាយ</p>
                            <p className="text-amber-300 mt-2 font-bold font-moul">
                              {effectiveContent.bride}
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                  case "schedule":
                    return sectionEnabled("schedule") ? (
                      <div key="schedule" className="tpl-card">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">CEREMONY PROGRAMME</span>
                          <h3 className="tpl-heading__title">កាលវិភាគកម្មវិធីមង្គលការ</h3>
                        </div>
                        <div className="space-y-3">
                          {[
                            { time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន និងសែនព្រេន", desc: "ជួបជុំភ្ញៀវកិត្តិយស និងរៀបចំក្បួនជំនូន" },
                            { time: "០៩:០០ ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", desc: "ប្រសិទ្ធពរជ័យពីចាស់ទុំ និងមាតាបិតា" },
                            { time: "០៥:០០ ល្ងាច", title: "ពិធីពិសាភោជនាហារ", desc: "ទទួលបដិសណ្ឋារកិច្ច និងពិសារអាហារពេលល្ងាច" },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80"
                            >
                              <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold shrink-0">
                                {item.time}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;

                  case "gallery":
                    return sectionEnabled("gallery") && effectiveContent.gallery.length ? (
                      <div key="gallery" className="tpl-card">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">PHOTO GALLERY</span>
                          <h3 className="tpl-heading__title">កម្រងរូបថតអនុស្សាវរីយ៍</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {effectiveContent.gallery.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => setLightboxImg(img)}
                              className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer group relative"
                            >
                              <img
                                src={img}
                                alt={`Gallery ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = "/facebook/all/03-card/cover-card.jpg";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;

                  case "story":
                    return sectionEnabled("story") && effectiveContent.storyText ? (
                      <div key="story" className="tpl-card">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">OUR LOVE STORY</span>
                          <h3 className="tpl-heading__title">ដំណើររឿងស្នេហា</h3>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed italic text-center">
                          "{effectiveContent.storyText}"
                        </p>
                      </div>
                    ) : null;

                  case "map":
                  case "venue":
                    return sectionEnabled("map") ? (
                      <div key="map" className="tpl-card text-center space-y-3">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">LOCATION & MAP</span>
                          <h3 className="tpl-heading__title">ទីតាំងប្រារព្ធពិធី</h3>
                        </div>
                        <p className="text-xs text-zinc-300">
                          {effectiveContent.venue?.name || "The Premier Center Sen Sok"}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {effectiveContent.venue?.address || "រាជធានីភ្នំពេញ"}
                        </p>
                        <a
                          href={effectiveContent.venue?.mapLink || "https://maps.google.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="tpl-btn-primary inline-flex"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>បើកមើល Google Maps</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ) : null;

                  case "gift":
                    return sectionEnabled("gift") && effectiveContent.qrGiftUrl ? (
                      <div key="gift" className="tpl-card text-center space-y-3">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">DIGITAL GIFT</span>
                          <h3 className="tpl-heading__title">ចំណងដៃឌីជីថល (QR Code)</h3>
                        </div>
                        <div className="mx-auto w-40 h-40 bg-white p-2 rounded-2xl shadow-xl border border-amber-500/40">
                          <img
                            src={effectiveContent.qrGiftUrl}
                            alt="Gift QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          ស្កេនតាមរយៈកម្មវិធីធនាគារ (ABA / Bakong KHQR)
                        </p>
                      </div>
                    ) : null;

                  case "rsvp":
                    return sectionEnabled("rsvp") ? (
                      <div key="rsvp" className="tpl-card">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">RSVP CONFIRMATION</span>
                          <h3 className="tpl-heading__title">បញ្ជាក់ការចូលរួម</h3>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="សូមបញ្ចូលឈ្មោះរបស់លោកអ្នក..."
                            className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => alert("អរគុណសម្រាប់ការបញ្ជាក់ការចូលរួម!")}
                            className="tpl-btn-primary w-full"
                          >
                            <Send className="h-4 w-4" />
                            <span>ផ្ញើការបញ្ជាក់ (Confirm RSVP)</span>
                          </button>
                        </div>
                      </div>
                    ) : null;

                  default:
                    return null;
                }
              });
            })()}

            {/* Footer */}
            <div className="text-center pt-8 space-y-2 text-zinc-500 text-[11px]">
              <p>សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម</p>
              <p className="font-mono text-[10px]">KOUPRENG DIGITAL INVITATION</p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 text-white bg-zinc-800 rounded-full"
            onClick={() => setLightboxImg(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Enlarged"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
