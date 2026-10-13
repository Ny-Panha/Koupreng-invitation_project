import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./templates.css";
import {
    KEEP_TEMPLATE_CODE,
    ROYAL_KHMER_TEMPLATE_CODE,
    COVER_KHMER_GOLDEN_CODE,
    KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    THE_DIGITAL_YES_TEMPLATE_CODE,
    SILK_HERITAGE_TEMPLATE_CODE,
    TEMPLATES,
} from "../data/templatesData";
import { templateService } from "../api/templateService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import heroBg from "../../../assets/icons/background.png";
import { useBackendMessages } from "../../../shared/i18n/useBackendMessages";

const FEATURED_TEMPLATE_IDS = [
    SILK_HERITAGE_TEMPLATE_CODE,
    THE_DIGITAL_YES_TEMPLATE_CODE,
    KEEP_TEMPLATE_CODE,
    ROYAL_KHMER_TEMPLATE_CODE,
    COVER_KHMER_GOLDEN_CODE,
    KHMER_GOLDEN_CANVA_INSPIRED_CODE,
];

const TEMPLATE_CARD_COVER = {
    [THE_DIGITAL_YES_TEMPLATE_CODE]: "/facebook/all/03-card/cover-card.jpg",
    [KEEP_TEMPLATE_CODE]: "/facebook/all/03-card/cover-card.jpg",
    [ROYAL_KHMER_TEMPLATE_CODE]: "/facebook/all/01-card/cover-card.jpg",
    [COVER_KHMER_GOLDEN_CODE]: "/templates/cover-khmer-golden-wedding/cover-preview.svg",
    [KHMER_GOLDEN_CANVA_INSPIRED_CODE]: "/invitations/khmer-golden-canva-inspired/cover-card.svg",
};

const getCategoryLabels = (t) => ({
    ancient: t("catAncient") || "បុរាណ",
    modern: t("catModern") || "ទំនើប",
    contemporary: t("catContemporary") || "សហសម័យ",
    luxury: "ប្រណិត",
    minimalist: "សាមញ្ញ",
    floral: "ផ្កាស្រស់",
});

function getCreatePath(path, isAuthenticated) {
    if (isAuthenticated) {
        return path;
    }

    return `/login?next=${encodeURIComponent(path)}`;
}

function getUseTemplatePath(templateId, isAuthenticated) {
    return getCreatePath(`/templates/browse?template=${encodeURIComponent(templateId)}`, isAuthenticated);
}

function formatTemplateDesc(description, fallback) {
    if (!description) return fallback || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP";
    const str = String(description).trim();
    if (str.startsWith("{") && str.endsWith("}")) {
        try {
            const parsed = JSON.parse(str);
            if (parsed.blessingMessage && typeof parsed.blessingMessage === "string" && parsed.blessingMessage.trim()) {
                return parsed.blessingMessage.trim();
            }
            if (parsed.invitationTitle && typeof parsed.invitationTitle === "string" && parsed.invitationTitle.trim()) {
                return `${parsed.invitationTitle} — គំរូធៀបការឌីជីថលបែបប្រណិត`;
            }
            if (parsed.description && typeof parsed.description === "string" && parsed.description.trim()) {
                return parsed.description.trim();
            }
            return fallback || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP";
        } catch {
            return str;
        }
    }
    return str;
}

function getTemplateBenefit(template, t) {
    const desc = formatTemplateDesc(template.description, t("templateBenefit"));
    return desc?.split("។")[0] || t("templateBenefit") || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP";
}

/**
 * TemplateGrid — public wedding templates gallery.
 * Loads live active templates from Backend API with local fallback.
 */
