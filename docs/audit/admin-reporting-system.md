# Admin reporting system — implementation audit

Audit started 2026-10-15 on clean `main`, HEAD `2ae45958` (report overview
components/subscription analytics), after V6 commit `59e41957`. No unrelated
worktree changes existed. Implementation and validation initially ran locally.
The subsequent user request authorizes committing and pushing this reporting
work to GitHub and resolving CI failures. Production rollout, live payment
configuration and production data mutation remain outside this task.

Read AGENTS.md, CODEX.md, ROUTER, PAGINATION_READINESS, STYLESEED and business
invariants. Primary skill: koupreng-backend-standards. Supporting skills:
koupreng-payment-security and koupreng-qa-release. Backend compatibility,
server-owned financial truth and measured QA take precedence over generic UI
defaults. Existing admin navigation, providers, design tokens and themes stay.

## Initial audit matrix

| Risk | Reproduced evidence / root cause | Priority | Remediation |
| --- | --- | --- | --- |
| Modular components not integrated | AdminReportOverview defines inline equivalents and does not import the five report section/preview components. | P0 | Compose a single active reporting route and shared read-only ledger. |
| Recent snapshot replaces paginated invitations | Route reload prefers platformReport; platformReport uses findTop10ByDeletedFalseOrderByCreatedAtDesc. The paginated invitation method is not its primary source. | P0 | Use the paginated invitation report route with the shared filter contract. |
| CSV is buffered | AdminManagementController export methods return byte[]; service builds full lists/StringBuilder. | P1 | Bounded projection batches, disk-backed export, response copy and reliable cleanup. |
| Current page mislabeled complete | Inline and FinancialReportSection export filtered in-memory rows. No full-filter dataset boundary. | P0 | Explicit current-page versus all-filtered actions; server exports for full scope. |
| Artificial growth | platformReport eventGrowthMoM returns 100 when prior month is zero and current is positive. | P0 | Null rate with explicit new-activity/unavailable state. |
| Duplicate print paths | Inline preview plus unused ReportPrintPreviewModal; component slices invitations to 15 and prints Page 1 of 1. | P1 | One snapshot preview, full-filter server document, truthful pagination. |
| Unbounded reads | paymentsReport uses findAll for orders/subscriptions; invitation summary loads all hidden candidates; platformReport loads metric/subscription lists. | P0 | New active report projections/SQL aggregates and bounded export batches; document retained compatibility paths. |
| No shared period contract | Existing invitation parameters lack dates/dimension/sort; financial/platform methods take no filters. | P0 | Asia/Phnom_Penh calendar boundaries converted to UTC, inclusive start/exclusive end, allowlisted dimensions and sort. |
| Invented missing values | Frontend maps absent provider/status/currency to KHQR/COMPLETED/USD, potentially presenting missing data as success. | P0 | Explicit unavailable values, backend classifications and dictionary. |
| Misleading revenue/privacy | Aggregated transaction rows and individual order facts are mixed; suppression flags are guessed from row counts. | P0 | Dedicated authorized minimized ledgers, distinct verified receipts per currency and explicit unavailable aggregate metrics. |

## Architecture and implementation evidence

The findings above are the historical baseline. The active reporting route now
uses the implementation below. No settlement code, live configuration, database
migration or public user application was changed by this task. Concurrent edits
appeared in dev initialization, production validation and unrelated tests during
verification; those edits were preserved and are not part of this report's
implementation inventory.

### Read model and consistency

`AdminReportingController` delegates to `AdminReportingService`. Immutable query
filters and a versioned bilingual column catalog drive SQL projections, UI
columns, CSV headers, workbook cells and print column bands. The repository uses
prepared values and schema-allowlisted identifiers. It does not hydrate JPA
entities or execute one query per displayed record.

The service reads summary, page and chart aggregates inside one read-only
REPEATABLE_READ transaction. The export writer is a separate Spring bean: it
creates the complete snapshot file inside its own read-only transaction, then
the HTTP adapter copies the file after that transaction ends. This separates
database snapshot consistency from slow-client lifetime. A concurrency fixture
commits an extra invitation between summary and row queries and proves it does
not enter the earlier snapshot.

