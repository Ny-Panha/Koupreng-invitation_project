# 02 — component and usage inventory

The reproducible [register](evidence/component-register.md) covers 36 JSX modules plus ten named exports from `AdminUI.jsx` (46 rows). [JSON](evidence/component-register.json) includes textual source-use candidates; these are **candidates**, not an exhaustive resolved import graph, especially for barrel imports. The 135-route ledger tracks direct known consumer groups and marks unverified families explicitly.

| Family | Current source and representative consumer | Phase 04 disposition |
|---|---|---|
| C1 actions/links | User `LoadingButton.jsx` → organization create and assistant; admin `ActionButton` in `AdminUI.jsx` → dashboard, templates, reports | ADOPT bounded busy/type/theme behavior; other links KEEP/DEFER |
| C2 fields | User `FormField.jsx` → organization create, assistant; `SearchInput.jsx` → guest/RSVP filtering; admin `DatePicker.jsx`, `TimePicker.jsx` → Studio | ADOPT field/search theme and focus styles; specialized controls DEFER |
| C3 overlays | User `Modal.jsx`, `ConfirmDialog.jsx` → organizations and management; admin layout dialogs | KEEP tested stack/focus; drawer/popover audit DEFER |
| C4 nav/selection | Admin `FilterTabs`, user `AnimatedTabs`, shell navigation | KEEP current consumers; `FilterTabs` has no source consumer and needs keyboard contract before adoption |
| C5 data | User `ResponsiveTable.jsx` → organization members, guests, delivery; admin `StatCard` → templates/packages; `DataTable` has no found consumer | ADOPT region and table/metric theme; DEFER unused DataTable |
| C6 feedback | User `ToastContainer.jsx`, `StatusBadge.jsx`; admin `Toast.jsx`, `StatusBadge` → admin templates/payments | ADOPT persistent admin errors and scoped management status theme; other feedback KEEP/DEFER |
| C7 media | User `MediaImage.jsx`, creator media tools | KEEP specialized safety boundary; upload/progress audit DEFER |
| C8 metric/report/print | Admin `StatCard`, `AnimatedNumber`, report actions/exports | ADOPT metric surface; report/print semantics KEEP, broad audit DEFER |
| C9 Studio chrome | Admin template editor, resize and preview controls | KEEP existing protocol and switching; source capture and browser test only |

No new vendor component was installed. The existing `docs/design/THIRD_PARTY_UI_LICENSES.md` ledger remains authoritative for previously adapted components. Visual similarity alone did not justify adding a dependency.
