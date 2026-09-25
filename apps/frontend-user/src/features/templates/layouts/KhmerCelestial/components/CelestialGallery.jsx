import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { CelestialHeading, CelestialImage, CelestialReveal } from "./CelestialSection";

function imageSource(item) {
  return typeof item === "string" ? item : item?.src || item?.url || item?.preview || "";
}

const SAMPLE_CELESTIAL_GALLERY = [
  "/facebook/all/06-card/06-01.jpg",
  "/facebook/all/06-card/06-02.jpg",
  "/facebook/all/06-card/06-03.jpg",
  "/facebook/all/06-card/06-04.jpg",
  "/facebook/all/06-card/06-05.jpg",
];

export default function CelestialGallery({ images, languageMode, preview = false }) {
  const userImages = (Array.isArray(images) ? images : []).map(imageSource).filter(Boolean);
  const gallery = userImages.length > 0 ? userImages : (preview ? SAMPLE_CELESTIAL_GALLERY : []);
  const [activeIndex, setActiveIndex] = useState(-1);
  const reducedMotion = usePrefersReducedMotion();
  const triggerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (activeIndex < 0) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(-1);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % gallery.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length);
      if (event.key === "Tab" && dialogRef.current) {
        const controls = [...dialogRef.current.querySelectorAll("button")];
        const firstControl = controls[0];
        const lastControl = controls.at(-1);
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl?.focus();
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, gallery.length]);

  useEffect(() => {
    if (activeIndex >= 0) {
      const previousOverflow = document.body.style.overflow;
      const invitationRoot = triggerRef.current?.closest(".kc-root");
      const rootWasInert = invitationRoot?.hasAttribute("inert");
      const previousAriaHidden = invitationRoot?.getAttribute("aria-hidden");
      document.body.style.overflow = "hidden";
      invitationRoot?.setAttribute("inert", "");
      invitationRoot?.setAttribute("aria-hidden", "true");
      closeButtonRef.current?.focus();
      return () => {
        document.body.style.overflow = previousOverflow;
        if (!rootWasInert) invitationRoot?.removeAttribute("inert");
        if (previousAriaHidden === null) invitationRoot?.removeAttribute("aria-hidden");
        else if (previousAriaHidden !== undefined) invitationRoot?.setAttribute("aria-hidden", previousAriaHidden);
      };
    }
    if (triggerRef.current) triggerRef.current.focus();
    return undefined;
  }, [activeIndex]);

  if (!gallery.length) return null;

  const openImage = (index, event) => {
    triggerRef.current = event.currentTarget;
    setActiveIndex(index);
  };

  return (
    <section className="kc-section kc-gallery" data-tx-section="gallery" aria-labelledby="kc-gallery-title">
      <div className="kc-shell kc-gallery__intro">
        <CelestialHeading
          id="kc-gallery-title"
          khmer="កម្រងអនុស្សាវរីយ៍"
          english="A portrait of our story"
          eyebrow="THE GALLERY"
          align="left"
          languageMode={languageMode}
        />
      </div>
      <div className="kc-gallery__canvas">
        <div className="kc-gallery__grid">
          {gallery.slice(0, 9).map((src, index) => (
            <CelestialReveal
              as="button"
              type="button"
              className={`kc-gallery__item kc-gallery__item--${index % 6}`}
              key={`${src}-${index}`}
              delay={(index % 3) * 0.06}
              onClick={(event) => openImage(index, event)}
              aria-label={`មើលរូបភាពទី ${index + 1}`}
            >
              <CelestialImage src={src} alt={`អនុស្សាវរីយ៍អាពាហ៍ពិពាហ៍ ទី ${index + 1}`} />
              <span aria-hidden="true">0{index + 1}</span>
            </CelestialReveal>
          ))}
        </div>
      </div>

      {createPortal(<AnimatePresence>
        {activeIndex >= 0 ? (
          <motion.div
            ref={dialogRef}
            className="kc-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="រូបភាព"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { display: "none" } : { opacity: 0 }}
            onClick={() => setActiveIndex(-1)}
          >
            <button ref={closeButtonRef} type="button" className="kc-lightbox__close" onClick={() => setActiveIndex(-1)} aria-label="បិទ">
              <X aria-hidden="true" />
            </button>
            {gallery.length > 1 ? (
              <button
                type="button"
                className="kc-lightbox__nav kc-lightbox__nav--previous"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length);
                }}
                aria-label="មើលរូបភាពមុន"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
            ) : null}
            <motion.img
              src={gallery[activeIndex]}
              alt={`អនុស្សាវរីយ៍អាពាហ៍ពិពាហ៍ ទី ${activeIndex + 1}`}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? { display: "none" } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
              onClick={(event) => event.stopPropagation()}
            />
            {gallery.length > 1 ? (
              <button
                type="button"
                className="kc-lightbox__nav kc-lightbox__nav--next"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((index) => (index + 1) % gallery.length);
                }}
                aria-label="មើលរូបភាពបន្ទាប់"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            ) : null}
            <p aria-live="polite">{activeIndex + 1} / {gallery.length}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>, document.body)}
    </section>
  );
}
