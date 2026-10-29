# Royal Garden Cinematic V3.3 engineering report

Verified on Windows, 29 October 2026. Audited base: `cf586813385471dc311d64ea840684441c52cf25` on `main`. Work was performed in the existing checkout without a worktree or feature branch. No production deployment, container restart, DNS change, dependency addition or database migration was made.

## Result and audit

The existing `IllustratedMapEditor`, `IllustratedMap`, `illustratedMapModel`, `mapPresets`, `vectorExport`, Studio save/history, shared modal and access/upgrade components were extended. The calendar continues to use `eventDateTime`, `program`, `eventCalendarExport` and the existing Royal Garden calendar component. There is no parallel editor, content document, payment flow or calendar calculation system.

The audit found a small inline editor, six presets, a V1 schema and Premium-only activated map benefits. V3.3 adds the responsive designer and Pro map benefit while preserving V1 documents, activated subscription snapshots, revision checks and server authorization.

The user's later screenshot correction takes precedence over the directive's proposed demo navigation: the floating section toolbar is absent. Marketing demos also omit the selected-day sample card, ceremony legend, disabled export controls and their explanatory copy. The month grid remains available. Real invitations and authored Studio previews retain their selected-day details and working calendar actions. Demo dates follow the catalog's configured event date; sample content is not merged into owner-authored invitations.

The three files named `IMG_0240.png`, `IMG_0241.jpeg` and `IMG_0242.jpeg` were not present in the attachment directory. The written brief, existing Royal Garden artwork and subsequently supplied UI screenshots guided the implementation. Existing local typography/name customizations were preserved.

## Editor, renderer and canonical data

`content.illustratedMap` remains the single saved map. The same SVG renderer powers Studio, guest invitations, larger-map viewing, preset previews and downloads.

| Capability | Implemented behavior |
| --- | --- |
| Workspace | Three desktop panels, collapsible tablet layout, mobile canvas/elements/properties tabs; shared modal focus trap, Escape and focus restoration |
| Geometry | Pointer/touch movement, resize and rotation handles, numeric controls, rotated canvas bounds, horizontal/vertical/diagonal roads, connected segments, curves and intersections |
| Editing | Duplicate/delete, layers, alignment/centering, grid and endpoint snapping, zoom/pan/fit, shared Studio undo/redo, confirmed preset replacement/reset |
| Text | Khmer/English fields, bounded labels, grapheme-aware Khmer wrapping, English word wrapping, font/size/color/background/offset/rotation/alignment controls |
| Saving | Existing Studio draft and save pipeline, optimistic revision protection, honest server acknowledgement/error state, draft retained when closing |
| Public view | Responsive SVG, owner description, optional landmark legend and approved directions link, accessible larger-map modal |
| Export | SVG, PNG and WebP through existing vector export, transparent/opaque backgrounds, embedded bundled fonts/licenses, no editing grid/handles |

Pointer movement uses a temporary SVG transform and commits geometry once on release; it does not send a backend update per pointer event. The designer is lazy loaded and absent from marketing/guest page JavaScript requests.

V1 maps remain readable with their existing coordinates, IDs, order and text. Opening a map does not mutate the draft. An explicit edit normalizes it to V2. V2 adds optional node styling and `settings.showLegend` / `settings.showDirectionsButton`, while retaining `nodes` rather than introducing a second road collection.

Server validation accepts only versions 1/2, known themes/types/fonts/styles, boolean settings, hex colors and finite bounded geometry. Limits remain 80 nodes, unique IDs of at most 100 characters, 150-character localized labels, 1,500-character localized descriptions and the existing 50,000-character content limit. SVG uses controlled vector paths and React text, without executable markup, external map tiles or remote image references.

### Inventory and licensing

24 tools: straight road, curve, cross intersection, T intersection, roundabout, bridge, arrow, wedding venue, destination pin, house, hotel, restaurant, school, hospital, market, pagoda, parking, gas station, bank, building, landmark, information, text label and botanical detail.

