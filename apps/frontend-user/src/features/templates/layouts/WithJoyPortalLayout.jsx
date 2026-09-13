import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Music,
  VolumeX,
  Sparkles,
  Send,
  CheckCircle2,
  QrCode,
  Copy,
  ExternalLink,
  ChevronRight,
  Camera,
  Gift,
  Users,
} from "lucide-react";
import defaultMusicUrl from "../../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import "./withjoy-portal.css";

export default function WithJoyPortalLayout({
  content = {},
  preview = false,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  useTemplateLink,
}) {
  const groom = content.groom || "វណ្ណដា";
  const bride = content.bride || "ស្រីពេជ្រ";
  const dateText = content.dateText || "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦";
  const venue = content.venue || {
    name: "The Premier Center Sen Sok",
    hall: "Grand Ballroom A",
    address: "ផ្លូវ 1003, សង្កាត់ភ្នំពេញថ្មី, ខណ្ឌសែនសុខ, រាជធានីភ្នំពេញ",
  };
  const coverImage = content.coverImage || "/facebook/all/03-card/cover-card.jpg";
  const musicUrl = content.music?.url || content.music || defaultMusicUrl;

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

  // Countdown logic
  const [timeLeft, setTimeLeft] = useState({ days: 48, hours: 14, minutes: 22, seconds: 45 });
  useEffect(() => {
    const target = new Date("2026-11-28T17:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
  const loveStories = [
    {
      date: "តុលា ២០២១",
      title: "ថ្ងៃជួបគ្នាដំបូង",
      desc: "យើងបានជួបគ្នាក្នុងកម្មវិធីសិក្ខាសាលាបច្ចេកវិទ្យានៅភ្នំពេញ ស្នាមញញឹមដំបូងបានដក់ជាប់ក្នុងចិត្តមិនដែលភ្លេច។",
    },
    {
      date: "ធ្នូ ២០២៣",
      title: "ដំណើរកម្សាន្តទៅសៀមរាប",
      desc: "ទស្សនាថ្ងៃលិចនៅប្រាសាទបាខែង និងការសន្យារួមដំណើរសាងអនាគតជាមួយគ្នាក្រោមពន្លឺផ្កាយ។",
    },
    {
      date: "កុម្ភៈ ២០២៥",
      title: "ថ្ងៃសុំរៀបការ (The Proposal)",
      desc: "ពាក្យ 'Yes' ដ៏ផ្អែមល្ហែមបំផុតបានបន្លឺឡើង ជាមួយការអបអរសាទរពីក្រុមគ្រួសារ និងមិត្តភក្តិជិតស្និទ្ធ។",
    },
  ];

  // Schedule items
  const scheduleItems = [
    { time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន & សូត្រមន្ត", desc: "ស្វាគមន៍ភ្ញៀវ និងទទួលពរជ័យពីព្រះសង្ឃ", icon: "ceremony" },
    { time: "០៨:៣០ ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", desc: "ពិធីប្រពៃណីកាត់សក់សិរីសួស្តីដល់គូស្វាមីភរិយា", icon: "hair" },
    { time: "១០:០០ ព្រឹក", title: "ពិធីសំពះផ្ទឹម & ចងដៃ", desc: "មាតាបិតា និងញាតិមិត្តចងដៃប្រសិទ្ធពរជ័យ", icon: "ring" },
    { time: "០៥:០០ ល្ងាច", title: "ពិធីពិសាភោជនាហារមង្គលការ", desc: "ពិសាអាហារ រាំកម្សាន្ត និងថតរូបអនុស្សាវរីយ៍", icon: "party" },
  ];

  // Gallery items
  const galleryImages = [
    "/facebook/all/03-card/cover-card.jpg",
    "/facebook/all/03-card/03-01.jpg",
    "/facebook/all/03-card/03-02.jpg",
    "/facebook/all/03-card/03-03.jpg",
    "/facebook/all/03-card/03-04.jpg",
    "/templates/canva-luxury/emerald-luxury.jpg",
  ];

  const isEnabled = (key) => content.enabledSections?.[key] !== false;
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
            {isEnabled("story") && <a href="#story" className="wj-nav-link">រឿងរ៉ាវស្នេហា</a>}
            {isEnabled("schedule") && <a href="#schedule" className="wj-nav-link">កម្មវិធីបុណ្យ</a>}
            {isEnabled("gallery") && <a href="#gallery" className="wj-nav-link">កម្រងរូបភាព</a>}
            {isEnabled("dressCode") && <a href="#dress-code" className="wj-nav-link">Dress Code</a>}
            {isEnabled("map") && <a href="#venue" className="wj-nav-link">ទីតាំង</a>}
            {isEnabled("gift") && <a href="#gift" className="wj-nav-link">ជូនពរ/ចំណងដៃ</a>}
            {isEnabled("faq") && <a href="#faq" className="wj-nav-link">FAQ</a>}
            {isEnabled("rsvp") && <a href="#rsvp" className="wj-nav-link wj-nav-rsvp-btn">ឆ្លើយតប RSVP</a>}
          </nav>
          {showBack && (
            <Link to={backTo} className="wj-nav-link text-xs">
              ← {backLabel}
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="wj-hero" style={{ backgroundImage: `url(${coverImage})` }}>
        <div className="wj-hero-content">
          <span className="wj-hero-tag">អាពាហ៍ពិពាហ៍ឌីជីថលបែបទំនើប</span>
          <h1 className="wj-hero-names">
            {groom} <span style={{ color: "var(--wj-accent)" }}>&amp;</span> {bride}
          </h1>
          <p className="wj-hero-date">{dateText}</p>

          {isEnabled("countdown") && (
            <div className="wj-countdown-grid">
              <div className="wj-countdown-item">
                <span className="wj-countdown-num">{timeLeft.days}</span>
                <span className="wj-countdown-label">ថ្ងៃ</span>
              </div>
              <div className="wj-countdown-item">
                <span className="wj-countdown-num">{timeLeft.hours}</span>
                <span className="wj-countdown-label">ម៉ោង</span>
              </div>
              <div className="wj-countdown-item">
                <span className="wj-countdown-num">{timeLeft.minutes}</span>
                <span className="wj-countdown-label">នាទី</span>
              </div>
              <div className="wj-countdown-item">
                <span className="wj-countdown-num">{timeLeft.seconds}</span>
                <span className="wj-countdown-label">វិនាទី</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Love Story Timeline */}
      {isEnabled("story") && (
        <section id="story" className="wj-section">
          <div className="wj-section-header">
            <p className="wj-section-kicker">Our Journey</p>
            <h2 className="wj-section-title">រឿងរ៉ាវស្នេហារបស់យើង</h2>
            <p className="wj-section-sub">ពេលវេលាដ៏មានន័យដែលយើងបានឆ្លងកាត់ជាមួយគ្នា</p>
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
            <h2 className="wj-section-title">កម្មវិធីពិធីមង្គលការ</h2>
            <p className="wj-section-sub">
              សូមអញ្ជើញចូលរួមតាមពេលវេលាកំណត់ ដើម្បីរួមអបអរសាទរ
            </p>
          </div>

          <div className="wj-schedule-grid">
            {scheduleItems.map((item, i) => (
              <div key={i} className="wj-schedule-card">
                <div className="wj-schedule-icon">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="wj-schedule-time">{item.time}</span>
                <h3 className="wj-schedule-title">{item.title}</h3>
                <p className="wj-schedule-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dress Code Section */}
      {isEnabled("dressCode") && dressColors.length > 0 && (
        <section id="dress-code" className="wj-section" style={{ background: "#ffffff" }}>
          <div className="wj-section-header">
            <p className="wj-section-kicker">Dress Code</p>
            <h2 className="wj-section-title">{content.dressCode?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)"}</h2>
            <p className="wj-section-sub">ពណ៌សម្លៀកបំពាក់សម្រាប់ភ្ញៀវកិត្តិយស</p>
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
            <h2 className="wj-section-title">កម្រងរូបភាពអនុស្សាវរីយ៍</h2>
            <p className="wj-section-sub">ចុចលើរូបភាពដើម្បីពង្រីកមើលទំហំធំ</p>
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
          <div className="wj-section-header">
            <p className="wj-section-kicker">Location &amp; Map</p>
            <h2 className="wj-section-title">ទីតាំងប្រារព្ធពិធី</h2>
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
            >
              មើលលើ Google Maps <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      {/* Gift / Blessing Registry */}
      {isEnabled("gift") && (
        <section id="gift" className="wj-section">
          <div className="wj-section-header">
            <p className="wj-section-kicker">Wedding Gift</p>
            <h2 className="wj-section-title">ចំណងដៃ &amp; ពាក្យជូនពរ</h2>
            <p className="wj-section-sub">វត្តមានដ៏ថ្លៃថ្លារបស់លោកអ្នក គឺជាកាដូដ៏មានតម្លៃបំផុតសម្រាប់យើងខ្ញុំ</p>
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
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.25rem" }}>ABA Bank &amp; KHQR</h3>
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
              <QrCode className="w-36 h-36 mx-auto text-slate-800" />
              <p style={{ fontSize: "0.85rem", fontWeight: "600", marginTop: "0.5rem" }}>000 123 456 (ABA)</p>
              <p style={{ fontSize: "0.75rem", color: "var(--wj-text-muted)" }}>{groom} &amp; {bride}</p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {isEnabled("faq") && faqList.length > 0 && (
        <section id="faq" className="wj-section" style={{ background: "#ffffff" }}>
          <div className="wj-section-header">
            <p className="wj-section-kicker">FAQ</p>
            <h2 className="wj-section-title">សំណួរដែលសួរញឹកញាប់</h2>
            <p className="wj-section-sub">ព័ត៌មានលម្អិតបន្ថែមសម្រាប់ភ្ញៀវកិត្តិយស</p>
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
            <h2 className="wj-section-title">បញ្ជាក់ការចូលរួម</h2>
            <p className="wj-section-sub">
              សូមជួយឆ្លើយតបមុនថ្ងៃទី ១៥ ខែវិច្ឆិកា ឆ្នាំ២០២៦ ដើម្បីឱ្យយើងខ្ញុំរៀបចំទទួលបដិសណ្ឋារកិច្ចឱ្យបានល្អប្រសើរ។
            </p>
          </div>

          <div className="wj-rsvp-card">
            {rsvpState.submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--wj-primary)", marginBottom: "0.5rem" }}>
                  សូមអរគុណសម្រាប់ការឆ្លើយតប!
                </h3>
                <p style={{ color: "var(--wj-text-muted)", lineHeight: "1.6" }}>
                  យើងខ្ញុំទទួលបានការបញ្ជាក់របស់លោកអ្នករួចរាល់ហើយ។ រីករាយនឹងជួបលោកអ្នកក្នុងថ្ងៃមង្គលការ!
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit}>
                <div className="wj-form-group">
                  <label className="wj-label">គោត្តនាម និងនាម (Your Name)</label>
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
                  <label className="wj-label">តើលោកអ្នកអាចចូលរួមបានទេ? (Will you attend?)</label>
                  <div className="wj-radio-group">
                    <label className="wj-radio-label">
                      <input
                        type="radio"
                        name="attending"
                        value="yes"
                        checked={rsvpState.attending === "yes"}
                        onChange={(e) => setRsvpState({ ...rsvpState, attending: e.target.value })}
                      />
                      ចូលរួមដោយក្តីរីករាយ
                    </label>
                    <label className="wj-radio-label">
                      <input
                        type="radio"
                        name="attending"
                        value="no"
                        checked={rsvpState.attending === "no"}
                        onChange={(e) => setRsvpState({ ...rsvpState, attending: e.target.value })}
                      />
                      សោកស្តាយ មិនអាចចូលរួមបាន
                    </label>
                  </div>
                </div>

                {rsvpState.attending === "yes" && (
                  <>
                    <div className="wj-form-group">
                      <label className="wj-label">ចំនួនភ្ញៀវចូលរួម (Number of Guests)</label>
                      <select
                        className="wj-select"
                        value={rsvpState.guests}
                        onChange={(e) => setRsvpState({ ...rsvpState, guests: e.target.value })}
                      >
                        <option value="1">១ នាក់ (1 person)</option>
                        <option value="2">២ នាក់ (2 persons)</option>
                        <option value="3">៣ នាក់ ឬគ្រួសារ (3+ persons)</option>
                      </select>
                    </div>

                    <div className="wj-form-group">
                      <label className="wj-label">ជម្រើសមុខម្ហូប (Meal Preference)</label>
                      <select
                        className="wj-select"
                        value={rsvpState.meal}
                        onChange={(e) => setRsvpState({ ...rsvpState, meal: e.target.value })}
                      >
                        <option value="khmer">ម្ហូបខ្មែរប្រពៃណី (Traditional Khmer Feast)</option>
                        <option value="western">សាច់គោអាំងបែបបស្ចិមប្រទេស (Western Steak)</option>
                        <option value="vegetarian">ម្ហូបបួស (Vegetarian)</option>
                      </select>
                    </div>

                    <div className="wj-form-group">
                      <label className="wj-label">សំណូមពរបទចម្រៀងសម្រាប់ DJ (Song Request)</label>
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
                  <Send className="w-4 h-4 inline mr-2" /> ផ្ញើការបញ្ជាក់ (Submit RSVP)
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer CTA & Brand */}
      <footer style={{ background: "var(--wj-primary)", color: "#ffffff", padding: "3rem 1.5rem", textAlign: "center" }}>
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
