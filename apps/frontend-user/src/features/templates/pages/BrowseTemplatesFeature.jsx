import { isPublicCatalogTemplate, matchesTemplateSearch, requiresTemplateAccess, templateCategory } from "../model/catalogPolicy";
import { publicTemplateImage } from "../model/publicTemplateImage";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoDiamondOutline,
  IoEyeOutline,
  IoImageOutline,
  IoSearchOutline,
  IoSparkles,
} from "react-icons/io5";

import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import { paymentService } from "@/features/payments/paymentService";
import { useBackendMessages } from "@/shared/i18n/useBackendMessages";
import { SkeletonTable } from "@/shared/ui";
import { templateIdentity, templatePriceLabel, templateUsePath } from "../model/templateIdentity";
import "./BrowseTemplates.css";

function formatTemplateDescription(description) {
  if (!description) return "";
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
      if (parsed.groomName && parsed.brideName) {
        return `គំរូធៀបការមង្គលការ ${parsed.groomName} & ${parsed.brideName}`;
      }
      if (parsed.description && typeof parsed.description === "string" && parsed.description.trim()) {
        return parsed.description.trim();
      }
      return "គំរូធៀបការមង្គលការបែបប្រពៃណីខ្មែរ រចនាបទស្រស់ស្អាតនិងទំនើប";
    } catch {
      return str;
    }
  }
  return str;
}