The UI captures export filters when the action starts. Export timestamps/IDs
identify newly generated server snapshots; exports are not advertised as the
same historical database snapshot as a previously loaded UI page. Preview HTML
is retained as one immutable document; orientation/zoom do not fetch fresh data.

### Integration and feature completion

| Report | Active implementation and authoritative basis | Explicit limits / unavailable values |
| --- | --- | --- |
| Executive | Current account/catalog/valid-subscription counts; period registrations and invitation cohort; verified cash by currency; pending/failed created-order value; equal-day prior comparison; monthly aggregates | Enabled accounts are not DAU; collections are not accounting revenue; zero or out-of-range prior denominator has no growth percentage |
| Financial | Unified template/subscription order projection; expected/recorded paid amounts, timestamps, provider/reference, trusted confirmation, safe reviewer ID, outcome | No wedding gifts, FX or raw claimant/bank evidence; unrecorded payment method is unavailable |
| Reconciliation | Same canonical facts; MATCHED, UNMATCHED, PENDING_REVIEW, AMOUNT_MISMATCH, DUPLICATE, REJECTED, EXPIRED; exception and verification columns | Diagnostic, read only; resolution text is withheld; no settlement or review mutation |
| Invitations | Existing invitation API with `view=ledger`; full SQL counts, period/dimension/search/status/moderation filters, server paging/sort, event metadata and totals | Deleted invitations excluded; all six event types shown in server category breakdown; zero-denominator rates unavailable |
| Users | Nondeleted registration cohort, account state, lifetime invitation/template purchase counts, current valid package, positive-verified-receipt account classification | No email/phone/password/contact export; no genuine last-activity/DAU source |
| Templates | Catalog activation/free/premium/category; period invitation usage and verified purchases, receipts per currency; top-five charts | Conversion unavailable without measured view denominator; createdAt optionally adds template-cohort restriction |
| Subscriptions | Package, persisted/payment state, expected and trusted recorded amount, period/active-overlap filters, effective active/expired state and tier distribution | No inferred renewal/upgrade/downgrade transitions; free entitlements are not paid receipts |
| Guest/RSVP/check-in | Event-only aggregates; send/open markers, latest eligible guest-linked responses, active distinct check-ins, weighted full-filter rates | No guest identities; anonymous/cross-event/older duplicate responses excluded; send markers do not establish delivery |
| System/audit | Sanitized persisted audit actions, failed notification and payment exceptions; server page/search/sort | No raw descriptions, recipient data, bank payloads, IPs or contacts; no invented uptime/API health from absent events |
| KPI dictionary | Versioned bilingual definitions, formulas, sources, dimensions, inclusion/exclusion, denominator, currency and missing-data behavior | Definitions describe available sources, not newly collected telemetry |

All existing report section components are now mounted through one active
`AdminReportOverview`: overview, category, invitations, finance, subscriptions,
guests, system and the single print preview. The shared ledger provides row
numbers, visible-column selection, authorized TSV copy, row details, sticky
headers/identifier, stable server sorting and pagination. It exposes no payment
approval/edit/delete actions. Other operational administration routes retain
their existing responsibilities.

The existing admin shell, theme/language providers and branding remain. Shared
filters persist in URL parameters. The inclusive UI through-date becomes an
exclusive API end date in Asia/Phnom_Penh. Explicit partial URL periods are not
silently completed with guessed dates. In-flight/failed refreshes disable
exports; old snapshots are hidden on scope changes, and failed same-scope
refreshes are marked stale. Unknown/missing values remain distinct from zero.

### API and DTO contract

Full route/query/format documentation: [Admin API](../api/admin.md). The checked-in
OpenAPI document describes flattened URL filters and explicit binary/text media
types for management and legacy CSV downloads. It was regenerated with the existing contract-update test and
subsequently passed the regular drift test.

New routes are `/api/v1/admin/reports/management/definitions`, `/{report}` and
`/{report}/export/{csv|xlsx|html}`. `all/export/xlsx` accepts period-only filters.
The invitation UI uses `/api/v1/admin/reports/invitations?view=ledger`, retaining
the existing legacy JSON response when view is omitted. The response adds
definition, metadata, filteredSummary, series and notices while preserving
report/generatedAt/summary/rows/page/size/totalElements/totalPages.

