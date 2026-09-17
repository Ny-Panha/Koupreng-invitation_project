import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Music, VolumeX, X, CheckCircle2 } from "lucide-react";
import defaultMusicUrl from "../../../assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";
import "./bliss-editorial.css";

export default function BlissEditorialLayout({
  content = {},
  preview = false,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  useTemplateLink,
}) {
  const groom = content.groom || "វណ្ណដា";
  const bride = content.bride || "ស្រីពេជ្រ";
  const groomEn = content.groomEn || "Vanda Chea";
  const brideEn = content.brideEn || "Sreypich Sok";
  const dateText = content.dateText || "ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦";
  const dateTextEn = content.dateTextEn || "Saturday, November 28, 2026";
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

  // RSVP Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rsvpState, setRsvpState] = useState({
    name: "",
    attending: "yes",
    guests: "1",
    note: "",
    submitted: false,
  });

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpState((prev) => ({ ...prev, submitted: true }));
  };

  const galleryImages = [
    "/facebook/all/03-card/cover-card.jpg",
    "/facebook/all/03-card/03-01.jpg",
    "/facebook/all/03-card/03-02.jpg",
    "/facebook/all/03-card/03-03.jpg",
  ];

  const isEnabled = (key) => content.enabledSections?.[key] !== false;
  const dressColors = Array.isArray(content.dressCode)
    ? content.dressCode
    : (Array.isArray(content.dressCode?.colors) ? content.dressCode.colors : (content.dressColors || [
        { hex: "#2C2C2C", name: "Charcoal" },
        { hex: "#8E8279", name: "Taupe" },
        { hex: "#D6CFC7", name: "Cream" },
        { hex: "#FFFFFF", name: "White" },
      ]));
  const faqList = Array.isArray(content.faq) && content.faq.length > 0 ? content.faq : [
    { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់។" },
    { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗទាំងអស់ក្នុងពិធីមង្គលការ។" },
    { id: "f3", q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?", a: "កម្មវិធីទទួលភ្ញៀវចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។" },
  ];

  return (
    <div className="bliss-container">
      <audio ref={audioRef} src={musicUrl} loop />

      {/* Floating Audio Button */}
      <button
        type="button"
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 90,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "var(--bliss-charcoal)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {isPlaying ? <Music className="w-5 h-5 animate-spin" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Editorial Minimalist Header */}
      <header className="bliss-header">
        <div className="bliss-monogram">
          {groomEn.charAt(0)} &amp; {brideEn.charAt(0)}
        </div>
        <nav className="bliss-header-nav">
          <a href="#editorial-hero" className="bliss-header-link">សេចក្តីផ្តើម</a>
          {isEnabled("schedule") && <a href="#editorial-program" className="bliss-header-link">កម្មវិធី</a>}
          {isEnabled("gallery") && <a href="#editorial-spread" className="bliss-header-link">កម្រងរូបភាព</a>}
          {isEnabled("dressCode") && <a href="#editorial-dress" className="bliss-header-link">Dress Code</a>}
          {isEnabled("map") && <a href="#editorial-venue" className="bliss-header-link">ទីតាំង</a>}
          {isEnabled("faq") && <a href="#editorial-faq" className="bliss-header-link">FAQ</a>}
          {isEnabled("rsvp") && (
            <button type="button" className="bliss-rsvp-trigger" onClick={() => setDrawerOpen(true)}>
              RSVP
            </button>
          )}
          {showBack && (
            <Link to={backTo} className="bliss-header-link" style={{ opacity: 0.7 }}>
              ← {backLabel}
            </Link>
          )}
        </nav>
      </header>

      {/* Split-Screen Hero */}
      <section id="editorial-hero" className="bliss-hero-split">
        <div className="bliss-hero-visual">
          <img src={coverImage} alt="Wedding Portrait" className="bliss-hero-img" />
        </div>
        <div className="bliss-hero-editorial">
          <span className="bliss-issue-tag">THE WEDDING CELEBRATION • ISSUE 2026</span>
          <h1 className="bliss-editorial-names">
            {groom} &amp;<br />
            {bride}
          </h1>
          <p className="bliss-editorial-date">{dateText}</p>
          <blockquote className="bliss-quote">
            "សេចក្តីស្រឡាញ់ពិតមិនមែនជាការសម្លឹងមើលមុខគ្នានោះទេ ប៉ុន្តែជាការសម្លឹងទៅកាន់ទិសដៅតែមួយរួមគ្នាជាមួយមនុស្សជាទីស្រឡាញ់។"
          </blockquote>
          {isEnabled("rsvp") && (
            <div>
              <button type="button" className="bliss-rsvp-trigger" onClick={() => setDrawerOpen(true)}>
                សូមបញ្ជាក់ការចូលរួម • RSVP NOW
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Editorial Program Section */}
      {isEnabled("schedule") && (
        <section id="editorial-program" className="bliss-section">
          <div className="bliss-section-heading">
            <p className="bliss-kicker">Order of Events</p>
            <h2 className="bliss-title">កាលវិភាគពិធីមង្គលការ</h2>
          </div>

          <div className="bliss-program-list">
            <div className="bliss-program-row">
              <span className="bliss-program-time">07:00 AM</span>
              <div>
                <h3 className="bliss-program-title">ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត</h3>
                <p className="bliss-program-desc">
                  ពិធីសាសនាបែបព្រះពុទ្ធសាសនា និមន្តព្រះសង្ឃសូត្រមន្តប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គលវិបុលសុខដល់គូស្វាមីភរិយាថ្មី។
                </p>
              </div>
            </div>

            <div className="bliss-program-row">
              <span className="bliss-program-time">08:30 AM</span>
              <div>
                <h3 className="bliss-program-title">ពិធីកាត់សក់បង្កក់សិរី &amp; សំពះផ្ទឹម</h3>
                <p className="bliss-program-desc">
                  ពិធីប្រពៃណីខ្មែរដ៏ពិសិដ្ឋ កាត់សក់ជម្រះនូវឧបទ្រពចង្រៃ និងសំពះផ្ទឹមចងដៃប្រសិទ្ធពរជ័យពីសំណាក់មាតាបិតា និងចាស់ទុំទាំងសងខាង។
                </p>
              </div>
            </div>

            <div className="bliss-program-row">
              <span className="bliss-program-time">05:00 PM</span>
              <div>
                <h3 className="bliss-program-title">ពិធីទទួលបដិសណ្ឋារកិច្ច &amp; ពិសាភោជនាហារ</h3>
                <p className="bliss-program-desc">
                  ស្វាគមន៍ភ្ញៀវកិត្តិយស ពិសាអាហារពេលល្ងាច និងរាំកម្សាន្តនៅ {venue.name} ({venue.hall})។
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dress Code Section */}
      {isEnabled("dressCode") && dressColors.length > 0 && (
        <section id="editorial-dress" className="bliss-section" style={{ textAlign: "center", borderTop: "1px solid var(--bliss-border)" }}>
          <p className="bliss-kicker">Palette &amp; Attire</p>
          <h2 className="bliss-title" style={{ marginBottom: "1.5rem" }}>{content.dressCode?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)"}</h2>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", maxWidth: "600px", margin: "0 auto" }}>
            {dressColors.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: c.hex,
                    border: "1px solid var(--bliss-border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <span style={{ fontSize: "0.8rem", letterSpacing: "0.05em", color: "var(--bliss-charcoal)", textTransform: "uppercase" }}>{c.name}</span>
              </div>
            ))}
          </div>
          {content.dressCode?.description && (
            <p style={{ color: "var(--bliss-taupe)", maxWidth: "500px", margin: "1.5rem auto 0", lineHeight: "1.7", fontSize: "0.85rem" }}>
              {content.dressCode.description}
            </p>
          )}
        </section>
      )}

      {/* Asymmetrical Gallery Spread */}
      {isEnabled("gallery") && (
        <section id="editorial-spread" className="bliss-section" style={{ borderTop: "1px solid var(--bliss-border)" }}>
          <div className="bliss-section-heading">
            <p className="bliss-kicker">Visual Editorial</p>
            <h2 className="bliss-title">កម្រងអនុស្សាវរីយ៍</h2>
          </div>

          <div className="bliss-gallery-spread">
            <div className="bliss-gallery-col-1 bliss-gallery-frame">
              <img src={galleryImages[0]} alt="Spread 1" loading="lazy" />
            </div>
            <div className="bliss-gallery-col-2 bliss-gallery-frame">
              <img src={galleryImages[1]} alt="Spread 2" loading="lazy" />
            </div>
            <div className="bliss-gallery-col-3 bliss-gallery-frame">
              <img src={galleryImages[2]} alt="Spread 3" loading="lazy" />
            </div>
            <div className="bliss-gallery-col-4 bliss-gallery-frame">
              <img src={galleryImages[3]} alt="Spread 4" loading="lazy" />
            </div>
          </div>
        </section>
      )}

      {/* Venue Information */}
      {isEnabled("map") && (
        <section id="editorial-venue" className="bliss-section" style={{ textAlign: "center", borderTop: "1px solid var(--bliss-border)" }}>
          <p className="bliss-kicker">The Destination</p>
          <h2 className="bliss-title" style={{ marginBottom: "1rem" }}>{venue.name}</h2>
          <p style={{ color: "var(--bliss-taupe)", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: "1.7" }}>
            {venue.address}
          </p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(venue.name + " " + venue.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--bliss-charcoal)",
              borderBottom: "1px solid var(--bliss-charcoal)",
              paddingBottom: "4px",
              textDecoration: "none",
            }}
          >
            View on Google Maps →
          </a>
        </section>
      )}

      {/* FAQ Section */}
      {isEnabled("faq") && faqList.length > 0 && (
        <section id="editorial-faq" className="bliss-section" style={{ borderTop: "1px solid var(--bliss-border)" }}>
          <div className="bliss-section-heading">
            <p className="bliss-kicker">Q &amp; A</p>
            <h2 className="bliss-title">សំណួរដែលសួរញឹកញាប់</h2>
          </div>
          <div style={{ maxWidth: "650px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqList.map((item) => (
              <details
                key={item.id || item.q}
                style={{
                  borderBottom: "1px solid var(--bliss-border)",
                  paddingBottom: "1rem",
                }}
              >
                <summary style={{ fontWeight: "600", color: "var(--bliss-charcoal)", cursor: "pointer", fontSize: "0.95rem" }}>
                  {item.q}
                </summary>
                <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--bliss-taupe)", lineHeight: "1.7" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ padding: "4rem 2rem", textAlign: "center", borderTop: "1px solid var(--bliss-border)" }}>
        <p style={{ fontFamily: "Cinzel, serif", fontSize: "1.4rem", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
          {groomEn} &amp; {brideEn}
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--bliss-taupe)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2rem" }}>
          Phnom Penh, Cambodia • {dateTextEn}
        </p>
        {!preview && useTemplateLink && (
          <Link
            to={useTemplateLink}
            style={{
              display: "inline-block",
              background: "var(--bliss-charcoal)",
              color: "#ffffff",
              padding: "0.8rem 2rem",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            ប្រើគំរូ Bliss Editorial នេះ
          </Link>
        )}
      </footer>

      {/* Slide-out RSVP Drawer */}
      <div
        className={`bliss-drawer-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`bliss-drawer ${drawerOpen ? "open" : ""}`}>
        <button type="button" className="bliss-drawer-close" onClick={() => setDrawerOpen(false)}>
          <X className="w-6 h-6" />
        </button>
        <h2 className="bliss-drawer-title">RSVP</h2>
        <p style={{ color: "var(--bliss-taupe)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          សូមបញ្ជាក់ការចូលរួមរបស់លោកអ្នក
        </p>

        {rsvpState.submitted ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <CheckCircle2 className="w-14 h-14 text-stone-800 mx-auto mb-4" />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              សូមអរគុណសម្រាប់ការឆ្លើយតប!
            </h3>
            <p style={{ color: "var(--bliss-taupe)", fontSize: "0.9rem" }}>
              យើងខ្ញុំទន្ទឹងរង់ចាំទទួលស្វាគមន៍លោកអ្នកក្នុងថ្ងៃមង្គលការ។
            </p>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ឈ្មោះពេញ (Full Name)
              </label>
              <input
                type="text"
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--bliss-border)", background: "var(--bliss-bg)" }}
                value={rsvpState.name}
                onChange={(e) => setRsvpState({ ...rsvpState, name: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ការចូលរួម (Attendance)
              </label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="bliss-attending"
                    value="yes"
                    checked={rsvpState.attending === "yes"}
                    onChange={(e) => setRsvpState({ ...rsvpState, attending: e.target.value })}
                  />
                  ចូលរួម (Yes)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="bliss-attending"
                    value="no"
                    checked={rsvpState.attending === "no"}
                    onChange={(e) => setRsvpState({ ...rsvpState, attending: e.target.value })}
                  />
                  មិនអាចចូលរួម (No)
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                ពាក្យជូនពរ (Blessing Note)
              </label>
              <textarea
                rows="4"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--bliss-border)", background: "var(--bliss-bg)" }}
                placeholder="សរសេរពាក្យជូនពរ..."
                value={rsvpState.note}
                onChange={(e) => setRsvpState({ ...rsvpState, note: e.target.value })}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                background: "var(--bliss-charcoal)",
                color: "#ffffff",
                padding: "0.9rem",
                border: "none",
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              ផ្ញើការឆ្លើយតប • SUBMIT
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
