import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  ExternalLink,
  Gift,
  Heart,
  MapPin,
  Music2,
  Sparkles,
  VolumeX,
} from "lucide-react";
import defaultMusicUrl from "../../../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import CoverBackground from "../../shared/Openings/CoverBackground";
import CountdownTimer from "../../shared/Countdown/CountdownTimer";
import GalleryGrid from "../../shared/Gallery/GalleryGrid";
import RsvpContainer from "../../shared/RSVP/RsvpContainer";
import {
  isTrustedPreviewMessage,
  postPreviewMessage,
  readEmbeddedPreviewChannel,
} from "@/shared/preview/previewMessaging";
import "./khmer-royal-lotus.css";

const DEFAULT_COVER = "/facebook/all/01-card/cover-card.jpg";

const DEFAULT_SCHEDULE = [
  { id: "procession", time: "៦:៣០ ព្រឹក", title: "ពិធីហែជំនូន", description: "ជួបជុំញាតិមិត្ត និងហែជំនូនចូលរោងជ័យ" },
  { id: "rings", time: "៨:០០ ព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", description: "គូស្វាមីភរិយាប្តូរចិញ្ចៀន និងទទួលពរជ័យ" },
  { id: "hair", time: "៩:៣០ ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", description: "ទទួលពរជ័យពីមាតាបិតា និងចាស់ទុំ" },
  { id: "reception", time: "៥:០០ ល្ងាច", title: "ពិធីពិសាភោជនាហារ", description: "ទទួលបដិសណ្ឋារកិច្ចភ្ញៀវកិត្តិយស" },
];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeGallery(base) {
  const source = Array.isArray(base.photos) && base.photos.length
    ? base.photos
    : (Array.isArray(base.galleryImages) && base.galleryImages.length
      ? base.galleryImages
      : (Array.isArray(base.gallery) && base.gallery.length
        ? base.gallery
        : (Array.isArray(base.storyImages) ? base.storyImages : [])));

  return source
    .map((item, index) => {
      if (typeof item === "string") return { src: item, alt: `រូបថតអនុស្សាវរីយ៍ ${index + 1}` };
      const src = item?.src || item?.url || item?.preview;
      if (!src) return null;
      return { ...item, src, alt: item.alt || `រូបថតអនុស្សាវរីយ៍ ${index + 1}` };
    })
    .filter(Boolean);
}

