import TemplateReveal from "../shared/TemplateReveal";
import TemplateImage from "../shared/TemplateImage";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";

/**
 * TemplateCouple — introduce groom & bride.
 * When separate photos exist, renders alternating rows.
 * When only a single couple photo exists, renders a unified couple showcase card.
 */
export default function TemplateCouple({ content }) {
    if (content.hasHostContent && !content.groomImage && !content.brideImage && !content.backgroundImage) {
        return null;
    }

    const hasSeparateImages =
        content.groomImage &&
        content.brideImage &&
        content.groomImage !== content.brideImage;

    const couplePhoto = content.backgroundImage || content.portraitImage || content.coverImage;

    return (
        <section className="tx-section tx-couple" data-tx-section="couple" aria-labelledby="tx-couple-title">
            <div className="tx-shell">
                <TemplateSectionHeader
                    id="tx-couple-title"
                    icon={templateIcons.couple}
                    kicker="គូស្នេហ៍"
                    title="កូនកំលោះ និង កូនក្រមុំ"
                    subtitle="THE BRIDE & GROOM"
                />

                {hasSeparateImages ? (
                    <div className="tx-couple__list">
                        <TemplateReveal className="tx-couple__row">
                            <div className="tx-couple__media">
                                <TemplateImage src={content.groomImage} alt={content.groom} />
                                <span className="tx-couple__frame" aria-hidden="true" />
                            </div>
                            <div className="tx-couple__body">
                                <p className="tx-kicker">កូនកំលោះ</p>
                                <h3 className="tx-couple__name">{content.groom}</h3>
                                {content.couple.groomIntro && <p className="tx-couple__intro">{content.couple.groomIntro}</p>}
                                {content.couple.groomParents && <p className="tx-couple__parents">{content.couple.groomParents}</p>}
                            </div>
                        </TemplateReveal>
                        <TemplateReveal className="tx-couple__row is-flip">
                            <div className="tx-couple__media">
                                <TemplateImage src={content.brideImage} alt={content.bride} />
                                <span className="tx-couple__frame" aria-hidden="true" />
                            </div>
                            <div className="tx-couple__body">
                                <p className="tx-kicker">កូនក្រមុំ</p>
                                <h3 className="tx-couple__name">{content.bride}</h3>
                                {content.couple.brideIntro && <p className="tx-couple__intro">{content.couple.brideIntro}</p>}
                                {content.couple.brideParents && <p className="tx-couple__parents">{content.couple.brideParents}</p>}
                            </div>
                        </TemplateReveal>
                    </div>
                ) : (
                    <TemplateReveal className="tx-couple__unified-card">
                        <div className="tx-couple__unified-media">
                            <TemplateImage src={couplePhoto} alt={`${content.groom} & ${content.bride}`} />
                            <span className="tx-couple__frame" aria-hidden="true" />
                        </div>
                        <div className="tx-couple__unified-grid">
                            <div className="tx-couple__person">
                                <span className="tx-couple__badge">កូនកំលោះ</span>
                                <h3 className="tx-couple__name">{content.groom}</h3>
                                {content.couple.groomIntro && <p className="tx-couple__intro">{content.couple.groomIntro}</p>}
                                {content.couple.groomParents && <p className="tx-couple__parents">{content.couple.groomParents}</p>}
                            </div>
                            <div className="tx-couple__divider-ornament" aria-hidden="true">
                                <span>✦</span>
                            </div>
                            <div className="tx-couple__person">
                                <span className="tx-couple__badge">កូនក្រមុំ</span>
                                <h3 className="tx-couple__name">{content.bride}</h3>
                                {content.couple.brideIntro && <p className="tx-couple__intro">{content.couple.brideIntro}</p>}
                                {content.couple.brideParents && <p className="tx-couple__parents">{content.couple.brideParents}</p>}
                            </div>
                        </div>
                    </TemplateReveal>
                )}
            </div>
        </section>
    );
}
