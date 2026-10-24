import ProgramDetails from "../../../shared/ProgramDetails";
import TemplateReveal from "../shared/TemplateReveal";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { scheduleIcon, templateIcons } from "../../config/templateIcons";

/**
 * TemplateSchedule — wedding day timeline cards with live ceremony milestone tracking.
 * Each card: time, title, description, optional location, and optional live milestone status.
 */
export default function TemplateSchedule({ content }) {
    const items = content.schedule || [];
    if (!items.length) return null;

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

    return (
        <section className="tx-section tx-schedule" data-tx-section="schedule" aria-labelledby="tx-schedule-title">
            <div className="tx-shell">
                <TemplateSectionHeader
                    id="tx-schedule-title"
                    icon={templateIcons.schedule}
                    kicker="កម្មវិធី"
                    title="កម្មវិធីពិធីមង្គលការ"
                    subtitle="WEDDING PROGRAM"
                />

                <div className="tx-schedule__grid">
                    {items.map((item, index) => {
                        const ScheduleIcon = scheduleIcon(index);
                        return (
                            <TemplateReveal as="article" key={item.id} className={`tx-schedule__card ${item.status === 'IN_PROGRESS' ? 'tx-schedule__card--active' : ''}`} delay={index * 0.05}>
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
            </div>
        </section>
    );
}
