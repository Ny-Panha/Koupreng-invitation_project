import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { CelestialHeading, CelestialImage, CelestialReveal } from "./CelestialSection";

function imageSource(item) {
  return typeof item === "string" ? item : item?.src || item?.url || item?.preview || "";
}

export default function CelestialGallery({ images, languageMode }) {
  const gallery = (Array.isArray(images) ? images : []).map(imageSource).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (activeIndex < 0) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(-1);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % gallery.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, gallery.length]);

  useEffect(() => {
    if (activeIndex === -1 && triggerRef.current) triggerRef.current.focus();
  }, [activeIndex]);

  if (!gallery.length) return null;

  const openImage = (index, event) => {
    triggerRef.current = event.currentTarget;
    setActiveIndex(index);
  };

  return (
    <section className="kc-section kc-gallery" data-tx-section="gallery" aria-labelledby="kc-gallery-title">
      <div className="kc-shell">
        <CelestialHeading
          id="kc-gallery-title"
          khmer="កម្រងអនុស្សាវរីយ៍"
          english="A portrait of our story"
          eyebrow="THE GALLERY"
          languageMode={languageMode}
        />
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

      <AnimatePresence>
        {activeIndex >= 0 ? (
          <motion.div
            className="kc-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="រូបភាព"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(-1)}
          >
            <button type="button" className="kc-lightbox__close" onClick={() => setActiveIndex(-1)} aria-label="បិទ">
              <X aria-hidden="true" />
            </button>
            <motion.img
              src={gallery[activeIndex]}
              alt={`អនុស្សាវរីយ៍អាពាហ៍ពិពាហ៍ ទី ${activeIndex + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              onClick={(event) => event.stopPropagation()}
            />
            <p>{activeIndex + 1} / {gallery.length}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

