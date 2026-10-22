import { SearchInput } from "@/shared/ui";
import { SlidersHorizontal, X } from "lucide-react";

export default function GuestFilters({
  search, setSearch, groupFilter, setGroupFilter, categoryFilter, setCategoryFilter,
  groups, categories, onClear, t,
}) {
  return (
    <div className="guest-filters">
      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch("")}
        placeholder={t("searchPlaceholder")}
        ariaLabel={t("searchPlaceholder")}
      />
      <div className="guest-filter-selects">
        <SlidersHorizontal size={17} aria-hidden="true" />
        <label className="guest-filter-field">
          <span className="guest-sr-only">{t("fieldGroup")}</span>
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
            <option value="">{t("allGroups")}</option>
            {groups.map((group) => <option key={group.id} value={group.name}>{group.name}</option>)}
          </select>
        </label>
        <label className="guest-filter-field">
          <span className="guest-sr-only">{t("fieldCategory")}</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
          </select>
        </label>
        {(search || groupFilter || categoryFilter) && (
          <button className="guest-text-button" type="button" onClick={onClear}>
            <X size={15} aria-hidden="true" /> {t("clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}
