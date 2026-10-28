# Royal Garden catalog visibility and chooser repair

Verified locally on 28 October 2026. Original investigation baseline: `842f4c4494b3c89afd6fa5ecfda64ace94f19c87`. The initial implementation was committed as `01e7a2f2`; this report also covers its verification and follow-up fixes. Production database state is unverified.

## Confirmed root cause

The local MySQL `templates` table had 12 records and **no record at all** with code `royal-garden-cinematic`, including inactive records. The real public API returned six ACTIVE records without Royal Garden. The dedicated preview resolved a static renderer by code and therefore worked independently of database registration.

The path was traced through `TemplateCatalogController` → `TemplateCatalogService` → `/api/v1/templates` → `templateCatalogService` → `registerDynamicTemplates` / `templateFromCatalogItem` → `TemplateGrid`, `BrowseTemplatesFeature`, and `InvitationForm`.

Three frontend behaviors amplified the missing registration:

- Landing-page featured codes omitted Royal Garden. The previous featured slice could also fill spaces with designs that were not explicitly featured.
- An empty registry fell back to static inventory, and Studio swallowed catalog failures. This could present an unavailable design as selectable, with static Free metadata.
- Studio's thumbnail priority favored a demonstration portrait over the actual backend catalog thumbnail. Its nested modal supplied a second header and close action, and its cards lacked separate preview and selection controls.

Admin create/update requests also lacked fields for supported event types and languages, although the domain and public response already supported them. Those fields now round-trip through the existing Admin API; older requests that omit them preserve existing associations.

## Database and business configuration

The user approved Premium-user access and explicit landing-page featuring. Registration used the existing authenticated, audited Admin process: list by stable code, create INACTIVE, read back and verify metadata, then activate the newly created record. Running registration again preserved the same row.

| Field | Verified local value |
| --- | --- |
| Backend numeric ID | `14` — allocated by MySQL, never a renderer identity |
| Code | `royal-garden-cinematic` |
| Status / category | `ACTIVE` / `TRADITIONAL` |
| Access | `premium=true`, included with entitled Premium access |
| Separate template price | `0.00 USD`; this does not make the template Free |
| Supported event types | `WEDDING` |
| Supported languages | `KH`, `EN`, `BOTH` |
| Thumbnail | `/images/marketing/catalog/royal-garden-cinematic-640.webp` |
| Full preview | `/templates/royal-garden-cinematic` |
| Checkout | `checkoutEligible=false`; no new standalone sale policy |
| Featured | Explicit code in `FEATURED_TEMPLATE_CODES`, subject to ACTIVE API inventory |

The current real public response is saved in [catalog-local.json](evidence/catalog-local.json). The existing entitlement service continues to decide access from verified purchases or eligible paid subscription benefits. Browser selection does not grant access or approve payments. The legacy checkout policy and its server-owned amount remain unchanged.

For another environment, deploy the Admin compatibility-field support and frontend assets, authenticate as an authorized Admin, then run:

```powershell
# Supply an Admin bearer token through the environment, never command-line arguments.
python scripts/maintenance/register-royal-garden.py --base-url https://YOUR-API-ORIGIN --activate
```

The script does not update an existing record, invent an ID, duplicate a stable code, or reactivate an existing inactive design. Existing records that need changes require explicit review in Admin. A metadata mismatch on a newly created record leaves it INACTIVE. No Flyway migration or production activation was performed in this task.

## Resulting behavior

- Public inventory requires ACTIVE status, a positive numeric backend ID and a stable code. Numeric allocations such as `2` and `13` cannot independently retire an unrelated design. Existing retirement filters for Garden Royal Khmer Wedding and Khmer Royal Lotus are preserved by stable identity/name.
- Empty catalogs remain empty. Failed catalog requests show retry and preview-only demo states; static previews never authorize selection or assert Free access.
- The 30-second language-specific cache still deduplicates requests. Studio refreshes on opening the chooser and rechecks the public detail endpoint and current entitlement before switching.
- Backend status, price, currency, entitlement and compatibility fields override presentation JSON. Checkout price labels use the backend offer when explicitly eligible.
- The chooser has one shared modal header/close action, a 3/2/1-column responsive grid, proportional 9:16 previews, names, backend access labels, search across code/name/style and localized descriptions, actual category filters, selected/in-use indicators, separate Preview/Select controls and a persistent confirmation footer.
- The shared modal supplies Tab containment, Escape, background isolation and focus restoration. Controls use native buttons/links, labels, pressed states and visible focus. Unsupported renderers/events/languages remain unavailable.
- The existing confirmation explains template changes. The form retains event details, dates, authored optional sections, program days, saved image references and uploads. Server-side authorization remains authoritative.

## Genuine thumbnail and screenshots

The WebP images are captures of the actual Royal Garden entrance at `/templates/royal-garden-cinematic`, not generated artwork or unrelated substitutes. Capture viewport: 360×640, device scale 3, reduced motion. Only the language/music control overlay was hidden for the artwork capture. The full portrait was resized proportionally with Lanczos and encoded as WebP, quality 86: 320×569 (66,764 bytes), 640×1138 (194,350 bytes), 960×1707 (328,836 bytes). Responsive `srcset` selects among these images. Catalog cards create no video elements or pre-wedding-video preload.

