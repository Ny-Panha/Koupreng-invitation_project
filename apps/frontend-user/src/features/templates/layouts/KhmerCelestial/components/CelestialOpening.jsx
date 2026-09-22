import { useState } from "react";
import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { KHMER_CELESTIAL_ASSETS } from "../khmerCelestialAssets";

const EASE = [0.22, 1, 0.36, 1];

function mediaSource(value) {
  if (typeof value === "string") return value;
  return value?.url || value?.src || "";
}

function reveal(reducedMotion, delay, overrides = {}) {
  if (reducedMotion) return { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } };
  return {
    initial: { opacity: 0, y: 18, filter: "blur(5px)", ...overrides.initial },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", ...overrides.animate },
    transition: { duration: 0.82, delay, ease: EASE, ...overrides.transition },
  };
}

export default function CelestialOpening({ content, onOpen }) {
  const reducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const openLabel = content.opening?.openButtonText || "បើកធៀបការ";
  const guestName = content.guestName?.trim() || "ភ្ញៀវកិត្តិយស";
  const guestLabel = content.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ";
  const guestNameLength = Array.from(guestName.replace(/\s+/g, "")).length;
  const guestNameClass = [
    "kc-opening__guest-name",
    guestNameLength > 28 ? "kc-opening__guest-name--long" : "",
    guestNameLength > 46 ? "kc-opening__guest-name--very-long" : "",
  ].filter(Boolean).join(" ");
  const names = [content.groom, content.bride].filter(Boolean);
  const logoAlt = names.length
    ? `ស្លាកឈ្មោះ ${names.join(" និង ")}`
    : "ស្លាកឈ្មោះគូស្វាមីភរិយា";
  const videoEnabled = content.design?.openingVideoEnabled !== false;
  const openingVideo = videoEnabled
    ? mediaSource(content.openingVideo) || KHMER_CELESTIAL_ASSETS.openingVideo
    : "";

  return (
    <motion.div
      className="kc-opening"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kc-opening-title"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? { display: "none" } : { opacity: 0, filter: "blur(7px)" }}
      transition={{ duration: reducedMotion ? 0 : 1.12, ease: EASE }}
    >
      <motion.div
        className="kc-opening__film"
        initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 1.6, ease: EASE }}
        aria-hidden="true"
      >
        {!reducedMotion && !videoFailed && openingVideo ? (
          <video
            src={openingVideo}
            poster={KHMER_CELESTIAL_ASSETS.botanicalFrame}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            width="720"
            height="1280"
            onError={() => setVideoFailed(true)}
          />
        ) : null}
      </motion.div>

      <motion.img
        className="kc-opening__botanical"
        src={KHMER_CELESTIAL_ASSETS.botanicalFrame}
        alt=""
        aria-hidden="true"
        width="999"
        height="1575"
        initial={reducedMotion ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0.65, scale: 1.035 }}
        transition={{ duration: reducedMotion ? 0 : 1.7, delay: reducedMotion ? 0 : 0.2, ease: EASE }}
      />
      <div className="kc-opening__shade" aria-hidden="true" />

      <div className="kc-opening__content">
        <motion.p id="kc-opening-title" className="kc-opening__eyebrow" {...reveal(reducedMotion, 0.62)}>
          {content.opening?.heading || content.title || "សិរីសួស្តីអាពាហ៍ពិពាហ៍"}
        </motion.p>

        <motion.div
          className="kc-opening__brand-wrap"
          initial={reducedMotion ? false : { opacity: 0, y: 25, scale: 0.94, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: reducedMotion ? 0 : 1.35, delay: reducedMotion ? 0 : 1, ease: EASE }}
        >
          <img
            className="kc-opening__brand"
            src={KHMER_CELESTIAL_ASSETS.brandMark}
            alt={logoAlt}
            width="768"
            height="512"
          />
          <span className="kc-opening__brand-highlight" aria-hidden="true" />
        </motion.div>

        <motion.div className="kc-opening__date-block" {...reveal(reducedMotion, 2.18)}>
          {content.dateText ? <p className="kc-opening__date">{content.dateText}</p> : null}
          {content.eventTime ? <p className="kc-opening__time">{content.eventTime}</p> : null}
        </motion.div>

        <motion.p
          className="kc-opening__guest-label"
          {...reveal(reducedMotion, 2.42, {
            initial: { y: 5, filter: "blur(3px)" },
            transition: { duration: 0.58 },
          })}
        >
          {guestLabel}
        </motion.p>

        <motion.div
          className="kc-opening__guest-banner"
          initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: reducedMotion ? 0 : 0.96, delay: reducedMotion ? 0 : 2.54, ease: EASE }}
        >
          <img
            className="kc-opening__guest-banner-image"
            src={KHMER_CELESTIAL_ASSETS.guestNameBanner}
            alt=""
            aria-hidden="true"
            width="2172"
            height="724"
            loading="eager"
            decoding="async"
            draggable="false"
          />
          <p className="kc-opening__guest-banner-content">
            <motion.strong
              className={guestNameClass}
              {...reveal(reducedMotion, 2.68, {
                initial: { y: 7, filter: "blur(3px)" },
                transition: { duration: 0.68 },
              })}
            >
              {guestName}
            </motion.strong>
          </p>
        </motion.div>

        <motion.button
          type="button"
          className="kc-button kc-opening__button"
          onClick={onOpen}
          autoFocus
          {...reveal(reducedMotion, 2.96, {
            initial: { y: 12 },
            transition: { duration: 0.72 },
          })}
        >
          <MailOpen aria-hidden="true" />
          <span>{openLabel}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
