import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Smartphone, BookOpen, RotateCcw, ArrowUpRight, Music } from "lucide-react";
import { SILK_HERITAGE_TEMPLATE } from "../data/templatesData";
import { templateUsePath } from "../model/templateIdentity";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import "./PublicTemplateDevicePreview.css";

export default function PublicTemplateDevicePreview({
  template = SILK_HERITAGE_TEMPLATE,
  lang = "km",
  enableTilt = true,
  initialMode = "phone",
  showModeSwitch = true,
  showActionFooter = true,
}) {
  const [mode, setMode] = useState(initialMode); // "phone" | "flat"
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });
  const containerRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const prefersReducedMotion = usePrefersReducedMotion();

  const copy = useCallback((km, en) => (lang === "en" ? en : km), [lang]);

  // Handle 3D perspective tilt bounded to 5-6 degrees
  const handlePointerMove = (e) => {
    if (!enableTilt || prefersReducedMotion || mode === "flat") return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    // Bounded between -5.5 and +5.5 deg
    const maxTilt = 5.5;
    setTilt({
      x: -normY * maxTilt,
      y: normX * maxTilt,
      isHovered: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  const resetView = () => {
    setTilt({ x: 0, y: 0, isHovered: false });
  };

  const groomName = copy(template.groom || "សុខា", template.groomEn || "Sokha");
  const brideName = copy(template.bride || "ចរិយា", template.brideEn || "Chariya");
  const ceremonyDate = copy(template.dateText || "ថ្ងៃសៅរ៍ ទី១៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦", template.dateTextEn || "Saturday, November 18, 2026");
  const venue = copy(template.venueName || "សណ្ឋាគារ ហ៊ីម៉ាវ៉ារី ភ្នំពេញ", template.venueNameEn || "Himawari Hotel, Phnom Penh");
  const demoPath = `/templates/${encodeURIComponent(template.id || "silk-heritage")}`;
  const usePath = templateUsePath(template.id || "silk-heritage", isAuthenticated);

  const transformStyle = prefersReducedMotion || !enableTilt || mode === "flat"
    ? undefined
    : {
        transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
        transition: tilt.isHovered ? "transform 0.12s ease-out" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      };

  return (
    <div
      ref={containerRef}
      className="kp-stage-wrapper"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Viewport mode switcher */}
      {showModeSwitch && (
        <div className="kp-stage-switcher" role="group" aria-label={copy("ជ្រើសរើសរបៀបមើល", "Select view mode")}>
          <button
            type="button"
            className="kp-stage-switch-btn"
            aria-pressed={mode === "phone"}
            onClick={() => setMode("phone")}
          >
            <Smartphone size={15} aria-hidden="true" />
            <span>{copy("ទូរស័ព្ទដៃ", "Phone view")}</span>
          </button>
          <button
            type="button"
            className="kp-stage-switch-btn"
            aria-pressed={mode === "flat"}
            onClick={() => {
              setMode("flat");
              resetView();
            }}
          >
            <BookOpen size={15} aria-hidden="true" />
            <span>{copy("សន្លឹកការលាត", "Flat folio")}</span>
          </button>
        </div>
      )}

      {/* 3D Canvas / Shell */}
      <div
        className="kp-stage-canvas"
        style={transformStyle}
        data-animating={!tilt.isHovered}
        aria-label={copy(`គំរូសន្លឹកការ ${template.name}`, `${template.name} invitation preview`)}
      >
        {mode === "phone" ? (
          <div className="kp-phone-shell">
            {/* Physical hardware details */}
            <div className="kp-phone-btn-power" aria-hidden="true" />
            <div className="kp-phone-btn-volume" aria-hidden="true" />
            <div className="kp-phone-island" aria-hidden="true">
              <div className="kp-phone-camera-lens" />
            </div>

            {/* Screen Glass Area */}
            <div className="kp-phone-screen">
              <div className="kp-phone-content">
                {/* Mini Statusbar / Music Pill */}
                <div className="kp-invitation-statusbar" aria-hidden="true">
                  <span>9:41</span>
                  <div className="kp-music-indicator">
                    <Music size={11} />
                    <span className="kp-music-pulse" />
                    <span>{copy("ភ្លេងការ", "Wedding Melody")}</span>
                  </div>
                </div>

                {/* Hero Invitation Inside Phone */}
                <div className="kp-phone-hero-card">
                  <img
                    className="kp-phone-ornament"
                    src="/templates/silk-heritage/woven-ornament.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="kp-phone-ceremony-label">
                    {copy("សិរីសួស្តីអាពាហ៍ពិពាហ៍", "Together with our families")}
                  </span>

                  <h2 className="kp-phone-couple-names">
                    <span>{groomName}</span>
                    <span className="kp-phone-ampersand">&</span>
                    <span>{brideName}</span>
                  </h2>

                  <div className="kp-phone-portrait-wrap">
                    <img
                      className="kp-phone-portrait-img"
                      src={template.mainImage || "/templates/silk-heritage/portrait.webp"}
                      alt={copy("រូបថតគូស្វាមីភរិយា", "Couple portrait")}
                      loading="lazy"
                    />
                    <span className="kp-phone-badge">
                      {copy("សូត្រមង្គល · គំរូ", "Silk Heritage")}
                    </span>
                  </div>

                  <p className="kp-phone-date">{ceremonyDate}</p>
                  <p className="kp-phone-venue">{venue}</p>

                  <Link to={demoPath} className="kp-phone-rsvp-cta">
                    <span>{copy("ឆ្លើយតប RSVP គំរូ", "Preview guest RSVP")}</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Flat Folio Mode */
          <div className="kp-flat-folio">
            <img
              className="kp-phone-ornament"
              src="/templates/silk-heritage/woven-ornament.svg"
              alt=""
              aria-hidden="true"
            />
            <span className="kp-phone-ceremony-label">
              {copy("សិរីសួស្តីអាពាហ៍ពិពាហ៍", "Wedding Celebration")}
            </span>
            <h2 className="kp-phone-couple-names" style={{ fontSize: "28px" }}>
              <span>{groomName}</span>
              <span className="kp-phone-ampersand">&</span>
              <span>{brideName}</span>
            </h2>
            <div className="kp-phone-portrait-wrap" style={{ height: "280px" }}>
              <img
                className="kp-phone-portrait-img"
                src={template.mainImage || "/templates/silk-heritage/portrait.webp"}
                alt={copy("រូបថតគូស្វាមីភរិយា", "Couple portrait")}
                loading="lazy"
              />
            </div>
            <p className="kp-phone-date">{ceremonyDate}</p>
            <p className="kp-phone-venue">{venue}</p>
          </div>
        )}
      </div>

      {/* Stage footer with Reset View and links */}
      {showActionFooter && (
        <div className="kp-stage-footer">
          {enableTilt && !prefersReducedMotion && mode === "phone" ? (
            <button
              type="button"
              className="kp-stage-reset-btn"
              onClick={resetView}
              title={copy("កំណត់ទិដ្ឋភាព 3D ឡើងវិញ", "Reset 3D perspective tilt")}
              aria-label={copy("កំណត់ទិដ្ឋភាព 3D ឡើងវិញ", "Reset 3D perspective tilt")}
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>{copy("កំណត់ទិដ្ឋភាពឡើងវិញ", "Reset 3D view")}</span>
            </button>
          ) : <div />}

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to={usePath} className="kp-button" style={{ minHeight: "38px", padding: "6px 16px", fontSize: "13px" }}>
              {copy("ប្រើគំរូនេះ", "Use design")}
            </Link>
            <Link to={demoPath} className="kp-stage-demo-link">
              <span>{copy("មើលគំរូពេញលេញ", "View full demo")}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