10 fictitious presets: main road, multi-turn route, landmark route, urban intersection, rural road, minimal diagram, roundabout, restaurant/hotel, botanical wedding and royal blue/gold. Applying any preset supplies a bilingual example notice and independent node IDs. Nonempty replacement requires confirmation and can be undone.

Palettes: existing Ivory, Garden Ink and Rose; new Royal Gold, Botanical Wedding and Royal Blue. Pictogram vector paths and schematic layouts are original implementation assets. Interface icons reuse the installed Lucide package under its ISC license. Exports reuse bundled Kantumruy Pro, Moul and Cormorant Garamond fonts and their SIL Open Font License notices. No new third-party bitmap/map assets were introduced.

## Authorization and persistence

| Server-owned access | New/edit map | Retained saved data |
| --- | --- | --- |
| Free / Basic | Denied, including a newly supplied disabled paid payload | Existing policy unchanged |
| Activated Pro | Allowed map benefit | Other Premium-only design tools remain gated |
| Activated Premium | Allowed | Existing Premium benefits preserved |
| Expired / unknown entitlement | New edits denied; unknown state offers retry | Unchanged content and exact disable-only changes follow existing policy; public stripping on expiry preserved |
| User without invitation permission | Denied regardless of tier | Owner data remains protected |

Package price, generic paid status, template ownership and browser tier claims do not grant map access. The existing upgrade dialog uses verified server catalog offers. Public demo viewing grants no editor/save/export privilege. No server export endpoint was added; authorized editor downloads use the existing client vector exporter.

Browser fixtures verify save/reload, shared history, preview and published-renderer consistency. Independently, six real MySQL service integration cases cover activated Pro/Premium create-update-reload-publish-public reads, Free/Basic rejection, another user's denied edit and expired Pro disable-only behavior. They ran against a newly created loopback-only disposable database with transaction rollback; that task-owned database was removed after verification. The user's application database was untouched by these integration tests. This is service/database integration evidence, not a claim of a browser-to-live-backend test.

Existing payment reconciliation, prices, RBAC, guest tokens, owner privacy and currency separation were not changed. Account sample-data verification is separate and is not included in this public report or screenshot fixtures.

## Calendar

The existing timezone/date parser and ICS exporter remain authoritative. The upgraded calendar supports month navigation, ceremony markers, selected-day details and a primary Add to Calendar action below the grid for real invitations. Tests cover a December/January boundary, dates in both languages, main-event and multi-ceremony UTC exports, and `showAddToCalendar: false` in preview/public rendering. Marketing-only examples use a coherent two-day program without the removed sample detail/export UI.

## Verification

See [machine-readable results](evidence/test-results.json), [responsive screenshots](evidence/responsive-contact-sheet.jpg), [clean demo cover](evidence/demo-cover-desktop.jpg), [clean demo calendar](evidence/demo-calendar-mobile.png), [desktop designer](evidence/designer-desktop.jpg), [mobile designer](evidence/designer-mobile.jpg), [dark designer](evidence/designer-dark.jpg), [upgrade](evidence/upgrade-mobile.jpg), and [SVG](evidence/exports/venue-map.svg), [PNG](evidence/exports/venue-map.png), [WebP](evidence/exports/venue-map.webp) exports. Images contain test fixtures, not private account/event records.

| Check | Result | Duration |
| --- | --- | --- |
| User Vitest | 1,183 passed, 161 files | 84.96 s |
| Admin Vitest | 128 passed, 22 files | 30.81 s |
| Backend Maven | 657 discovered, 582 passed, 75 environment-gated skips; zero failures/errors | 2 min 42 s |
| Isolated MySQL + policy/ArchUnit | 33 passed, zero skips; includes six real MySQL cases | 46.009 s |
| Telegram worker pytest | 74 passed, one existing Starlette deprecation warning | 2.31 s |
| User lint / production build | Passed | Build 1.27 s |
| Agent routing and skill integrity | Passed, zero errors | — |
| Playwright regression / accessibility / visual | 90 passed, 10 planned skips, zero failures; four visual comparisons passed without updates | 4.7 min |
| Performance comparison | 1 passed, 10 measured runs plus two excluded warmups | 20.5 s |

Commands used:

