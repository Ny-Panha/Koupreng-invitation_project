import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Music,
  VolumeX,
  MapPin,
  QrCode,
  Calendar,
  ExternalLink,
} from "lucide-react";
import defaultMusicUrl from "@/assets/music/ថ្ងៃដែលរង់ចាំ.mp3";
import { normalizeTemplateViewModel } from "../../services/templateService";
import PalaceGateOpening from "./components/PalaceGateOpening";
import TemplateOpeningGate from "../../experience/components/sections/TemplateOpeningGate";
import ParentsHonorSection from "./components/ParentsHonorSection";
import KhmerCeremonySequence from "./components/KhmerCeremonySequence";
import GalleryGrid from "../../shared/Gallery/GalleryGrid";
import RsvpContainer from "../../shared/RSVP/RsvpContainer";
import "../../experience/template-experience.css";
import "./royal-khmer.css";

export default function RoyalKhmerLayout({
  tpl: tplProp,
  content: contentProp,
  preview = false,
  previewStartClosed = false,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  useTemplateLink,
  children,
}) {
  const [liveData, setLiveData] = useState(null);
  const tpl = useMemo(() => {
    return normalizeTemplateViewModel(tplProp, { ...contentProp, ...liveData });
  }, [tplProp, contentProp, liveData]);

  const groom = tpl.groom || "វណ្ណដា";
  const bride = tpl.bride || "ស្រីពេជ្រ";
  const dateText = tpl.dateText || "ថ្ងៃពុធ ទី២៨ ខែមករា ឆ្នាំ២០២៦";
  const venue = {
    name: tpl.venueName || "សណ្ឋាគារ សុខា ភ្នំពេញ",
    hall: tpl.venueHall || "បន្ទប់សាលរាជធានី (Grand Ballroom)",
    address: tpl.venueAddress || "ផ្លូវកែវចិន្តា, សង្កាត់ជ្រោយចង្វារ, ខណ្ឌជ្រោយចង្វារ, រាជធានីភ្នំពេញ",
  };
  const musicUrl = tpl.music || defaultMusicUrl;

  // Gate state - default to opened in preview
  const [gateState, setGateState] = useState(preview && !previewStartClosed ? "opened" : "closed");
  const opened = gateState === "opened";

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

  const gateStyle = tpl.gateStyle || tpl.openingStyle || tpl.design?.openingStyle || "khmer-royal";
  const isCustomGate = Boolean(gateStyle && gateStyle !== "khmer-royal" && gateStyle !== "KHMER_ROYAL");

  const handleOpenGate = () => {
    setGateState("opening");
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
    let duration = 500;
    if (gateStyle === "curtain" || gateStyle === "CURTAIN") duration = 1300;
    else if (gateStyle === "envelope-3d" || gateStyle === "WAX_ENVELOPE") duration = 1600;
    else if (gateStyle === "magical-gate") duration = 1300;
    else if (gateStyle === "ribbon-untie" || gateStyle === "RIBBON_UNTIE") duration = 400;
    else if (gateStyle === "cinematic-video" || gateStyle === "CINEMATIC_VIDEO") duration = 400;

    setTimeout(() => {
      setGateState("opened");
    }, duration);
  };

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === "TOGGLE_GATE") {
        const shouldOpen = Boolean(e.data.open ?? e.data.isOpen);
        setGateState(shouldOpen ? "opened" : "closed");
      }
      if (e.data?.type === "LIVE_PREVIEW_SYNC" && e.data.data) {
        setLiveData(e.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const isEnabled = (key) => tpl.enabledSections?.[key] !== false;
  const dressColors = Array.isArray(tpl.dressCode)
    ? tpl.dressCode
    : (Array.isArray(tpl.dressCode?.colors) ? tpl.dressCode.colors : (tpl.dressColors || [
        { hex: "#8B1E2D", name: "ក្រហមទុំ" },
        { hex: "#D4AF37", name: "មាស" },
        { hex: "#FFFDF7", name: "ស" },
        { hex: "#4A151C", name: "ក្រហមចាស់" },
      ]));
  const faqList = Array.isArray(tpl.faq) && tpl.faq.length > 0 ? tpl.faq : [
    { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់។" },
    { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗទាំងអស់ក្នុងពិធីមង្គលការ។" },
    { id: "f3", q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?", a: "កម្មវិធីទទួលភ្ញៀវចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។" },
  ];

  return (
    <div
      className={`rkh-container${tpl.cardMotion ? ` tx-motion--${String(tpl.cardMotion).toLowerCase().replace(/_/g, "-")}` : ""}`}
      style={{
        "--rkh-crimson": tpl.primaryColor || "#731320",
        "--rkh-crimson-dark": tpl.primaryColor ? `${tpl.primaryColor}ee` : "#4a0a14",
        "--rkh-gold": tpl.secondaryColor || "#c49a45",
        "--rkh-gold-light": tpl.secondaryColor ? `${tpl.secondaryColor}dd` : "#f3d790",
        fontFamily: tpl.fontKhmer ? `${tpl.fontKhmer}, "Kantumruy Pro", system-ui, sans-serif` : undefined,
      }}
    >
      <audio ref={audioRef} src={musicUrl} loop preload="none" />

      {/* Floating Audio Control */}
      <button
        type="button"
        onClick={toggleMusic}
        style={{
          position: preview ? "absolute" : "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 90,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--rkh-crimson)",
          color: "var(--rkh-gold-light)",
          border: "2px solid var(--rkh-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
        aria-label="Toggle Music"
      >
        {isPlaying ? <Music className="w-5 h-5 animate-spin" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Dynamic Animated Gate Overlay (The Digital Yes 3D Styles) */}
      {isCustomGate && gateState !== "opened" && (
        <div
          className="tx-root tx-root--preview"
          style={{
            position: preview ? "absolute" : "fixed",
            inset: 0,
            zIndex: 300,
            overflow: "hidden",
            backgroundColor: "#120306",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TemplateOpeningGate
            content={{
              ...tpl,
              groom,
              bride,
              dateText,
              design: {
                ...tpl.design,
                openingStyle: gateStyle,
                primaryColor: tpl.primaryColor || "#8B1E2D",
                secondaryColor: tpl.secondaryColor || "#D4AF37",
              },
            }}
            lockDocumentScroll={false}
            onOpen={handleOpenGate}
            state={gateState}
          />
        </div>
      )}

      {/* Classic Palace Gate Overlay (when khmer-royal is selected) */}
      {!isCustomGate && (
        <PalaceGateOpening
          opened={opened}
          onOpenGate={handleOpenGate}
          groom={groom}
          bride={bride}
        />
      )}

      {/* Top Breadcrumb & Replay Bar */}
      <div style={{ maxWidth: "1000px", margin: "1rem auto 0", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {showBack && (
          <Link to={backTo} style={{ color: "var(--rkh-crimson)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "600" }}>
            ← {backLabel}
          </Link>
        )}
        {preview && (
          <button
            type="button"
            onClick={() => setGateState(opened ? "closed" : "opened")}
            style={{
              background: "var(--rkh-gold-soft)",
              border: "1px solid var(--rkh-gold)",
              color: "var(--rkh-crimson)",
              padding: "0.3rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: "600",
              marginLeft: "auto",
            }}
          >
            {opened ? "🔒 បិទទ្វារវាំងមើល (Close)" : "✨ បើកទ្វារវាំងមើល (Open)"}
          </button>
        )}
      </div>

      {/* Royal Hero Section */}
      <section className="rkh-hero">
        <div className="rkh-kbach-header">
          <p style={{ letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.85rem", color: "var(--rkh-gold)", marginBottom: "0.5rem", fontWeight: "700" }}>
            សិរីសួស្តី អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
          </p>
          <h1 className="rkh-title">
            សិរីមង្គលអាពាហ៍ពិពាហ៍
          </h1>
          <p style={{ color: "#78350f", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            ROYAL KHMER WEDDING INVITATION
          </p>
        </div>

        {/* Parents Honor Section */}
        <ParentsHonorSection
          groomParents={tpl.groomParents}
          brideParents={tpl.brideParents}
        />

        {/* Couple Names */}
        <div style={{ margin: "2rem 0" }}>
          <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "0.5rem" }}>
            មានកិត្តិយសសូមគោរពអញ្ជើញលោកអ្នកចូលរួមក្នុងពិធីអាពាហ៍ពិពាហ៍កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--rkh-gold)", fontWeight: "600" }}>កូនប្រុសនាម</p>
              <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.8rem", color: "var(--rkh-crimson)" }}>{groom}</h2>
            </div>
            <span style={{ fontSize: "2rem", color: "var(--rkh-gold)" }}>♥</span>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--rkh-gold)", fontWeight: "600" }}>កូនស្រីនាម</p>
              <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.8rem", color: "var(--rkh-crimson)" }}>{bride}</h2>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--rkh-gold-soft)", border: "1px solid var(--rkh-gold)", padding: "0.5rem 1.5rem", borderRadius: "9999px" }}>
            <Calendar className="w-5 h-5 text-amber-700" />
            <span style={{ fontWeight: "700", color: "var(--rkh-crimson)" }}>{dateText}</span>
          </div>
        </div>
      </section>

      {/* 8-Step Traditional Program Sequence */}
      {isEnabled("schedule") && <KhmerCeremonySequence schedule={tpl.schedule} />}

      {/* Venue Information */}
      {isEnabled("map") && (
        <section style={{ background: "var(--rkh-paper)", padding: "3.5rem 1.5rem", borderTop: "2px dashed var(--rkh-gold)", borderBottom: "2px dashed var(--rkh-gold)" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "0.8rem", borderRadius: "50%", background: "var(--rkh-gold-soft)", color: "var(--rkh-crimson)", marginBottom: "1rem" }}>
              <MapPin className="w-8 h-8" />
            </div>
            <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.6rem", color: "var(--rkh-crimson)", marginBottom: "0.5rem" }}>
              {venue.name}
            </h2>
            <p style={{ color: "var(--rkh-gold)", fontWeight: "700", fontSize: "1rem", marginBottom: "0.5rem" }}>
              {venue.hall}
            </p>
            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
              {venue.address}
            </p>
            {tpl.googleMapsUrl && (
              <a
                href={tpl.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--rkh-crimson)",
                  color: "#fff",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 12px rgba(139,30,45,0.25)",
                }}
              >
                <span>មើលទីតាំងលើ Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {tpl.sketchMapImage && (
              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--rkh-crimson)", fontWeight: "600", marginBottom: "0.5rem" }}>
                  🗺️ គំនូសប្លង់ទីតាំង / Sketch Map
                </p>
                <img
                  src={tpl.sketchMapImage}
                  alt="Sketch Map"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "220px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    border: "1px solid rgba(139,30,45,0.2)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Dress Code Section */}
      {isEnabled("dressCode") && dressColors.length > 0 && (
        <section style={{ padding: "3.5rem 1.5rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.5rem", color: "var(--rkh-crimson)" }}>
              {tpl.dressCode?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--rkh-gold)", fontWeight: "700", marginTop: "4px" }}>
              DRESS CODE PALETTE
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
            {dressColors.map((color, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: color.hex,
                    border: "2px solid var(--rkh-gold)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                  }}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--rkh-crimson)", fontWeight: "600" }}>
                  {color.name}
                </span>
              </div>
            ))}
          </div>
          {tpl.dressCode?.description && (
            <p style={{ color: "#475569", fontSize: "0.9rem", maxWidth: "500px", margin: "0 auto" }}>
              {tpl.dressCode.description}
            </p>
          )}
        </section>
      )}

      {/* Gallery Section */}
      {isEnabled("gallery") && tpl.gallery && tpl.gallery.length > 0 && (
        <section style={{ padding: "3.5rem 1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.6rem", color: "var(--rkh-crimson)" }}>
              កម្រងរូបភាពអនុស្សាវរីយ៍
            </h2>
          </div>
          <GalleryGrid images={tpl.gallery} />
        </section>
      )}

      {/* FAQ Accordion Section */}
      {isEnabled("faq") && faqList.length > 0 && (
        <section style={{ padding: "3.5rem 1.5rem", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.5rem", color: "var(--rkh-crimson)" }}>
              សំណួរដែលសួរញឹកញាប់ (FAQ)
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
              ព័ត៌មានលម្អិតបន្ថែមសម្រាប់ភ្ញៀវកិត្តិយស
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {faqList.map((item) => (
              <details
                key={item.id || item.q}
                style={{
                  background: "var(--rkh-paper)",
                  border: "1px solid var(--rkh-gold)",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                }}
              >
                <summary style={{ fontWeight: "700", color: "var(--rkh-crimson)", cursor: "pointer", fontSize: "0.95rem" }}>
                  {item.q}
                </summary>
                <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#475569", lineHeight: "1.6", borderTop: "1px solid rgba(212,175,55,0.3)", paddingTop: "0.5rem" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {isEnabled("rsvp") && (
        <section style={{ padding: "3rem 1.5rem", maxWidth: "650px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Moul, serif", fontSize: "1.5rem", color: "var(--rkh-crimson)" }}>
              សូមបញ្ជាក់ការចូលរួម (RSVP)
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "4px" }}>
              សូមផ្តល់ដំណឹងជូនម្ចាស់កម្មវិធីដើម្បីងាយស្រួលរៀបចំទទួលបដិសណ្ឋារកិច្ច
            </p>
          </div>
          <div style={{ background: "var(--rkh-paper)", padding: "2rem", borderRadius: "16px", border: "1px solid var(--rkh-gold)" }}>
            <RsvpContainer children={children} />
          </div>
        </section>
      )}

      {/* ABA KHQR Gift Section */}
      {isEnabled("gift") && (
        <section style={{ padding: "3rem 1.5rem 6rem", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "var(--rkh-paper)", border: "2px solid var(--rkh-gold)", borderRadius: "16px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            <QrCode className="w-10 h-10 mx-auto text-amber-700 mb-2" />
            <h3 style={{ fontFamily: "Moul, serif", fontSize: "1.2rem", color: "var(--rkh-crimson)", marginBottom: "0.5rem" }}>
              ចងដៃតាមប្រព័ន្ធធនាគារ KHQR
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះទឹកចិត្ត និងពរជ័យ
            </p>

            <div style={{ width: "160px", height: "160px", margin: "0 auto 1.5rem", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", overflow: "hidden" }}>
              {tpl.bankAccount?.qrUrl ? (
                <img src={tpl.bankAccount.qrUrl} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "4px" }} />
              ) : (
                <div style={{ textAlign: "center", color: "#0f172a" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "#dc2626" }}>KHQR</p>
                  <p style={{ fontSize: "0.75rem", fontWeight: "600", marginTop: "4px" }}>{tpl.bankAccount?.accountName}</p>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>{tpl.bankAccount?.accountNumber}</p>
                </div>
              )}
            </div>

            <div style={{ background: "var(--rkh-gold-soft)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--rkh-crimson)", fontWeight: "600" }}>
              <span>{tpl.bankAccount?.bank} : </span>
              <span style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>{tpl.bankAccount?.accountNumber}</span>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Floating Bar */}
      {!preview && useTemplateLink && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.95)", borderTop: "1px solid var(--rkh-gold)", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 80, backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--rkh-crimson)", fontWeight: "700", fontFamily: "Moul, serif" }}>
            រាជហង្សខ្មែរ • Royal Khmer Heritage
          </span>
          <Link
            to={useTemplateLink}
            style={{ background: "var(--rkh-crimson)", color: "#fff", padding: "0.6rem 1.5rem", borderRadius: "6px", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}
          >
            ប្រើគំរូនេះ
          </Link>
        </div>
      )}
    </div>
  );
}
