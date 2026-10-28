import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TEMPLATES } from "../data/templatesData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "../../../stores/useLanguageStore";
import { usePublicTemplateCatalog } from "../hooks/usePublicTemplateCatalog";
import { presentTemplate } from "../model/templatePresentation";
import PublicTemplateCard from "./PublicTemplateCard";
import { FEATURED_TEMPLATE_CODES as FEATURED, matchesTemplateSearch } from "../model/catalogPolicy";
import "./templates.css";


export default function TemplateGrid({ featured = false }) {
  const { isAuthenticated } = useAuth();
  const lang = useLanguageStore((state) => state.lang);
  const { items, status, retry } = usePublicTemplateCatalog(lang);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const copy = (km, en) => lang === "en" ? en : km;
  const categories = {
    ancient: copy("ប្រពៃណីខ្មែរ", "Khmer tradition"), modern: copy("ទំនើប", "Modern"),
    contemporary: copy("សហសម័យ", "Contemporary"), luxury: copy("ប្រណិត", "Luxury"),
    minimalist: copy("សាមញ្ញ", "Minimalist"), floral: copy("ផ្កា", "Floral"), other: copy("រចនាបទផ្សេងៗ", "Other designs"),
  };
  const source = status === "error" ? TEMPLATES.filter((item) => FEATURED.includes(item.id)) : items;
  const presented = source.map((item) => presentTemplate(item, lang, status === "ready"));
  const sorted = [...presented].sort((a, b) => {
    const rank = (tpl) => { const index = FEATURED.indexOf(tpl.identity); return index < 0 ? FEATURED.length : index; };
    return rank(a) - rank(b);
  });
  const filtered = featured ? sorted.filter((tpl) => FEATURED.includes(tpl.identity)).slice(0, 3) : presented.filter((tpl) =>
    (category === "all" || category === tpl.category) &&
    matchesTemplateSearch(tpl, search)
  );
  const content = (
    <>
      {!featured && <div className="tp-catalog-controls" role="group" aria-label={copy("ប្រភេទគំរូ", "Template categories")}>
        {[["all", copy("ទាំងអស់", "All")], ...Object.entries(categories).filter(([key]) => presented.some((tpl) => tpl.category === key))].map(([key, label]) => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}
        <label className="kp-catalog-search"><span>{copy("ស្វែងរកគំរូ", "Search designs")}</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy("ឈ្មោះ ឬរចនាបទ", "Name or design style")} /></label>
      </div>}
      {status === "loading" && <><p role="status" className="tp-catalog-status">{copy("កំពុងផ្ទុកគំរូសន្លឹកការ…", "Loading the invitation collection…")}</p><div className="kp-design-grid" aria-hidden="true">{[1, 2, 3].map((key) => <div key={key} className="kp-design-skeleton" />)}</div></>}
      {status === "error" && <p role="status" className="tp-catalog-status">{copy("មិនអាចផ្ទុកគំរូពីម៉ាស៊ីនមេបាន។ ខាងក្រោមជាគំរូបង្ហាញប៉ុណ្ណោះ។ សិទ្ធិ និងតម្លៃត្រូវពិនិត្យពេលជ្រើសរើស។", "The live collection is unavailable. These are demo designs; availability and price must be checked when you select one.")} <button type="button" onClick={retry}>{copy("សាកម្ដងទៀត", "Try again")}</button></p>}
      {status !== "loading" && filtered.length === 0 && <p role="status" className="tp-catalog-status">{items.length === 0 && status === "ready" ? copy("មិនទាន់មានគំរូក្នុងបញ្ជីនេះទេ។ សូមពិនិត្យម្ដងទៀតនៅពេលក្រោយ។", "There are no designs in the collection yet. Please check back later.") : copy("មិនមានគំរូត្រូវនឹងការជ្រើសរើសនេះទេ។ សាកជ្រើសរើសប្រភេទផ្សេង ឬស្វែងរកម្ដងទៀត។", "No designs match this selection. Try another category or search.")}</p>}
      {status !== "loading" && <div className="kp-design-grid tp-grid">{filtered.map((tpl, index) => <PublicTemplateCard key={tpl.identity} template={tpl} lang={lang} isAuthenticated={isAuthenticated} categoryLabel={categories[tpl.category] || categories.other} compact={featured} priority={!featured && index === 0} />)}</div>}
    </>
  );
  if (featured) return (
    <section className="kp-collection kp-section" aria-labelledby="kp-collection-title">
      <div className="kp-section-heading">
        <div>
          <p className="kp-eyebrow">{copy("គំរូសន្លឹកការប្រណីត", "Curated invitation designs")}</p>
          <h2 id="kp-collection-title">{copy("ជ្រើសរើសគំរូដែលសាកសមនឹងថ្ងៃពិសេស", "Curated designs for your wedding day")}</h2>
        </div>
        <Link to="/templates" className="kp-text-link">{copy("មើលគំរូទាំងអស់", "Explore the collection")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
      {content}
    </section>
  );
  return <div className="tp-page kp-public-catalog"><div className="tp-container"><header className="tp-header-section"><p className="kp-eyebrow">{copy("គំរូសន្លឹកការ", "The invitation collection")}</p><h1 className="tp-title">{copy("រចនាបទដែលជារបស់អ្នក។", "A design that feels like you.")}</h1><p>{copy("មើលគំរូពេញលេញ រួចជ្រើសរើសគំរូសម្រាប់ថ្ងៃពិសេសរបស់អ្នក។", "Preview the complete invitation, then choose a design for your celebration.")}</p></header>{content}</div></div>;
}
