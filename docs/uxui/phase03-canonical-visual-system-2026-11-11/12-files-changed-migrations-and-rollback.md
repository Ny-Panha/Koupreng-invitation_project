# Changed files, compatibility and rollback

| File | Intent |
|---|---|
| `apps/frontend-user/src/shared/styles/semantic-tokens.css` | Canonical management role taxonomy and dark selector |
| `apps/frontend-admin/src/styles/application-tokens.css` | Generated exact mirror, committed with source |
| `apps/frontend-user/src/shared/styles/app-experience.css` | `--app-*` alias mapping for owner/marketing chrome |
| `apps/frontend-user/src/styles/index.css` | Marketing public aliases to role palette |
| `apps/frontend-user/src/features/auth/AuthPage.css` | Auth surface, field, CTA, error, dark and contrast fixes |
| `apps/frontend-user/src/shared/styles/semanticTokens.test.js` | Sync/contrast regression for new roles |
| `apps/frontend-admin/src/styles/index.css` | Tailwind alias map, local font faces, legacy warning bridge, card mapping |
| `apps/frontend-admin/src/features/templates/TemplateStudio.css` | Dark Studio chrome roles, no iframe/theme rewrite |
| `apps/frontend-admin/public/fonts/management/` | Existing DM Sans WOFF2 + matching OFL license copied for admin UI |
| `docs/uxui/phase03-canonical-visual-system-2026-11-11/` | Reference and reproducible local evidence harness |

No Flyway migration, backend file, API contract, route factory, auth guard, payment status, template renderer, serialized invitation data, licensed template asset or provider integration changed. The 48 historical Flyway migrations remain untouched. Builds and screenshots are ignored local outputs; no generated `dist` file is intended for commit.

Rollback a deployed Phase 03 change by reverting its commit(s) on `main` through the normal Git history, rebuilding both isolated apps, and running `node scripts/sync-design-tokens.cjs --check` plus focused route/theme tests. Do not hand-edit only the generated admin mirror; the source and mirror must roll back together. Existing `--ui-*`, `--app-*`, `--kp-*`, `--ws-*` names are kept for compatibility so component migrations can proceed by owner phase. Before rollback, check whether later phases have begun depending on `--ui-theme-*` roles.