Legacy CSV URLs retain original BOM/header names/order and UTC timestamp layout
through bounded adapters. Their unsafe/nonmatched PAID Amount cells are blank;
the new financial export is the supported reconciled-ledger contract. Removed
the unused byte-array export methods and moved their security coverage to real
SQL/file tests. Legacy JSON platform/payments/RSVP APIs remain compatibility
paths with some unbounded reads and older semantics; the new UI does not use
them for financial truth. The legacy invitation hidden count now uses COUNT.

### Financial integrity and KPI definitions

Detailed reviewed dictionary: [all metric formulas](admin-reporting-metrics.md).
It is also delivered in the API and workbook.

Confirmed receipts require persisted PAID, paidAt and confirmedAt, an allowed
confirmation source for that product, recorded paid amount equal to nonnegative
expected amount, USD/KHR, and no duplicate order or provider reference across
either source. Duplicate detection occurs **before** date/product filters, so
filtering cannot hide a conflicting record and promote it into receipts. Both
conflicting records are excluded rather than choosing an arbitrary winner.

Template trusted sources are ABA_PAYWAY_CALLBACK, MANUAL_ADMIN and the existing
settled TELEGRAM_ABA_ALERT source. Subscription sources are MANUAL_ADMIN and
TRUSTED_TELEGRAM_MERCHANT_ALERT. Raw TELEGRAM_ADMIN_DETECT/browser claims are
not trusted payment truth. The reporting code reads persisted outcomes and
does not inspect bank messages to grant access or settle orders.

Reference fixture: verified USD = 10 template + 12 earlier-created template paid
in period + 25 subscription = **47 USD**. Verified KHR = **40,000 KHR**. Pending
expected value is 1,044 USD; failed value is 99 USD. Browser claims (777 USD),
untrusted Telegram detection (88 USD), duplicate references, mismatched amounts,
missing dates and EUR never enter those verified-currency totals.

Account payment classification uses at least one **positive** lifetime matched
receipt in either explicit currency. Zero-value PAID records and free
entitlements alone do not establish a paying account. The complementary cohort
is labeled without positive verified receipts, not presumed to be on a free
plan. Both counts use the filtered registration cohort and are server-owned.

RSVP/check-in rates use eligible guest identities from the filtered event
cohort, not raw response row counts. The fixture includes old duplicate,
anonymous and cross-event responses, duplicate active and undone check-ins.
Growth is `(current-previous)/previous` over equal calendar-day windows; no
100% fallback. Rates are fractions in JSON/CSV and typed percentages in Excel.
Monthly financial groups below five matched payments suppress amount with an
explicit reason. This is a chart disclosure rule, not anonymization of the
separately authorized ADMIN ledger or its complete financial totals.

### Workbook structure and validation

Native `.xlsx`, not renamed CSV. The full workbook contains:

1. Executive Summary
2. Payments Ledger
3. Reconciliation
4. Invitations
5. Users
6. Templates
7. Subscriptions
8. Engagement
9. System Audit
10. KPI Dictionary
11. Metadata

Individual exports contain the selected worksheet, Summary, KPI Dictionary and
Metadata (dictionary exports omit the duplicate dictionary sheet). Data sheets
have branded bilingual titles/headers, period/timezone/snapshot/scope, frozen
row/identifier panes, filters, number/date/percent/money types, fixed widths,
status formatting, repeat print headers/identifier columns, A4 settings and
page footers. SUMIFS formulas are generated only from fixed trusted code and
check MATCHED receipts separately for USD and KHR. Cached full-sheet totals are
checked against server aggregates; POI recalculation verifies them independently.

SXSSF uses a 100-row window and compressed spill files. Queries use 200-row
batches. Worksheets continue before Excel's row limit. The large fixture
exports **2,503 invitation records** over multiple batches and forced continuation
sheets, with exact counts and a Unicode-prefixed formula attack kept as text.
Numbers exceeding Excel's 15-significant-digit precision are rejected with a
CSV instruction rather than silently rounded. Financial arithmetic remains
BigDecimal. Excel/LibreOffice desktop applications were not available for a GUI
check; POI reopened the actual workbook files, checked sheets, row counts,
types, Khmer, dates, numeric values, formulas and calculated/cached results.

