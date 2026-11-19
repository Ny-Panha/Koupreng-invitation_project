# Chapter 05 — Public Template Discovery, Search, Filter & Sort Audit

## 1. Search Behavior & Bilingual Recovery (C09-002 Repair)

- **Search Capabilities:** Live filtering against title, slug, code, category, description, and style.
- **Defect Identified (C09-002):** In `catalogPolicy.js`, `matchesTemplateSearch` originally indexed `descriptionKm` and `descriptionEn`, but omitted `nameKm` and `nameEn`. When a bilingual user searched using Khmer characters while the English UI was active, the search returned zero results.
- **Repair:** Codex added `template.nameKm` and `template.nameEn` to `matchesTemplateSearch`. Verified in `Phase09CodexAuditRegression.test.jsx` (test N09-01).

## 2. Filter & Sort Mechanics

- **Category Chips:** Accessible button chips with `aria-pressed` states (Khmer tradition, Modern, Contemporary, Luxury, Minimalist, Floral, Other).
- **Price Preference:** Filter by All, Free, or Premium. Null or missing prices are never classified as Free.
- **Sorting:** Deterministic sorting supporting Curated (default), Name (A-Z), and Name (Z-A). Duplicate and empty names do not drop catalog items.
- **Results Announcement:** Accessible `role="status"` live region announces total matching designs (`Showing X designs` / `បង្ហាញ X គំរូ`).
- **Reset Action:** `.tp-reset-filters-btn` appears when filters are active, resetting all facets in a single click.