export default function BrowseTemplatesFeature() {
  const { lang, text: t } = useBackendMessages("templates");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTemplate = searchParams.get("template");
  const [templates, setTemplates] = useState([]);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => [
    { id: "ALL", label: t("catAll") || (lang === "en" ? "All" : "ទាំងអស់") },
    { id: "PAID", label: lang === "en" ? "Paid Templates" : "បានទិញរួច (Paid)" },
    { id: "FREE", label: t("catFree") || (lang === "en" ? "Free" : "ឥតគិតថ្លៃ (Free)") },
    { id: "PREMIUM", label: t("catPremium") || "Premium" },
    { id: "MODERN", label: t("catModern") || (lang === "en" ? "Modern" : "សម័យទំនើប (Modern)") },
    { id: "TRADITIONAL", label: t("catTraditional") || (lang === "en" ? "Traditional" : "ប្រពៃណីខ្មែរ (Traditional)") },
    { id: "FLORAL", label: t("catFloral") || (lang === "en" ? "Floral" : "ផ្កាភ្ញី (Floral)") },
    { id: "LUXURY", label: t("catLuxury") || (lang === "en" ? "Luxury" : "ប្រណិត (Luxury)") },
    { id: "MINIMALIST", label: t("catMinimalist") || (lang === "en" ? "Minimalist" : "បែបសាមញ្ញ (Minimalist)") },
  ], [lang, t]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    templateCatalogService
      .list({ force: revision > 0 })
      .then((items) => {
        if (active) {
          setTemplates((items || []).filter(isPublicCatalogTemplate));
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || (t("error") || "មិនអាចទាញយកគំរូធៀបការបានទេ"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t, revision]);

  const [paidIds, setPaidIds] = useState(new Set());

  useEffect(() => {
    let active = true;
    if (typeof paymentService?.paidTemplates === "function") {
      paymentService
        .paidTemplates()
        .then((res) => {
          if (active && Array.isArray(res)) {
            const ids = new Set(res.map((item) => String(item.templateId || item.id)));
            setPaidIds(ids);
          }
        })
        .catch(() => {
          // Silently ignore if not authenticated or offline
        });
    }
    return () => {
      active = false;
    };
  }, []);

  const isPremium = useCallback((tpl) => requiresTemplateAccess(tpl), []);
  const isUnlocked = useCallback((tpl) => !isPremium(tpl) || paidIds.has(String(tpl.id)) || paidIds.has(String(tpl.slug)), [isPremium, paidIds]);
  const categoryLabel = useCallback((template) => {
    const category = String(template?.category || "OTHER").toUpperCase();
    const labels = {
      MODERN: lang === "en" ? "Modern" : "សម័យទំនើប",
      TRADITIONAL: lang === "en" ? "Traditional" : "ប្រពៃណីខ្មែរ",
      MINIMALIST: lang === "en" ? "Minimalist" : "បែបសាមញ្ញ",
      FLORAL: lang === "en" ? "Floral" : "ផ្កាភ្ញី",
      LUXURY: lang === "en" ? "Luxury" : "ប្រណិត",
      OTHER: lang === "en" ? "Other" : "ផ្សេងៗ",
    };
    return labels[category] || category;
  }, [lang]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (selectedTemplate && ![tpl.code, tpl.slug, String(tpl.id)].includes(selectedTemplate)) return false;
      const prem = isPremium(tpl);
      // Category filter
      if (activeCategory === "PAID" && !(prem && isUnlocked(tpl))) return false;
      if (activeCategory === "FREE" && prem) return false;
      if (activeCategory === "PREMIUM" && !prem) return false;
      if (
        !["ALL", "PAID", "FREE", "PREMIUM"].includes(activeCategory) &&
        templateCategory(tpl) !== activeCategory
      ) {
        return false;
      }

      if (!matchesTemplateSearch(tpl, searchQuery)) return false;

      return true;
    });
  }, [templates, activeCategory, searchQuery, isPremium, isUnlocked, selectedTemplate]);

  const stats = useMemo(() => {
    const total = templates.length;
    const free = templates.filter((t) => !isPremium(t)).length;
    const premium = templates.filter((t) => isPremium(t)).length;
    return { total, free, premium };
  }, [templates, isPremium]);

  const handleSelect = async (template) => {
    if (!isPublicCatalogTemplate(template)) return;
    if (isPremium(template) && !isUnlocked(template)) {
      try {
        const access = await paymentService.templateAccess(template.id);
        if (access?.hasAccess) { navigate(templateUsePath(templateIdentity(template), true)); return; }
      } catch { /* The server must grant access before selection. */ }
      navigate(template.checkoutEligible === true
        ? `/templates/${encodeURIComponent(templateIdentity(template))}/checkout` : "/pricing");
      return;
    }
    navigate(templateUsePath(templateIdentity(template), true));
  };

  const handlePreview = (template) => {
    const tplId = templateIdentity(template);
    if (template.previewUrl && /^(\/(?!\/)|https?:\/\/)/.test(template.previewUrl)) {
      if (template.previewUrl.startsWith("/")) {
        navigate(template.previewUrl);
      } else {
        window.open(template.previewUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    navigate(`/templates/browse/${encodeURIComponent(tplId)}`);
  };

  return (
    <main className="dash-main pe-guests-page pe-templates-browse-page">
      {/* Header */}
      <header className="dash-page-header">
        <div>
          <span className="dash-kicker">
            <IoSparkles /> {t("kicker")}
          </span>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
      </header>
      {selectedTemplate && <p className="tp-catalog-status">{lang === "en" ? "Showing your selected design." : "កំពុងបង្ហាញគំរូដែលអ្នកបានជ្រើសរើស។"} <button type="button" className="inv-secondary-btn" onClick={() => { const next = new URLSearchParams(searchParams); next.delete("template"); setSearchParams(next); }}>{lang === "en" ? "Show all templates" : "បង្ហាញគំរូទាំងអស់"}</button></p>}

      {/* Stats Summary matching GuestsPage */}
      <section className="pe-summary-grid">
        <article className="pe-summary-card">
          <span>{t("statTotal")}</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="pe-summary-card">
          <span style={{ color: "#0f766e" }}>{t("statFree")}</span>
          <strong style={{ color: "#0f766e" }}>{stats.free}</strong>
        </article>
        <article className="pe-summary-card">
          <span style={{ color: "var(--brand-primary)" }}>{t("statPremium")}</span>
          <strong style={{ color: "var(--brand-primary)" }}>{stats.premium}</strong>
        </article>
        <article className="pe-summary-card">
          <span>{t("statResults")}</span>
          <strong>{filteredTemplates.length}</strong>
        </article>
      </section>

      {/* Toolbar & Filters */}
      <section className="tb-toolbar">
        <div className="tb-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={`tb-category-chip ${activeCategory === cat.id ? "active" : ""}`}
            >
              {cat.id === "PREMIUM" && <IoDiamondOutline />}
              {cat.id === "FREE" && <IoCheckmarkCircleOutline />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="tb-search-wrap">
          <IoSearchOutline />
          <input
            type="text"
            aria-label={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="tb-search-input"
          />
        </div>
      </section>

      {/* Content Grid */}
      {loading ? (
        <SkeletonTable rows={4} columns={4} />
      ) : error ? (
        <div className="tb-empty" role="status"><p>{error}</p><button type="button" className="inv-secondary-btn" onClick={() => setRevision(value => value + 1)}>{lang === "en" ? "Try again" : "សាកម្តងទៀត"}</button></div>
      ) : filteredTemplates.length === 0 ? (
        <div className="tb-empty">
          <h3>{t("emptyTitle")}</h3>
          <p style={{ margin: "8px 0 0", fontSize: "0.875rem" }}>
            {t("emptyDesc")}
          </p>
        </div>
      ) : (
        <section className="tb-grid">
          {filteredTemplates.map((template) => (
            <article key={template.id} className="tb-card">
              {/* Media Preview */}
              <div className="tb-card-media">
                <div className="tb-card-badges">
                  {isPremium(template) && isUnlocked(template) ? (
                    <span className="tb-badge tb-badge--unlocked">
                      {lang === "en" ? "Purchased" : "បានទិញរួច"}
                    </span>
                  ) : (
                    <span className={`tb-badge tb-badge--${isPremium(template) ? "premium" : "free"}`}>
                      {isPremium(template) ? (lang === "en" ? "Premium" : "ប្រណិត") : (lang === "en" ? "Free" : "ឥតគិតថ្លៃ")}
                    </span>
                  )}
                  {template.category && (
                    <span className="tb-badge tb-badge--cat">{categoryLabel(template)}</span>
                  )}
                </div>

                {template.thumbnailUrl ? (
                  <img className="tb-card-thumb" {...publicTemplateImage(template.thumbnailUrl)} alt={template.name} loading="lazy" />
                ) : (
                  <div className="tb-card-empty-thumb">
                    <IoImageOutline style={{ fontSize: "2.4rem" }} />
                    <span style={{ fontSize: "0.75rem" }}>{t("fallbackCard")}</span>
                  </div>
                )}
              </div>

              {/* Body Info */}
              <div className="tb-card-body">
                <h3 className="tb-card-title">{template.name}</h3>
                {template.description && (
                  <p className="tb-card-desc">{formatTemplateDescription(template.description)}</p>
                )}

                {/* Actions */}
                <div className="tb-card-actions">
                  <button
                    type="button"
                    onClick={() => handleSelect(template)}
                    className="tb-btn tb-btn--primary"
                  >
                    {isPremium(template) && !isUnlocked(template) ? (
                      <>
                        <IoDiamondOutline />
                        <span>{template.checkoutEligible && templatePriceLabel(template, lang)
                          ? `${lang === "en" ? "Buy design" : "ទិញគំរូ"} (${templatePriceLabel(template, lang)})`
                          : (lang === "en" ? "View pricing — price unavailable" : "មើលតម្លៃ — មិនមានតម្លៃគំរូ")}</span>
                      </>
                    ) : (
                      <>
                        <IoAddOutline />
                        <span>{lang === "en" ? "Use Template" : "ជ្រើសរើស"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreview(template)}
                    className="tb-btn tb-btn--preview"
                    title={t("previewTitle")}
                  >
                    <IoEyeOutline />
                    <span>{lang === "en" ? "Preview" : "មើលគំរូ"}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
