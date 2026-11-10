import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, ImageOff, Sparkles } from "lucide-react";
import { templateUsePath, templatePriceLabel } from "../model/templateIdentity";
import { publicTemplateImage } from "../model/publicTemplateImage";

export default function PublicTemplateCard({ template, lang, isAuthenticated, categoryLabel, priority = false, compact = false }) {
  const [broken, setBroken] = useState(false);
  const copy = (km, en) => lang === "en" ? en : km;
  const demo = `/templates/${encodeURIComponent(template.identity)}`;
  const price = templatePriceLabel(template, lang);
  const accessText = !template.live
    ? copy("គំរូបង្ហាញ · មើលគំរូប៉ុណ្ណោះ", "Demo design · Preview only")
    : template.isPremium
      ? `${copy("ប្រណីត", "Premium")} · ${price || copy("រួមបញ្ចូលក្នុងគម្រោង Premium", "Included with Premium access")}`
      : copy("គំរូឥតគិតថ្លៃ", "Free design");

  const badgeClass = !template.live ? "demo" : template.isPremium ? "premium" : "free";
  const badgeLabel = !template.live
    ? copy("គំរូបង្ហាញ", "Demo")
    : template.isPremium
      ? copy("ប្រណីត", "Premium")
      : copy("ឥតគិតថ្លៃ", "Free");

  return (
    <article className="kp-design-card tp-card" data-template={template.identity}>
      <Link
        to={demo}
        className="kp-design-media"
        aria-label={`${broken || !template.image ? copy("រូបភាពគំរូមិនមាន។ ", "Preview image unavailable. ") : ""}${copy("មើលគំរូ", "Preview design")} ${template.name}`}
      >
        <span className={`tp-card-badge tp-card-badge--${badgeClass}`} aria-hidden="true">
          {template.isPremium && <Sparkles size={12} aria-hidden="true" />}
          <span>{badgeLabel}</span>
        </span>
        {template.image && !broken ? (
          <img
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            {...publicTemplateImage(template.image, compact)}
            width="720"
            height="1080"
            alt={template.name}
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="kp-design-placeholder">
            <ImageOff size={32} aria-hidden="true" />
            {copy("រូបភាពគំរូមិនមាន", "Preview image unavailable")}
          </span>
        )}
        <span className="kp-design-preview">
          <Eye size={16} aria-hidden="true" />
          <span>{copy("មើលគំរូ", "Preview design")}</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </Link>
      <div className="kp-design-body">
        <div className="kp-design-meta-row">
          <p className="kp-design-category">{categoryLabel}</p>
          {template.languageMode && (
            <span className="tp-card-lang-tag">
              {template.languageMode === "BOTH" ? "KM + EN" : template.languageMode}
            </span>
          )}
        </div>
        <h3>{template.name}</h3>
        <p className="kp-design-description">{template.description}</p>
        <p className="kp-design-access">{accessText}</p>
        <div className="kp-design-actions">
          {template.live && (
            <Link to={templateUsePath(template.identity, isAuthenticated)} className="kp-action-use">
              <span>{copy("ប្រើគំរូនេះ", "Use design")}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
          <Link to={demo} className="kp-action-preview">
            <Eye size={14} aria-hidden="true" />
            <span>{copy("មើលគំរូ", "Preview")}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
