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

    const isCatalogOrEnglishName = (str) => {
        if (!str || typeof str !== "string") return true;
        const lower = str.trim().toLowerCase();
        return (
            lower.includes("garden royal") ||
            lower.includes("khmer wedding") ||
            lower.includes("royal khmer") ||
            lower.includes("template") ||
            lower.includes("celestial") ||
            lower.includes("wedding invitation") ||
            lower.includes("cover-") ||
            lower === "គំរូធៀបការ" ||
            lower === "គំរូសន្លឹកការ"
        );
    };

    const displayTitle = !isCatalogOrEnglishName(content.title)
        ? content.title
        : (!isCatalogOrEnglishName(content.invitationTitle)
            ? content.invitationTitle
            : "សិរីមង្គលអាពាហ៍ពិពាហ៍");

    const displayKicker = content.eventTitle && !content.eventTitle.toLowerCase().includes("garden royal")
        ? content.eventTitle
        : "WEDDING INVITATION";

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
                    maxWidth: "480px",
                    textAlign: "center",
                    margin: "0 auto",
                    padding: "0 1rem",
                }}
            >
                <motion.p
                    className="tx-hero__kicker"
                    style={{
                        fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                        fontSize: "0.68rem",
                        letterSpacing: "0.32em",
                        color: "#dfbe76",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        marginBottom: "4px",
                        textShadow: "0 2px 12px rgba(0,0,0,0.85)",
                        textAlign: "center",
                        width: "100%",
                    }}
                    {...rise(0.02)}
                >
                    {displayKicker}
                </motion.p>
                <motion.h2
                    className="tx-hero__subtitle"
                    style={{
                        fontFamily: "'Moul', 'Noto Serif Khmer', serif",
                        fontSize: "1.05rem",
                        fontWeight: 400,
                        color: "#fffaf0",
                        margin: "0 0 14px",
                        letterSpacing: "0.03em",
                        textShadow: "0 2px 14px rgba(0,0,0,0.9)",
                        textAlign: "center",
                        width: "100%",
                    }}
                    {...rise(0.06)}
                >
                    {displayTitle}
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
                            lineHeight: 1.25,
                        }}
                        {...rise(0.2)}
                    >
                        <span>{content.groom}</span>
                        <em className="tx-hero__amp">{content.amp || "❖"}</em>
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
                        margin: "10px auto 12px",
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
                            fontSize: "0.82rem",
                            color: "rgba(255, 248, 235, 0.92)",
                            margin: "2px auto 12px",
                            textShadow: "0 2px 10px rgba(0,0,0,0.85)",
                            textAlign: "center",
                            width: "100%",
                            letterSpacing: "0.02em",
                        }}
                        {...rise(0.36)}
                    >
                        {content.families}
                    </motion.p>
                )}

                {(content.dateText || content.eventTime) && (
                    <motion.div
                        className="tx-hero__date"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "6px 16px",
                            borderRadius: "999px",
                            background: "rgba(18, 12, 8, 0.62)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            border: "1px solid rgba(212, 175, 55, 0.38)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 0 10px rgba(212, 175, 55, 0.12)",
                            color: "#fffaf0",
                            fontSize: "0.78rem",
                            margin: "0 auto",
                            maxWidth: "92%",
                            flexWrap: "wrap",
                            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                        }}
                        {...rise(0.4)}
                    >
                        {content.dateText && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                <IoCalendarOutline aria-hidden="true" style={{ color: "#dfbe76" }} />
                                <span>{content.dateText}</span>
                            </span>
                        )}
                        {content.eventTime && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                {content.dateText && <span style={{ opacity: 0.4, margin: "0 2px" }}>•</span>}
                                <IoTimeOutline aria-hidden="true" style={{ color: "#dfbe76" }} />
                                <span>{formatTime24toKhmer(content.eventTime) || content.eventTime}</span>
                            </span>
                        )}
                    </motion.div>
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
