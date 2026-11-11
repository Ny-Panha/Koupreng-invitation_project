# Architecture and UI inventory

| Boundary | Current source | Classification / audit action |
|---|---|---|
| Customer root and route factory | `apps/frontend-user/src/main.jsx`, `app/App.jsx`, `app/router.jsx`, `app/routes/{builder,marketing,auth,host}Routes.jsx` | KEEP + VERIFY; 111 leaves through route factory test; lazy pages and auth guards remain separate. |
| Admin root and route factory | `apps/frontend-admin/src/main.jsx`, `app/App.jsx`, `app/routes.js` | KEEP + VERIFY; 24 leaves, including `/admin` aliases and full-screen template editor. |
| Management shells and tokens | User `layouts/{Marketing,Auth,Host}Shell`, `shared/styles/semantic-tokens.css`; admin `layouts/AdminLayout`, `styles/index.css` | KEEP + VERIFY; shared semantic foundation, distinct invitation themes. Check actual rendered token pairings. |
| Form/dialog/navigation primitives | User `shared/ui/Modal.jsx`, `FormField`, `RouteLoadingSkeleton`, `RouteErrorBoundary`, `ToastContainer`; host nav and feedback host | KEEP + VERIFY focus, loading, field description and error recovery. No second focus manager is justified by source. |
| Admin Studio | `features/templates/AdminTemplateEditFeature.jsx`, `TemplateStudio.css`, `components/{StudioPanelResize,StudioPreviewFrame}.jsx` | KEEP + VERIFY serialization, preview origin, panel states, mobile and desktop. |
| Renderer and authored preview | User `features/templates/registry/templateRegistry.js`, `experience/TemplateExperience.jsx`, individual `layouts/*` | KEEP + VERIFY every family and shared fallback; dynamic active templates arrive through catalog API. |
| Data and trust | Backend `auth`, `event`, `invitation`, `guest`, `rsvp`, `payment`, `entitlement`, `media`, `admin` API modules; MySQL migrations; Telegram worker | API and authorization are server boundaries. A browser fixture cannot certify writes, settlement, access revocation or migration correctness. |

The current manifests list React 19.3.1, Vite 8.3.5, Tailwind 4.3.3 and React Router 7.18.2 for both frontends. User additionally lists Zustand and Framer Motion; admin lists dnd-kit. Fonts are declared in user `assets/fonts/fonts.css`, `shared/fonts/core-fonts.css` and template-specific styles. A source search found 48 migration files; application and migration checksums were not changed. Existing local documentation describes further implementation phases, but feature state is checked against the current source rather than inferred from folder names.

**Cross-cutting component ledger:** status, field, modal, feedback, table/card, preview, upload, media, navigation, chart/export, motion, and theme primitives each need state and responsive verification in their owning phase. Source existence is recorded here; exhaustive variants, duplicate lookalikes and live behavior remain **UNVERIFIED**. Deletion candidates cannot be established from visual similarity alone.