### CSV, clipboard and print security review

| Boundary | Implemented defense / evidence |
| --- | --- |
| Authorization | Controller method security and persisted active ADMIN checks in read/export services; anonymous 401, USER/STAFF 403 tests |
| SQL injection | Bound query values; escaped literal LIKE; catalog-only sort/dimension/projection identifiers; attack-string and unsupported-sort tests |
| Financial truth | Product-specific trusted metadata, exact amounts, global duplicate windows and separate currencies; no settlement mutations or wedding-gift source |
| Projection privacy | Explicit columns, safe reviewer IDs and fixed operational messages; tests exclude contacts, passwords and raw evidence; no guest identity export |
| Spreadsheet injection | Quoted CSV, UTF-8 BOM, apostrophe defense including invisible Unicode/control/full-width prefixes; XLSX user strings remain string cells; TSV cannot add rows/columns |
| Print HTML | Escaped text/attributes, numeric-only chart geometry, sandbox iframe without scripts; test script-tag text is escaped |
| HTTP/files | Fixed MIME, safe allowlisted filenames, attachment, no-store/private and nosniff; complete temp snapshot before client copy; failure/disconnect cleanup tests |

Print HTML includes count charts, full summary/details, repeated table heads,
seven-column bands with repeated IDs, headers/footer/page counters and local
licensed Khmer fonts. Preview supports A4 portrait/landscape and 60–150% zoom,
waits for document fonts and labels the action **Print / Save as PDF**. There is
no claim of automatic PDF download. Print documents above 20,000 rows fail
explicitly; CSV/XLSX remain complete alternatives.

The original variable Kantumruy font produced Chromium Type 3 glyph programs.
Static 400/700 TrueType instances derived from that existing OFL font now produce
conventional embedded subsets. Font sources, licenses and reproduction steps
are in `apps/frontend-admin/public/fonts/reports/README.md`. No runtime npm or
Maven dependency was added. PyMuPDF/FontTools were local QA tools under ignored
`output/admin-reporting/pdf-tools`; they are not application dependencies.

### Query and performance review

Application row materialization is bounded; summary totals and series are SQL
aggregates over the full filter. Guest subqueries aggregate by invitation and
scope guest identity by both keys. Payment sources UNION once per query and
window duplicate counts across the whole ledger. Stable OFFSET batches and
the same transaction avoid count/page drift; no per-row entity fetching occurs.

This does **not** establish production capacity: duplicate windows, guest/latest
response grouping, repeated aggregate queries, deep offsets, workbook spill
disk and concurrent exports can be expensive. Existing migrations provide
invitation user/status/event-date, guest/RSVP invitation, payment user/status/
order/transaction/template, static-match and notification-delivery indexes.
MySQL EXPLAIN/cardinality/latency/heap/temp-disk/concurrent-export measurements
were unavailable; no speculative index migration was added. H2 fixture timing
is functional evidence, not a MySQL capacity benchmark. Retained legacy JSON
report paths remain a separate pagination hardening item.

## Verification record

Verified locally on 2026-10-15. Test artifacts contain synthetic fixture data
only and remain under ignored `output/admin-reporting/`. No skipped test is
counted as a pass.

