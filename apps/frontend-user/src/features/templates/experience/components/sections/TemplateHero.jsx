import { motion } from "framer-motion";
import { IoCalendarOutline, IoChevronDown, IoTimeOutline } from "react-icons/io5";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { formatTime24toKhmer } from "@/shared/ui/TimePicker";
import TemplateImage from "../shared/TemplateImage";

/**
 * TemplateHero — fullscreen opening for the shared experience engine.
 * Background image + themed overlay, couple names, date, short venue,
 * style badge, families line, open CTA + scroll indicator.
 */
export default function TemplateHero({ content, onOpen }) {
    const reduced = usePrefersReducedMotion();

    const rise = (delay) =>
        reduced
            ? {}
            : {
                initial: { opacity: 0, y: 26 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
            };

    return (
        <section className="tx-hero" data-tx-section="hero" aria-label="ការអញ្ជើញ">
            <TemplateImage
                className="tx-hero__bg"
                src={content.coverImage}
                alt={`${content.groom} និង ${content.bride}`}
                loading="eager"
                fetchPriority="high"
            />
            <div className="tx-hero__overlay" aria-hidden="true" />
            <span className="tx-hero__petal tx-hero__petal--one" aria-hidden="true" />
            <span className="tx-hero__petal tx-hero__petal--two" aria-hidden="true" />
            <span className="tx-hero__petal tx-hero__petal--three" aria-hidden="true" />

            <div
                className="tx-hero__inner"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    textAlign: "center",
                    margin: "0 auto",
                }}
            >
                <motion.p
                    className="tx-hero__kicker"
                    style={{
                        fontSize: "0.72rem",
                        letterSpacing: "0.22em",
                        color: "#ead6aa",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                        textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                        textAlign: "center",
                        width: "100%",
                    }}
                    {...rise(0.02)}
                >
                    {content.eventTitle && content.eventTitle.toLowerCase() !== content.title?.toLowerCase() ? content.eventTitle : "WEDDING INVITATION"}
                </motion.p>
                <motion.h2
                    className="tx-hero__subtitle"
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#fffaf0",
                        margin: "0 0 12px",
                        textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                        textAlign: "center",
                        width: "100%",
                    }}
                    {...rise(0.06)}
                >
                    {content.title || "សិរីសួស្ដីអាពាហ៍ពិពាហ៍"}
                </motion.h2>

                <motion.div
                    className="tx-hero__crest"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        margin: "0 auto 12px",
                    }}
                    {...rise(0.12)}
                    aria-hidden="true"
                >
                    <div className="tx-crest-circle">
                        <span className="tx-crest-initials">{content.monogramText}</span>
                    </div>
                </motion.div>

                {!content.hideCoupleNameOnCover && (
                    <motion.h1
                        className="tx-hero__names"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            width: "100%",
                            margin: "0 auto",
                        }}
                        {...rise(0.2)}
                    >
                        <span>{content.groom}</span>
                        <em className="tx-hero__amp">{content.amp}</em>
                        <span>{content.bride}</span>
                    </motion.h1>
                )}

                <motion.div
                    className="tx-hero__rule"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        margin: "14px auto",
                    }}
                    aria-hidden="true"
                    {...rise(0.32)}
                >
                    <span /><i /><span />
                </motion.div>

                {content.families && (
                    <motion.p
                        className="tx-hero__families"
                        style={{
                            fontSize: "0.85rem",
                            color: "#ead6aa",
                            margin: "6px auto 8px",
                            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                            textAlign: "center",
                            width: "100%",
                        }}
                        {...rise(0.36)}
                    >
                        {content.families}
                    </motion.p>
                )}

                {(content.dateText || content.eventTime) && (
                    <motion.p
                        className="tx-hero__date"
                        style={{
                            fontSize: "0.85rem",
                            color: "#fffaf0",
                            margin: "0 auto 16px",
                            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: "6px",
                            width: "100%",
                            textAlign: "center",
                        }}
                        {...rise(0.4)}
                    >
                        {content.dateText && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <IoCalendarOutline aria-hidden="true" />
                                <span>{content.dateText}</span>
                            </span>
                        )}
                        {content.eventTime && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                {content.dateText && <span style={{ opacity: 0.6, margin: "0 2px" }}>•</span>}
                                <IoTimeOutline aria-hidden="true" />
                                <span>{formatTime24toKhmer(content.eventTime) || content.eventTime}</span>
                            </span>
                        )}
                    </motion.p>
                )}
            </div>

            <button
                type="button"
                className="tx-hero__scroll"
                onClick={onOpen}
                aria-label="រំកិលចុះក្រោម"
            >
                <span>រំកិលចុះក្រោម</span>
                <IoChevronDown aria-hidden="true" />
            </button>
        </section>
    );
}
