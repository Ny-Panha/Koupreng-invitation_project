# Cinematic landing audit — 14 October 2026

Baseline HEAD: `b694dac7a7c5e1f6d212ac3d31f5729006eeefb2`. Working tree was clean.
Scope: public marketing, shared marketing navigation/footer, and demonstrated template handoff defects.

## Discovery and intended edits

| Files inspected | Baseline / intended change |
| --- | --- |
| `pages/marketing/HomePage.jsx`, `features/marketing/HomeFeature.jsx` | One H1, static Silk preview, benefits, three steps, pricing link, two FAQs, nested footer. Keep page route; split narrative into focused components. |
| `features/marketing/MarketingFeature.css` | Mostly obsolete SaaS selectors; active home styles also live in JSX. Replace home-only stylesheet with scoped styles. Preserve separately referenced pricing/contact styles. |
| `layouts/MarketingShell.jsx`, `layouts/components/Header.jsx`, `Footer.jsx` | Two footers confirmed in both languages. Header has Escape/scroll locking but no focus trap or return. Language choices rely on hover; `langEn` is visibly untranslated. Use native modal drawer, explicit language controls, one shared bilingual footer. |
| `app/routes/marketingRoutes.jsx`, `hostRoutes.jsx` | `/`, `/templates`, `/pricing`, `/contact`, `/venues`; standalone `/templates/:id` demos; protected `/templates/browse`, `/templates/browse/:id`, `/templates/:templateId/checkout`, `/dashboard/invitations/design`. Preserve all routes. |
| `templates/components/TemplateGrid.jsx`, `templates.css` | Live catalog service, real retry, category chips and selected-template login query already exist. Offline designs falsely labeled free; premium flag becomes an unsupported popular badge; some covers duplicate. Share presentation and improve accurate states, localization, media fallback, and touch affordances. |
| `templates/pages/BrowseTemplatesFeature.jsx` | Selection query exists. Premium price fallback is `$0.01`; preview prefers numeric ID. Use server currency/price or pricing route; prefer code/slug for preview. Preserve paid access logic. |
| `templates/pages/TemplateDemoFeature.jsx`, `experience/TemplateExperience.jsx` | Public demo remains accessible; numeric route fallback and exact server identity need careful precedence. Keep runtime lazy and out of home. |
| `experience/components/sections/TemplateRsvp.jsx` | Demo-only form invites submission and its link says Send RSVP. Clearly mark demonstration; accurate create action; disabled RSVP when no use link. Published RSVP is injected as children and remains intact. |
| `registry/templateRegistry.js`, `data/templatesData.js`, `api/templateCatalogApi.js` | Dedicated layouts already lazy. Registry prefers explicit identity/preset before numeric aliases. Celestial sample has December 32; other sample dates disagree with machine date. Correct static dates and add data regression. Catalog service remains authoritative. |
| `invitations/LivePhoneSimulator.jsx` | Editor preview depends on full template engine and trusted preview messaging. Do not put it on landing critical path. |
| `shared/hooks/usePrefersReducedMotion.js`, `shared/ui/ScrollReveal.jsx` | Motion preference hook exists; old ScrollReveal hides content initially and lacks reduced-motion handling. Use readable CSS entrance/reveal in marketing scope. |
| `shared/animations/SiteAnimations.jsx` | Global section observer hides below-fold content and includes a blocking intro/grid. Exclude homepage from global effects; landing owns its finite motion. |
| `styles/index.css`, `assets/fonts/fonts.css` | Separate brand/wedding tokens; fonts.css globally requests Google fonts. Add marketing-only aliases and reuse locally licensed Silk fonts with distinct family names. Management token values remain intact. |
| `index.html`, `shared/ui/ChatBot.jsx` | Dependency audit found a global pinch-zoom lock and an automatic greeting covering the mobile hero. Remove the viewport zoom restriction; suppress only the homepage automatic greeting, keeping support usable. |
| `.styleseed/*`, `docs/STYLESEED.md` | Lock is explicitly an authenticated operations-console grammar. Preserve lock; public expressive wedding scope follows premium UX and brief. |
| `tests/e2e/*`, existing template/auth/payment tests | Existing smoke and published Silk RSVP coverage. Add marketing, offline recovery, navigation, premium price and query regression coverage. |

Baseline breakpoints: header 1024/768/560; gallery 1024/768/600; old home 960/900/600/560. New marketing composition will use 1100/900/600 with fluid typography.

Baseline production build passed (`npm run build`, Vite 8.3.0). Home JS 15,125 bytes / gzip 4,499; CSS 14,141 / gzip 3,345. Entry JS 553,615 / gzip 165,317. Decorative background 2,520,889 bytes; logo 384,504. Existing warnings: >500 kB entry and unresolved cover-bg path.

Before screenshots: `output/playwright/cinematic/before-{km,en}-{1440,390}.png`, taken with explicit offline API responses. Below-fold headings are hidden by existing global reveal observer in the full-page screenshot, a real baseline defect.

## Reference and provenance notes

Read [GoEvent](https://goevent.online/) public text: value proposition, template previews, three-step explanation, pricing clarity. [Bandith](https://bandithcardstore.com/) returned no extractable page text; no interactive competitor audit claimed. No competitor content or media reused.

Existing Silk photographs, woven SVG, and local OFL fonts have provenance in `template-asset-licenses.md`. New linework/envelope is original CSS/SVG; no image download, font download, runtime dependency, or API key is required. Khmer copy still needs native editorial review before release.
