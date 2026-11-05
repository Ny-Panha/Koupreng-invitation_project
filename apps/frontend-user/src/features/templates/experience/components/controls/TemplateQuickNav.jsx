import { useContext } from "react";
import { templateIcons } from "../../config/templateIcons";
import { InvitationLocaleContext } from "../../../shared/invitationLocaleContext";
import { useLanguageStore } from "@/stores/useLanguageStore";

const NAV_ITEMS = [
    { section: "schedule", labelKm: "កម្មវិធី", labelEn: "Program", icon: templateIcons.schedule },
    { section: "venue", labelKm: "ទីតាំង", labelEn: "Venue", icon: templateIcons.venue },
    { section: "gallery", labelKm: "រូបភាព", labelEn: "Gallery", icon: templateIcons.gallery },
    { section: "gift", labelKm: "ចំណងដៃ", labelEn: "Gift QR", icon: templateIcons.gift },
    { section: "rsvp", labelKm: "ឆ្លើយតប", labelEn: "RSVP", icon: templateIcons.invitation },
    { section: "footer", labelKm: "អរគុណ", labelEn: "Thanks", icon: templateIcons.thank },
];

export default function TemplateQuickNav({ enabledSections, onNavigate, languageMode }) {
    const localeContext = useContext(InvitationLocaleContext);
    const storeLang = useLanguageStore((state) => state.lang);
    const effectiveLang = languageMode || (localeContext && localeContext !== "both" ? localeContext : storeLang) || "km";
    const isEn = String(effectiveLang).toLowerCase() === "en";

    const items = NAV_ITEMS.filter(({ section }) => {
        if (section === "footer") return true;
        const key = section === "venue" ? "map" : section;
        return enabledSections?.[key] !== false;
    });

    return (
        <nav
            className="tx-quick-nav"
            aria-label={isEn ? "Invitation navigation" : "រុករកសន្លឹកការ"}
            style={{ "--tx-quick-nav-count": items.length }}
        >
            {items.map(({ section, labelKm, labelEn, icon: Icon }) => {
                const label = isEn ? labelEn : labelKm;
                return (
                    <button
                        key={section}
                        type="button"
                        className="tx-quick-nav__item"
                        onClick={() => onNavigate(section)}
                        title={label}
                        aria-label={label}
                    >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
