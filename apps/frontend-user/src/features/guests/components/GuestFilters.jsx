import { Link } from "react-router-dom";
import {
  IoCloudUploadOutline,
  IoDownloadOutline,
  IoQrCodeOutline,
  IoSettingsOutline,
  IoPersonAddOutline,
} from "react-icons/io5";
import { SearchInput } from "@/shared/ui";

export default function GuestFilters({
  search,
  setSearch,
  groupFilter,
  setGroupFilter,
  categoryFilter,
  setCategoryFilter,
  groups,
  categories,
  onOpenAddGuest,
  onOpenImport,
  onExportCsv,
  onOpenGroupManager,
  onOpenCategoryManager,
  t,
}) {
  const exportLabel = (t && t("exportBtn") && t("exportBtn") !== "exportBtn")
    ? t("exportBtn")
    : "ទាញយក CSV";

  const addGuestLabel = (t && t("addGuestBtn")) ? t("addGuestBtn") : "+ បន្ថែមភ្ញៀវ";
  const importLabel = (t && t("importBtn")) ? t("importBtn") : "នាំចូល";

  return (
    <div className="pe-toolbar">
      {/* Search and Filters Section */}
      <div className="pe-filters">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder={t ? t("searchPlaceholder") : "ស្វែងរកឈ្មោះ ក្រុម លេខទូរស័ព្ទ..."}
        />

        <div className="pe-select-wrap">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="pe-filter-select"
            aria-label="Filter by group"
          >
            <option value="">{t ? t("allGroups") : "គ្រប់ក្រុមទាំងអស់"}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="pe-manage-icon-btn"
            onClick={onOpenGroupManager}
            title={t ? t("manageGroups") : "គ្រប់គ្រងក្រុម"}
            aria-label={t ? t("manageGroups") : "គ្រប់គ្រងក្រុម"}
          >
            <IoSettingsOutline aria-hidden="true" />
          </button>
        </div>

        <div className="pe-select-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pe-filter-select"
            aria-label="Filter by category"
          >
            <option value="">{t ? t("allCategories") : "គ្រប់ប្រភេទទាំងអស់"}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="pe-manage-icon-btn"
            onClick={onOpenCategoryManager}
            title={t ? t("manageCategories") : "គ្រប់គ្រងប្រភេទ"}
            aria-label={t ? t("manageCategories") : "គ្រប់គ្រងប្រភេទ"}
          >
            <IoSettingsOutline aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pe-actions">
        {onOpenAddGuest && (
          <button
            type="button"
            className="pe-primary-add-btn"
            onClick={onOpenAddGuest}
            aria-label={addGuestLabel}
          >
            <IoPersonAddOutline aria-hidden="true" />
            <span>{addGuestLabel}</span>
          </button>
        )}

        <Link
          to="/dashboard/check-in"
          className="pe-secondary-btn"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
          title="ស្កេន QR Code Check-in ភ្ញៀវពេលមកដល់"
        >
          <IoQrCodeOutline aria-hidden="true" />
          <span>ស្កេន Check-in</span>
        </Link>

        <button
          type="button"
          className="pe-secondary-btn"
          onClick={onExportCsv}
          title={exportLabel}
        >
          <IoDownloadOutline aria-hidden="true" />
          <span>{exportLabel}</span>
        </button>

        <button type="button" className="pe-secondary-btn" onClick={onOpenImport}>
          <IoCloudUploadOutline aria-hidden="true" />
          <span>{importLabel}</span>
        </button>
      </div>
    </div>
  );
}