Rendered with the real local backend catalog; authentication and owner event writes are isolated browser fixtures:

- [Featured Royal Garden](../../../output/playwright/royal-garden-catalog/real-featured-royal.png)
- [Desktop chooser — 1440×900](../../../output/playwright/royal-garden-catalog/real-chooser-desktop.png)
- [Tablet chooser — 834×1194](../../../output/playwright/royal-garden-catalog/real-chooser-tablet.png)
- [Mobile chooser — 390×844](../../../output/playwright/royal-garden-catalog/real-chooser-mobile.png)

## Verification

Commands are run from the named application directory unless otherwise specified. Evidence is actual execution output, not inferred from static preview success.

| Check | Result |
| --- | --- |
| User frontend `npm run lint` | Passed |
| User frontend `npm test -- --maxWorkers=2` | 151 files / 1,103 tests passed in 73.12 seconds |
| User frontend `npm run build` | Passed |
| Admin frontend `npm run lint`, `npm run build` | Passed |
| Backend targeted Maven verification | 17 passed; zero failures, errors or skips |
| Playwright catalog + V3.2 suites | 20 passed / 2 deliberate duplicate-project skips in 58.6 seconds |
| Focused final search/card tests | 9 passed; zero failures |
| Agent routing and skill integrity | Passed; zero routing errors, 59 bundled skill directories verified |

Backend command, with `RUN_FLYWAY_INTEGRATION=true` and the private `FLYWAY_TEST_DB_*` connection variables provided through the environment:

```powershell
.\mvnw.cmd "-Dtest=RoyalGardenCatalogMySqlTests,TemplateCatalogServiceTests,TemplateCheckoutPolicyTests,TemplateRecommendationServiceTests,ArchitectureRulesTests" test
```

`RoyalGardenCatalogMySqlTests` is **one real MySQL 8.0.39 integration test**, with no mocked repositories or services. It creates a guarded random `koupreng_catalog_test_*` database, applies Flyway migrations, exercises Admin/public controllers through MockMvc, persists compatibility metadata and subscriptions, verifies Premium denial/grant, verifies inactive exclusion and Admin-only access, then drops the disposable database. See its [actual Surefire result](evidence/backend/com.koupreng.backend.template.application.RoyalGardenCatalogMySqlTests.txt). The remaining checks comprise seven mocked catalog service tests, two mocked recommendation service tests, two pure checkout-policy tests and five ArchUnit rules. MockMvc's Admin principal is a test fixture; the live local registration separately used actual Admin login and HTTP endpoints.

Playwright command:

```powershell
$env:RUN_REAL_CATALOG='true'
npx playwright test tests/e2e/royal-garden-catalog.spec.js tests/e2e/royal-garden-v32.spec.js --workers=2
```

The suite verifies ACTIVE/inactive visibility, full Royal preview, allocated-ID selection, categories and search, Premium denial, a template becoming unavailable before confirmation, honest retry, keyboard focus restoration, event/media preservation, save/reload/publication contracts and V3.2 guest features. The real-catalog case forwards catalog reads to the running Spring Boot API backed by MySQL; it does not substitute a catalog response. Authentication and owner writes remain synthetic. The modal's scoped axe scan has zero violations, and catalog browsing makes no video requests. The responsive pass verifies the information frame at nine viewport sizes from 320×568 through 1920×1080. The two skips are the mobile project's duplicates of the desktop real-catalog and nine-viewport cases; both cases execute and pass in the desktop project.

Earlier failures were resolved: test fixtures now supply actual catalog identities, Home assertions expect the Premium plan label, the first lazy renderer receives a bounded five-second wait under full-suite load, and mobile tests open Studio's on-demand preview. The nine-viewport test's obsolete project-name condition was corrected so that check actually executes.

## Changed files and limits

Implementation is concentrated in:

- Backend: `AdminTemplateRequest`, `AdminTemplateResponse`, `AdminManagementService`, `InvitationTemplateRepository`, `TemplateCatalogService`, `TemplateRecommendationService`, and their catalog/integration tests.
- Public frontend: `templateCatalogApi.js`, `templatesData.js`, `catalogPolicy.js`, `templateIdentity.js`, `templatePresentation.js`, `publicTemplateImage.js`, `TemplateGrid.jsx`, `PublicTemplateCard.jsx`, and `BrowseTemplatesFeature.jsx`.
- Studio: `InvitationForm.jsx` and the extracted `studio/TemplateChooser.jsx` / `.css`, with component, identity, data-retention and browser tests.
- Admin frontend: `AdminTemplatesFeature.jsx` retirement filtering, preserving numeric allocation independence.
- Assets/operations: three Royal WebP derivatives, the idempotent Admin registration script, screenshots and this evidence report.

No V3.2 renderer, calendar, RSVP, gift, privacy or media-provider feature was removed. This is local verification, not a production deployment. Production catalog activation and subscription configuration must be verified in their own environment using the supported Admin process above. Browser owner writes were fixtures; real persistence/entitlement assertions ran against the disposable MySQL database. Unrelated pre-existing local artifacts are left outside the task commit.