| Actual command | Final observed result | Log |
| --- | --- | --- |
| `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test` | **512 tests: 483 passed, 29 skipped, 0 failures/errors**; BUILD SUCCESS; 1:47; completed 22:38:04 +07 | `output/admin-reports-backend-final.log` |
| `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test -Dtest=AdminReportingTests,ArchitectureRulesTests` | **23 passed** (18 report tests + 5 architecture rules), including financial continuation-sheet cached/recalculated subtotals; 28.857 s | `output/admin-reports-final-workbook-tests.log` |
| `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test -Dtest=OpenApiIntegrationTests -Dopenapi.contract.update=true` | **14 passed**, including flat-filter/binary-media assertions for management and legacy CSV routes; 35.541 s | `output/admin-reports-contract-final.log` |
| `.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test -Dtest=OpenApiIntegrationTests#checkedInOpenApiContractMatchesRuntimeDocument` | **1 passed**, regular drift check without update flag after regeneration; 21.611 s | `output/admin-reports-contract-drift.log` |
| `npm --prefix apps/frontend-admin run lint` | Passed, no lint errors | `output/admin-reports-lint.log` |
| `npm --prefix apps/frontend-admin test` | **75 passed**, 16 files; 5.28 s; clean final log | `output/admin-reports-frontend-final.log` |
| `npm --prefix apps/frontend-admin run build` | Passed; Vite production build; 1.10 s in final cached build | `output/admin-reports-build.log` |
| `node scripts/qa/admin-reporting-browser.mjs` | Passed: 10 tabs at 1440/768/390; no page overflow; 53 API requests, 0 page errors; filters/sort/refresh, pagination, clipboard, 4 downloads, one immutable preview, orientation/zoom/close, Khmer/dark and anonymous redirect | `output/admin-reports-browser-final.log` |
| `python scripts/qa/inspect-admin-reporting-pdfs.py` | Passed: 3 real PDFs; selectable Khmer, embedded static fonts, repeated headers, no blank pages or text outside paper; reopened browser workbook ZIP/XML and reconciled downloaded USD CSV | `output/admin-reports-pdf-inspection.log` |
| `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | 10/10 pinned + 6/6 custom; 0 missing/checksum errors | `output/admin-reports-skill-integrity.log` |
| `python scripts/validate-agent-routing.py` | 58 valid skills; 0 errors/failures | `output/admin-reports-routing.log` |
| `git -c core.safecrlf=false diff --check` | Passed | Local diff check |

The final API-documentation pass additionally checks flattened filters, typed
report definitions and native download media types, including legacy CSV
routes. Those annotation-only corrections do not change the tested query or
settlement behavior. The contract tests and regular drift check are listed
in the verification table.

The 18 report tests execute real production SQL and file writers against
isolated H2 MySQL mode. The five controller tests use the application's actual
Spring security chain and method authorization. Existing payment/auth/security,
business service and OpenAPI tests pass in the full suite. Environment-gated
MySQL/Flyway/payment/subscription integration tests account for the skipped
tests; Docker's Linux engine pipe was unavailable, and no live database was
used as a substitute.

Workbook evidence also includes **514 financial records** across forced
continuation sheets: each sheet's USD subtotal cache and POI-recalculated
SUMIFS equal its matched rows, summing to 547 USD for that synthetic fixture.
The independent browser-download inspection finds 4 sheets in the selected
workbook, 11 in the full workbook, valid ZIP CRCs, and exactly 12 USD detail
records with 47 USD matched receipts in the downloaded filtered CSV.

Actual print evidence:

| Document | Actual pages | Verified properties |
| --- | --- | --- |
| `invitations-landscape.pdf` | 5 | Branded bilingual summary, charts, all three column bands, page counters, embedded Khmer, full 3-record fixture |
| `large-invitations-landscape.pdf` | 21 | 63-record long-Khmer print fixture, repeated table headers/IDs, visible charts, no blank pages/outside-paper text |
| `large-invitations-portrait.pdf` | 18 | Same full print fixture in portrait; no hidden columns, embedded fonts, selectable Khmer and actual page counts |

Inspected rendered first, second, table and last-page images. Browser preview
screenshots and light/dark mobile/desktop screenshots are included. PDF checks
verify glyph/text presence and paper bounds, not native editorial correctness
or a claim that all screen-reader/PDF accessibility audits were completed.

Review artifacts:

- [Complete workbook](../../output/admin-reporting/all-reports.xlsx),
  [financial workbook](../../output/admin-reporting/payments.xlsx),
  [large financial workbook](../../output/admin-reporting/large-payments.xlsx),
  [large invitation workbook](../../output/admin-reporting/large-invitations.xlsx).
- [Landscape PDF](../../output/admin-reporting/large-invitations-landscape.pdf),
  [portrait PDF](../../output/admin-reporting/large-invitations-portrait.pdf),
  [print preview](../../output/admin-reporting/print-preview.png).
- [Browser evidence](../../output/admin-reporting/browser-evidence.json),
  [PDF inspection](../../output/admin-reporting/pdf-inspection.json),
  [download inspection](../../output/admin-reporting/download-inspection.json).

Reproduce from repository root (the preview runs in its own terminal):

```powershell
.\apps\backend\mvnw.cmd -f apps/backend/pom.xml test -Dtest=AdminReportingTests
npm --prefix apps/frontend-admin run build
node apps/frontend-admin/node_modules/vite/bin/vite.js preview apps/frontend-admin --host 127.0.0.1 --port 4184 --strictPort
# In another terminal:
node scripts/qa/admin-reporting-browser.mjs
# Optional local QA tools, kept out of application dependencies:
python -m pip install --target output/admin-reporting/pdf-tools pymupdf
python scripts/qa/inspect-admin-reporting-pdfs.py
```

Primary implementation references: [Apache POI streaming spreadsheet support](https://poi.apache.org/components/spreadsheet/),
[SXSSFWorkbook lifecycle/API](https://poi.apache.org/apidocs/dev/org/apache/poi/xssf/streaming/SXSSFWorkbook.html),
and [Chromium print-margin page counters](https://developer.chrome.com/blog/print-margins?hl=en).

## Changed implementation inventory

- Backend API/DTO: AdminReportingController, AdminReportQuery,
  AdminReportingModels; additive AdminReportResponse and invitation/CSV adapters
  in AdminManagementController.
- Backend application: AdminReportCatalog, AdminReportFilter,
  AdminReportingService, AdminReportExportService, AdminReportSnapshotWriter,
  AdminReportWorkbookWriter; legacy growth/count fixes and obsolete buffered
  exporter removal in AdminManagementService.
- Persistence/shared: AdminReportReadRepository, AdminReportQueries,
  UserInvitationRepository moderation COUNT, CsvExportUtils.
- Backend QA: AdminReportingTests, AdminReportingControllerTests, OpenApiIntegrationTests,
  admin-reporting-fixture.sql; move old buffered CSV test coverage out of
  AdminManagementServiceTests.
- Frontend: AdminReportOverview and tests; all eight existing section/category/
  preview components; new ReportLedger, ReportFilters, ReportAnalytics,
  reportModel and tests, scoped reports.css; adminService APIs and safe
  csvExport utility/tests; licensed local reporting fonts.
- Documentation/contracts: this audit, metric dictionary, Admin API,
  PAGINATION_READINESS and generated `packages/api-contracts/openapi.yaml`.
- QA tools: `scripts/qa/admin-reporting-browser.mjs` and
  `scripts/qa/inspect-admin-reporting-pdfs.py`.

## Known limitations and follow-up

1. **MySQL verification unavailable:** Docker Linux engine pipe was absent;
   environment-gated MySQL tests were skipped, not reported as passes. Validate
   migrated MySQL DATETIME/driver timezone mapping and query plans in an isolated
   MySQL environment before a production capacity claim.
2. Browser checks use actual backend-generated synthetic SQL/POI/HTML fixtures
   replayed through the built frontend. HTTP security is tested separately with
   Spring MockMvc; this is not a live production API/DB end-to-end run.
3. Chromium desktop/tablet/phone viewport emulation and actual PDF rendering
   were available; physical devices, Firefox/WebKit, desktop Excel and native
   Khmer editorial review of the new admin copy were not performed.
4. Delivery, genuine last activity/DAU, template conversion, subscription
   transitions and infrastructure uptime need new reliable source data. Their
   absence is exposed explicitly; adding telemetry requires its own design.
5. Very large exports need resource/quotas and concurrency measurements. Offset
   batching is stable but deep offsets may justify a measured keyset/export-job
   design. XLSX/CSV spill disk and heap were not profiled at production scale.
6. No production rollout occurred. The subsequent publication task commits and
   pushes this work and verifies GitHub Actions separately from the local
   evidence above. Unrelated concurrent edits are preserved. Neither local
   checks nor GitHub CI imply a production deployment or release approval.
