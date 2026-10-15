# Marketing V6 audit — 2026-10-15

## Repository and scope

The initial worktree was clean on `main`, HEAD
`966821717ec8de1f6250c05b95a235f52b8344f8` (`feat(reports): add print preview,
print report, and PDF export across user and admin portals`). HEAD has advanced
from the approved V5 reference `1bd91f15950b197d85d5449b62c9660e52daf5b6`.
Initial status, staged diff and unstaged diff were empty. The reports commit is
preserved. No backend, admin, reports, budget, payment, authentication or
entitlement implementation was edited.

V6 was verified as local, uncommitted work. No push, PR or deployment had been
performed at that audit snapshot. The user subsequently authorized committing
and pushing V6 to `main`; deployment remains outside scope. V4/V5
reports, capture scripts and evidence remain intact. New browser evidence is
under `output/playwright/marketing-v6/`, covered by existing ignore rules.

Read the V5 audit/implementation, V4 art direction, existing asset provenance,
current source and V5 capture/measurement scripts before implementation. The
approved native Khmer wording and existing visual composition are retained.

## Route and component map

| Area | Current responsibility / V6 boundary |
| --- | --- |
| `main.jsx`, `App.jsx`, providers | Vite client-rendered SPA; session initialization, template registry, shared toast/support. No hydration assumed. |
| `router.jsx`, `routes/*`, `lazyRoutePages.js` | Existing lazy route pages and common Suspense fallback. Home remains eager. Host shell and invitation redirects now load only on matching protected routes. |
| `MarketingShell`, Header/Footer | One semantic public shell; local language state, native mobile dialog, active navigation and focus handling. |
| `HomeFeature`, LandingHero/Photo | Concise CTA, preloaded responsive portrait, manual folio. Escape and close now restore the initiating control's focus. |
| `TemplateGrid`, PublicTemplateCard | Featured collection immediately after Hero; server catalog, explicit demo/error/empty states, preview/use distinction. Exact local image URLs get derivatives. |
| `templatePresentation`, `templateIdentity` | Server identifiers, premium state and valid currency/amount formatting retained. Numeric IDs alone cannot select local artwork. |
| `/templates/:id`, browse/login/editor | Existing lazy demo and protected handoff; template code survives login and resolves to server editor ID. |
| `/pricing` | Anonymous explanation without package API calls; authenticated offers preserve USD/KHR and missing-price states. |
| `/contact` | Existing bounded fields, validation, double-submit guard, retained draft, 429/error and SMTP_ACCEPTED-only acknowledgement. All test submissions mocked. |
| RouteFontLoader / RouteMotion / SupportWidget | Public routes avoid legacy external font sheets and animation engine; legacy behavior remains available on other routes. |

## Diagnosis and priority decisions

1. **Critical JS / render delay:** the hero resource completed about 0.8–1.1s
   before its LCP paint. The entry eagerly included HostNav, management message
   dictionaries, invitation redirect/storage modules and unused shared UI/CSS.
   Source-map inspection confirmed their presence. Move the two host boundaries
   to React.lazy, use a direct ToastContainer import and read language directly
   in TemplateGrid, whose copy already lives inline. This removes an unused
   i18n request/effect and the management dictionary without changing copy.
2. **Gallery transfer:** two exact local fixture URLs sent 667,795 + 1,064,977
   bytes after LCP. Generate smaller aspect-preserving WebP candidates and select
   by painted area/DPR. Preserve original files, crops, lazy loading and all
   unknown server/upload URLs. No guessed CDN transformations.
3. **Keyboard continuity:** V5 could focus the full-demo link on opening but
   provided no Escape dismissal. Track the actual opener for both controls;
   return focus on close/Escape and retain inert closed content.
4. **Keep the measured hero/font path:** the preload and rendered hero already
   chose one matching 480w candidate at DPR1. Do not change image dimensions,
   observer, content visibility or approved typography to improve a score.
   Full Khmer fonts stay intact; no unproven subsetting or glyph removal.

The remaining mobile Khmer miss is documented in the performance report.
Retained template data, React/router startup, Khmer layout and font contention
remain candidates for a separate measured experiment. No blanket lazy-loading,
registry refactor, replacement font, artificial placeholder delay or new library
was introduced.

## Applied skills

The repository ROUTER and SKILLS_INDEX were consulted. Three skills were active:

| Skill | Concrete application |
| --- | --- |
| `vercel-react-best-practices` (primary) | Conditional route boundaries and direct imports; verified excluded eager modules using production source maps and browser request assertions. |
| `performance-optimization` | Measure → diagnose → change → repeat with the same cold-run conditions; retain the unsuccessful mobile result and distributions. |
| `playwright` | Existing repository Playwright runner, controlled API fixtures, real Chromium screenshots, keyboard/touch checks and traces. |

No StyleSeed artifact was applied: this task retains the existing marketing
composition. No dashboard grammar, new design system or new analytics dependency
was imposed.
