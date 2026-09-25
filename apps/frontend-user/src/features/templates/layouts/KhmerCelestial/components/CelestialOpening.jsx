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

export default function CelestialOpening({ content, onOpen, preview = false }) {
  const reducedMotion = usePrefersReducedMotion();
  const instant = Boolean(reducedMotion || preview);
  const [videoFailed, setVideoFailed] = useState(false);
  const openLabel = content.opening?.openButtonText || "Open invitation";
  const guestName = content.guestName?.trim() || "លោកអ្នក និងក្រុមគ្រួសារ";
  const guestLabel = content.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ:";
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
  const videoEnabled = content.design?.openingVideoEnabled !== false && currentGateStyle !== "botanical-cover";
  const openingVideo = videoEnabled
    ? mediaSource(content.openingVideo)
      || mediaSource(content.openingVideoUrl)
      || mediaSource(content.videoUrl)
      || mediaSource(content.design?.openingVideoUrl)
      || KHMER_CELESTIAL_ASSETS.openingVideo
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
            <h2 id="kc-opening-title" className="kc-opening__couple-names">
              <span className="kc-opening__groom">{content.groom?.trim() || "វណ្ណដា"}</span>
              <span className="kc-opening__amp"> &amp; </span>
              <span className="kc-opening__bride">{content.bride?.trim() || "ស្រីពេជ្រ"}</span>
            </h2>
          </motion.div>
        )}

        <motion.div className="kc-opening__date-block" {...reveal(instant, 0.18)}>
          <p className="kc-opening__date">
            {content.dateTextEn || content.dateText || "Sunday, December 20, 2026"}
          </p>
          <p className="kc-opening__time">
            {content.receptionTime || content.eventTime || "១៧:០០"}
          </p>
          {content.subtitle && content.subtitle !== "សូមគោរពអញ្ជើញ" && content.subtitle !== guestLabel && content.subtitle !== "ជូនចំពោះ" && content.subtitle !== "ជូនចំពោះ:" ? (
            <p className="kc-opening__subtitle">{content.subtitle}</p>
          ) : null}
        </motion.div>

        <motion.p
          className="kc-opening__guest-label"
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
              className={guestNameClass}
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
