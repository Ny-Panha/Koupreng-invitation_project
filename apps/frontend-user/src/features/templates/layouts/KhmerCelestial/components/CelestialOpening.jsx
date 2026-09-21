import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { CelestialImage } from "./CelestialSection";

export default function CelestialOpening({ content, onOpen }) {
  const reducedMotion = usePrefersReducedMotion();
  const openLabel = content.opening?.openButtonText || "បើកសំបុត្រអញ្ជើញ";

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
      <CelestialImage
        className="kc-opening__photo"
        src={content.coverImage}
        alt=""
        eager
      />
      <div className="kc-opening__shade" aria-hidden="true" />
      <div className="kc-opening__frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <span className="kc-opening__moon" aria-hidden="true" />

      <div className="kc-opening__content">
        <p className="kc-opening__eyebrow">សិរីមង្គលអាពាហ៍ពិពាហ៍</p>
        <p className="kc-opening__english">A KHMER WEDDING INVITATION</p>
        <span className="kc-opening__sigil" aria-hidden="true">◆</span>
        {!content.hideCoupleNameOnCover ? (
          <h1 id="kc-opening-title">
            <span>{content.groom}</span>
            <em>&amp;</em>
            <span>{content.bride}</span>
          </h1>
        ) : (
          <h1 id="kc-opening-title" className="kc-opening__title-only">{content.title}</h1>
        )}
        <p className="kc-opening__date">{content.dateText}</p>
        <p className="kc-opening__guest">
          {content.isPersonalizedGuest ? "សូមគោរពអញ្ជើញ" : "ជូនចំពោះ"}<br />
          <strong>{content.guestName}</strong>
        </p>
        <button type="button" className="kc-button kc-button--gold kc-opening__button" onClick={onOpen}>
          <MailOpen aria-hidden="true" />
          <span>{openLabel}</span>
        </button>
        <p className="kc-opening__hint">Tap to enter · ចុចដើម្បីបើក</p>
      </div>
    </motion.div>
  );
}

