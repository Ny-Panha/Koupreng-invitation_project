import useCountdown from "@/features/wedding-site/hooks/useCountdown";

import TemplateReveal from "../shared/TemplateReveal";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

/**
 * TemplateCountdown — anticipation builder.
 * Uses the shared useCountdown hook. Falls back to an elegant line when no
 * valid wedding date exists (never crashes).
 */
export default function TemplateCountdown({ content }) {
    const hasValidDate =
        content.targetDate != null &&
        !Number.isNaN(new Date(content.targetDate).getTime());

    const countdown = useCountdown(hasValidDate ? content.targetDate : undefined);

    const cells = [
        ["ថ្ងៃ", countdown.d],
        ["ម៉ោង", countdown.h],
        ["នាទី", countdown.m],
        ["វិនាទី", countdown.s],
    ];

    const isPast =
        hasValidDate &&
        countdown.d === "00" &&
        countdown.h === "00" &&
        countdown.m === "00" &&
        countdown.s === "00";

    return (
        <section className="tx-section tx-countdown" data-tx-section="countdown" aria-labelledby="tx-countdown-title">
            <div className="tx-shell tx-shell--narrow">
                <TemplateSectionHeader
                    id="tx-countdown-title"
                    icon={templateIcons.countdown}
                    kicker="រាប់ថយក្រោយ"
                    title="រង់ចាំថ្ងៃពិសេស"
                    subtitle="COUNTING DOWN TO FOREVER"
                />

                {hasValidDate ? (
                    <>
                        <TemplateReveal className="tx-countdown__grid" aria-label="រាប់ថយក្រោយ">
                            {cells.map(([label, value]) => (
                                <div className="tx-countdown__cell" key={label}>
                                    <strong>{value}</strong>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </TemplateReveal>
                        {isPast && (
                            <p className="tx-countdown__past-note">
                                🎉 កាលបរិច្ឆេទនៃថ្ងៃសិរីសួស្តីអាពាហ៍ពិពាហ៍
                            </p>
                        )}
                    </>
                ) : (
                    <TemplateReveal>
                        <p className="tx-countdown__fallback">
                            កាលបរិច្ឆេទនឹងត្រូវប្រកាសក្នុងពេលឆាប់ៗនេះ
                        </p>
                    </TemplateReveal>
                )}
            </div>
        </section>
    );
}
