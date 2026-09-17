import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
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
import "./BrowseTemplatesPage.css";
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
  const [templates, setTemplates] = useState([]);
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
      .list()
      .then((items) => {
        if (active) {
          setTemplates(items || []);
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
  }, [t]);

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

  const isPremium = useCallback((tpl) => Boolean(tpl?.premium || tpl?.isPremium || Number(tpl?.price) > 0), []);
  const isUnlocked = useCallback((tpl) => !isPremium(tpl) || paidIds.has(String(tpl.id)) || paidIds.has(String(tpl.slug)), [isPremium, paidIds]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const prem = isPremium(tpl);
      // Category filter
      if (activeCategory === "PAID") return prem && isUnlocked(tpl);
      if (activeCategory === "FREE" && prem) return false;
      if (activeCategory === "PREMIUM" && !prem) return false;
      if (
        !["ALL", "PAID", "FREE", "PREMIUM"].includes(activeCategory) &&
        String(tpl.category || "").toUpperCase() !== activeCategory
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = String(tpl.name || "").toLowerCase().includes(query);
        const descMatch = String(formatTemplateDescription(tpl.description) || "").toLowerCase().includes(query);
        const catMatch = String(tpl.category || "").toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [templates, activeCategory, searchQuery, isPremium, isUnlocked]);

  const stats = useMemo(() => {
    const total = templates.length;
    const free = templates.filter((t) => !isPremium(t)).length;
    const premium = templates.filter((t) => isPremium(t)).length;
    return { total, free, premium };
  }, [templates, isPremium]);

  const handleSelect = (template) => {
    const prem = isPremium(template);
    const unlocked = isUnlocked(template);

    if (prem && !unlocked) {
      navigate(`/templates/${template.slug || template.code || template.id}/checkout`);
      return;
    }

    navigate(`/create/wedding?templateId=${template.id || template.slug || ""}`);
  };

  const handlePreview = (template) => {
    const tplId = template.id || template.slug || "cover-khmer-golden-wedding";
    if (template.previewUrl) {
      if (template.previewUrl.startsWith("/")) {
        navigate(template.previewUrl);
      } else {
        window.open(template.previewUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    navigate(`/templates/browse/${tplId}`);
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
        <div className="tb-empty">{error}</div>
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
                    <span className="tb-badge tb-badge-unlocked" style={{ background: "rgba(21, 128, 61, 0.92)", color: "#fff", backdropFilter: "blur(6px)" }}>
                      ✓ បានទិញរួច
                    </span>
                  ) : (
                    <span className={`tb-badge ${isPremium(template) ? "tb-badge-paid" : "tb-badge-free"}`}>
                      {isPremium(template) ? "Premium" : "Free"}
                    </span>
                  )}
                  {template.category && (
                    <span className="tb-badge tb-badge-cat">{template.category}</span>
                  )}
                </div>

                {template.thumbnailUrl ? (
                  <img src={template.thumbnailUrl} alt={template.name} loading="lazy" />
                ) : (
                  <div style={{ color: "var(--brand-text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <IoImageOutline style={{ fontSize: "2rem" }} />
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
                    className={`tb-btn-select ${isPremium(template) && !isUnlocked(template) ? "tb-btn-buy" : ""}`}
                  >
                    {isPremium(template) && !isUnlocked(template) ? (
                      <>
                        <IoDiamondOutline style={{ fontSize: "1.1rem" }} />
                        <span>ទិញគំរូ ({Number(template.price) > 0 ? `$${Number(template.price).toFixed(2)}` : "$0.01"})</span>
                      </>
                    ) : (
                      <>
                        <IoAddOutline style={{ fontSize: "1.1rem" }} />
                        <span>{t("selectBtn")}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreview(template)}
                    className="tb-btn-preview"
                    title={t("previewTitle")}
                  >
                    <IoEyeOutline style={{ fontSize: "1.1rem" }} />
                    <span>{t("previewBtn")}</span>
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
