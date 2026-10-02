import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { KHMER_CELESTIAL_ASSETS } from "../khmerCelestialAssets";

const CELESTIAL_EASE = [0.22, 1, 0.36, 1];

const PARTICLES = [
  { id: "p1", top: "14%", left: "5%", size: 3.5, delay: 0, duration: 3.8, y: -18, opacity: 0.7 },
  { id: "p2", top: "72%", left: "10%", size: 4, delay: 1.1, duration: 4.2, y: -22, opacity: 0.8 },
  { id: "p3", top: "12%", left: "88%", size: 3, delay: 0.5, duration: 3.6, y: -16, opacity: 0.65 },
  { id: "p4", top: "70%", left: "92%", size: 4.5, delay: 2.0, duration: 4.0, y: -24, opacity: 0.85 },
  { id: "p5", top: "-4%", left: "48%", size: 3.5, delay: 1.5, duration: 3.5, y: -14, opacity: 0.75 },
  { id: "p6", top: "94%", left: "32%", size: 3, delay: 2.6, duration: 4.3, y: -20, opacity: 0.6 },
];

export default function OpenInvitationCTA({
  label = "Open invitation",
  onOpen,
  autoFocus = true,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [invitationState, setInvitationState] = useState("closed");
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (invitationState !== "closed") return;

    if (reducedMotion) {
      setInvitationState("opened");
      onOpen?.();
      return;
    }

    setInvitationState("opening");
    onOpen?.();
  }, [invitationState, onOpen, reducedMotion]);

  const buttonVariants = {
    idle: {
      scale: [1, 1.025, 1],
      y: [0, -4, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.04,
      y: -2,
      transition: {
        duration: 0.3,
        ease: CELESTIAL_EASE,
      },
    },
    tap: {
      scale: 0.97,
      transition: {
        duration: 0.12,
        ease: "easeOut",
      },
    },
    opening: {
      scale: 1.05,
      opacity: 0,
      filter: "blur(5px)",
      transition: {
        duration: 0.65,
        ease: CELESTIAL_EASE,
      },
    },
  };

  const reducedVariants = {
    idle: { scale: 1, y: 0, opacity: 1 },
    hover: { scale: 1, y: 0, opacity: 1 },
    tap: { scale: 1, y: 0, opacity: 1 },
    opening: { scale: 1, y: 0, opacity: 0 },
  };

  return (
    <motion.div
      className="kc-opening__cta-wrapper"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.92, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.8,
        delay: reducedMotion ? 0 : 0.4,
        ease: CELESTIAL_EASE,
      }}
    >
      <div className="kc-opening__cta-frame">
        {/* Optional ceremonial golden flash behind CTA during opening */}
        {invitationState === "opening" && !reducedMotion && (
          <motion.div
            className="kc-opening__cta-flash"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.35] }}
            transition={{ duration: 0.65, ease: CELESTIAL_EASE }}
            aria-hidden="true"
          />
        )}

        {/* Subtle celestial golden dust particles */}
        {!reducedMotion && invitationState === "closed" && (
          <div className="kc-opening__cta-particles" aria-hidden="true">
            {PARTICLES.map((p) => (
              <motion.span
                key={p.id}
                className="kc-opening__cta-spark"
                style={{
                  top: p.top,
                  left: p.left,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
                animate={{
                  opacity: [0, p.opacity, 0],
                  y: [0, p.y],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        {/* Hero CTA Button */}
        <motion.button
        type="button"
        className="kc-opening__button kc-opening__cta-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={invitationState !== "closed"}
        aria-label={label}
        autoFocus={autoFocus}
        variants={reducedMotion ? reducedVariants : buttonVariants}
        animate={
          reducedMotion
            ? "idle"
            : invitationState === "opening"
            ? "opening"
            : isHovered
            ? "hover"
            : "idle"
        }
        whileTap={reducedMotion ? undefined : "tap"}
      >
        <div className="kc-opening__cta-media">
          <img
            className="kc-opening__cta-image"
            src={KHMER_CELESTIAL_ASSETS.openButton}
            alt=""
            width="2172"
            height="724"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable="false"
          />
        </div>
      </motion.button>
      </div>
    </motion.div>
  );
}

