import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { KHMER_CELESTIAL_ASSETS } from "../khmerCelestialAssets";
import CelestialLiveGarden from "./CelestialLiveGarden";
import OpenInvitationCTA from "./OpenInvitationCTA";

const EASE = [0.22, 1, 0.36, 1];

function mediaSource(value) {
  if (typeof value === "string") return value;
  return value?.url || value?.src || "";
}

function reveal(instant, delay, overrides = {}) {
  if (instant) return { initial: false, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: 0, delay: 0 } };
  return {
    initial: { opacity: 0, y: 12, filter: "blur(4px)", ...overrides.initial },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", ...overrides.animate },
    transition: { duration: 0.55, delay, ease: EASE, ...overrides.transition },
  };
}

const ensureGoogleFontLoaded = (fontFamily) => {
  if (!fontFamily || typeof document === "undefined") return;
  const cleanName = fontFamily.trim().replace(/^['"]|['"]$/g, "");
  const fontId = `gfont-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}&display=swap`;
  document.head.appendChild(link);
  if (document.fonts?.load) {
    document.fonts.load(`1em "${cleanName}"`).catch(() => {});
  }
};

export default function CelestialOpening({ content, onOpen, preview = false }) {
  const reducedMotion = usePrefersReducedMotion();
  const instant = Boolean(reducedMotion || preview);
  const [videoFailed, setVideoFailed] = useState(false);
  const openLabel = content.opening?.openButtonText || "Open invitation";
  const guestName = (content.guestName && content.guestName.trim()) || "លោកអ្នក និងក្រុមគ្រួសារ";
  const guestLabel = (content.guestLabel && content.guestLabel.trim()) || (content.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ:");
  const subtitleText = content.subtitle || content.invitationSubtitle;
  const guestNameLength = Array.from(guestName.replace(/\s+/g, "")).length;
  const guestNameClass = [
    "kc-opening__guest-name",
    guestNameLength > 28 ? "kc-opening__guest-name--long" : "",
    guestNameLength > 46 ? "kc-opening__guest-name--very-long" : "",
  ].filter(Boolean).join(" ");
  const groomName = content.groom?.trim() || "វណ្ណដា";
  const brideName = content.bride?.trim() || "ស្រីពេជ្រ";
  const names = [content.groom, content.bride].filter(Boolean);
  const logoAlt = names.length
    ? `ស្លាកឈ្មោះ ${names.join(" និង ")}`
    : "ស្លាកឈ្មោះគូស្វាមីភរិយា";
  const showBrandMark = content.showBrandMark !== false && content.brandMark !== "" && content.brandMark !== "none";
  const effectiveBrandMark = showBrandMark
    ? (content.brandMark || KHMER_CELESTIAL_ASSETS.brandMark)
    : null;
  const showGuestBanner = content.showGuestBanner !== false && content.guestNameBanner !== "" && content.guestNameBanner !== "none";
  const effectiveGuestBanner = showGuestBanner
    ? (content.guestNameBanner || KHMER_CELESTIAL_ASSETS.guestNameBanner)
    : null;
  const showOpenButton = content.showOpenButton !== false && content.openButtonImage !== "" && content.openButtonImage !== "none";
  const effectiveOpenButton = showOpenButton
    ? (content.openButtonImage || KHMER_CELESTIAL_ASSETS.openButton)
    : null;
  const currentGateStyle = content.gateStyle || content.openingStyle || content.design?.openingStyle || "celestial-cover";
  const explicitVideo =
    mediaSource(content.openingVideo) ||
    mediaSource(content.openingVideoUrl) ||
    mediaSource(content.videoUrl) ||
    mediaSource(content.design?.openingVideoUrl) ||
    "";

  const videoOptOut =
    content.showCoverVideo === false ||
    content.enableCoverVideo === false ||
    content.design?.openingVideoEnabled === false ||
    currentGateStyle === "botanical-cover" ||
    (content.videoUrl === "" && content.openingVideoUrl === "");

  const videoEnabled = !videoOptOut && Boolean(
    explicitVideo || (content.design?.openingVideoEnabled === true ? KHMER_CELESTIAL_ASSETS.openingVideo : "")
  );

  const openingVideo = videoEnabled
    ? (explicitVideo || (content.design?.openingVideoEnabled === true ? KHMER_CELESTIAL_ASSETS.openingVideo : ""))
    : "";

  const botanicalFrame = content.backgroundImage
    || content.design?.backgroundImage
    || content.coverBgImage
    || KHMER_CELESTIAL_ASSETS.botanicalFrame;

  const showButterflies = content.showButterflies !== false && content.design?.showButterflies !== false;

  const isDarkFrame = Boolean(
    (typeof botanicalFrame === "string" && (
      botanicalFrame.includes("folio") ||
      botanicalFrame.includes("corners") ||
      botanicalFrame.includes("dark")
    )) ||
    content.coverTheme === "dark" ||
    content.design?.coverTheme === "dark"
  );

  const elementFonts = content.elementFonts || {};
  const globalKhmer = content.fontKhmer || "Siemreap";
  const globalLatin = content.fontLatin || "Cinzel Decorative";

  const fontCouple = elementFonts.couple || globalKhmer;
  const fontDate = elementFonts.date || globalKhmer;
  const fontTime = elementFonts.time || globalKhmer;
  const fontSubtitle = elementFonts.subtitle || globalKhmer;
  const fontGuestLabel = elementFonts.guestLabel || globalKhmer;
  const fontGuestName = elementFonts.guestName || globalKhmer;

  useEffect(() => {
    [
      fontCouple,
      fontDate,
      fontTime,
      fontSubtitle,
      fontGuestLabel,
      fontGuestName,
      globalKhmer,
      globalLatin,
    ].forEach((f) => {
      if (f && typeof f === "string") ensureGoogleFontLoaded(f);
    });
  }, [
    fontCouple,
    fontDate,
    fontTime,
    fontSubtitle,
    fontGuestLabel,
    fontGuestName,
    globalKhmer,
    globalLatin,
  ]);

  const activeSelected = content.selectedFontElement;

  const handleSelectElement = (elementId, e) => {
    if (!preview) return;
    if (e) {
      e.stopPropagation();
    }
    if (typeof window !== "undefined" && window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "SELECT_TARGET_ELEMENT",
          elementId,
        },
        "*"
      );
    }
  };

  useEffect(() => {
    setVideoFailed(false);
  }, [openingVideo]);

  return (
    <motion.div
      className={`kc-opening ${isDarkFrame ? "kc-opening--dark-theme" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kc-opening-title"
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={instant ? { display: "none" } : { opacity: 0, filter: "blur(7px)" }}
      transition={{ duration: instant ? 0 : 0.8, ease: EASE }}
    >
      {!reducedMotion && !videoFailed && openingVideo ? (
        <motion.div
          className="kc-opening__film"
          initial={instant ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: instant ? 0 : 1.2, ease: EASE }}
          aria-hidden="true"
        >
          <video
            key={openingVideo}
            src={openingVideo}
            poster={botanicalFrame}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            width="720"
            height="1280"
            onError={() => setVideoFailed(true)}
          />
        </motion.div>
      ) : null}

      <motion.img
        className="kc-opening__botanical"
        src={botanicalFrame}
        alt=""
        aria-hidden="true"
        width="999"
        height="1575"
        initial={instant ? false : { opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={instant ? undefined : { opacity: 0.65, scale: 1.02 }}
        transition={{ duration: instant ? 0 : 1.2, delay: instant ? 0 : 0.1, ease: EASE }}
      />
      <div className="kc-opening__shade" aria-hidden="true" />
      {showButterflies ? (
        <CelestialLiveGarden className="kc-opening__garden" variant="opening" />
      ) : null}

      <div className="kc-opening__content">
        {effectiveBrandMark ? (
          <motion.div
            className="kc-opening__brand-wrap"
            initial={instant ? false : { opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: instant ? 0 : 0.8, delay: instant ? 0 : 0.05, ease: EASE }}
          >
            <img
              className="kc-opening__brand"
              src={effectiveBrandMark}
              alt={logoAlt}
              width="768"
              height="512"
            />
            <span className="kc-opening__brand-highlight" aria-hidden="true" />
          </motion.div>
        ) : null}

        {!content.hideCoupleNameOnCover && (
          <motion.div className="kc-opening__couple-wrap" {...reveal(instant, 0.12)}>
            <h2
              id="kc-opening-title"
              className={`kc-opening__couple-names ${preview ? "kc-interactive-element" : ""} ${activeSelected === "couple" ? "kc-interactive-element--active" : ""}`}
              onClick={(e) => handleSelectElement("couple", e)}
              title={preview ? "ចុចដើម្បីកែប្រែឈ្មោះគូដណ្ដឹង & ពុម្ពអក្សរ" : undefined}
              style={{
                fontFamily: `"${fontCouple}", "Moul", "Bayon", serif`,
                fontWeight: "normal",
              }}
            >
              <span
                className="kc-opening__groom"
                style={{
                  fontFamily: `"${fontCouple}", "Moul", "Bayon", serif`,
                  fontWeight: "inherit",
                }}
              >
                {content.groom?.trim() || "វណ្ណដា"}
              </span>
              <span className="kc-opening__amp"> &amp; </span>
              <span
                className="kc-opening__bride"
                style={{
                  fontFamily: `"${fontCouple}", "Moul", "Bayon", serif`,
                  fontWeight: "inherit",
                }}
              >
                {content.bride?.trim() || "ស្រីពេជ្រ"}
              </span>
            </h2>
          </motion.div>
        )}

        <motion.div className="kc-opening__date-block" {...reveal(instant, 0.18)}>
          <p
            className={`kc-opening__date ${preview ? "kc-interactive-element" : ""} ${activeSelected === "date" ? "kc-interactive-element--active" : ""}`}
            onClick={(e) => handleSelectElement("date", e)}
            title={preview ? "ចុចដើម្បីកែប្រែកាលបរិច្ឆេទ & ពុម្ពអក្សរ" : undefined}
            style={{
              fontFamily: `"${fontDate}", "Dangrek", "Kantumruy Pro", "Siemreap", sans-serif`,
              fontWeight: "normal",
            }}
          >
            {content.dateText || content.weddingDate || "ថ្ងៃពុធ ២៨ មករា ២០២៦"}
          </p>
          <p
            className={`kc-opening__time ${preview ? "kc-interactive-element" : ""} ${activeSelected === "time" ? "kc-interactive-element--active" : ""}`}
            onClick={(e) => handleSelectElement("time", e)}
            title={preview ? "ចុចដើម្បីកែប្រែពេលវេលា & ពុម្ពអក្សរ" : undefined}
            style={{
              fontFamily: `"${fontTime}", "Bayon", "Moul", serif`,
              fontWeight: "normal",
            }}
          >
            {content.receptionTime || content.eventTime || content.weddingTime || "១៧:០០"}
          </p>
          {subtitleText ? (
            <p
              className={`kc-opening__subtitle ${preview ? "kc-interactive-element" : ""} ${activeSelected === "subtitle" ? "kc-interactive-element--active" : ""}`}
              onClick={(e) => handleSelectElement("subtitle", e)}
              title={preview ? "ចុចដើម្បីកែប្រែពាក្យអញ្ជើញ & ពុម្ពអក្សរ" : undefined}
              style={{
                fontFamily: `"${fontSubtitle}", "Bayon", "Moul", "Siemreap", serif`,
                fontWeight: "normal",
                display: "block",
              }}
            >
              {subtitleText}
            </p>
          ) : null}
        </motion.div>

        <motion.p
          className={`kc-opening__guest-label ${preview ? "kc-interactive-element" : ""} ${activeSelected === "guestLabel" ? "kc-interactive-element--active" : ""}`}
          onClick={(e) => handleSelectElement("guestLabel", e)}
          title={preview ? "ចុចដើម្បីកែប្រែពាក្យស្វាគមន៍ & ពុម្ពអក្សរ" : undefined}
          style={{
            fontFamily: `"${fontGuestLabel}", "Bayon", "Moul", "Siemreap", serif`,
            fontWeight: "normal",
          }}
          {...reveal(instant, 0.22, {
            initial: { y: 4 },
            transition: { duration: 0.4 },
          })}
        >
          {guestLabel}
        </motion.p>

        <motion.div
          className="kc-opening__guest-banner"
          {...reveal(instant, 0.26)}
        >
          {effectiveGuestBanner && (
            <img
              className="kc-opening__guest-banner-image"
              src={effectiveGuestBanner}
              alt=""
              aria-hidden="true"
              width="2172"
              height="724"
              loading="eager"
              decoding="async"
              draggable="false"
            />
          )}
          <p
            className="kc-opening__guest-banner-content"
            style={!effectiveGuestBanner ? { position: "static", transform: "none", margin: "6px 0 10px" } : undefined}
          >
            <motion.strong
              className={`${guestNameClass} ${preview ? "kc-interactive-element" : ""} ${activeSelected === "guestName" ? "kc-interactive-element--active" : ""}`}
              onClick={(e) => handleSelectElement("guestName", e)}
              title={preview ? "ចុចដើម្បីកែប្រែឈ្មោះភ្ញៀវ & ពុម្ពអក្សរ" : undefined}
              style={{
                fontFamily: `"${fontGuestName}", "Bayon", "Moul", serif`,
                fontWeight: "normal",
              }}
              {...reveal(instant, 0.3, {
                initial: { y: 4 },
                transition: { duration: 0.4 },
              })}
            >
              {guestName}
            </motion.strong>
          </p>
        </motion.div>

        <OpenInvitationCTA
          label={openLabel}
          onOpen={onOpen}
          instant={instant}
          image={effectiveOpenButton}
        />
      </div>
    </motion.div>
  );
}
