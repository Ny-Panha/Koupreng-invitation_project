# របាយការណ៍ការអនុវត្ត Koupreng Cinematic Landing

ថ្ងៃ៖ 14 October 2026។ Baseline HEAD៖ `b694dac7a7c5e1f6d212ac3d31f5729006eeefb2`។
ការផ្លាស់ប្តូរនៅក្នុង working tree សម្រាប់ពិនិត្យ។ មិនបាន commit, push, បង្កើត PR ឬ deploy ទេ។

## 1. Audit Summary

Working tree ដើមស្អាត។ ព័ត៌មានលម្អិត និង file-by-file intent នៅក្នុង `docs/frontend/user/cinematic-landing-audit.md`។
Catalog cache, retry, category controls, query-selected template និង lazy template layouts មានស្រាប់ ហើយត្រូវបានរក្សាទុក។
បានបញ្ជាក់ និងកែ duplicate footer, demo RSVP ដែលបង្ហាញដូចការផ្ញើពិត, តម្លៃ `$0.01` ដែលមិនមែនទិន្នន័យម៉ាស៊ីនមេ,
ថ្ងៃខែគំរូមិនត្រឹមត្រូវ, host demo ដែលបាត់ការជ្រើសរើស និង mobile focus wrap។

បានអាន [GoEvent](https://goevent.online/) ជា public text ដើម្បីសិក្សាការបង្ហាញតម្លៃផលិតផល និងលំដាប់ជំហាន។
[Bandith](https://bandithcardstore.com/) មិនផ្តល់អត្ថបទដែលអាចអានបានក្នុងការទាញយកនោះទេ។ មិនបានអះអាងថាបានសាកល្បង competitor interactions និងមិនបានចម្លង assets/content/layout ទេ។

## 2. Design Decisions

Public marketing ប្រើ ivory `#FCF8F2`, emerald `#3D554A`, dark emerald `#233B32`,
wedding gold aliases (`#C8A35F` សម្រាប់តុបតែង និង `#6F4D24` សម្រាប់អត្ថបទ), ink `#21180F`, muted `#605A52`។
Tokens ថ្មីស្ថិតក្នុង `.kp-marketing-shell`; dashboard/admin token values មិនត្រូវបានប្តូរទេ។

បានប្រើ local OFL Kantumruy Pro និង Cormorant Garamond ដែលមានស្រាប់។ Khmer headings ប្រើ Khmer UI font
ជាមួយ line-height 1.6–1.85 និងគ្មាន artificial letter spacing។ English display ប្រើ editorial serif។
Hero មាន staged CSS entrances, SVG line draw, manual folio opening, preview stages និង finite CSS view timelines។
Reduced motion រក្សាព័ត៌មានទាំងអស់។ Homepage មិនប្រើ global intro overlay, pointer grid ឬ section hiding ទៀតទេ។

រូបថត Silk Heritage និង SVG មាន provenance ក្នុង `docs/frontend/user/template-asset-licenses.md`។
គ្មានរូបភាពប្រកួតប្រជែង, font download, runtime dependency ថ្មី ឬ API key។ Axe-core ត្រូវបានដំឡើងតែក្នុង ignored QA output directory។

## 3. Implemented Components

Path ខាងក្រោមទាក់ទងនឹង repository root។

| Files | ការផ្លាស់ប្តូរ |
| --- | --- |
| `apps/frontend-user/src/features/marketing/HomeFeature.jsx` | Section composition, bilingual copy, one H1; inner footer និង inline stylesheet ត្រូវបានដកចេញ។ |
| `apps/frontend-user/src/features/marketing/components/LandingHero.jsx` | Silk portrait, open/close preview, valid demo/create routes, sample data។ |
| `apps/frontend-user/src/features/marketing/components/InvitationShowcase.jsx` | Three manual preview stages និង live announcement; ច្បាស់ថាជារូបគំរូបង្ហាញ។ |
| `apps/frontend-user/src/features/marketing/components/LandingStory.jsx` | Three steps, benefits និង photograph/paper narrative។ |
| `apps/frontend-user/src/features/marketing/components/LandingConversion.jsx` | Authoritative pricing link, five FAQs, final CTA។ |
| `apps/frontend-user/src/features/marketing/components/LandingPhoto.jsx` | Hero media failure fallback។ |
| `apps/frontend-user/src/features/marketing/MarketingFeature.css` | Scoped responsive layout និង finite motion; replaced home stylesheet ដែលភាគច្រើនមិនប្រើ។ |
| `apps/frontend-user/src/layouts/MarketingShell.jsx` | Marketing scope, language attribute, skip-link destination, one footer។ |
| `apps/frontend-user/src/layouts/components/Header.jsx` | Shared nav, explicit language buttons, native modal + Tab wrap/Escape/focus return/scroll cleanup។ |
| `apps/frontend-user/src/layouts/components/Footer.jsx` | Shared bilingual navigation/contact footer និង dynamic year។ |
| `apps/frontend-user/src/layouts/components/MarketingChrome.css` | Local fonts និង public chrome; mobile footer typography។ |
| `apps/frontend-user/src/styles/index.css` | Marketing-only semantic aliases។ |
| `apps/frontend-user/src/features/templates/components/TemplateGrid.jsx` | Shared live/featured gallery, search/category controls, loading/empty/error/retry។ |
| `apps/frontend-user/src/features/templates/components/PublicTemplateCard.jsx` | Public card with always-visible preview/use actions, access labels, server currency and media fallback។ |
| `apps/frontend-user/src/features/templates/components/templates.css` | Scoped card styles, stable media aspect ratios, touch affordances។ |
| `apps/frontend-user/src/features/templates/hooks/usePublicTemplateCatalog.js` | Locale-aware public catalog load and real retry។ |
| `apps/frontend-user/src/features/templates/model/templateIdentity.js` | Code/slug precedence, login selection path, truthful currency formatting។ |
| `apps/frontend-user/src/features/templates/model/templatePresentation.js` | Public metadata adapter; numeric IDs alone never select a static preset។ |
| `apps/frontend-user/src/features/templates/api/templateCatalogApi.js` | Reject malformed responses; keep valid empty inventory and existing cache contract។ |
| `apps/frontend-user/src/features/templates/data/templatesData.js` | Valid human dates consistent with machine dates in all static samples។ |
| `apps/frontend-user/src/features/templates/experience/components/sections/TemplateRsvp.jsx` | Demo disclosure, accurate create CTA, disabled unavailable submission។ |
| `apps/frontend-user/src/features/templates/pages/BrowseTemplatesFeature.jsx` | Missing-price recovery, explicit currency, code-first preview; existing entitlement behavior retained។ |
| `apps/frontend-user/src/features/templates/pages/TemplateDemoFeature.jsx` | Canonical identity through login/selected template query។ |
| `apps/frontend-user/src/features/templates/pages/HostTemplateDemoFeature.jsx` | Preserve selection from host demo និង translate primary labels។ |
| `apps/frontend-user/src/shared/animations/SiteAnimations.jsx` | Exclude homepage from global effects។ |
| `apps/frontend-user/src/shared/ui/ChatBot.jsx` | Homepage automatic greeting suppressed; support remains available។ |
| `apps/frontend-user/index.html` | Removed pinch-zoom restriction។ |
| `apps/frontend-user/scripts/measure-marketing.mjs` | Reproducible lab measurements, Axe audit, gradient contrast checks and screenshots។ |

Tests ថ្មី៖ `HomeFeature.test.jsx`, `model/templatePresentation.test.js`, `pages/BrowseTemplatesFeature.test.jsx`,
`experience/components/sections/TemplateRsvp.test.jsx` និង `tests/e2e/marketing-landing.spec.js`។
Tests ដែលបានកែតាម contract ថ្មី៖ `PublicControls.test.jsx`, `catalogCache.test.js`,
`layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx` និង `tests/e2e/critical-routes.spec.js`។
មិនបានដក tests ចេញ ឬបិទ lint rules ទេ។

## 4. UX Functional Fixes

- Public home មាន navigation និង footer តែមួយ។
- Demo RSVP មិនផ្ញើ ឬរក្សាទុកចម្លើយ; CTA គឺ “Create with this design”។ Published RSVP API failure/success និង token flow ត្រូវបានសាកល្បងក្នុង existing browser suite។
- Premium missing/invalid price ឬ currency នាំទៅ pricing។ តម្លៃមិនត្រូវបានបង្កើតឡើងដោយ UI ទេ; USD/KHR ត្រូវបានបង្ហាញតាម server currency។
- Public card → demo → login form → selected catalog → reload → correct editor ID → back បានសាកល្បង។ Locked premium នាំទៅ checkout; paid/free template នាំទៅ editor។
- Offline collection បង្ហាញ “demo designs”; live empty catalog មិនត្រូវបានជំនួសដោយគំរូលក់ទេ។ Malformed HTML response ចាត់ទុកជាបញ្ហា។
- Mobile drawer មាន Tab/Shift+Tab wrap, Escape, focus return, safe scroll restoration និង language control។
- Sample date regression checks ពិនិត្យ weekday/day/month/year ជាមួយ machine date សម្រាប់ static templates ទាំង 10។

## 5. QA Results

Commands ខាងក្រោមរត់ពី `apps/frontend-user` លើ Windows ក្នុង local environment។

| Command / check | លទ្ធផលពិត |
| --- | --- |
| `npm run lint` | PASS, exit 0។ |
| `npm test` | 87 files / 429 tests PASS, 41.90s។ |
| `npm run build` | PASS, final Vite 8.3.0 build 1.15s។ |
| `npm run test:e2e -- --workers=2` | 116 PASS, 2 SKIPPED, 0 FAIL; 1.9 min។ |
| `npm run test:e2e -- tests/e2e/marketing-landing.spec.js --workers=2` | 20 PASS; 28.1s។ |
| `npm test -- src/features/marketing/HomeFeature.test.jsx src/features/marketing/PublicControls.test.jsx` | Final semantic changes: 8 PASS; 1.51s។ |
| `node scripts/measure-marketing.mjs` + final `--a11y-only` rerun | Final audit PASS, exit 0។ |
| Root `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | 10/10 pinned + 6/6 custom skills verified; 0 missing/checksum errors។ |
| Root `python scripts/validate-agent-routing.py` | 58 skills, 46 local links; 0 failures។ Existing duplicate React skill-name notice។ |
| Root `git diff --check` | PASS។ |

Browser widths៖ **320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920**។
Both languages និង desktop/mobile Chromium projects។ One H1/footer, overflow, preview/FAQ, keyboard, retry,
slow response, image failures, login/checkout/editor selection និង reduced motion ត្រូវបានពិនិត្យ។
200% CSS zoom ត្រូវបានសាកល្បងជា browser-layout proxy; actual browser UI zoom/pinch នៅលើឧបករណ៍ពិតនៅសល់សម្រាប់ manual QA។
Homepage viewport tests មិនរកឃើញ uncaught page errors។

Axe-core **4.14.0**៖ 22 passing rule groups និង **0 automated violations** ក្នុង km/en × 390/1440។
Background gradient និង rotated/decorative content មួយចំនួនត្រូវការត្រួតពិនិត្យ color contrast ដោយឡែក។
Script ពិនិត្យ foreground against both gradient endpoints និង solid paper surfaces; minimum **7.13:1** សម្រាប់ text pairs ដែលបានពិនិត្យ។
នេះមិនមែនជាការបញ្ជាក់ WCAG certification ឬ screen-reader audit ពេញលេញទេ។

Lab performance៖ local production preview, fresh Chromium contexts, **4× CPU, 1.6 Mbps, 150ms latency**,
controlled catalog API; 3 runs ក្នុងមួយ viewport។

| Metric | 390px | 1440px |
| --- | --- | --- |
| Median LCP | 4.220s | 4.948s |
| Median CLS | 0.00130 | 0.04473 |
| Maximum sampled Event Timing | 32ms | 56ms |

**LCP ≤2.5s target មិនទាន់បានសម្រេចក្នុង throttled lab នេះទេ។**
Event Timing នេះមិនមែន field INP; field p75 CWV មិនមានក្នុង local environment។
Homepage requests មិនផ្ទុក `TemplateExperience`, `SilkHeritageLayout`, editor ឬ 2.52 MB decorative background ទេ។

| Build artifact | Before bytes / gzip | After bytes / gzip |
| --- | --- | --- |
| Home JS | 15,125 / 4,499 | 27,003 / 7,417 |
| Home CSS | 14,141 / 3,345 | 16,173 / 3,831 |
| Entry JS | 553,615 / 165,317 | 552,533 / 166,254 |

Gzip columns ត្រូវបានគណនាជាមួយ Node `gzipSync`។ Landing narrative និង shared gallery បន្ថែម JS; គ្មានការអះអាងថា JS bundle តូចជាងដើមទេ។
Final exact asset inventory និង per-run resource list ស្ថិតក្នុង `output/playwright/cinematic/measurements.json`។
Existing build warnings៖ >500 kB shared entry និង missing `/templates/cover-khmer-golden-wedding/cover-bg.svg` សម្រាប់ old template។
Existing Happy DOM warnings ពី blocked external fonts/maps បង្ហាញក្នុង unit logs; assertions ទាំងអស់ PASS។
Skipped tests ទាំង 2 គឺ optional live-local-backend Khmer Celestial checks ដែលមិនបាន enable។

## 6. Before / After

- Before៖ `output/playwright/cinematic/before-{km,en}-{390,1440}.png` (offline API baseline)។
- Final៖ `output/playwright/cinematic/final-{km,en}-{390,1440}.png` (controlled catalog fixtures; prices ជា test data)។
- Every-width hero captures៖ `after-{km,en}-<width>-{desktop,mobile}-chromium-hero.png` ក្នុង directory ដូចគ្នា។
- Raw evidence៖ `baseline.json`, `measurements.json`, `final-audit.log`។

បានមើល screenshots ពិត ដើម្បីពិនិត្យ Khmer mobile hero, open folio និង full English narrative។
Existing tracked Silk QA screenshots ដែលត្រូវបាន E2E overwrite ត្រូវបាន restore; new task captures រក្សាទុកក្នុង ignored output directory។

## 7. Remaining Risks / Manual QA

1. Shared entry, current logo/favicon payload និង global Google Fonts declarations នៅធំ; ត្រូវបន្ត performance work ដើម្បីឆ្ពោះទៅ LCP target។
2. Backend/bank settlement ពិតមិនត្រូវបានសាកល្បងក្នុងការងារនេះ។ Browser auth/catalog/payment cases ប្រើ controlled fixtures; server authorization មិនត្រូវបានប្តូរ។
3. Native Khmer copy review, VoiceOver/TalkBack, actual Android low-end, iOS Safari និង Telegram/Messenger webviews នៅសល់។
4. Recheck actual 200% browser zoom/pinch, long venue addresses, multiday programs និង arbitrary host font combinations ជាមួយ account/data ពិត។
5. Rights evidence សម្រាប់ older gallery/template assets និង existing music នៅសល់ពី project audit ដើម; new hero ប្រើ documented Silk assets។
6. Missing old cover-bg asset និង full public/host demo localization ក្រៅ landing scope ត្រូវបន្តដោះស្រាយ។

Manual workflow៖ បើក `/` និង `/templates` ទាំងពីរភាសា; សាក keyboard + drawer + stages + FAQ;
សាក catalog outage/retry; ជ្រើស free/paid/locked design តាម account ពិត;
បញ្ជាក់ editor identity, premium checkout និង published guest RSVP ដោយការអនុញ្ញាតក្នុង staging។
Production deployment ត្រូវការការអនុញ្ញាតពីម្ចាស់។

## 8. Suggested Next Sprint — GitHub ticket drafts

នេះជាសំណើ tickets តាមលំដាប់; មិនបានបង្កើត GitHub issues ដោយស្វ័យប្រវត្តិទេ។

| លំដាប់ | Ticket draft | Acceptance |
| --- | --- | --- |
| 1 | Improve marketing LCP and shared entry delivery | Profile entry graph, current logo/favicon/fonts; verify transfer compression and rerun cold-device metrics។ |
| 2 | Review Khmer marketing copy with native editor | Approve headings, FAQ, preview disclosures និង labels ទាំងអស់។ |
| 3 | Validate staging catalog/auth/premium handoff against real backend | Reload/back/login/free/paid/locked and missing-price flows use real authoritative data without purchasing automatically។ |
| 4 | Complete mobile webview and assistive-technology QA | Android/iOS, Telegram/Messenger, VoiceOver/TalkBack, actual zoom និង long/multiday content cases។ |
| 5 | Resolve older template asset licensing and missing cover media | Attach rights evidence; repair cover-bg and verify dynamic covers/font options។ |
| 6 | Measure production Core Web Vitals after authorized release | Collect field p75 LCP/INP/CLS; compare with documented lab limits and fix measured regressions។ |