function normalizeParentLines(base, side) {
  const father = base[`${side}Father`] || base.couple?.[`${side}Father`] || "";
  const mother = base[`${side}Mother`] || base.couple?.[`${side}Mother`] || "";
  if (father || mother) return [father, mother].filter(Boolean);

  const familyValue = base.family?.[`${side}Parents`];
  if (Array.isArray(familyValue)) return familyValue.filter(Boolean);

  const simpleValue = base[`${side}Parents`] || base.couple?.[`${side}Parents`] || familyValue;
  if (typeof simpleValue === "string" && simpleValue.trim()) {
    return simpleValue.split(/\s+និង\s+/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeGift(base) {
  if (Array.isArray(base.gift) && base.gift.length) return base.gift;

  const khqr = [
    base.khqrDollar?.qrUrl ? {
      id: "khqr-dollar",
      bank: base.khqrDollar.bankName || "KHQR",
      account: base.khqrDollar.accountName || "",
      number: base.khqrDollar.accountNumber || "",
      note: "USD ($)",
      qrImage: base.khqrDollar.qrUrl,
    } : null,
    base.khqrRiel?.qrUrl ? {
      id: "khqr-riel",
      bank: base.khqrRiel.bankName || "KHQR",
      account: base.khqrRiel.accountName || "",
      number: base.khqrRiel.accountNumber || "",
      note: "KHR (៛)",
      qrImage: base.khqrRiel.qrUrl,
    } : null,
  ].filter(Boolean);

  if (khqr.length) return khqr;

  const bank = base.bankAccount || {};
  const qrImage = base.qrGiftUrl || bank.qrUrl;
  if (!qrImage && !base.bankAccountNumber && !bank.accountNumber) return [];

  return [{
    id: "gift-primary",
    bank: base.bankName || bank.bank || "",
    account: base.bankAccountName || bank.accountName || "",
    number: base.bankAccountNumber || bank.accountNumber || "",
    note: "Wedding Gift",
    qrImage: qrImage || "",
  }];
}

function safeExternalUrl(value, fallback = "") {
  if (!value || typeof value !== "string") return fallback;
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    return fallback;
  }
  return fallback;
}

function formatMusicSource(value) {
  if (typeof value === "string") return value;
  return value?.url || "";
}

export default function KhmerRoyalLotusLayout({
  tpl: tplProp,
  content: contentProp,
  preview = false,
  previewStartClosed = false,
  previewChannel,
  showBack = false,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  useTemplateLink,
  primaryCtaLabel = "ប្រើគំរូនេះ",
  children,
}) {
  const [liveData, setLiveData] = useState(null);
  const [opened, setOpened] = useState(preview && !previewStartClosed);
  const [isOpening, setIsOpening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const invitationRef = useRef(null);
  const openingTimerRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const channel = useMemo(
    () => previewChannel || readEmbeddedPreviewChannel(),
    [previewChannel]
  );

  useEffect(() => {
    if (!channel) return undefined;
    const handleMessage = (event) => {
      if (!isTrustedPreviewMessage(event, channel)) return;
      if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data?.data) {
        setLiveData(event.data.data);
      }
      if (event.data?.type === "TOGGLE_GATE") {
        if (openingTimerRef.current) window.clearTimeout(openingTimerRef.current);
        setIsOpening(false);
        setOpened(Boolean(event.data.open ?? event.data.isOpen));
      }
    };

    window.addEventListener("message", handleMessage);
    try {
      postPreviewMessage({ type: "PREVIEW_READY" }, channel);
    } catch {
      // Preview handshake is best-effort outside the embedded simulator.
    }
    return () => window.removeEventListener("message", handleMessage);
  }, [channel]);

  useEffect(() => {
    if (preview) {
      if (openingTimerRef.current) window.clearTimeout(openingTimerRef.current);
      setIsOpening(false);
      setOpened(!previewStartClosed);
    }
  }, [preview, previewStartClosed]);

  useEffect(() => () => {
    if (openingTimerRef.current) window.clearTimeout(openingTimerRef.current);
  }, []);

  const content = useMemo(() => {
    const base = {
      ...(tplProp || {}),
      ...(contentProp || {}),
      ...(liveData || {}),
    };

    const groomParents = normalizeParentLines(base, "groom");
    const brideParents = normalizeParentLines(base, "bride");
    const venueName = base.venueName || base.venue?.name || "";
    const venueAddress = base.venueAddress || base.venue?.address || "";
    const rawMapUrl = base.googleMapUrl || base.googleMapsUrl || base.venue?.mapLink || base.mapQuery || "";
    const mapUrl = rawMapUrl?.startsWith("http")
      ? safeExternalUrl(rawMapUrl)
      : (rawMapUrl ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawMapUrl)}` : "");

    const schedule = Array.isArray(base.schedule) && base.schedule.length
      ? base.schedule.map((item, index) => ({
          id: item.id || `programme-${index}`,
          time: item.time || "",
          title: item.title || "កម្មវិធី",
          description: item.description || item.desc || "",
        }))
      : DEFAULT_SCHEDULE;

    const targetDate = base.targetDate || base.machineEventDate || (
      typeof base.weddingDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(base.weddingDate)
        ? `${base.weddingDate.split("T")[0]}T17:00:00+07:00`
        : ""
    );

    return {
      ...base,
      groom: base.groomName || base.groom || "កូនកំលោះ",
      groomEn: base.groomEn || "",
      bride: base.brideName || base.bride || "កូនក្រមុំ",
      brideEn: base.brideEn || "",
      title: base.invitationTitle || base.title || "សិរីសួស្តីអាពាហ៍ពិពាហ៍",
      subtitle: base.invitationSubtitle || base.subtitle || "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
      guestName: base.guestName || base.guestNameBanner || "លោកអ្នក និងក្រុមគ្រួសារ",
      messageTitle: base.messageTitle || "មានកិត្តិយសសូមគោរពអញ្ជើញ",
      message: base.messageText || base.blessingMessage ||
        (typeof base.message === "string" ? base.message : base.message?.text) ||
        "ចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តីមង្គល ជូនកូនប្រុស កូនស្រី របស់យើងខ្ញុំ ក្នុងថ្ងៃដ៏វិសេសវិសាលនេះ។",
      dateText: base.dateText || base.eventDateText || base.weddingDate || "ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦",
      receptionTime: base.receptionTime || base.eventTime || base.weddingTime || "វេលាម៉ោង ៥:០០ ល្ងាច",
      targetDate,
      groomParents,
      brideParents,
      venueName,
      venueAddress,
      mapUrl,
      schedule,
      gallery: normalizeGallery(base),
      gift: normalizeGift(base),
      musicUrl: base.musicUrl || base.bgMusicUrl || formatMusicSource(base.music) || defaultMusicUrl,
      primaryColor: base.primaryColor || base.design?.primaryColor || "",
      secondaryColor: base.secondaryColor || base.design?.secondaryColor || "",
      backgroundColor: base.backgroundColor || base.bg || "",
      fontKhmer: base.fontKhmer || "",
      thankYouTitle: base.thankYouTitle || "សូមថ្លែងអំណរគុណ",
      thankYouText: base.thankYouText ||
        "វត្តមានរបស់លោកអ្នក គឺជាកិត្តិយស និងជាពរជ័យដ៏មានតម្លៃសម្រាប់គ្រួសារយើងខ្ញុំ។",
    };
  }, [tplProp, contentProp, liveData]);

  const sectionEnabled = useCallback(
    (key) => content.enabledSections?.[key] !== false,
    [content.enabledSections]
  );

  const handleOpen = useCallback(() => {
    if (isOpening) return;
    setIsOpening(true);
    if (audioRef.current && content.musicUrl) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    const finishOpening = () => {
      setOpened(true);
      setIsOpening(false);
      window.requestAnimationFrame(() => {
        invitationRef.current?.focus({ preventScroll: true });
      });
    };

    if (reducedMotion) {
      finishOpening();
      return;
    }

    openingTimerRef.current = window.setTimeout(finishOpening, 1450);
  }, [content.musicUrl, isOpening, reducedMotion]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const dynamicStyles = {
    ...(content.primaryColor ? { "--krl-primary": content.primaryColor } : {}),
    ...(content.secondaryColor ? { "--krl-secondary": content.secondaryColor } : {}),
    ...(content.backgroundColor ? { "--krl-page": content.backgroundColor } : {}),
    ...(content.fontKhmer ? {
      "--krl-font-khmer": `"${content.fontKhmer}", "Kantumruy Pro", "Battambang", sans-serif`,
    } : {}),
  };

  return (
    <div className="tpl-khmer-royal-lotus" style={dynamicStyles}>
      <audio ref={audioRef} src={content.musicUrl} loop preload="metadata" />

      {!opened ? (
        <section className={`krl-opening${isOpening ? " is-opening" : ""}`} aria-label="បើកធៀបការ">
          <CoverBackground
            content={content}
            templateDefault={{
              src: DEFAULT_COVER,
              poster: DEFAULT_COVER,
              type: "image",
            }}
          />
          <div className="krl-opening__scrim" aria-hidden="true" />
          <div className="krl-opening__top">
            <span className="krl-kicker">THE WEDDING INVITATION</span>
            <h1>{content.title}</h1>
          </div>

          <div className="krl-envelope-stage">
            <div className="krl-envelope" aria-hidden="true">
              <div className="krl-envelope__back" />
              <div className="krl-envelope__card">
                <span className="krl-lotus-mark">✦</span>
                <span className="krl-envelope__names">{content.groom}</span>
                <span className="krl-envelope__amp">និង</span>
                <span className="krl-envelope__names">{content.bride}</span>
              </div>
              <div className="krl-envelope__pocket krl-envelope__pocket--left" />
              <div className="krl-envelope__pocket krl-envelope__pocket--right" />
              <div className="krl-envelope__pocket krl-envelope__pocket--bottom" />
              <div className="krl-envelope__flap">
                <div className="krl-envelope__flap-line" />
              </div>
              <div className="krl-wax-seal">
                <span>ក</span>
              </div>
            </div>
          </div>

          <div className="krl-opening__action">
            <p className="krl-opening__guest">
              <span>ជូនចំពោះ</span>
              <strong>{content.guestName}</strong>
            </p>
            <button type="button" className="krl-open-button" onClick={handleOpen} disabled={isOpening}>
              <Sparkles size={18} aria-hidden="true" />
              <span>{isOpening ? "កំពុងបើកធៀបការ..." : "បើកធៀបការ"}</span>
            </button>
            <small>ចុចដើម្បីបើកសំបុត្រ និងចាក់ភ្លេងមង្គលការ</small>
          </div>
        </section>
      ) : (
        <main
          ref={invitationRef}
          tabIndex={-1}
          className="krl-document"
          aria-label="ធៀបការឌីជីថល រាជឈូកខ្មែរ"
        >
          {showBack && (
            <div className="krl-preview-bar">
              <Link to={backTo}>{backLabel}</Link>
              {useTemplateLink && <Link className="krl-preview-bar__cta" to={useTemplateLink}>{primaryCtaLabel}</Link>}
            </div>
          )}

          <section className="krl-hero">
            <CoverBackground
              content={content}
              templateDefault={{
                src: DEFAULT_COVER,
                poster: DEFAULT_COVER,
                type: "image",
              }}
            />
            <div className="krl-hero__overlay" aria-hidden="true" />
            <div className="krl-hero__frame" aria-hidden="true">
              <span className="krl-hero__corner krl-hero__corner--a" />
              <span className="krl-hero__corner krl-hero__corner--b" />
              <span className="krl-hero__corner krl-hero__corner--c" />
              <span className="krl-hero__corner krl-hero__corner--d" />
            </div>
            <div className="krl-hero__content">
              <span className="krl-lotus-mark krl-lotus-mark--hero">✦</span>
              <p className="krl-kicker">{content.subtitle}</p>
              <h2 className="krl-hero__title">{content.groom}</h2>
              <span className="krl-hero__amp">និង</span>
              <h2 className="krl-hero__title">{content.bride}</h2>
              {(content.groomEn || content.brideEn) && (
                <p className="krl-hero__english">
                  {content.groomEn}{content.groomEn && content.brideEn ? " & " : ""}{content.brideEn}
                </p>
              )}
              <div className="krl-hero__meta">
                <span><CalendarDays size={17} aria-hidden="true" />{content.dateText}</span>
                <span><Clock3 size={17} aria-hidden="true" />{content.receptionTime}</span>
              </div>
              <p className="krl-hero__venue">{content.venueName}</p>
              <ChevronDown className="krl-scroll-cue" aria-hidden="true" />
            </div>
          </section>

          <section className="krl-section krl-section--paper" data-section="invitation">
            <div className="krl-ornament" aria-hidden="true"><span /><i>✦</i><span /></div>
            <header className="krl-section-heading">
              <p>FORMAL INVITATION</p>
              <h2>{content.messageTitle}</h2>
            </header>
            <p className="krl-invitation-copy">{content.message}</p>

            <div className="krl-family-grid">
              <article>
                <span className="krl-family-label">មាតាបិតាកូនកំលោះ</span>
                {content.groomParents.length ? content.groomParents.map((parent, index) => (
                  <p key={`groom-parent-${index}`}>{index === 0 ? "លោក " : "និងលោកស្រី "}{parent.replace(/^(លោកស្រី|លោក)\s*/, "")}</p>
                )) : <p>ព័ត៌មានមាតាបិតា</p>}
                <strong>{content.groom}</strong>
              </article>
              <div className="krl-family-divider" aria-hidden="true"><Heart size={20} /></div>
              <article>
                <span className="krl-family-label">មាតាបិតាកូនក្រមុំ</span>
                {content.brideParents.length ? content.brideParents.map((parent, index) => (
                  <p key={`bride-parent-${index}`}>{index === 0 ? "លោក " : "និងលោកស្រី "}{parent.replace(/^(លោកស្រី|លោក)\s*/, "")}</p>
                )) : <p>ព័ត៌មានមាតាបិតា</p>}
                <strong>{content.bride}</strong>
              </article>
            </div>
          </section>

          {sectionEnabled("countdown") && (
            <section className="krl-section krl-section--burgundy" data-section="countdown">
              <header className="krl-section-heading krl-section-heading--light">
                <p>COUNTING DOWN TO OUR DAY</p>
                <h2>រាប់ថយក្រោយដល់ថ្ងៃមង្គល</h2>
              </header>
              <CountdownTimer
                targetDate={content.targetDate}
                className="krl-countdown"
              />
              <p className="krl-blessing-line">សូមប្រសិទ្ធពរជ័យ សិរីសួស្តី មង្គលវិបុលសុខ គ្រប់ប្រការ</p>
            </section>
          )}

          {sectionEnabled("schedule") && (
            <section className="krl-section krl-section--paper" data-section="schedule">
              <header className="krl-section-heading">
                <p>WEDDING PROGRAMME</p>
                <h2>កម្មវិធីមង្គលការ</h2>
              </header>
              <div className="krl-programme">
                {content.schedule.map((item, index) => (
                  <article className="krl-programme__item" key={item.id || index}>
                    <div className="krl-programme__time">{item.time}</div>
                    <div className="krl-programme__thread" aria-hidden="true">
                      <span>{index + 1}</span>
                    </div>
                    <div className="krl-programme__copy">
                      <h3>{item.title}</h3>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {sectionEnabled("gallery") && content.gallery.length > 0 && (
            <section className="krl-section krl-section--gallery" data-section="gallery">
              <header className="krl-section-heading">
                <p>OUR MEMORIES</p>
                <h2>កម្រងរូបភាពអនុស្សាវរីយ៍</h2>
              </header>
              <GalleryGrid images={content.gallery} className="krl-gallery-grid" />
            </section>
          )}

          {sectionEnabled("map") && (content.venueName || content.venueAddress) && (
            <section className="krl-section krl-section--venue" data-section="venue">
              <div className="krl-venue-card">
                <MapPin size={30} aria-hidden="true" />
                <p className="krl-kicker">CEREMONY VENUE</p>
                <h2>ទីតាំងប្រារព្ធពិធី</h2>
                {content.venueName && <strong>{content.venueName}</strong>}
                {content.venueAddress && <p>{content.venueAddress}</p>}
                {content.mapUrl && (
                  <a href={content.mapUrl} target="_blank" rel="noreferrer" className="krl-action-link">
                    <MapPin size={17} aria-hidden="true" />
                    <span>បើកមើល Google Maps</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
            </section>
          )}

          {sectionEnabled("gift") && content.gift.length > 0 && (
            <section className="krl-section krl-section--paper" data-section="gift">
              <header className="krl-section-heading">
                <p>WEDDING GIFT</p>
                <h2>ចំណងដៃឌីជីថល</h2>
              </header>
              <div className="krl-gift-grid">
                {content.gift.map((item, index) => (
                  <article className="krl-gift-card" key={item.id || `gift-${index}`}>
                    <Gift size={22} aria-hidden="true" />
                    {item.qrImage && <img src={item.qrImage} alt={`QR Code ${item.bank || index + 1}`} loading="lazy" />}
                    <h3>{item.bank || "KHQR"}</h3>
                    {item.account && <p>{item.account}</p>}
                    {item.number && <strong>{item.number}</strong>}
                    {item.note && <small>{item.note}</small>}
                  </article>
                ))}
              </div>
              <p className="krl-gift-note">សូមអរគុណចំពោះសេចក្តីស្រឡាញ់ និងពរជ័យរបស់លោកអ្នក</p>
            </section>
          )}

          {sectionEnabled("rsvp") && (
            <section className="krl-section krl-section--rsvp" data-section="rsvp">
              <header className="krl-section-heading krl-section-heading--light">
                <p>RSVP</p>
                <h2>សូមបញ្ជាក់ការចូលរួម</h2>
              </header>
              <div className="krl-rsvp-card">
                <RsvpContainer themeClass="krl-rsvp" children={children} />
              </div>
            </section>
          )}

          <footer className="krl-closing">
            <span className="krl-lotus-mark">✦</span>
            <h2>{content.thankYouTitle}</h2>
            <p>{content.thankYouText}</p>
            <div className="krl-closing__names">{content.groom} <span>♥</span> {content.bride}</div>
            <small>KOUPRENG · DIGITAL WEDDING INVITATION</small>
          </footer>
        </main>
      )}

      {opened && (
        <button
          type="button"
          className={`krl-music-toggle${isPlaying ? " is-playing" : ""}`}
          onClick={toggleMusic}
          aria-label={isPlaying ? "បិទភ្លេង" : "ចាក់ភ្លេង"}
          title={isPlaying ? "បិទភ្លេង" : "ចាក់ភ្លេង"}
        >
          {isPlaying ? <Music2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
