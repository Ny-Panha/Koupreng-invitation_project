import ProgramDetails from "../../../shared/ProgramDetails";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TemplateReveal from "../shared/TemplateReveal";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { scheduleIcon, templateIcons } from "../../config/templateIcons";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

/**
 * TemplateSchedule — wedding day timeline cards with live ceremony milestone tracking.
 * Supports Scroll-Driven Horizontal Sticky Pinning (Scroll Down drives cards to the right)
 * or traditional vertical grid layout.
 */
export default function TemplateSchedule({ content }) {
    if (!content.schedule?.length) return null;
    return <ScheduleTimeline content={content} />;
}

function ScheduleTimeline({ content }) {
    const items = content.schedule;
    const outerRef = useRef(null);
    const viewportRef = useRef(null);
    const trackRef = useRef(null);
    const [travelDistance, setTravelDistance] = useState(0);
    const reducedMotion = usePrefersReducedMotion();


    const renderStatusBadge = (status) => {
        if (!status) return null;
        const normalized = String(status).toUpperCase();
        const labelMap = {
            IN_PROGRESS: "កំពុងប្រព្រឹត្តទៅ • IN PROGRESS",
            COMPLETED: "បានបញ្ចប់ • COMPLETED",
            UPCOMING: "បន្ទាប់ • UPCOMING",
        };
        const label = labelMap[normalized] || normalized;
        const statusClass = normalized === "IN_PROGRESS"
            ? "tx-schedule__status--active"
            : normalized === "COMPLETED"
            ? "tx-schedule__status--done"
            : "tx-schedule__status--upcoming";

        return (
            <span className={`tx-schedule__status ${statusClass}`} role="status">
                {label}
            </span>
        );
    };

    const isHorizontal = content.scheduleLayout !== "vertical";
    const isPinned = isHorizontal && items.length > 1 && !reducedMotion;

    // Track vertical scroll progress through the outer pinned section
    const { scrollYProgress } = useScroll({
        target: outerRef,
        offset: ["start start", "end end"],
    });

    // Dynamically measure scrollable width of the cards track
    useEffect(() => {
        if (!isPinned) return undefined;

        const measure = () => {
            if (trackRef.current && viewportRef.current) {
                const distance = Math.max(
                    0,
                    trackRef.current.scrollWidth - viewportRef.current.clientWidth + 36
                );
                setTravelDistance(distance);
            }
        };

        measure();

        let ro;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(measure);
            if (trackRef.current) ro.observe(trackRef.current);
            if (viewportRef.current) ro.observe(viewportRef.current);
        }

        window.addEventListener("resize", measure);
        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [isPinned, items]);

    const x = useTransform(scrollYProgress, [0, 1], [0, -travelDistance]);

    // Solid pin height: gives firm, smooth scroll travel so scrolling down
    // cleanly drives cards to the right (#1 -> #2 -> #3 -> #4) before unpinning
    const sectionHeight = isPinned ? `${Math.max(items.length * 60, 220)}vh` : "auto";

    return (
        <section
            ref={outerRef}
            className={`tx-section tx-schedule ${isHorizontal ? 'tx-schedule--horizontal' : ''}`}
            data-tx-section="schedule"
            aria-labelledby="tx-schedule-title"
            style={{ height: sectionHeight }}
        >
            <div ref={viewportRef} className={isPinned ? "tx-schedule__sticky-viewport" : ""}>
                <div className="tx-shell">
                    <TemplateSectionHeader
                        id="tx-schedule-title"
                        icon={templateIcons.schedule}
                        kicker="កម្មវិធី"
                        title="កម្មវិធីពិធីមង្គលការ"
                        subtitle="WEDDING PROGRAM"
                    />

                    {isHorizontal ? (
                        <div className="tx-schedule__horizontal-wrapper">
                            <div className="tx-schedule__progress-wrap" aria-hidden="true">
                                <span className="tx-schedule__progress-label">
                                    <span>Scroll Down ➔ មើលកម្មវិធី</span>
                                </span>
                                <div className="tx-schedule__progress-bar">
                                    <motion.div
                                        className="tx-schedule__progress-fill"
                                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                                    />
                                </div>
                            </div>

                            <div className="tx-schedule__track-viewport">
                                <motion.div
                                    ref={trackRef}
                                    style={{ x: isPinned ? x : 0 }}
                                    className="tx-schedule__motion-strip"
                                >
                                    {items.map((item, index) => {
                                        const ScheduleIcon = scheduleIcon(index);
                                        return (
                                            <article
                                                key={item.id || index}
                                                className={`tx-schedule__card tx-schedule__card--horizontal ${item.status === 'IN_PROGRESS' ? 'tx-schedule__card--active' : ''}`}
                                            >
                                                <div className="tx-schedule__step-num">#{index + 1}</div>
                                                <span className="tx-schedule__icon" aria-hidden="true"><ScheduleIcon /></span>
                                                {renderStatusBadge(item.status)}
                                                <span className="tx-schedule__time">{item.time}<ProgramDetails item={item} content={content} /></span>
                                                <h3 className="tx-schedule__title">{item.title}</h3>
                                                {item.titleEn && <p className="tx-schedule__en">{item.titleEn}</p>}
                                                <p className="tx-schedule__desc">{item.description}</p>
                                                {item.location && <p className="tx-schedule__loc">{item.location}</p>}
                                            </article>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        <div className="tx-schedule__grid">
                            {items.map((item, index) => {
                                const ScheduleIcon = scheduleIcon(index);
                                return (
                                    <TemplateReveal as="article" key={item.id || index} className={`tx-schedule__card ${item.status === 'IN_PROGRESS' ? 'tx-schedule__card--active' : ''}`} delay={index * 0.05}>
                                        <span className="tx-schedule__icon" aria-hidden="true"><ScheduleIcon /></span>
                                        {renderStatusBadge(item.status)}
                                        <span className="tx-schedule__time">{item.time}<ProgramDetails item={item} content={content} /></span>
                                        <h3 className="tx-schedule__title">{item.title}</h3>
                                        {item.titleEn && <p className="tx-schedule__en">{item.titleEn}</p>}
                                        <p className="tx-schedule__desc">{item.description}</p>
                                        {item.location && <p className="tx-schedule__loc">{item.location}</p>}
                                    </TemplateReveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
