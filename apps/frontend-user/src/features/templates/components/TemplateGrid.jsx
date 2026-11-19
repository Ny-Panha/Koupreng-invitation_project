import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, ArrowUpRight, Search, SearchX, X } from "lucide-react";
import { TEMPLATES } from "../data/templatesData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "../../../stores/useLanguageStore";
import { usePublicTemplateCatalog } from "../hooks/usePublicTemplateCatalog";
import { presentTemplate } from "../model/templatePresentation";
import PublicTemplateCard from "./PublicTemplateCard";
import { FEATURED_TEMPLATE_CODES as FEATURED, matchesTemplateSearch } from "../model/catalogPolicy";
import { EmptyState } from "@/shared/ui/vendor";
import "./templates.css";

export default function TemplateGrid({ featured = false }) {
  const { isAuthenticated } = useAuth();
  const lang = useLanguageStore((state) => state.lang);
  const { items, status, retry } = usePublicTemplateCatalog(lang);
  const [category, setCategory] = useState("all");
  const [pricePreference, setPricePreference] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const copy = (km, en) => (lang === "en" ? en : km);
  const categories = {
    ancient: copy("ប្រពៃណីខ្មែរ", "Khmer tradition"),
    modern: copy("ទំនើប", "Modern"),
    contemporary: copy("សហសម័យ", "Contemporary"),
    luxury: copy("ប្រណិត", "Luxury"),
    minimalist: copy("សាមញ្ញ", "Minimalist"),
    floral: copy("ផ្កា", "Floral"),
    other: copy("រចនាបទផ្សេងៗ", "Other designs"),
  };
  const source = status === "error" ? TEMPLATES.filter((item) => FEATURED.includes(item.id)) : items;
  const presented = source.map((item) => presentTemplate(item, lang, status === "ready"));
  const sorted = [...presented].sort((a, b) => {
    const rank = (tpl) => {
      const index = FEATURED.indexOf(tpl.identity);
      return index < 0 ? FEATURED.length : index;
    };
    return rank(a) - rank(b);
  });
  const baseFiltered = presented.filter(
    (tpl) =>
      (category === "all" || category === tpl.category) &&
      (pricePreference === "all" ||
        (pricePreference === "free" && !tpl.isPremium && tpl.live) ||
        (pricePreference === "premium" && tpl.isPremium)) &&
      matchesTemplateSearch(tpl, search)
  );

  const sortedList = [...baseFiltered].sort((a, b) => {
    if (sortBy === "name-asc") {
      return (a.name || "").localeCompare(b.name || "", lang === "km" ? "km" : "en");
    }
    if (sortBy === "name-desc") {
      return (b.name || "").localeCompare(a.name || "", lang === "km" ? "km" : "en");
    }
    return 0;
  });

  const filtered = featured
    ? sorted.filter((tpl) => FEATURED.includes(tpl.identity)).slice(0, 3)
    : sortedList;

  const hasActiveFilters = category !== "all" || pricePreference !== "all" || Boolean(search.trim()) || sortBy !== "default";

  const clearAllFilters = () => {
    setCategory("all");
    setPricePreference("all");
    setSearch("");
    setSortBy("default");
  };

  const content = (
    <>
      {!featured && (
        <div className="tp-catalog-controls" role="group" aria-label={copy("ប្រភេទគំរូ", "Template categories")}>
          <div className="tp-category-buttons">
            {[["all", copy("ទាំងអស់", "All")], ...Object.entries(categories).filter(([key]) => presented.some((tpl) => tpl.category === key))].map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={category === key}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="tp-controls-subrow">
            <div className="tp-price-filter-row" role="group" aria-label={copy("តម្លៃគំរូ", "Price filter")}>
              <span className="tp-filter-label">{copy("តម្លៃ", "Price")}:</span>
              {[
                ["all", copy("ទាំងអស់", "All")],
                ["free", copy("ឥតគិតថ្លៃ", "Free")],
                ["premium", copy("ប្រណីត", "Premium")],
              ].map(([val, label]) => (
                <button
                  type="button"
                  key={val}
                  className={`tp-price-pill ${pricePreference === val ? "is-active" : ""}`}
                  aria-pressed={pricePreference === val}
                  onClick={() => setPricePreference(val)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="tp-sort-wrap">
              <label htmlFor="tp-sort-select" className="tp-filter-label">
                <ArrowUpDown size={14} aria-hidden="true" />
                <span>{copy("តម្រៀបតាម", "Sort by")}:</span>
              </label>
              <select
                id="tp-sort-select"
                className="tp-sort-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label={copy("តម្រៀបគំរូសន្លឹកការ", "Sort invitation designs")}
              >
                <option value="default">{copy("លំនាំដើម", "Curated order")}</option>
                <option value="name-asc">{copy("ឈ្មោះ (A–Z)", "Name (A–Z)")}</option>
                <option value="name-desc">{copy("ឈ្មោះ (Z–A)", "Name (Z–A)")}</option>
              </select>
            </div>

            <div className="kp-catalog-search-wrap">
              <label className="kp-catalog-search">
                <Search size={16} aria-hidden="true" className="kp-catalog-search-icon" />
                <span className="sr-only">{copy("ស្វែងរកគំរូ", "Search designs")}</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={copy("ឈ្មោះ ឬរចនាបទ…", "Search name or style…")}
                  aria-label={copy("ស្វែងរកគំរូសន្លឹកការ", "Search invitation designs")}
                />
              </label>
              {search && (
                <button
                  type="button"
                  className="kp-search-clear-btn"
                  onClick={() => setSearch("")}
                  aria-label={copy("សម្អាតការស្វែងរក", "Clear search")}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="tp-results-bar">
            <span role="status" className="tp-results-count">
              {copy(`បង្ហាញ ${filtered.length} គំរូ`, `Showing ${filtered.length} designs`)}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                className="tp-reset-filters-btn"
                onClick={clearAllFilters}
              >
                {copy("កំណត់តម្រងឡើងវិញ", "Reset filters")}
              </button>
            )}
          </div>
        </div>
      )}
      {status === "loading" && (
        <>
          <p role="status" className="tp-catalog-status">
            {copy("កំពុងផ្ទុកគំរូសន្លឹកការ…", "Loading the invitation collection…")}
          </p>
          <div className="kp-design-grid" aria-hidden="true">
            {[1, 2, 3].map((key) => (
              <div key={key} className="kp-design-skeleton" />
            ))}
          </div>
        </>
      )}
      {status === "error" && (
        <p role="status" className="tp-catalog-status">
          {copy(
            "មិនអាចផ្ទុកគំរូពីម៉ាស៊ីនមេបាន។ ខាងក្រោមជាគំរូបង្ហាញប៉ុណ្ណោះ។ សិទ្ធិ និងតម្លៃត្រូវពិនិត្យពេលជ្រើសរើស។",
            "The live collection is unavailable. These are demo designs; availability and price must be checked when you select one."
          )}{" "}
          <button type="button" onClick={retry}>
            {copy("សាកម្ដងទៀត", "Try again")}
          </button>
        </p>
      )}
      {status !== "loading" && filtered.length === 0 && (
        <EmptyState
          icon={SearchX}
          headline={
            items.length === 0 && status === "ready"
              ? copy("មិនទាន់មានគំរូក្នុងបញ្ជីនេះទេ", "There are no designs in the collection yet.")
              : copy("មិនមានគំរូត្រូវនឹងការជ្រើសរើសនេះទេ", "No designs match this selection")
          }
          description={
            items.length === 0 && status === "ready"
              ? copy("សូមពិនិត្យម្ដងទៀតនៅពេលក្រោយ។", "Please check back later for new wedding themes.")
              : copy(
                  "សាកជ្រើសរើសប្រភេទផ្សេង ឬសម្អាតការស្វែងរក។",
                  "Try another category or clear your search to explore other designs."
                )
          }
          primaryAction={
            hasActiveFilters ? (
              <button
                type="button"
                className="kp-button"
                onClick={clearAllFilters}
              >
                {copy("សម្អាតតម្រង", "Clear filters")}
              </button>
            ) : undefined
          }
        />
      )}
      {status !== "loading" && (
        <div className="kp-design-grid tp-grid">
          {filtered.map((tpl, index) => (
            <PublicTemplateCard
              key={tpl.identity}
              template={tpl}
              lang={lang}
              isAuthenticated={isAuthenticated}
              categoryLabel={categories[tpl.category] || categories.other}
              compact={featured}
              priority={!featured && index === 0}
            />
          ))}
        </div>
      )}
    </>
  );
  if (featured)
    return (
      <section className="kp-collection kp-section" aria-labelledby="kp-collection-title">
        <div className="kp-section-heading">
          <div>
            <p className="kp-eyebrow">{copy("គំរូសន្លឹកការប្រណីត", "Curated invitation designs")}</p>
            <h2 id="kp-collection-title">
              {copy("ជ្រើសរើសគំរូដែលសាកសមនឹងថ្ងៃពិសេស", "Curated designs for your wedding day")}
            </h2>
          </div>
          <Link to="/templates" className="kp-text-link">
            {copy("មើលគំរូទាំងអស់", "Explore the collection")}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {content}
      </section>
    );
  return (
    <div className="tp-page kp-public-catalog">
      <div className="tp-container">
        <header className="tp-header-section">
          <p className="kp-eyebrow">{copy("គំរូសន្លឹកការប្រណិត", "The invitation collection")}</p>
          <h1 className="tp-title">{copy("រចនាបទដែលជារបស់អ្នក។", "A design that feels like you.")}</h1>
          <div className="tp-divider" aria-hidden="true">
            <span className="tp-line" />
            <span className="tp-diamond" />
            <span className="tp-line" />
          </div>
          <p>
            {copy(
              "មើលគំរូពេញលេញ រួចជ្រើសរើសគំរូសម្រាប់ថ្ងៃពិសេសរបស់អ្នក។",
              "Preview the complete invitation, then choose a design for your celebration."
            )}
          </p>
        </header>
        {content}
      </div>
    </div>
  );
}
