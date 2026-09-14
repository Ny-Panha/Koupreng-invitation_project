import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./templates.css";
import {
    KEEP_TEMPLATE_CODE,
    ROYAL_KHMER_TEMPLATE_CODE,
    COVER_KHMER_GOLDEN_CODE,
    KHMER_GOLDEN_CANVA_INSPIRED_CODE,
    THE_DIGITAL_YES_TEMPLATE_CODE,
    TEMPLATES,
} from "../data/templatesData";
import { templateService } from "../api/templateService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import heroBg from "../../../assets/icons/background.png";
import { useBackendMessages } from "../../../shared/i18n/useBackendMessages";

const FEATURED_TEMPLATE_IDS = [
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
    return getCreatePath(`/create/wedding?template=${templateId}`, isAuthenticated);
}

function getTemplateBenefit(template, t) {
    return template.description?.split("។")[0] || t("templateBenefit") || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP";
}

/**
 * TemplateGrid — public wedding templates gallery.
 * Loads live active templates from Backend API with local fallback.
 */
export default function TemplateGrid() {
    const { isAuthenticated } = useAuth();
    const { text: t } = useBackendMessages("templateGrid");
    const categoryLabels = getCategoryLabels(t);
    const [apiTemplates, setApiTemplates] = useState(null);

    useEffect(() => {
        let active = true;
        templateService.listPublic()
            .then((res) => {
                if (active && Array.isArray(res) && res.length > 0) {
                    setApiTemplates(res);
                }
            })
            .catch(() => {
                // Keep local fallback on error
            });
        return () => { active = false; };
    }, []);

    const visibleTemplates = useMemo(() => {
        if (!apiTemplates || apiTemplates.length === 0) {
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
                description: apiTpl.description || localMatch?.description || "គំរូសន្លឹកការដែលរួចរាល់សម្រាប់បង្ហាញ និង RSVP",
                isPremium: Boolean(apiTpl.isPremium || apiTpl.premium),
                price: apiTpl.price,
            };
        });
    }, [apiTemplates]);

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

                <div className="tp-grid">
                    {visibleTemplates.map((template) => {
                        const createPath = getUseTemplatePath(template.id, isAuthenticated);
                        const coverImage = TEMPLATE_CARD_COVER[template.id] || template.image;

                        return (
                            <div key={template.id} className="tp-card">
                                {template.popular && <div className="tp-popular-tag">{t("popular") || "✨ ពេញនិយម"}</div>}

                                {/* Category badge */}
                                <div className={`tp-category-badge tp-category-badge--${template.category}`}>
                                    {categoryLabels[template.category]}
                                </div>

                                <Link to={`/templates/${template.id}`} className="tp-image-box">
                                    <img
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