export default function TemplateGrid() {
    const { isAuthenticated } = useAuth();
    const { text: rawText, lang } = useBackendMessages("templateGrid");
    const t = (key) => { const text = rawText(key); return text === key ? "" : text; };
    const categoryLabels = getCategoryLabels(t);
    const [apiTemplates, setApiTemplates] = useState(null);
    const [status, setStatus] = useState("loading");
    const [category, setCategory] = useState("all");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        setStatus("loading");
        templateService.listPublic({ force: reload > 0 })
            .then((res) => {
                if (active && Array.isArray(res)) {
                    setApiTemplates(res);
                    setStatus("ready");
                }
            })
            .catch(() => {
                if (active) { setApiTemplates(null); setStatus("error"); }
            });
        return () => { active = false; };
    }, [reload]);

    const visibleTemplates = useMemo(() => {
        if (!apiTemplates) {
            return FEATURED_TEMPLATE_IDS
                .map((templateId) => TEMPLATES.find((template) => template.id === templateId))
                .filter(Boolean);
        }

        return apiTemplates.map((apiTpl) => {
            const code = apiTpl.code || String(apiTpl.id);
            const localMatch = TEMPLATES.find((t) => t.id === code || t.id === apiTpl.slug);
            const rawCat = (apiTpl.category || "TRADITIONAL").toLowerCase();
            const categoryKey = rawCat === "traditional" ? "ancient" : (rawCat === "luxury" ? "contemporary" : rawCat);

            return {
                id: code,
                name: apiTpl.name || localMatch?.name || "គំរូធៀបការខ្មែរ",
                style: localMatch?.style || (apiTpl.code ? apiTpl.code.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Khmer Wedding"),
                category: categoryKey,
                popular: Boolean(apiTpl.isPremium || apiTpl.premium || localMatch?.popular),
                image: apiTpl.thumbnailUrl || TEMPLATE_CARD_COVER[code] || localMatch?.image || "/facebook/all/03-card/cover-card.jpg",
                description: formatTemplateDesc(apiTpl.description, localMatch?.description || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP"),
                isPremium: Boolean(apiTpl.isPremium || apiTpl.premium),
                price: apiTpl.price,
            };
        });
    }, [apiTemplates]);
    const filteredTemplates = visibleTemplates.filter((template) => category === "all" || template.category === category);

    return (
        <div className="tp-page">
            <div className="tp-bg-overlay" aria-hidden="true">
                <div
                    className="tp-bg-image"
                    style={{ backgroundImage: `url(${heroBg})` }}
                ></div>
                <div className="tp-bg-gradient"></div>
            </div>

            <div className="tp-container">
                <header className="tp-header-section">
                    <span className="tp-label">{t("premiumLabel") || "Koupreng Premium Templates"}</span>
                    <h1 className="tp-title">
                        {t("titleTemplates") || "ជ្រើសរើស"}<span>{t("titleTemplatesSpan") || "គ្រោងសន្លឹកការណ៍"}</span>
                    </h1>
                    <div className="tp-divider">
                        <div className="tp-line"></div>
                        <div className="tp-diamond"></div>
                        <div className="tp-line"></div>
                    </div>
                </header>

                <div className="tp-catalog-controls" aria-label={lang === "en" ? "Template categories" : "ប្រភេទគំរូ"}>
                    {[["all", lang === "en" ? "All" : "ទាំងអស់"], ["ancient", lang === "en" ? "Khmer tradition" : "ប្រពៃណីខ្មែរ"], ["modern", lang === "en" ? "Modern" : "ទំនើប"]].map(([key, label]) => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}
                </div>
                {status === "loading" && <p role="status" className="tp-catalog-status">{lang === "en" ? "Loading the template collection…" : "កំពុងផ្ទុកគំរូសន្លឹកការ…"}</p>}
                {status === "error" && <p role="status" className="tp-catalog-status">{lang === "en" ? "The live collection is unavailable. These are demo designs; availability is checked when you select one." : "មិនអាចផ្ទុកគំរូពីម៉ាស៊ីនមេបាន។ នេះជាគំរូបង្ហាញ។"} <button type="button" onClick={() => setReload((value) => value + 1)}>{lang === "en" ? "Try again" : "សាកម្ដងទៀត"}</button></p>}
                {status === "ready" && filteredTemplates.length === 0 && <p role="status" className="tp-catalog-status">{lang === "en" ? "No templates in this collection yet." : "មិនទាន់មានគំរូក្នុងប្រភេទនេះទេ។"}</p>}
                <div className="tp-grid">
                    {filteredTemplates.map((template) => {
                        const createPath = getUseTemplatePath(template.id, isAuthenticated);
                        const coverImage = template.image || TEMPLATE_CARD_COVER[template.id];

                        return (
                            <div key={template.id} className="tp-card">
                                {template.popular && <div className="tp-popular-tag">{t("popular") || "✨ ពេញនិយម"}</div>}

                                {/* Category badge */}
                                <div className={`tp-category-badge tp-category-badge--${template.category}`}>
                                    {categoryLabels[template.category]}
                                </div>

                                <Link to={`/templates/${template.id}`} className="tp-image-box">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        width="720"
                                        height="1080"
                                        src={coverImage}
                                        alt={template.name}
                                        className="tp-main-img"
                                    />
                                    <div className="tp-overlay">
                                        <span className="tp-view-btn">{t("viewDetail") || "មើលលម្អិត"}</span>
                                    </div>
                                </Link>

                                <div className="tp-card-content">
                                    <h3 className="tp-card-name">{template.name}</h3>
                                    <span className="tp-style-name">
                                        {categoryLabels[template.category]} / {template.style}
                                    </span>
                                    <p className="tp-card-benefit">{getTemplateBenefit(template, t)}</p>
                                    <p className="tp-access-label">{template.isPremium ? (lang === "en" ? "Premium · access required" : "ប្រណិត · តម្រូវឱ្យមានសិទ្ធិប្រើប្រាស់") : (lang === "en" ? "Free template" : "គំរូឥតគិតថ្លៃ")}</p>
                                    <div className="tp-card-actions">
                                        <Link to={createPath} className="tp-action-btn">
                                            {t("useTemplate") || "ប្រើគំរូនេះ"}
                                        </Link>
                                        <Link to={`/templates/${template.id}`} className="tp-detail-btn">
                                            {t("viewDetail") || "មើលលម្អិត"}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
