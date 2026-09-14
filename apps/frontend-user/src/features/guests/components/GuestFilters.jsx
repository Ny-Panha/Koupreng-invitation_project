import { Link } from "react-router-dom";
import { IoAdd, IoCloudUploadOutline, IoDownloadOutline, IoQrCodeOutline, IoSettingsOutline } from "react-icons/io5";
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
  onOpenCreate,
  onOpenImport,
  onExportCsv,
  onOpenGroupManager,
  onOpenCategoryManager,
  t,
}) {
  return (
    <div className="pe-toolbar">
      <div className="pe-filters">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder={t ? t("searchPlaceholder") : "ស្វែងរកឈ្មោះ ក្រុម លេខ..."}
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

      <div className="pe-actions">
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
          title={t ? t("exportBtn") : "ទាញយកបញ្ជីភ្ញៀវជា Excel/CSV"}
        >
          <IoDownloadOutline aria-hidden="true" />
          <span>{t ? t("exportBtn") : "ទាញយក CSV"}</span>
        </button>
        <button type="button" className="pe-secondary-btn" onClick={onOpenImport}>
          <IoCloudUploadOutline aria-hidden="true" />
          <span>{t ? t("importBtn") : "នាំចូល"}</span>
        </button>
        <button type="button" className="pe-primary-btn" onClick={onOpenCreate}>
          <IoAdd aria-hidden="true" />
          <span>{t ? t("addGuestBtn") : "បន្ថែមភ្ញៀវ"}</span>
        </button>
      </div>
    </div>
  );
}
