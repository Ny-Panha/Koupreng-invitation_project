import { useState } from "react";
import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { KHMER_CELESTIAL_ASSETS } from "../khmerCelestialAssets";

function mediaSource(value) {
  if (typeof value === "string") return value;
  return value?.url || value?.src || "";
}

export default function CelestialOpening({ content, onOpen }) {
  const reducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const openLabel = content.opening?.openButtonText || "បើកសំបុត្រអញ្ជើញ";
  const hasCoupleNames = Boolean(content.groom || content.bride);
  const videoEnabled = content.design?.openingVideoEnabled !== false;
  const openingVideo = videoEnabled
    ? mediaSource(content.openingVideo) || KHMER_CELESTIAL_ASSETS.openingVideo
    : "";
  const openingPoster = videoEnabled
    ? mediaSource(content.openingPoster) || KHMER_CELESTIAL_ASSETS.openingPoster
    : content.coverImage || KHMER_CELESTIAL_ASSETS.openingPoster;

  return (
    <motion.div
      className="kc-opening"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kc-opening-title"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? { display: "none" } : { opacity: 0, scale: 1.025 }}
      transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {!reducedMotion && !videoFailed && openingVideo ? (
        <video
          className="kc-opening__media"
          src={openingVideo}
          poster={openingPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          width="720"
          height="1280"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <img className="kc-opening__media" src={openingPoster} alt="" aria-hidden="true" width="720" height="1280" />
      )}
      <div className="kc-opening__shade" aria-hidden="true" />
      <img
        className="kc-opening__ornament"
        src={KHMER_CELESTIAL_ASSETS.ceremonialCorners}
        alt=""
        aria-hidden="true"
        width="736"
        height="1308"
      />
      <div className="kc-opening__frame" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="kc-opening__content">
        <img
          className="kc-opening__brand"
          src={KHMER_CELESTIAL_ASSETS.brandMark}
          alt="Koupreng"
          width="768"
          height="512"
        />
        <p className="kc-opening__eyebrow">សិរីមង្គលអាពាហ៍ពិពាហ៍</p>
        <p className="kc-opening__english">A signature Khmer invitation</p>
        {!content.hideCoupleNameOnCover && hasCoupleNames ? (
          <h1 id="kc-opening-title">
            <span>{content.groom}</span>
            <em>&amp;</em>
            <span>{content.bride}</span>
          </h1>
        ) : (
          <h1 id="kc-opening-title" className="kc-opening__title-only">{content.title}</h1>
        )}
        {content.dateText ? <p className="kc-opening__date">{content.dateText}</p> : null}
        <p className="kc-opening__guest">
          {content.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ"}<br />
          <strong>{content.guestName}</strong>
        </p>
        <button
          type="button"
          className="kc-button kc-button--gold kc-opening__button"
          onClick={onOpen}
          aria-describedby="kc-opening-hint"
          autoFocus
        >
          <MailOpen aria-hidden="true" />
          <span>{openLabel}</span>
        </button>
        <p id="kc-opening-hint" className="kc-opening__hint">Tap to enter · ចុចដើម្បីបើក</p>
      </div>
    </motion.div>
  );
}
