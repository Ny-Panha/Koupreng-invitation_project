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
    <div className="dash-main paid-templates-page">
      <div className="paid-templates-container">
        {/* Breadcrumb Navigation */}
        <nav className="paid-breadcrumb">
          <Link to="/dashboard" className="paid-breadcrumb-link">
            <IoHomeOutline />
            <span>ផ្ទាំងគ្រប់គ្រង</span>
          </Link>
          <IoChevronForwardOutline className="paid-breadcrumb-sep" />
          <span className="paid-breadcrumb-active">គំរូដែលបានទិញ</span>
        </nav>

        {/* Page Header */}
        <header className="paid-header-banner">
          <div className="paid-header-info">
            <div className="paid-header-tag">
              <IoDiamondOutline />
              <span>PREMIUM LIFETIME ACCESS</span>
            </div>
            <h1 className="paid-header-title">
              គំរូធៀបការ <span className="gold-text">បានទិញរួច</span>
              {templates.length > 0 && (
                <span className="paid-count-badge">{templates.length} គំរូ</span>
              )}
            </h1>
            <p className="paid-header-desc">
              បញ្ជីគំរូ Premium ដែលអ្នកបានទូទាត់ប្រាក់ជោគជ័យ។ អ្នកអាចជ្រើសរើសដើម្បីចាប់ផ្តើមបង្កើតធៀបការមង្គលការបានគ្រប់ពេលវេលា។
            </p>
          </div>

          <div className="paid-header-actions">
            <Link to="/templates/browse" className="paid-btn-browse">
              <IoAddCircleOutline />
              <span>ស្វែងរកគំរូថ្មីៗ</span>
            </Link>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="paid-loading-card">
            <span className="checkout-spinner"></span>
            <p>កំពុងទាញយកបញ្ជីគំរូដែលបានទិញ...</p>
          </div>
        )}

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
              <h2 className="paid-empty-title">មិនទាន់មានគំរូដែលបានទិញនៅឡើយទេ</h2>
              <p className="paid-empty-desc">
                លោកអ្នកមិនទាន់មានគំរូ Premium ណាមួយឡើយ។ លោកអ្នកអាចជ្រើសរើស <strong>គំរូឥតគិតថ្លៃ (Free)</strong> ដើម្បីចាប់ផ្តើមបង្កើតធៀបការភ្លាមៗ ឬជ្រើសរើសទិញ <strong>គំរូ Premium</strong> ខាងក្រោម៖
              </p>
              <Link to="/templates/browse" className="paid-empty-btn">
                <IoSparkles /> មើលគំរូទាំងអស់ក្នុង Catalog (Browse All)
              </Link>
            </section>

            {/* Suggested Templates to Start Immediately */}
            {catalog.length > 0 && (
              <div style={{ marginTop: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-text, #1e293b)" }}>
                      ✨ គំរូធៀបការណែនាំសម្រាប់អ្នក (Suggested Templates)
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--brand-text-muted, #7a8799)" }}>
                      ជ្រើសរើសគំរូឥតគិតថ្លៃ (Free) ឬគំរូ Premium ដើម្បីចាប់ផ្តើម
                    </p>
                  </div>
                  <Link to="/templates/browse" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--brand-primary, #b98b42)", textDecoration: "none" }}>
                    មើលទាំងអស់ក្នុង Catalog →
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
                                <span>ទិញគំរូ (${Number(item.price || 0.01).toFixed(2)})</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/create/wedding?templateId=${item.id || item.slug || ""}`}
                                className="paid-btn-use"
                              >
                                <IoSparkles />
                                <span>ប្រើគំរូឥតគិតថ្លៃ (Free)</span>
                              </Link>
                            )}

                            <Link
                              to={`/templates/browse/${item.id || item.slug || ""}`}
                              className="paid-btn-preview"
                              title="មើលគំរូផ្ទាល់"
                            >
                              <IoEyeOutline />
                              <span>មើល</span>
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
              const category = meta?.category === "ancient" ? "បុរាណ / Ancient" : "ទំនើប / Modern";

              return (
                <article className="paid-card-item" key={`${item.templateId}-${item.createdAt}`}>
                  {/* Thumbnail Banner */}
                  <div className="paid-card-media">
                    <img src={coverImg} alt={displayName} className="paid-card-img" />
                    <div className="paid-card-badge-row">
                      <span className="paid-badge-unlocked">
                        <IoCheckmarkCircle /> UNLOCKED
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
                          <span>ទិញនៅ៖ {new Date(item.createdAt).toLocaleDateString("km-KH")}</span>
                        </div>
                      )}
                      <div className="paid-meta-row">
                        <IoDiamondOutline />
                        <span>សិទ្ធិប្រើប្រាស់ពេញលេញ (Unlimited Guests)</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="paid-card-actions">
                      <Link
                        to={`/create/wedding?template=${targetCode}`}
                        className="paid-btn-use"
                      >
                        <IoSparkles />
                        <span>បង្កើតធៀបការ (Use Template)</span>
                        <IoArrowForwardOutline />
                      </Link>

                      <Link
                        to={`/templates/${targetCode}/demo`}
                        className="paid-btn-preview"
                        title="មើលគំរូផ្ទាល់"
                      >
                        <IoEyeOutline />
                        <span>មើលគំរូ</span>
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
