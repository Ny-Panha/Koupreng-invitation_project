import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1];

export function CelestialReveal({
  as = "div",
  className = "",
  delay = 0,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-64px" });
  const reducedMotion = usePrefersReducedMotion();

  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={reducedMotion || inView
        ? { opacity: 1, y: 0, filter: "blur(0px)" }
        : { opacity: 0, y: 20, filter: "blur(4px)" }}
      transition={{ duration: reducedMotion ? 0 : 0.82, delay: reducedMotion ? 0 : delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function CelestialHeading({
  id,
  khmer,
  english,
  eyebrow,
  align = "center",
  tone = "editorial",
  languageMode = "both",
}) {
  const showKhmer = languageMode !== "en";
  const showEnglish = languageMode !== "km";
  const hasKhmerHeading = showKhmer && Boolean(khmer);

  return (
    <CelestialReveal className={`kc-heading kc-heading--${align} kc-heading--${tone}`}>
      {eyebrow ? <p className="kc-heading__eyebrow">{eyebrow}</p> : null}
      {hasKhmerHeading ? <h2 id={id} className="kc-heading__khmer">{khmer}</h2> : null}
      {showEnglish && english ? (
        hasKhmerHeading
          ? <p className="kc-heading__english">{english}</p>
          : <h2 id={id} className="kc-heading__english">{english}</h2>
      ) : null}
      <span className="kc-heading__ornament" aria-hidden="true"><i />◆<i /></span>
    </CelestialReveal>
  );
}

export function CelestialImage({ src, alt, className = "", eager = false }) {
  if (!src) {
    return <div className={`kc-image kc-image--fallback ${className}`} role="img" aria-label={alt || "Wedding photograph"} />;
  }

  return (
    <img
      className={`kc-image ${className}`}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
