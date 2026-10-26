import { useInvitationLocale } from '../../../shared/invitationLocaleContext';
import { invitationLabel } from '../../../shared/invitationLabels';
import TemplateReveal from "./TemplateReveal";

export default function TemplateSectionHeader({ id, icon: Icon, kicker, title, subtitle, lead }) {
    const locale = useInvitationLocale();
    const englishTitle = /[\u1780-\u17ff]/.test(title || '') && locale === 'en' ? invitationLabel(title, locale) !== title ? invitationLabel(title, locale) : subtitle || title : title;
    return (
        <header className="tx-section__head">
            <TemplateReveal>
                {Icon && (
                    <span className="tx-section__icon" aria-hidden="true">
                        <Icon />
                    </span>
                )}
                {kicker && <p className="tx-kicker">{invitationLabel(kicker, locale)}</p>}
                <h2 id={id} className="tx-section__title">{englishTitle}</h2>
                {subtitle && subtitle !== englishTitle && <p className="tx-section__subtitle">{subtitle}</p>}
                {lead && <p className="tx-section__lead">{lead}</p>}
                <span className="tx-ornament-divider" aria-hidden="true" />
            </TemplateReveal>
        </header>
    );
}
