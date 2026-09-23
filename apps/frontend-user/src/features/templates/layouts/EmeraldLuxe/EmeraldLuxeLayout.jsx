import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Music,
  VolumeX,
} from "lucide-react";
import defaultMusicUrl from "@/assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";
import { normalizeTemplateViewModel } from "../../model/templateModel";
import { normalizeDressColors } from "../../experience/config/templateExperienceContent";
import VelvetCurtainOpening from "./components/VelvetCurtainOpening";
import TemplateOpeningGate from "../../experience/components/sections/TemplateOpeningGate";
import Card3DFlip from "./components/Card3DFlip";
import GalleryGrid from "../../shared/Gallery/GalleryGrid";
import RsvpContainer from "../../shared/RSVP/RsvpContainer";
import "../../experience/template-experience.css";
import "./emerald-luxe.css";

export default function EmeraldLuxeLayout({
  tpl: tplProp,
  content: contentProp,
  preview = false,
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
  const musicUrl = tpl.music || defaultMusicUrl;

  // Gate curtain state - open by default in preview so host can view the card
  const [opened, setOpened] = useState(preview ? true : false);
  const [isFlipped, setIsFlipped] = useState(false);

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

  const handleOpenCurtain = () => {
    setOpened(true);
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const gateStyle = tpl.gateStyle || tpl.openingStyle || tpl.design?.openingStyle || "curtain";
  const isCustomGate = Boolean(gateStyle && gateStyle !== "curtain" && gateStyle !== "CURTAIN");

  // Sync postMessage with Admin Studio
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === "TOGGLE_GATE") {
        const shouldOpen = Boolean(e.data.open ?? e.data.isOpen);
        setOpened(shouldOpen);
      }
      if (e.data?.type === "LIVE_PREVIEW_SYNC" && e.data.data) {
        setLiveData(e.data.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const isEnabled = (key) => tpl.enabledSections?.[key] !== false;
  const rawColors = Array.isArray(tpl.dressCode?.colors)
    ? tpl.dressCode.colors
    : (Array.isArray(tpl.dressCode) ? tpl.dressCode : (tpl.dressColors || []));
  const dressColors = rawColors.length > 0 ? normalizeDressColors(rawColors) : [
    { hex: "#0F4C3A", name: "បៃតងចាស់" },
    { hex: "#2D8A6E", name: "បៃតងមរកត" },
    { hex: "#D4AF37", name: "មាស" },
    { hex: "#FFFDF7", name: "ស" },
  ];
  const faqList = Array.isArray(tpl.faq) && tpl.faq.length > 0 ? tpl.faq : [
    { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់។" },
    { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗទាំងអស់ក្នុងពិធីមង្គលការ។" },
    { id: "f3", q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?", a: "កម្មវិធីទទួលភ្ញៀវចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។" },
  ];

  return (
    <div
      className={`el-container${tpl.cardMotion ? ` tx-motion--${String(tpl.cardMotion).toLowerCase().replace(/_/g, "-")}` : ""}`}
      style={{
        "--el-bg-deep": tpl.backgroundColor || "#061510",
        "--el-gold-primary": tpl.secondaryColor || "#d4af37",
        fontFamily: tpl.fontKhmer ? `${tpl.fontKhmer}, "Kantumruy Pro", system-ui, sans-serif` : undefined,
      }}
    >
      <audio ref={audioRef} src={musicUrl} loop preload="none" />

      {/* Floating Audio Button */}
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
          background: "#061510",
          color: "var(--el-gold-primary)",
          border: "1px solid var(--el-gold-primary)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label="Toggle Audio"
      >
        {isPlaying ? <Music className="w-5 h-5 animate-spin" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Dynamic Animated Gate Overlay */}
      {isCustomGate && !opened && (
        <div
          className="tx-root tx-root--preview"
          style={{
            position: preview ? "absolute" : "fixed",
            inset: 0,
            zIndex: 300,
            overflow: "hidden",
            backgroundColor: "#061510",
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
              dateText: tpl.dateText,
              design: {
                ...tpl.design,
                openingStyle: gateStyle,
                primaryColor: tpl.primaryColor || "#0F4C3A",
                secondaryColor: tpl.secondaryColor || "#D4AF37",
              },
            }}
            lockDocumentScroll={false}
            onOpen={handleOpenCurtain}
            state={opened ? "opened" : "closed"}
          />
        </div>
      )}

      {/* Velvet Theatre Curtain Opening Gate (when curtain is selected) */}
      {!isCustomGate && (
        <VelvetCurtainOpening
          opened={opened}
          onOpenCurtain={handleOpenCurtain}
          groom={groom}
          bride={bride}
        />
      )}

      {/* Top Bar for Back / Replay */}
      <div style={{ maxWidth: "600px", margin: "1rem auto 0", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {showBack && (
          <Link to={backTo} style={{ color: "var(--el-gold-primary)", textDecoration: "none", fontSize: "0.85rem" }}>
            ← {backLabel}
          </Link>
        )}
        {preview && (
          <button
            type="button"
            onClick={() => setOpened((prev) => !prev)}
            style={{
              background: "rgba(212, 175, 55, 0.15)",
              border: "1px solid var(--el-gold-primary)",
              color: "var(--el-gold-light)",
              padding: "0.35rem 0.85rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "auto",
            }}
          >
            {opened ? "🔒 បិទវាំងននមើល (Close)" : "✨ បើកវាំងននមើល (Open)"}
          </button>
        )}
      </div>

      {/* 3D Flip Invitation Card */}
      <Card3DFlip
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        tpl={tpl}
      />

      {/* Dress Code Section */}
      {isEnabled("dressCode") && dressColors.length > 0 && (
        <section style={{ maxWidth: "560px", margin: "2.5rem auto 0", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ background: "rgba(13, 38, 30, 0.75)", border: "1px solid var(--el-border-gold)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontFamily: "Cinzel, serif", color: "var(--el-gold-light)", fontSize: "1.1rem", margin: "0 0 0.5rem" }}>
              {tpl.dressCode?.name || "DRESS CODE PALETTE"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--el-text-muted)", margin: "0 0 1rem" }}>
              ពណ៌សម្លៀកបំពាក់ភ្ញៀវកិត្តិយស
            </p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {dressColors.map((c, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: typeof c === "string" ? c : (c.hex || c.color || "#0F4C3A"),
                      border: "2px solid rgba(212, 175, 55, 0.6)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--el-gold-light)" }}>{typeof c === "string" ? c : (c.name || c.hex)}</span>
                </div>
              ))}
            </div>
            {tpl.dressCode?.description && (
              <p style={{ fontSize: "0.8rem", color: "var(--el-text-muted)", marginTop: "0.75rem" }}>
                {tpl.dressCode.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Photo Gallery Grid */}
      {isEnabled("gallery") && tpl.gallery && tpl.gallery.length > 0 && (
        <section style={{ maxWidth: "560px", margin: "3rem auto 0", padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "Cinzel, serif", color: "var(--el-gold-light)", fontSize: "1.25rem", margin: 0 }}>
              WEDDING GALLERY
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--el-text-muted)", margin: "4px 0 0" }}>
              កម្រងរូបភាពអនុស្សាវរីយ៍
            </p>
          </div>
          <GalleryGrid images={tpl.gallery} />
        </section>
      )}

      {/* FAQ Section */}
      {isEnabled("faq") && faqList.length > 0 && (
        <section style={{ maxWidth: "560px", margin: "3rem auto 0", padding: "0 1.5rem" }}>
          <div style={{ background: "rgba(13, 38, 30, 0.75)", border: "1px solid var(--el-border-gold)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontFamily: "Cinzel, serif", color: "var(--el-gold-light)", fontSize: "1.1rem", margin: "0 0 0.5rem", textAlign: "center" }}>
              FREQUENTLY ASKED QUESTIONS
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--el-text-muted)", margin: "0 0 1rem", textAlign: "center" }}>
              សំណួរដែលសួរញឹកញាប់
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {faqList.map((item) => (
                <details
                  key={item.id || item.q}
                  style={{
                    background: "rgba(6, 21, 16, 0.6)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "var(--el-gold-light)",
                    fontSize: "0.85rem",
                  }}
                >
                  <summary style={{ cursor: "pointer", fontWeight: "600" }}>{item.q}</summary>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--el-text-muted)", borderTop: "1px solid rgba(212,175,55,0.15)", paddingTop: "0.5rem" }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {isEnabled("rsvp") && (
        <div style={{ maxWidth: "560px", margin: "3rem auto 5rem", padding: "0 1.5rem" }}>
          <div style={{ background: "rgba(13, 38, 30, 0.75)", border: "1px solid var(--el-border-gold)", borderRadius: "16px", padding: "2rem", backdropFilter: "blur(10px)" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-amber-300" />
              <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "1.25rem", color: "var(--el-gold-light)", margin: 0 }}>
                RSVP CONFIRMATION
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--el-text-muted)", margin: "4px 0 0" }}>
                សូមបញ្ជាក់ការចូលរួមពិធីមង្គលការ
              </p>
            </div>
            <RsvpContainer children={children} />
          </div>
        </div>
      )}

      {/* Bottom Sticky Action */}
      {!preview && useTemplateLink && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#061510", borderTop: "1px solid var(--el-border-gold)", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 80 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--el-gold-primary)", fontFamily: "Cinzel, serif" }}>
            Emerald Luxe • 3D Double Card
          </span>
          <Link
            to={useTemplateLink}
            style={{ background: "linear-gradient(135deg, var(--el-gold-primary), #997320)", color: "#061510", padding: "0.5rem 1.25rem", borderRadius: "9999px", textDecoration: "none", fontWeight: "700", fontSize: "0.85rem" }}
          >
            ប្រើគំរូនេះ
          </Link>
        </div>
      )}
    </div>
  );
}
