import { useCallback, useEffect, useState } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";

import TemplateReveal from "../shared/TemplateReveal";
import TemplateImage from "../shared/TemplateImage";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

/**
 * TemplateGallery — adaptive masonry gallery with an accessible, full-screen lightbox.
 * Supports arrow navigation, image counter, and keyboard dismissal.
 * Hides itself when there are no images.
 */
export default function TemplateGallery({ content = {} }) {
    const images = content?.gallery || [];
    const [activeIndex, setActiveIndex] = useState(null);
    const isOpen = activeIndex !== null;

    const close = useCallback(() => setActiveIndex(null), []);

    const prev = useCallback((event) => {
        event?.stopPropagation();
        setActiveIndex((current) => (current > 0 ? current - 1 : images.length - 1));
    }, [images.length]);

    const next = useCallback((event) => {
        event?.stopPropagation();
        setActiveIndex((current) => (current < images.length - 1 ? current + 1 : 0));
    }, [images.length]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (event) => {
            if (event.key === "Escape") close();
            else if (event.key === "ArrowLeft") prev();
            else if (event.key === "ArrowRight") next();
        };

        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, close, prev, next]);

    if (!images.length) return null;

    return (
        <section className="tx-section tx-gallery" data-tx-section="gallery" aria-labelledby="tx-gallery-title">
            <div className="tx-shell">
                <TemplateSectionHeader
                    id="tx-gallery-title"
                    icon={templateIcons.gallery}
                    kicker="រូបភាព"
                    title="អនុស្សាវរីយ៍ស្នេហា"
                    subtitle="OUR GALLERY"
                />

                {images.length ? (
                    <TemplateReveal className="tx-gallery__grid">
                        {images.map((img, index) => (
                            <button
                                type="button"
                                key={`${img.src}-${index}`}
                                className={`tx-gallery__item is-${img.span || "small"}`}
                                onClick={() => setActiveIndex(index)}
                                aria-label={`មើលរូបភាពទី ${index + 1}`}
                            >
                                <TemplateImage src={img.src} alt={`អនុស្សាវរីយ៍ ${index + 1}`} />
                                <span className="tx-gallery__overlay" aria-hidden="true" />
                            </button>
                        ))}
                    </TemplateReveal>
                ) : null}
            </div>

            {isOpen && (
                <div
                    className="tx-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="រូបភាព"
                    onClick={close}
                >
                    <button type="button" className="tx-lightbox__close" onClick={close} aria-label="បិទ">
                        <IoClose aria-hidden="true" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="tx-lightbox__nav-btn tx-lightbox__nav-btn--prev"
                                onClick={prev}
                                aria-label="រូបភាពមុន"
                            >
                                <IoChevronBack aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="tx-lightbox__nav-btn tx-lightbox__nav-btn--next"
                                onClick={next}
                                aria-label="រូបភាពបន្ទាប់"
                            >
                                <IoChevronForward aria-hidden="true" />
                            </button>
                            <div className="tx-lightbox__counter" aria-live="polite">
                                {activeIndex + 1} / {images.length}
                            </div>
                        </>
                    )}

                    <TemplateImage
                        className="tx-lightbox__img"
                        src={images[activeIndex].src}
                        alt={`អនុស្សាវរីយ៍ ${activeIndex + 1}`}
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
}
