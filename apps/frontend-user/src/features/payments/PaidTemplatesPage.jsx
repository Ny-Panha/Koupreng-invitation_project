import { CardGridSkeleton } from '@/shared/ui/LoadingState';
import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoDiamondOutline,
  IoSparkles,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoCalendarOutline,
  IoColorPaletteOutline,
  IoEyeOutline,
  IoAddCircleOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
} from "react-icons/io5";

import { paymentService } from "./paymentService";
import { getTemplateById, KEEP_TEMPLATE_CODE } from "../templates/data/templatesData";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import "./PaymentPages.css";

export default function PaidTemplatesPage() {
  const uiCopy = useUiCopy();
  const [templates, setTemplates] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    paymentService
      .paidTemplates()
      .then((data) => {
        if (active) {
          setTemplates(data || []);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Could not load paid templates");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    templateCatalogService
      .list()
      .then((items) => {
        if (active && Array.isArray(items)) {
          setCatalog(items);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div role="main" className="dash-main paid-templates-page">
      <div className="paid-templates-container">
        {/* Breadcrumb Navigation */}
        <nav className="paid-breadcrumb">
          <Link to="/dashboard" className="paid-breadcrumb-link">
            <IoHomeOutline />
            <span>{uiCopy("ផ្ទាំងគ្រប់គ្រង", "Dashboard")}</span>
          </Link>
          <IoChevronForwardOutline className="paid-breadcrumb-sep" />
          <span className="paid-breadcrumb-active">{uiCopy("គំរូដែលបានទិញ", "Purchased templates")}</span>
        </nav>

        {/* Page Header */}
        <header className="paid-header-banner">
          <div className="paid-header-info">
            <div className="paid-header-tag">
              <IoDiamondOutline />
              <span>{uiCopy("សិទ្ធិប្រើប្រាស់បុព្វលាភជារៀងរហូត", "PREMIUM LIFETIME ACCESS")}</span>
            </div>
            <h1 className="paid-header-title">
              {uiCopy("គំរូធៀបការ", "Invitation templates")} <span className="gold-text">{uiCopy("បានទិញរួច", "Purchased")}</span>
              {templates.length > 0 && (
                <span className="paid-count-badge">{templates.length} {uiCopy("គំរូ", "templates")}</span>
              )}
            </h1>
            <p className="paid-header-desc">
              {uiCopy("បញ្ជីគំរូបុព្វលាភដែលអ្នកបានទូទាត់ប្រាក់ជោគជ័យ។ អ្នកអាចជ្រើសរើសដើម្បីចាប់ផ្តើមបង្កើតធៀបការមង្គលការបានគ្រប់ពេលវេលា។", "Your purchased premium templates. Choose one to start creating an invitation at any time.")}
            </p>
          </div>

          <div className="paid-header-actions">
            <Link to="/templates/browse" className="paid-btn-browse">
              <IoAddCircleOutline />
              <span>{uiCopy("ស្វែងរកគំរូថ្មីៗ", "Browse new templates")}</span>
            </Link>
          </div>
        </header>

        {/* Loading State */}
        {loading && <CardGridSkeleton variant="template" />}

        {/* Error Alert */}
        {error && (
          <div className="paid-alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Empty State with Suggested Templates */}
        {!loading && templates.length === 0 && (
          <div className="paid-empty-wrap">
            <section className="paid-empty-state">
              <div className="paid-empty-icon">
                <IoColorPaletteOutline />
              </div>
              <h2 className="paid-empty-title">{uiCopy("មិនទាន់មានគំរូដែលបានទិញនៅឡើយទេ", "No purchased templates yet")}</h2>
              <p className="paid-empty-desc">
                {uiCopy("លោកអ្នកមិនទាន់មានគំរូបុព្វលាភណាមួយឡើយ។ លោកអ្នកអាចជ្រើសរើស", "You have no premium templates yet. Choose a")} <strong>{uiCopy("គំរូឥតគិតថ្លៃ", "free template")}</strong> {uiCopy("ដើម្បីចាប់ផ្តើមបង្កើតធៀបការភ្លាមៗ ឬជ្រើសរើសទិញ", "to create your invitation immediately, or purchase a")} <strong>{uiCopy("គំរូបុព្វលាភ", "premium template")}</strong> {uiCopy("ខាងក្រោម៖", "below:")}
              </p>
              <Link to="/templates/browse" className="paid-empty-btn">
                <IoSparkles /> {uiCopy("មើលគំរូទាំងអស់", "Browse all templates")}
              </Link>
            </section>

            {/* Suggested Templates to Start Immediately */}
            {catalog.length > 0 && (
              <div style={{ marginTop: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-text, #1e293b)" }}>
                      {uiCopy("✨ គំរូធៀបការណែនាំសម្រាប់អ្នក", "✨ Suggested invitation templates")}
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--brand-text-muted, #7a8799)" }}>
                      {uiCopy("ជ្រើសរើសគំរូឥតគិតថ្លៃ ឬគំរូបុព្វលាភដើម្បីចាប់ផ្តើម", "Choose a free or premium template to get started")}
                    </p>
                  </div>
                  <Link to="/templates/browse" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--brand-primary, #b98b42)", textDecoration: "none" }}>
                    {uiCopy("មើលគំរូទាំងអស់ →", "Browse all templates →")}
                  </Link>
                </div>

                <div className="paid-grid">
                  {catalog.slice(0, 4).map((item) => {
                    const isPrem = Boolean(item.premium || item.isPremium || Number(item.price) > 0);
                    return (
                      <article className="paid-card-item" key={item.id}>
                        <div className="paid-card-media">
                          <img src={item.thumbnailUrl || "/facebook/all/03-card/cover-card.jpg"} alt={item.name} className="paid-card-img" />
                          <div className="paid-card-badge-row">
                            <span className={isPrem ? "paid-badge-type" : "paid-badge-unlocked"}>
                              {isPrem ? "PREMIUM" : "FREE"}
                            </span>
                            {item.category && (
                              <span className="paid-badge-type">{item.category}</span>
                            )}
                          </div>
                        </div>

                        <div className="paid-card-body">
                          <span className="paid-card-cat">{item.category || "Wedding"}</span>
                          <h3 className="paid-card-title">{item.name}</h3>

                          <div className="paid-card-actions" style={{ marginTop: "auto", paddingTop: "12px" }}>
                            {isPrem ? (
                              <Link
                                to={`/templates/${item.slug || item.id}/checkout`}
                                className="paid-btn-use"
                                style={{ background: "linear-gradient(135deg, #b98b42 0%, #8f6424 100%)" }}
                              >
                                <IoDiamondOutline />
                                <span>{uiCopy("ទិញគំរូ ($", "Buy template ($")}{Number(item.price || 0.01).toFixed(2)})</span>
                              </Link>
                            ) : (
                              <Link
                                to="/templates/browse"
                                className="paid-btn-use"
                              >
                                <IoSparkles />
                                <span>{uiCopy("ប្រើគំរូឥតគិតថ្លៃ", "Use free template")}</span>
                              </Link>
                            )}

                            <Link
                              to={`/templates/browse/${item.id || item.slug || ""}`}
                              className="paid-btn-preview"
                              title={uiCopy("មើលគំរូផ្ទាល់", "Preview template")}
                            >
                              <IoEyeOutline />
                              <span>{uiCopy("មើល", "View")}</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid of Unlocked Templates */}
        {!loading && templates.length > 0 && (
          <div className="paid-grid">
            {templates.map((item) => {
              const targetCode =
                item.templateId || item.templateCode || item.templateSlug || KEEP_TEMPLATE_CODE;
              const meta = getTemplateById(targetCode);
              const displayName =
                item.templateName || meta?.name || meta?.style || "Garden Royal Khmer Wedding";
              const coverImg =
                meta?.mainImage || meta?.image || "/facebook/all/03-card/cover-card.jpg";
              const category = meta?.category === "ancient" ? uiCopy("បុរាណ", "Traditional") : uiCopy("ទំនើប", "Modern");

              return (
                <article className="paid-card-item" key={`${item.templateId}-${item.createdAt}`}>
                  {/* Thumbnail Banner */}
                  <div className="paid-card-media">
                    <img src={coverImg} alt={displayName} className="paid-card-img" />
                    <div className="paid-card-badge-row">
                      <span className="paid-badge-unlocked">
                        <IoCheckmarkCircle /> {uiCopy("មានសិទ្ធិប្រើប្រាស់", "UNLOCKED")}
                      </span>
                      <span className="paid-badge-type">
                        {item.accessType || "LIFETIME"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="paid-card-body">
                    <span className="paid-card-cat">{category}</span>
                    <h3 className="paid-card-title">{displayName}</h3>

                    <div className="paid-card-meta">
                      {item.createdAt && (
                        <div className="paid-meta-row">
                          <IoCalendarOutline />
                          <span>{uiCopy("ទិញនៅ៖", "Purchased:")} {new Date(item.createdAt).toLocaleDateString(uiCopy("km-KH", "en-US"))}</span>
                        </div>
                      )}
                      <div className="paid-meta-row">
                        <IoDiamondOutline />
                        <span>{uiCopy("សិទ្ធិប្រើប្រាស់ពេញលេញ មិនកំណត់ចំនួនភ្ញៀវ", "Full access with unlimited guests")}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="paid-card-actions">
                      <Link
                                to="/templates/browse"
                        className="paid-btn-use"
                      >
                        <IoSparkles />
                        <span>{uiCopy("បង្កើតធៀបការ", "Use template")}</span>
                        <IoArrowForwardOutline />
                      </Link>

                      <Link
                        to={`/templates/${targetCode}`}
                        className="paid-btn-preview"
                        title={uiCopy("មើលគំរូផ្ទាល់", "Preview template")}
                      >
                        <IoEyeOutline />
                        <span>{uiCopy("មើលគំរូ", "Preview")}</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
