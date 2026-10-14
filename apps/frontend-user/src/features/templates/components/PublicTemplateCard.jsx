import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { templateUsePath, templatePriceLabel } from "../model/templateIdentity";

export default function PublicTemplateCard({ template, lang, isAuthenticated, categoryLabel, priority = false }) {
  const [broken, setBroken] = useState(false);
  const copy = (km, en) => lang === "en" ? en : km;
  const demo = `/templates/${encodeURIComponent(template.identity)}`;
  const price = templatePriceLabel(template, lang);
  return (
    <article className="kp-design-card tp-card" data-template={template.identity}>
      <Link to={demo} className="kp-design-media" aria-label={`${broken || !template.image ? copy("រូបភាពគំរូមិនមាន។ ", "Preview image unavailable. ") : ""}${copy("មើលគំរូ", "Preview design")} ${template.name}`}>
        {template.image && !broken ? <img loading={priority ? "eager" : "lazy"} decoding="async" src={template.image} width="720" height="1080" alt={template.name} onError={() => setBroken(true)} /> : <span className="kp-design-placeholder"><ImageOff size={32} aria-hidden="true" />{copy("រូបភាពគំរូមិនមាន", "Preview image unavailable")}</span>}
        <span className="kp-design-preview">{copy("មើលគំរូ", "Preview design")}<ArrowUpRight size={18} aria-hidden="true" /></span>
      </Link>
      <div className="kp-design-body"><p className="kp-design-category">{categoryLabel}</p><h3>{template.name}</h3><p className="kp-design-description">{template.description}</p><p className="kp-design-access">{!template.live ? copy("គំរូបង្ហាញ · ពិនិត្យសិទ្ធិពេលជ្រើសរើស", "Demo design · Availability checked on selection") : template.isPremium ? `${copy("ប្រណិត · តម្រូវឱ្យមានសិទ្ធិ", "Premium · Access required")}${price ? ` · ${price}` : ` · ${copy("មើលតម្លៃ", "View pricing")}`}` : copy("គំរូឥតគិតថ្លៃ", "Free design")}</p><div className="kp-design-actions"><Link to={templateUsePath(template.identity, isAuthenticated)}>{copy("ប្រើគំរូនេះ", "Use design")}<ArrowUpRight size={16} aria-hidden="true" /></Link><Link to={demo}>{copy("មើលគំរូ", "Preview")}</Link></div></div>
    </article>
  );
}
