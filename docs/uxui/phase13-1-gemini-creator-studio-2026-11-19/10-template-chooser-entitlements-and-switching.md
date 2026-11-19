# 10 — Template Chooser, Entitlements, and Switching

## 1. TemplateChooser Modal
- Modal interface allowing users to preview and select from available templates.
- Enforces server-owned entitlement checks: premium designs require valid entitlements in `workspace.access.ownerFeatures`.
- Switching templates retains authored couple names, dates, custom photos, gallery images, and unknown JSON metadata.

## 2. Fallback Safety
- Catalog outage triggers graceful retry state without corrupting current draft.
- Unknown template codes fail closed to safe standard renderer.

See [Template Entitlements](evidence/template-entitlement-matrix.json) and [Modal Screenshot](evidence/screenshots/15-template-chooser-modal.png).
