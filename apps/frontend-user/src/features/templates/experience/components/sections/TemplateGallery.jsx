import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

import TemplateReveal from "../shared/TemplateReveal";
import TemplateImage from "../shared/TemplateImage";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

/**
 * TemplateGallery — adaptive masonry gallery with a simple, safe lightbox.
 * Hides itself when there are no images.
 */
export default function TemplateGallery({ content }) {
    const images = content.gallery || [];
    const [activeIndex, setActiveIndex] = useState(null);
    const isOpen = activeIndex !== null;

    const close = useCallback(() => setActiveIndex(null), []);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (event) => {
            if (event.key === "Escape") close();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, close]);

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
