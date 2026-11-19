import InvitationLightbox from "../../shared/Gallery/InvitationLightbox";
import DemoRsvpNotice from "../../shared/RSVP/DemoRsvpNotice";
import InvitationLabel from '@/features/templates/shared/InvitationLabel';
import InvitationBranding from '../../shared/InvitationBranding';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  MapPin,
  Music,
  VolumeX,
  ExternalLink,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import defaultMusicUrl from "../../../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import CoverBackground from "../../shared/Openings/CoverBackground";
import ProgramTimeline from "../../shared/ProgramTimeline";
import SaveTheDate from "../../shared/SaveTheDate";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { isTrustedPreviewMessage, postPreviewMessage, readEmbeddedPreviewChannel } from "@/shared/preview/previewMessaging";
import "./template-boilerplate.css";

export default function TemplateBoilerplateLayout({
  content = {},
  tpl: tplProp,
  liveData: liveDataProp,
  preview = false,
  previewStartClosed = false,
  previewChannel,
  previewGateCommand,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ក្រោយ",
  useTemplateLink,
  primaryCtaLabel = "ប្រើគំរូនេះ",
  showActions = true,
  children,
}) {
  // Live sync from Admin simulator iframe
  const [liveData, setLiveData] = useState(liveDataProp || null);

  useEffect(() => {
    if (liveDataProp) setLiveData(liveDataProp);
  }, [liveDataProp]);

  useEffect(() => {
    const channel = previewChannel || readEmbeddedPreviewChannel();
    if (!channel) return undefined;
    const handleMessage = (event) => {
      if (!isTrustedPreviewMessage(event, channel)) return;
      if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data?.data) {
        setLiveData(event.data.data);
      }
      if (event.data?.type === "TOGGLE_GATE") {
        const shouldOpen = Boolean(event.data.open ?? event.data.isOpen);
        setOpened(shouldOpen);
      }
    };
    window.addEventListener("message", handleMessage);
    try {
      postPreviewMessage({ type: "PREVIEW_READY" }, channel);
    } catch {
      // ignore
    }
    return () => window.removeEventListener("message", handleMessage);
  }, [previewChannel]);

  useEffect(() => {
    if (!previewGateCommand) return;
    setOpened(Boolean(previewGateCommand.open));
  }, [previewGateCommand]);

  // Merge base content + live admin edits + tplProp
  const effectiveContent = useMemo(() => {
    const baseInput = { ...(tplProp || {}), ...content, ...(liveData || {}) };
    const hosted = Boolean(baseInput.hasHostContent);
    const groomFather = baseInput.groomFather || baseInput.couple?.groomFather || "";
    const groomMother = baseInput.groomMother || baseInput.couple?.groomMother || "";
    const brideFather = baseInput.brideFather || baseInput.couple?.brideFather || "";
    const brideMother = baseInput.brideMother || baseInput.couple?.brideMother || "";
    const resolvedGroomParents = (groomFather || groomMother)
      ? [groomFather, groomMother].filter(Boolean).join(" និង ")
      : (baseInput.family?.groomParents || baseInput.couple?.groomParents || content.family?.groomParents || content.couple?.groomParents || "លោក ឪពុក & អ្នកម្តាយ");
    const resolvedBrideParents = (brideFather || brideMother)
      ? [brideFather, brideMother].filter(Boolean).join(" និង ")
      : (baseInput.family?.brideParents || baseInput.couple?.brideParents || content.family?.brideParents || content.couple?.brideParents || "លោក ឪពុក & អ្នកម្តាយ");

    return {
      ...baseInput,
      groom: baseInput.groomName || baseInput.groom || "",
      bride: baseInput.brideName || baseInput.bride || "",
      title: baseInput.invitationTitle || baseInput.title || "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
      subtitle: baseInput.invitationSubtitle || baseInput.subtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
      messageTitle: baseInput.messageTitle || content.messageTitle || "ការអញ្ជើញ",
      message: (typeof baseInput.messageText === "string" && baseInput.messageText.trim())
        ? baseInput.messageText
        : (baseInput.blessingMessage || baseInput.message || content.message || ""),
      messageText: (typeof baseInput.messageText === "string" && baseInput.messageText.trim())
        ? baseInput.messageText
        : (baseInput.blessingMessage || baseInput.messageText || baseInput.message || content.messageText || ""),
      groomParents: resolvedGroomParents,
      brideParents: resolvedBrideParents,
      dateText: baseInput.weddingDate || baseInput.dateText || (hosted ? "កាលបរិច្ឆេទនឹងត្រូវប្រកាស / Date to be confirmed" : "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦"),
      receptionTime: baseInput.weddingTime || baseInput.receptionTime || (hosted ? "" : "វេលាម៉ោង ៥:០០ ល្ងាច"),
      coverImage: baseInput.coverImage || (hosted ? "" : "/facebook/all/03-card/cover-card.jpg"),
      venue: {
        name: baseInput.venueName || baseInput.venue?.name || content.venue?.name || (hosted ? "" : "The Premier Centre Sen Sok"),
        address: baseInput.venueAddress || baseInput.venue?.address || content.venue?.address || (hosted ? "" : "Phnom Penh"),
        mapLink: baseInput.googleMapsUrl || baseInput.googleMapUrl || baseInput.venue?.mapLink || "https://maps.google.com",
      },
      gallery: Array.isArray(baseInput.galleryImages) && baseInput.galleryImages.length > 0
        ? baseInput.galleryImages
        : (Array.isArray(baseInput.gallery) && baseInput.gallery.length > 0
            ? baseInput.gallery
            : hosted ? [] : [
                "/facebook/all/03-card/03-01.jpg",
                "/facebook/all/03-card/03-02.jpg",
                "/facebook/all/03-card/03-03.jpg",
                "/facebook/all/03-card/03-04.jpg",
              ]),
      musicUrl: baseInput.bgMusicUrl || baseInput.musicUrl || content.music?.url || content.music || (hosted ? "" : defaultMusicUrl),
      primaryColor: baseInput.primaryColor || "#D4AF37",
      secondaryColor: baseInput.secondaryColor || "#F3E5AB",
      fontKhmer: baseInput.fontKhmer || "Kantumruy Pro",
    };
  }, [content, tplProp, liveData]);

  // Reduced motion detection
  const reduced = usePrefersReducedMotion();

  // Gate / Opening State
  const [opened, setOpened] = useState(!preview && !previewStartClosed);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  const mainRef = useRef(null);

  const handleOpenInvitation = useCallback((skip = false) => {
    setOpened(true);
    if (!skip && audioRef.current && !reduced) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setAudioError(true);
        });
    }
    requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
    });
  }, [reduced, setOpened]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setAudioError(true);
        });
    }
  };

  // Lightbox Modal for Gallery with Keyboard Support
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const galleryList = useMemo(() => {
    return (effectiveContent.gallery || []).map((img) =>
      typeof img === "string" ? img : img.src || img.url || ""
    ).filter(Boolean);
  }, [effectiveContent.gallery]);

  const openLightbox = (_img, index) => setLightboxIdx(index);
  const closeLightbox = () => setLightboxIdx(null);

  // Local RSVP submission state
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestRsvpName, setGuestRsvpName] = useState("");

  // Section visibility check
  const sectionEnabled = (key) => effectiveContent.enabledSections?.[key] !== false;

  // Custom CSS variables injection
  const dynamicStyles = {
    "--tpl-primary": effectiveContent.primaryColor,
    "--tpl-secondary": effectiveContent.secondaryColor,
    "--tpl-font-khmer": `"${effectiveContent.fontKhmer}", "Kantumruy Pro", sans-serif`,
  };

  return (
    <div className="tpl-boilerplate" style={dynamicStyles} data-template-renderer="template-boilerplate">
      {/* Background Audio */}
      {effectiveContent.musicUrl && (
        <audio
          ref={audioRef}
          src={effectiveContent.musicUrl}
          loop
          preload="none"
          aria-hidden="true"
        />
      )}

      {/* Floating Audio Toggle Button (When Opened) */}
      {opened && effectiveContent.musicUrl && (
        <button
          type="button"
          onClick={toggleMusic}
          className={`tpl-music-toggle ${isPlaying ? "is-playing" : ""}`}
          title={isPlaying ? "បិទសំឡេង (Pause music)" : "ចាក់ភ្លេង (Play music)"}
          aria-label={isPlaying ? "បិទសំឡេង (Pause music)" : "ចាក់ភ្លេង (Play music)"}
          aria-pressed={isPlaying}
        >
          {isPlaying ? <Music className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}

      {audioError && opened && (
        <p className="tpl-audio-error-banner" role="status">
          មិនអាចចាក់ភ្លេងបានទេ។ សូមចុចរូបតន្ត្រីដើម្បីសាកម្ដងទៀត។
        </p>
      )}

      {/* Toolbar for Navigation Back in Preview / Template Mode */}
      {showBack && (
        <nav className="tpl-nav-bar flex items-center justify-between p-3 max-w-xl mx-auto text-xs" aria-label="ការរុករកគំរូ">
          <Link
            to={backTo}
            className="text-amber-400 hover:underline min-h-[44px] inline-flex items-center gap-1 font-medium"
          >
            ← {backLabel}
          </Link>
          <span className="text-zinc-400 font-mono text-[11px]">Template Starter</span>
          {showActions && useTemplateLink && (
            <Link
              to={useTemplateLink}
              className="tpl-btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] inline-flex items-center"
            >
              {primaryCtaLabel}
            </Link>
          )}
        </nav>
      )}

      {/* Main Container Shell */}
      <div className="tpl-shell">
        {/* ================= 1. OPENING COVER SCREEN ================= */}
        {!opened ? (
          <section className="min-h-screen flex flex-col justify-between p-6 text-center relative overflow-hidden bg-zinc-950" aria-label="គម្របសំបុត្រអញ្ជើញ">
            {/* Universal Cover Background (Image / Looping Video / Default Art) */}
            <CoverBackground
              content={effectiveContent}
              templateDefault={{
                src: "/facebook/all/03-card/cover-card.jpg",
                type: "image",
                poster: "/facebook/all/03-card/cover-card.jpg",
              }}
            />

            <div className="pt-8 relative z-10">
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                WEDDING INVITATION
              </span>
              <h2 className="text-xl font-moul text-white mt-2 leading-relaxed">
                {effectiveContent.title}
              </h2>
            </div>

            {/* Couple Cover Photo */}
            <div className="my-auto py-6 relative z-10">
              <div className="relative mx-auto w-64 h-80 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10">
                <img
                  src={effectiveContent.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = "/facebook/all/03-card/cover-card.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white leading-tight font-moul">
                    {effectiveContent.groom} &amp; {effectiveContent.bride}
                  </h3>
                  <p className="text-xs text-amber-300 font-mono mt-1">
                    {effectiveContent.dateText}
                  </p>
                </div>
              </div>
            </div>

            {/* Open and Skip Buttons */}
            <div className="pb-8 space-y-3 relative z-10">
              <button
                type="button"
                onClick={() => handleOpenInvitation(false)}
                className="tpl-btn-primary w-full max-w-xs mx-auto text-base py-3 min-h-[48px] flex items-center justify-center gap-2"
                aria-label="សូមបើកសំបុត្រអញ្ជើញ (Open Invitation)"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>សូមបើកសំបុត្រអញ្ជើញ (Open Invitation)</span>
              </button>

              <button
                type="button"
                data-testid="tpl-skip-opening-btn"
                onClick={() => handleOpenInvitation(true)}
                className="tpl-btn-skip block mx-auto text-xs text-amber-300/80 hover:text-amber-200 underline py-2 min-h-[44px] cursor-pointer"
                aria-label="រំលងការបើក (Skip to content)"
              >
                រំលង (Skip opening)
              </button>

              <p className="text-[11px] text-zinc-500">
                ចុចដើម្បីអានសេចក្តីអញ្ជើញ និងចាក់ភ្លេងមង្គលការ
              </p>
            </div>
          </section>
        ) : (
          /* ================= 2. FULL INVITATION CONTENT ================= */
          <main
            ref={mainRef}
            tabIndex={-1}
            className="space-y-6 p-4 sm:p-6 pb-24 animate-in fade-in duration-700 outline-none"
            aria-label="ព័ត៌មានលម្អិតសំបុត្រអញ្ជើញ"
          >
            {/* Top Hero Banner */}
            <div className="tpl-card text-center space-y-4 pt-6">
              <span className="tpl-heading__eyebrow">
                {effectiveContent.subtitle}
              </span>
              <h1 className="text-2xl font-moul text-white leading-snug">
                {effectiveContent.groom} &amp; {effectiveContent.bride}
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-mono flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{effectiveContent.dateText}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{effectiveContent.receptionTime}</span>
                </span>
              </div>
            </div>

            {/* Dynamic Body Sections */}
            {(() => {
              const defaultOrder = [
                "family",
                "countdown",
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
                      <div key="family" className="tpl-card" data-tx-section="family">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">FAMILY &amp; PARENTS</span>
                          <h3 className="tpl-heading__title">មាតាបិតាទាំងសងខាង</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center text-xs text-zinc-300 divide-x divide-zinc-800">
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold block mb-1">
                              ខាងកូនប្រុស
                            </span>
                            <p className="font-semibold text-white">{effectiveContent.groomParents || "លោក ឪពុក & អ្នកម្តាយ"}</p>
                            <p className="text-amber-300 mt-2 font-bold font-moul">
                              {effectiveContent.groom}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold block mb-1">
                              ខាងកូនស្រី
                            </span>
                            <p className="font-semibold text-white">{effectiveContent.brideParents || "លោក ឪពុក & អ្នកម្តាយ"}</p>
                            <p className="text-amber-300 mt-2 font-bold font-moul">
                              {effectiveContent.bride}
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                  case "countdown":
                    return sectionEnabled("countdown") ? (
                      <div key="countdown" className="tpl-card text-center" data-tx-section="countdown">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">SAVE THE DATE</span>
                          <h3 className="tpl-heading__title">រង់ចាំថ្ងៃមង្គលការ</h3>
                        </div>
                        <SaveTheDate content={effectiveContent} english={false} />
                      </div>
                    ) : null;

                  case "schedule": {
                    const hasProgramDays = Boolean(
                      effectiveContent.programDays ||
                      effectiveContent.invitationStyleV1?.program
                    );
                    const scheduleItems =
                      Array.isArray(effectiveContent.schedule) && effectiveContent.schedule.length > 0
                        ? effectiveContent.schedule
                        : effectiveContent.hasHostContent ? [] : [
                            { time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន និងសែនព្រេន", desc: "ជួបជុំភ្ញៀវកិត្តិយស និងរៀបចំក្បួនជំនូន" },
                            { time: "០៩:០០ ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", desc: "ប្រសិទ្ធពរជ័យពីចាស់ទុំ និងមាតាបិតា" },
                            { time: "០៥:០០ ល្ងាច", title: "ពិធីពិសាភោជនាហារ", desc: "ទទួលបដិសណ្ឋារកិច្ច និងពិសារអាហារពេលល្ងាច" },
                          ];

                    return sectionEnabled("schedule") ? (
                      <div key="schedule" className="tpl-card" data-tx-section="schedule">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">CEREMONY PROGRAMME</span>
                          <h3 className="tpl-heading__title">កាលវិភាគកម្មវិធីមង្គលការ</h3>
                        </div>
                        {hasProgramDays ? (
                          <ProgramTimeline content={effectiveContent} />
                        ) : (
                          <div className="space-y-3">
                            {scheduleItems.map((item, i) => (
                              <div
                                key={item.id || i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80"
                              >
                                <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold shrink-0">
                                  {item.time || item.startTime || ""}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-white">{item.title || item.name || ""}</h4>
                                  {(item.description || item.desc) && (
                                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.description || item.desc}</p>
                                  )}
                                  {item.location && (
                                    <p className="text-[10px] text-amber-400/80 mt-0.5">{item.location}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  }

                  case "gallery":
                    return sectionEnabled("gallery") && galleryList.length ? (
                      <div key="gallery" className="tpl-card" data-tx-section="gallery">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">PHOTO GALLERY</span>
                          <h3 className="tpl-heading__title">កម្រងរូបថតអនុស្សាវរីយ៍</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {galleryList.map((img, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={(e) => openLightbox(img, i, e)}
                              className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer group relative text-left p-0 min-h-[44px]"
                              aria-label={`មើលរូបថតធំទី ${i + 1}`}
                            >
                              <img
                                src={img}
                                alt={`Gallery ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = "/facebook/all/03-card/cover-card.jpg";
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null;

                  case "story":
                    return sectionEnabled("story") && (effectiveContent.storyText || effectiveContent.story?.length) ? (
                      <div key="story" className="tpl-card" data-tx-section="story">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">OUR LOVE STORY</span>
                          <h3 className="tpl-heading__title">ដំណើររឿងស្នេហា</h3>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed italic text-center">
                          &ldquo;{effectiveContent.storyText || (Array.isArray(effectiveContent.story) ? effectiveContent.story[0]?.text : "")}&rdquo;
                        </p>
                      </div>
                    ) : null;

                  case "map":
                  case "venue":
                    return sectionEnabled("map") ? (
                      <div key="map" className="tpl-card text-center space-y-3" data-tx-section="venue">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">LOCATION &amp; MAP</span>
                          <h3 className="tpl-heading__title">ទីតាំងប្រារព្ធពិធី</h3>
                        </div>
                        {effectiveContent.venue?.name && (
                          <p className="text-xs text-zinc-300 font-semibold">
                            {effectiveContent.venue.name}
                          </p>
                        )}
                        {effectiveContent.venue?.address && (
                          <p className="text-[11px] text-zinc-400">
                            {effectiveContent.venue.address}
                          </p>
                        )}
                        <a
                          href={effectiveContent.venue?.mapLink || effectiveContent.googleMapUrl || "https://maps.google.com"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tpl-btn-primary inline-flex items-center gap-2 min-h-[44px] px-4"
                        >
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          <span>បើកមើល Google Maps</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                    ) : null;

                  case "gift":
                    return sectionEnabled("gift") && (effectiveContent.qrGiftUrl || effectiveContent.bankAccount) ? (
                      <div key="gift" className="tpl-card text-center space-y-3" data-tx-section="gift">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">DIGITAL GIFT</span>
                          <h3 className="tpl-heading__title">ចំណងដៃឌីជីថល (QR Code)</h3>
                        </div>
                        {effectiveContent.qrGiftUrl && (
                          <div className="mx-auto w-40 h-40 bg-white p-2 rounded-2xl shadow-xl border border-amber-500/40">
                            <img
                              src={effectiveContent.qrGiftUrl}
                              alt="Gift QR"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <p className="text-[11px] text-zinc-400">
                          ស្កេនតាមរយៈកម្មវិធីធនាគារ (ABA / Bakong KHQR)
                        </p>
                      </div>
                    ) : null;

                  case "rsvp":
                    return sectionEnabled("rsvp") ? (
                      <div key="rsvp" className="tpl-card" data-tx-section="rsvp">
                        <div className="tpl-heading">
                          <span className="tpl-heading__eyebrow">RSVP CONFIRMATION</span>
                          <h3 className="tpl-heading__title">បញ្ជាក់ការចូលរួម</h3>
                        </div>
                        {children ? (
                          <div className="tpl-children-rsvp">{children}</div>
                        ) : rsvpSubmitted ? (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                            <CheckCircle2 className="h-8 w-8 text-amber-400 mx-auto" aria-hidden="true" />
                            <DemoRsvpNotice completed />
                          </div>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              setRsvpSubmitted(true);
                            }}
                            className="space-y-3"
                          >
                            <DemoRsvpNotice />
                            <label className="block text-left text-xs text-zinc-300">
                              <span className="block mb-1 font-medium">គោត្តនាម និងនាម (Your Name)</span>
                              <input
                                type="text"
                                required
                                value={guestRsvpName}
                                onChange={(e) => setGuestRsvpName(e.target.value)}
                                placeholder="សូមបញ្ចូលឈ្មោះរបស់លោកអ្នក..."
                                className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </label>
                            <button
                              type="submit"
                              className="tpl-btn-primary w-full min-h-[44px] flex items-center justify-center gap-2"
                            >
                              <Send className="h-4 w-4" aria-hidden="true" />
                              <span><InvitationLabel value={"ផ្ញើការបញ្ជាក់ (Confirm RSVP)"} /></span>
                            </button>
                          </form>
                        )}
                      </div>
                    ) : null;

                  default:
                    return null;
                }
              });
            })()}

            {/* Footer */}
            <footer className="text-center pt-8 space-y-2 text-zinc-400 text-xs">
              <p>សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម</p>
              <InvitationBranding content={effectiveContent} />
            </footer>
          </main>
        )}
      </div>

      <InvitationLightbox images={galleryList} index={lightboxIdx} onIndexChange={setLightboxIdx} onClose={closeLightbox} />
    </div>
  );
}