```powershell
npm --prefix apps/frontend-user test -- --maxWorkers=2
npm --prefix apps/frontend-admin test -- --maxWorkers=2
& apps/backend/mvnw.cmd -f apps/backend/pom.xml test
# With RUN_FLYWAY_INTEGRATION=true and FLYWAY_TEST_DB_* pointing only to the isolated local test database:
& apps/backend/mvnw.cmd -f apps/backend/pom.xml test '-Dtest=RoyalGardenMapMySqlTests,InvitationDesignPolicyTests,EntitlementServiceTests,ArchitectureRulesTests'
& apps/telegram-bot/.venv/Scripts/python.exe -m pytest apps/telegram-bot/tests
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run build
powershell -ExecutionPolicy Bypass -File scripts/setup-ai-skills.ps1 -VerifyOnly
python scripts/validate-agent-routing.py
# Redirect legacy screenshot output to local cache before running the regression set:
$env:ROYAL_EVIDENCE_DIR='../../.cache/v33-legacy-evidence'
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/royal-garden-v33.spec.js tests/e2e/royal-garden-v33-visual.spec.js tests/e2e/royal-garden-v32.spec.js tests/e2e/royal-garden-v3.spec.js tests/e2e/royal-garden-catalog.spec.js tests/e2e/phase11-features.spec.js tests/e2e/phase12-studio.spec.js tests/e2e/next-studio-ux.spec.js --workers=2
# With archived base preview running at 4273 and current preview at 4173:
$env:RUN_ROYAL_PERF='true'
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/royal-garden-v33-performance.spec.js --project=desktop-chromium --workers=1
```

The four new Playwright PNG references at 375/1440 pixels were explicitly captured and then compared in a normal run without snapshot updates. The responsive sweep covers 320×568, 375×667, 390×844, 430×932, 768×1024, 1024×768, 1440×900 and 1920×1080 for editor, guest map/calendar and upgrade states. Axe checks use WCAG 2 A/AA, 2.1 AA and 2.2 AA tags; keyboard/focus, native touch/cancellation, dark mode and horizontal overflow are separately asserted.

The ten Playwright skips comprise two optional live-catalog tests, two duplicate V3.3 viewport sweeps already executed in the explicit desktop sweep, four duplicate visual references, one duplicate V3.2 viewport sweep and one duplicate Studio-tab evidence sweep. The real map service/MySQL cases ran separately. Backend totals include gated integration tests; the 33-case isolated run overlaps policy/entitlement/architecture unit tests and should not be added as 33 distinct new backend cases.

### Performance method and limits

The performance test compares a `git archive` build of the audited base at port 4273 against the current production preview at port 4173, with the same hosted V1 80-node fixture, Chromium 1440×900 and reduced motion. One warmup is excluded; the result is the median of five runs per build. The JSON includes all measurements, transferred JS, SVG size, execution durations and heap. It also checks that guest pages do not load the editor and that CLS stays below 0.1.

| Local median measurement | Audited base | V3.3 |
| --- | ---: | ---: |
| DOMContentLoaded | 56 ms | 57.1 ms |
| LCP | 928 ms | 900 ms |
| CLS | 0.002 | 0.002 |
| Transferred JavaScript | 398,941 B | 405,937 B |
| SVG elements | 622 | 590 |
| Main task duration | 339.675 ms | 342.295 ms |
| Script duration | 121.614 ms | 117.544 ms |
| JS heap | 9,801,104 B | 9,161,044 B |

The bounded fixture transfers 6,996 additional JS bytes (1.75%); timing differences are small local samples rather than evidence of production speed gains. See [raw measurements](evidence/performance.json).

These are local browser measurements with mocked API responses, not production Core Web Vitals or a network/load test. Visual goldens are Windows Chromium references; Safari, Firefox and real iOS/Android hardware were not run. The existing backend streaming MockMvc test showed a transient concurrent-modification failure on an initial run; the complete unmodified suite subsequently passed. Happy DOM's existing iframe-loading warning and the worker's Starlette deprecation warning remain nonfatal.

Publication is limited to the requested normal Git push to `origin/main`. Deployment and production behavior have not been asserted.
