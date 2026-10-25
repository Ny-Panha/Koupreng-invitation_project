import TemplateReveal from "../shared/TemplateReveal";
import AuthoredFamilies from '../../../shared/AuthoredFamilies';
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

/**
 * TemplateMessage — centered editorial invitation message with themed divider.
 */
export default function TemplateMessage({ content }) {
    return (
        <section className="tx-section tx-message" data-tx-section="message" aria-labelledby="tx-message-title">
            <div className="tx-shell tx-shell--narrow tx-message__inner">
                <TemplateSectionHeader
                    id="tx-message-title"
                    icon={templateIcons.invitation}
                    kicker={content.messageTitle || "ការអញ្ជើញ"}
                    title={content.subtitle || "សូមគោរពអញ្ជើញ"}
                    subtitle={content.subtitleEn || "A JOYFUL INVITATION"}
                />

                <TemplateReveal delay={0.1} className="tx-message__card">
                    <AuthoredFamilies content={content} />
                    <span className="tx-message__quote-mark" aria-hidden="true">“</span>
                    <p className="tx-message__text">
                        {content.message}
                    </p>
                    <span className="tx-message__seal" aria-hidden="true">❦</span>
                </TemplateReveal>
            </div>
        </section>
    );
}
