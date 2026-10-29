import { useLanguageStore } from "@/stores/useLanguageStore";
import { guestOptionLabel } from "../model/guestLabels";
import { SearchInput } from "@/shared/ui";
import { ChevronDown, X } from "lucide-react";

export default function GuestFilters({
  search, setSearch, groupFilter, setGroupFilter, categoryFilter, setCategoryFilter,
  groups, categories, onClear, t,
}) {
  const lang = useLanguageStore(state => state.lang);
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
        <label className="guest-filter-field">
          <span className="guest-filter-caption">{t("fieldGroup")}</span>
          <span className="guest-filter-control">
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
            <option value="">{t("allGroups")}</option>
            {groups.map((group) => <option key={group.id} value={group.name}>{guestOptionLabel(group.name, lang)}</option>)}
          </select>
          <ChevronDown size={15} aria-hidden="true" /></span>
        </label>
        <label className="guest-filter-field">
          <span className="guest-filter-caption">{t("fieldCategory")}</span>
          <span className="guest-filter-control">
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => <option key={category.id} value={category.name}>{guestOptionLabel(category.name, lang)}</option>)}
          </select>
          <ChevronDown size={15} aria-hidden="true" /></span>
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
