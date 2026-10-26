import InvitationLabel from '@/features/templates/shared/InvitationLabel';
import IllustratedMap from '@/features/templates/shared/IllustratedMap';
import SaveTheDate from '../shared/SaveTheDate';
import AuthoredClosing from '../shared/AuthoredClosing';
import AuthoredFamilies from '../shared/AuthoredFamilies';
import { authoredHeadingStyle } from '../shared/templateTypography';
import ProgramTimeline from '../shared/ProgramTimeline';
import ProgramDetails from "../shared/ProgramDetails";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Clock,
  MapPin,
  Music,
  VolumeX,
  Send,
  CheckCircle2,
  QrCode,
  ExternalLink,
  Gift,
} from "lucide-react";
import defaultMusicUrl from "../../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import CoverBackground from "../shared/Openings/CoverBackground";
import { isTrustedPreviewMessage, readEmbeddedPreviewChannel } from "@/shared/preview/previewMessaging";
import "./withjoy-portal.css";

export default function WithJoyPortalLayout({
  content = {},
  preview = false,
  previewChannel,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  useTemplateLink,
  children,
}) {
  const [liveData, setLiveData] = useState(null);
  const effectiveContent = { ...content, ...liveData };

  useEffect(() => {
    const channel = previewChannel || readEmbeddedPreviewChannel();
    if (!channel) return undefined;
    const handleMessage = (e) => {
      if (!isTrustedPreviewMessage(e, channel)) return;
      if (e.data?.type === "LIVE_PREVIEW_SYNC" && e.data.data) {
        setLiveData(e.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [previewChannel]);

  const groom = effectiveContent.groom || "";
  const bride = effectiveContent.bride || "";
  const dateText = effectiveContent.dateText || "";
  const venue = effectiveContent.venue || {
    name: "",
    hall: "",
    address: "",
  };
  const coverImage = effectiveContent.coverImage || "/images/wedding/couple-hero-meadow.webp";
  const musicUrl = effectiveContent.music?.url || effectiveContent.music || defaultMusicUrl;

  // Audio Control
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Lightbox modal state
  const [activePhoto, setActivePhoto] = useState(null);

  // RSVP Form state
  const [rsvpState, setRsvpState] = useState({
    name: "",
    attending: "yes",
    guests: "1",
    meal: "khmer",
    song: "",
    submitted: false,
  });

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpState((prev) => ({ ...prev, submitted: true }));
  };

  // Love Story items
  const loveStories = (effectiveContent.storyChapters || effectiveContent.story || []).map(s => ({ ...s, desc: s.text || s.desc || "" }));
  const scheduleItems = (effectiveContent.schedule || []).map(s => ({ ...s, desc: s.description || s.desc || "" }));

  // Gallery items
  const defaultGallery = [
    "/images/wedding/couple-hero-meadow.webp",
    "/images/wedding/couple-celebration-confetti.webp",
    "/images/wedding/couple-studio-cake.webp",
    "/images/wedding/couple-studio-bow.webp",
    "/images/wedding/couple-banquet-night.webp",
    "/images/wedding/couple-garden-rings.webp",
    "/images/wedding/couple-bouquet-warmth.webp",
    "/images/wedding/couple-walk-candid.webp",
    "/images/wedding/couple-studio-embrace.webp",
  ];
  const galleryImages = (effectiveContent.gallery && effectiveContent.gallery.length)
    ? effectiveContent.gallery.map(img => typeof img === "string" ? img : img.src || img.url)
    : defaultGallery;

  const isEnabled = (key) => effectiveContent.enabledSections?.[key] !== false;
  const dressColors = Array.isArray(content.dressCode)
    ? content.dressCode
    : (Array.isArray(content.dressCode?.colors) ? content.dressCode.colors : (content.dressColors || [
        { hex: "#2B6CB0", name: "ខៀវ" },
        { hex: "#4299E1", name: "ផ្ទៃមេឃ" },
        { hex: "#D69E2E", name: "មាស" },
        { hex: "#FFFFFF", name: "ស" },
      ]));
  const faqList = Array.isArray(content.faq) && content.faq.length > 0 ? content.faq : [
    { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់។" },
    { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗទាំងអស់ក្នុងពិធីមង្គលការ។" },
    { id: "f3", q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?", a: "កម្មវិធីទទួលភ្ញៀវចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។" },
  ];

  return (
    <div className="wj-portal">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={musicUrl} loop />

      {/* Floating Audio Button */}
      <button
        type="button"
        className="wj-music-fab"
        onClick={toggleMusic}
        title={isPlaying ? "បិទសំឡេង" : "ចាក់ភ្លេង"}
      >
        {isPlaying ? <Music className="w-5 h-5 animate-spin" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Sticky Glassmorphism Header */}
      <header className="wj-nav">
        <div className="wj-nav-inner">
          <a href="#home" className="wj-nav-brand">
            {groom} &amp; {bride}
          </a>
          <nav className="wj-nav-links">
            {isEnabled("story") && <a href="#story" className="wj-nav-link"><InvitationLabel value={"រឿងរ៉ាវស្នេហា"} /></a>}
            {isEnabled("schedule") && <a href="#schedule" className="wj-nav-link"><InvitationLabel value={"កម្មវិធីបុណ្យ"} /></a>}
            {isEnabled("gallery") && <a href="#gallery" className="wj-nav-link"><InvitationLabel value={"កម្រងរូបភាព"} /></a>}
            {isEnabled("dressCode") && <a href="#dress-code" className="wj-nav-link">Dress Code</a>}
            {isEnabled("map") && <a href="#venue" className="wj-nav-link"><InvitationLabel value={"ទីតាំង"} /></a>}
            {isEnabled("gift") && <a href="#gift" className="wj-nav-link"><InvitationLabel value={"ជូនពរ/ចំណងដៃ"} /></a>}
            {isEnabled("faq") && <a href="#faq" className="wj-nav-link">FAQ</a>}
            {isEnabled("rsvp") && <a href="#rsvp" className="wj-nav-link wj-nav-rsvp-btn"><InvitationLabel value={"ឆ្លើយតប RSVP"} /></a>}
          </nav>
          {showBack && (
            <Link to={backTo} className="wj-nav-link text-xs">
              ← {backLabel}
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="wj-hero" style={{ overflow: "hidden" }}>
        <CoverBackground
          content={effectiveContent}
          templateDefault={{
            src: coverImage,
            type: "image",
            poster: coverImage,
          }}
        />
        <div className="wj-hero-content">
          <span className="wj-hero-tag">{effectiveContent.title || 'អាពាហ៍ពិពាហ៍ឌីជីថលបែបទំនើប'}</span>
          {effectiveContent.subtitle && <p>{effectiveContent.subtitle}</p>}
          <h1 className="wj-hero-names" style={authoredHeadingStyle(effectiveContent, groom + bride, 'Kantumruy Pro')}>
            {groom} <span style={{ color: "var(--wj-accent)" }}>&amp;</span> {bride}
          </h1>
          <p className="wj-hero-date">{dateText}</p>
          {effectiveContent.messageTitle && <h2>{effectiveContent.messageTitle}</h2>}
          {effectiveContent.message && <p>{effectiveContent.message}</p>}
          <AuthoredFamilies content={effectiveContent} />

          {isEnabled("countdown") && <SaveTheDate content={effectiveContent} />}
        </div>
      </section>

      {/* Love Story Timeline */}
      {isEnabled("story") && (
        <section id="story" className="wj-section">
          <div className="wj-section-header">
            <p className="wj-section-kicker">Our Journey</p>
            <h2 className="wj-section-title"><InvitationLabel value={"រឿងរ៉ាវស្នេហារបស់យើង"} /></h2>
            <p className="wj-section-sub"><InvitationLabel value={"ពេលវេលាដ៏មានន័យដែលយើងបានឆ្លងកាត់ជាមួយគ្នា"} /></p>
          </div>

          <div className="wj-timeline">
            {loveStories.map((story, i) => (
              <div key={i} className="wj-timeline-item">
                <div className="wj-timeline-dot">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div className="wj-timeline-content">
                  <span className="wj-timeline-date">{story.date}</span>
                  <h3 className="wj-timeline-title">{story.title}</h3>
                  <p className="wj-timeline-desc">{story.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Program Schedule */}
      {isEnabled("schedule") && (
        <section id="schedule" className="wj-section" style={{ background: "#edf2f7" }}>
          <div className="wj-section-header">
            <p className="wj-section-kicker">Order of Events</p>
            <h2 className="wj-section-title"><InvitationLabel value={"កម្មវិធីពិធីមង្គលការ"} /></h2>
            <p className="wj-section-sub"><InvitationLabel value={"សូមអញ្ជើញចូលរួមតាមពេលវេលាកំណត់ ដើម្បីរួមអបអរសាទរ"} /></p>
          </div>

          {effectiveContent.programDays ? <ProgramTimeline content={effectiveContent} /> : <div className="wj-schedule-grid">
            {scheduleItems.map((item, i) => (
              <div key={i} className="wj-schedule-card">
                <div className="wj-schedule-icon">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="wj-schedule-time">{item.time}</span>
                <ProgramDetails item={item} content={effectiveContent} /><h3 className="wj-schedule-title">{item.title}</h3>
                <p className="wj-schedule-desc">{item.desc}</p>
              </div>
            ))}
          </div>}
        </section>
      )}

      {/* Dress Code Section */}
      {isEnabled("dressCode") && dressColors.length > 0 && (
        <section id="dress-code" className="wj-section" style={{ background: "#ffffff" }}>
          <div className="wj-section-header">
            <p className="wj-section-kicker">Dress Code</p>
            <h2 className="wj-section-title">{content.dressCode?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)"}</h2>
            <p className="wj-section-sub"><InvitationLabel value={"ពណ៌សម្លៀកបំពាក់សម្រាប់ភ្ញៀវកិត្តិយស"} /></p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", maxWidth: "600px", margin: "0 auto" }}>
            {dressColors.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: c.hex,
                    border: "2px solid var(--wj-border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--wj-text-main)", fontWeight: "600" }}>{c.name}</span>
              </div>
            ))}
          </div>
          {content.dressCode?.description && (
            <p style={{ textAlign: "center", color: "var(--wj-text-muted)", fontSize: "0.85rem", marginTop: "1rem" }}>
              {content.dressCode.description}
            </p>
          )}
        </section>
      )}

      {/* Gallery Section */}
      {isEnabled("gallery") && (
        <section id="gallery" className="wj-section">
          <div className="wj-section-header">
            <p className="wj-section-kicker">Moments &amp; Memories</p>
            <h2 className="wj-section-title"><InvitationLabel value={"កម្រងរូបភាពអនុស្សាវរីយ៍"} /></h2>
            <p className="wj-section-sub"><InvitationLabel value={"ចុចលើរូបភាពដើម្បីពង្រីកមើលទំហំធំ"} /></p>
          </div>

          <div className="wj-gallery-grid">
            {galleryImages.map((src, i) => (
              <div key={i} className="wj-gallery-item" onClick={() => setActivePhoto(src)}>
                <img src={src} alt={`Moment ${i + 1}`} className="wj-gallery-img" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setActivePhoto(null)}
        >
          <img
            src={activePhoto}
            alt="Expanded view"
            style={{ maxWidth: "90%", maxHeight: "85vh", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}

      {/* Venue Section */}
      {isEnabled("map") && (
        <section id="venue" className="wj-section" style={{ background: "#edf2f7" }}>
          <IllustratedMap content={effectiveContent} />
          <div className="wj-section-header">
            <p className="wj-section-kicker">Location &amp; Map</p>
            <h2 className="wj-section-title"><InvitationLabel value={"ទីតាំងប្រារព្ធពិធី"} /></h2>
            <p className="wj-section-sub">{venue.name} — {venue.hall}</p>
          </div>

          <div
            style={{
              maxWidth: "750px",
              margin: "0 auto",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "var(--wj-shadow)",
              textAlign: "center",
            }}
          >
            <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--wj-primary-light)" }} />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem" }}>{venue.name}</h3>
            <p style={{ color: "var(--wj-text-muted)", marginBottom: "1.5rem" }}>{venue.address}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(venue.name + " " + venue.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--wj-primary)",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            ><InvitationLabel value={"មើលលើ Google Maps"} /><ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      {/* Gift / Blessing Registry */}
      {isEnabled("gift") && (effectiveContent.bankAccount?.accountNumber || effectiveContent.bankAccount?.qrUrl || (effectiveContent.gift && effectiveContent.gift.length > 0)) && (
        <section id="gift" className="wj-section">
          <div className="wj-section-header">
            <p className="wj-section-kicker">Wedding Gift</p>
            <h2 className="wj-section-title"><InvitationLabel value={"ចំណងដៃ & ពាក្យជូនពរ"} /></h2>
            <p className="wj-section-sub"><InvitationLabel value={"វត្តមានដ៏ថ្លៃថ្លារបស់លោកអ្នក គឺជាកាដូដ៏មានតម្លៃបំផុតសម្រាប់យើងខ្ញុំ"} /></p>
          </div>

          <div
            style={{
              maxWidth: "480px",
              margin: "0 auto",
              background: "#ffffff",
              border: "1px solid var(--wj-border)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "var(--wj-shadow)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(214, 158, 46, 0.15)",
                color: "var(--wj-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Gift className="w-8 h-8" />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.25rem" }}>
              {effectiveContent.bankAccount?.bank || "Bank & KHQR"}
            </h3>
            <p style={{ color: "var(--wj-text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              ស្កេន QR Code ដើម្បីផ្ញើចំណងដៃជូនពរតាមប្រព័ន្ធធនាគារ
            </p>
            <div
              style={{
                background: "#f7fafc",
                padding: "1rem",
                borderRadius: "12px",
                display: "inline-block",
                border: "1px dashed var(--wj-border)",
                marginBottom: "1rem",
              }}
            >
              {effectiveContent.bankAccount?.qrUrl ? (
                <img src={effectiveContent.bankAccount.qrUrl} alt="KHQR" className="w-36 h-36 mx-auto object-contain rounded-lg" />
              ) : (
                <QrCode className="w-36 h-36 mx-auto text-slate-800" />
              )}
              {effectiveContent.bankAccount?.accountNumber && (
                <p style={{ fontSize: "0.85rem", fontWeight: "600", marginTop: "0.5rem" }}>
                  {effectiveContent.bankAccount.accountNumber} {effectiveContent.bankAccount.bank ? `(${effectiveContent.bankAccount.bank})` : ""}
                </p>
              )}
              {effectiveContent.bankAccount?.accountName ? (
                <p style={{ fontSize: "0.75rem", color: "var(--wj-text-muted)" }}>{effectiveContent.bankAccount.accountName}</p>
              ) : (groom || bride) ? (
                <p style={{ fontSize: "0.75rem", color: "var(--wj-text-muted)" }}>{[groom, bride].filter(Boolean).join(" & ")}</p>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {isEnabled("faq") && faqList.length > 0 && (
        <section id="faq" className="wj-section" style={{ background: "#ffffff" }}>
          <div className="wj-section-header">
            <p className="wj-section-kicker">FAQ</p>
            <h2 className="wj-section-title"><InvitationLabel value={"សំណួរដែលសួរញឹកញាប់"} /></h2>
            <p className="wj-section-sub"><InvitationLabel value={"ព័ត៌មានលម្អិតបន្ថែមសម្រាប់ភ្ញៀវកិត្តិយស"} /></p>
          </div>
          <div style={{ maxWidth: "650px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {faqList.map((item) => (
              <details
                key={item.id || item.q}
                style={{
                  background: "#f7fafc",
                  border: "1px solid var(--wj-border)",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                }}
              >
                <summary style={{ fontWeight: "600", color: "var(--wj-primary)", cursor: "pointer", fontSize: "0.95rem" }}>
                  {item.q}
                </summary>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--wj-text-muted)", lineHeight: "1.6", borderTop: "1px solid var(--wj-border)", paddingTop: "0.5rem" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Multi-step RSVP Section */}
      {isEnabled("rsvp") && (
        <section id="rsvp" className="wj-section" style={{ background: "#edf2f7" }}>
          <div className="wj-section-header">
            <p className="wj-section-kicker">RSVP Online</p>
            <h2 className="wj-section-title"><InvitationLabel value={"បញ្ជាក់ការចូលរួម"} /></h2>
            <p className="wj-section-sub">
              <InvitationLabel value="សូមបញ្ជាក់ការចូលរួមរបស់លោកអ្នក" />
            </p>
          </div>

          <div className="wj-rsvp-card">
            {children || (rsvpState.submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--wj-primary)", marginBottom: "0.5rem" }}><InvitationLabel value={"សូមអរគុណសម្រាប់ការឆ្លើយតប!"} /></h3>
                <p style={{ color: "var(--wj-text-muted)", lineHeight: "1.6" }}>
                  យើងខ្ញុំទទួលបានការបញ្ជាក់របស់លោកអ្នករួចរាល់ហើយ។ រីករាយនឹងជួបលោកអ្នកក្នុងថ្ងៃមង្គលការ!
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit}>
                <div className="wj-form-group">
                  <label className="wj-label"><InvitationLabel value={"គោត្តនាម និងនាម (Your Name)"} /></label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. លោក សុខ សុផល"
                    className="wj-input"
                    value={rsvpState.name}
                    onChange={(e) => setRsvpState({ ...rsvpState, name: e.target.value })}
                  />
                </div>

                <div className="wj-form-group">
                  <label className="wj-label"><InvitationLabel value={"តើលោកអ្នកអាចចូលរួមបានទេ? (Will you attend?)"} /></label>
                  <div className="wj-radio-group">
                    <label className="wj-radio-label">
                      <input
                        type="radio"
                        name="attending"
                        value="yes"
                        checked={rsvpState.attending === "yes"}
                        onChange={(e) => setRsvpState({ ...rsvpState, attending: e.target.value })}
                      /><InvitationLabel value={"ចូលរួមដោយក្តីរីករាយ"} /></label>
                    <label className="wj-radio-label">
                      <input
                        type="radio"
                        name="attending"
                        value="no"
                        checked={rsvpState.attending === "no"}
                        onChange={(e) => setRsvpState({ ...rsvpState, attending: e.target.value })}
                      /><InvitationLabel value={"សោកស្តាយ មិនអាចចូលរួមបាន"} /></label>
                  </div>
                </div>

                {rsvpState.attending === "yes" && (
                  <>
                    <div className="wj-form-group">
                      <label className="wj-label"><InvitationLabel value={"ចំនួនភ្ញៀវចូលរួម (Number of Guests)"} /></label>
                      <select
                        className="wj-select"
                        value={rsvpState.guests}
                        onChange={(e) => setRsvpState({ ...rsvpState, guests: e.target.value })}
                      >
                        <option value="1"><InvitationLabel value={"១ នាក់ (1 person)"} /></option>
                        <option value="2"><InvitationLabel value={"២ នាក់ (2 persons)"} /></option>
                        <option value="3"><InvitationLabel value={"៣ នាក់ ឬគ្រួសារ (3+ persons)"} /></option>
                      </select>
                    </div>

                    <div className="wj-form-group">
                      <label className="wj-label"><InvitationLabel value={"ជម្រើសមុខម្ហូប (Meal Preference)"} /></label>
                      <select
                        className="wj-select"
                        value={rsvpState.meal}
                        onChange={(e) => setRsvpState({ ...rsvpState, meal: e.target.value })}
                      >
                        <option value="khmer"><InvitationLabel value={"ម្ហូបខ្មែរប្រពៃណី (Traditional Khmer Feast)"} /></option>
                        <option value="western"><InvitationLabel value={"សាច់គោអាំងបែបបស្ចិមប្រទេស (Western Steak)"} /></option>
                        <option value="vegetarian"><InvitationLabel value={"ម្ហូបបួស (Vegetarian)"} /></option>
                      </select>
                    </div>

                    <div className="wj-form-group">
                      <label className="wj-label"><InvitationLabel value={"សំណូមពរបទចម្រៀងសម្រាប់ DJ (Song Request)"} /></label>
                      <input
                        type="text"
                        placeholder="ឧ. ថ្ងៃដែលរង់ចាំ ឬ គូព្រេង"
                        className="wj-input"
                        value={rsvpState.song}
                        onChange={(e) => setRsvpState({ ...rsvpState, song: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="wj-btn-submit">
                  <Send className="w-4 h-4 inline mr-2" /><InvitationLabel value={"ផ្ញើការបញ្ជាក់ (Submit RSVP)"} /></button>
              </form>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA & Brand */}
      <footer style={{ background: "var(--wj-primary)", color: "#ffffff", padding: "3rem 1.5rem", textAlign: "center" }}>
        <AuthoredClosing content={effectiveContent} />
        <p style={{ fontFamily: "Cinzel, serif", fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          {groom} &amp; {bride}
        </p>
        <p style={{ color: "#a0aec0", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          សូមអរគុណសម្រាប់ការចូលរួមជាចំណែកនៃថ្ងៃដ៏វិសេសវិសាលរបស់យើងខ្ញុំ
        </p>
        {!preview && useTemplateLink && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link
              to={useTemplateLink}
              style={{
                background: "linear-gradient(135deg, #d69e2e, #b7791f)",
                color: "#ffffff",
                padding: "0.75rem 1.75rem",
                borderRadius: "9999px",
                fontWeight: "600",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(214, 158, 46, 0.4)",
              }}
            >
              ប្រើគំរូ WithJoy Portal នេះ
            </Link>
          </div>
        )}
      </footer>
    </div>
  );
}
