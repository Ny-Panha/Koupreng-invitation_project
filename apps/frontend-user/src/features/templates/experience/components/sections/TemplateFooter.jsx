import { IoCallOutline, IoLogoFacebook, IoPaperPlane } from "react-icons/io5";

import TemplateReveal from "../shared/TemplateReveal";

/**
 * TemplateFooter — elegant closing / thank-you.
 */
export default function TemplateFooter({ content }) {
    const { contact } = content;
    const bgImage = content.backgroundImage || content.coverImage;

    return (
        <footer className="tx-footer" data-tx-section="footer" aria-labelledby="tx-footer-title">
            <div
                className="tx-footer__bg"
                style={bgImage ? {
                    backgroundImage: `linear-gradient(rgba(20, 14, 8, 0.88), rgba(20, 14, 8, 0.94)), url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                } : undefined}
                aria-hidden="true"
            />
            <div className="tx-shell tx-shell--narrow tx-footer__inner">
                <TemplateReveal>
                    <p className="tx-kicker tx-footer__kicker">{content.thankYouTitle || "សូមអរគុណ"}</p>
                    <h2 id="tx-footer-title" className="tx-footer__title">
                        {content.groom} <em>{content.amp}</em> {content.bride}
                    </h2>
                </TemplateReveal>

                <TemplateReveal delay={0.06}>
                    <span className="tx-divider tx-divider--light" aria-hidden="true">
                        <i /><span className="tx-divider__dot" /><i />
                    </span>
                    <p className="tx-footer__thanks">
                        {content.thankYouText || content.footerThanks || "សូមអរគុណចំពោះក្ដីស្រឡាញ់ និងពរជ័យដ៏កក់ក្ដៅរបស់អ្នក"}
                    </p>
                    <p className="tx-footer__thanks-en">
                        {content.footerThanksEn || "Thank you for joining our special day"}
                    </p>
                    {content.apologyTitle && <h3>{content.apologyTitle}</h3>}
                    {content.apologyText && <p className="tx-footer__thanks">{content.apologyText}</p>}
                </TemplateReveal>

                <TemplateReveal delay={0.12}>
                    {content.dateText && <p className="tx-footer__meta">{content.dateText}</p>}
                    {content.venue.name && <p className="tx-footer__meta">{content.venue.name}</p>}
                </TemplateReveal>

                {(contact?.telegram || contact?.phone) && (
                    <TemplateReveal delay={0.18} className="tx-footer__contact">
                        {contact.telegram && (
                            <a href={contact.telegram} target="_blank" rel="noopener noreferrer" className="tx-footer__contact-link">
                                <IoPaperPlane aria-hidden="true" />
                                Telegram
                            </a>
                        )}
                        {contact.phone && (
                            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="tx-footer__contact-link">
                                <IoCallOutline aria-hidden="true" />
                                {contact.phone}
                            </a>
                        )}
                        {contact.facebook && (
                            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="tx-footer__contact-link">
                                <IoLogoFacebook aria-hidden="true" />
                                Facebook
                            </a>
                        )}
                    </TemplateReveal>
                )}

                <TemplateReveal delay={0.24}>
                    <p className="tx-footer__brand">Powered by Koupreng</p>
                </TemplateReveal>
            </div>
        </footer>
    );
}
