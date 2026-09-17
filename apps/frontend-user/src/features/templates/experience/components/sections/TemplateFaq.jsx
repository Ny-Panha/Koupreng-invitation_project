import { useLanguageStore } from "@/stores/useLanguageStore";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

export default function TemplateFaq({ content }) {
    const lang = useLanguageStore((state) => state.lang);
    if (!content.faq?.length) return null;

    return (
        <section className="tx-section tx-faq" data-tx-section="faq" aria-labelledby="tx-faq-title">
            <div className="tx-shell tx-shell--narrow">
                <TemplateSectionHeader
                    id="tx-faq-title"
                    icon={templateIcons.invitation}
                    kicker={lang === "en" ? "INFORMATION" : "ព័ត៌មានបន្ថែម"}
                    title={lang === "en" ? "Frequently Asked Questions" : "សំណួរញឹកញាប់"}
                    subtitle="FAQ"
                />
                <div className="tx-faq__list">
                    {content.faq.map((item) => (
                        <details className="tx-faq__item" key={item.id || item.q}>
                            <summary>{item.q}</summary>
                            <p>{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
