import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { IoHeart } from "react-icons/io5";
import { useLanguageStore } from "@/stores/useLanguageStore";

import TemplateReveal from "../shared/TemplateReveal";

/**
 * TemplateRsvp — demo RSVP preview card for the template page.
 * Shows the fields a full RSVP collects, but does NOT submit (template demo).
 * "Use this template" routes the visitor into the real flow, so no RSVP logic
 * is duplicated here.
 */
const TemplateRsvp = forwardRef(function TemplateRsvp({ useTemplateLink }, ref) {
    const lang = useLanguageStore((state) => state.lang);

    return (
        <section className="tx-section tx-rsvp" data-tx-section="rsvp" aria-labelledby="tx-rsvp-title" ref={ref}>
            <div className="tx-shell tx-shell--narrow">
                <header className="tx-section__head">
                    <TemplateReveal>
                        <p className="tx-kicker">{lang === "en" ? "RSVP" : "ឆ្លើយតប"}</p>
                        <h2 id="tx-rsvp-title" className="tx-section__title">
                            {lang === "en" ? "Will you be attending?" : "តើអ្នកនឹងចូលរួមដែរឬទេ?"}
                        </h2>
                        <p className="tx-section__lead">
                            {lang === "en"
                                ? "Please let us know by submitting your response so we can prepare your seat."
                                : "សូមជូនដំណឹងមកយើងខ្ញុំ ដើម្បីយើងអាចរៀបចំទទួលស្វាគមន៍អ្នកបានសមរម្យ"}
                        </p>
                    </TemplateReveal>
                </header>

                <TemplateReveal className="tx-rsvp__card">
                    <form
                        className="tx-rsvp__form"
                        onSubmit={(event) => event.preventDefault()}
                        aria-label={lang === "en" ? "RSVP Form" : "គំរូ RSVP"}
                    >
                        <div className="tx-rsvp__field">
                            <label htmlFor="tx-rsvp-name">{lang === "en" ? "Full Name" : "ឈ្មោះ"}</label>
                            <input
                                id="tx-rsvp-name"
                                type="text"
                                placeholder={lang === "en" ? "Your full name" : "ឈ្មោះរបស់អ្នក"}
                                autoComplete="name"
                            />
                        </div>
                        <div className="tx-rsvp__field">
                            <label htmlFor="tx-rsvp-phone">{lang === "en" ? "Phone Number" : "លេខទូរស័ព្ទ"}</label>
                            <input id="tx-rsvp-phone" type="tel" placeholder="012 345 678" autoComplete="tel" />
                        </div>
                        <div className="tx-rsvp__row">
                            <div className="tx-rsvp__field">
                                <label htmlFor="tx-rsvp-attend">{lang === "en" ? "Attending?" : "ការចូលរួម"}</label>
                                <select id="tx-rsvp-attend" defaultValue="yes">
                                    <option value="yes">{lang === "en" ? "Joyfully Accept" : "ចូលរួម"}</option>
                                    <option value="no">{lang === "en" ? "Regretfully Decline" : "មិនអាចចូលរួម"}</option>
                                </select>
                            </div>
                            <div className="tx-rsvp__field">
                                <label htmlFor="tx-rsvp-count">{lang === "en" ? "Number of Guests" : "ចំនួនភ្ញៀវ"}</label>
                                <select id="tx-rsvp-count" defaultValue="1">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="tx-rsvp__field">
                            <label htmlFor="tx-rsvp-msg">{lang === "en" ? "Wishes / Message" : "សារជូនពរ"}</label>
                            <textarea
                                id="tx-rsvp-msg"
                                rows={3}
                                placeholder={lang === "en" ? "Warm wishes for the couple..." : "ពាក្យជូនពរដល់គូស្នេហ៍..."}
                            />
                        </div>

                        {useTemplateLink ? (
                            <Link to={useTemplateLink} className="tx-btn tx-btn--solid tx-rsvp__submit">
                                <IoHeart className="tx-rsvp__submit-icon" aria-hidden="true" />
                                <span>{lang === "en" ? "Send RSVP Response" : "ផ្ញើការឆ្លើយតប"}</span>
                            </Link>
                        ) : (
                            <button type="submit" className="tx-btn tx-btn--solid tx-rsvp__submit">
                                <IoHeart className="tx-rsvp__submit-icon" aria-hidden="true" />
                                <span>{lang === "en" ? "Send RSVP Response" : "ផ្ញើការឆ្លើយតប"}</span>
                            </button>
                        )}
                    </form>
                </TemplateReveal>
            </div>
        </section>
    );
});

export default TemplateRsvp;
