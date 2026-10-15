# Admin API

Verified controllers: `AdminManagementController`, `AdminInvitationController`, `AdminNotificationController`, `AdminUserController`, plus admin routes in `TemplatePaymentController`, `BudgetController`, and `DashboardReportController`.

Role requirement:
- `/api/v1/admin/**` requires `ADMIN`.
- `/api/admin/**` requires `ADMIN`.

Representative verified routes:
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{userId}`
- `PATCH /api/v1/admin/users/{userId}/activate`
- `PATCH /api/v1/admin/users/{userId}/deactivate`
- `PATCH /api/v1/admin/users/{userId}/role`
- `GET /api/v1/admin/templates`
- `POST /api/v1/admin/templates`
- `PUT /api/v1/admin/templates/{templateId}`
- `DELETE /api/v1/admin/templates/{templateId}`
- `GET /api/v1/admin/invitations`
- `GET /api/v1/admin/invitations/{invitationId}`
- `PATCH /api/v1/admin/invitations/{invitationId}/moderate`
- `GET /api/v1/admin/reports/users`
- `GET /api/v1/admin/reports/invitations`
- `GET /api/v1/admin/reports/payments`
- `GET /api/v1/admin/system-logs`
- `GET /api/v1/admin/payments`
- `GET /api/admin/invitations`
- `GET /api/admin/users`

Schemas:
- Insufficient data to verify full request and response schemas in this document.

## Reports & Analytics contract (2026-10-15)

The active `/reports` frontend uses `AdminReportingController` and the minimized
`view=ledger` invitation projection. All reporting routes require an authenticated
`ADMIN`; the application service also checks the persisted administrator is
ACTIVE and not deleted. STAFF does not inherit report authorization.

| GET route | Contract |
| --- | --- |
| `/api/v1/admin/reports/management/definitions` | Ten definitions, bilingual titles/column labels, column types, supported dimensions and filters, notes and KPI dictionary |
| `/api/v1/admin/reports/management/{report}` | Filtered page with full-filter summary and chart aggregates |
| `/api/v1/admin/reports/invitations?view=ledger` | Same paginated management contract; the existing invitation path is the active UI source |
| `/api/v1/admin/reports/management/{report}/export/{format}` | Complete filtered XLSX, CSV or HTML snapshot; ignores page/size for export scope |
| `/api/v1/admin/reports/management/all/export/xlsx` | All ten report worksheets plus Metadata; accepts common period only, rejects ledger-specific filters |

Report codes: `executive`, `payments`, `reconciliation`, `invitations`, `users`,
`templates`, `subscriptions`, `engagement`, `system`, `dictionary`.

Query fields: `from`, `to`, `dateDimension`, `eventType`, `status`,
`moderationStatus`, `paymentType`, `paymentStatus`, `provider`, `currency`,
`packageId`, `search`, `sort`, `direction`, `page`, `size`. Each definition
allowlists supported filters and dimensions. Unsupported combinations are 400,
not ignored. Search is literal, case insensitive, maximum 160 printable
characters. Sort must name a declared column; direction ASC/DESC; ID is the
stable tie breaker. Page starts at 0, size is 1–200 (default 20).

Dates are ISO calendar dates in Asia/Phnom_Penh: `[from, to)`. Supply both or
neither; omitted dates mean all time. The UI supplies a last-30-calendar-days
default, persists filters in the URL, and converts its inclusive through-date
to the exclusive API `to`. Timestamp bounds bind UTC DATETIME values; event-date
bounds compare DATE values. Active-period filtering uses interval overlap;
effective subscription state is evaluated at generation time.

Default dimensions: executive `metric` (per metric), payments/reconciliation
`activity`, invitations/users/engagement/system/subscriptions `createdAt`,
templates `activity`, dictionary `definition`. Financial activity uses paidAt
for PAID records (createdAt fallback marks missing-date exceptions), createdAt
otherwise. Other available dimensions are declared in the catalog.

`ApiResponse.data` preserves existing report fields and adds:

- `definition`: versioned bilingual, typed, ordered column schema.
- `metadata`: snapshot ID, generation instant, timezone, inclusive/exclusive
  period, dimension, applied filters, total matching records, scope, sort,
  direction and definition version.
- `filteredSummary`: authoritative totals over every matching row, separate
  from page length; `summary` is retained as the same map on the new contract.
- `series`: server aggregates with explicit dimensions and suppression state.
- `notices`: metric, privacy and unavailable-data qualifications.

Money is calculated as BigDecimal and returned per currency; rates are fractions
(0.5 = 50%). Zero denominators return null with defined growth states. The
frontend accepts the existing numeric epoch-second and ISO timestamp forms.
Guest reports contain event aggregates, never guest names or contact data.

Formats: `xlsx` is a native streamed workbook; `csv` has a UTF-8 BOM, stable
column keys and a metadata preamble; `html` is escaped print content with local
Khmer fonts. HTML is **not** a PDF download. Use the preview's **Print / Save as
PDF** action. Print snapshots above 20,000 records are rejected with an explicit
instruction to narrow filters or use complete CSV/XLSX. XLSX sheets continue
before Excel's row limit. Unsupported formats are 400.

Exports are generated in one read-only repeatable-read transaction and spooled
to disk. The transaction ends before copying the completed file to the client.
Temporary files are deleted on success, generation failure and client disconnect.
Each export is a newly generated snapshot of its captured filters; its timestamp
can differ from an earlier UI page. A print preview retains its captured document
when language, filters or orientation change.

The old JSON routes remain available for compatibility and are not the source
for new management totals. Existing `/reports/invitations/export` and
`/reports/payments/export` now use bounded streaming adapters while retaining
their original BOM, header names/order and UTC timestamp layout. Their legacy
Amount column is not a receipts total: non-PAID amounts are expected values,
and unsafe/nonmatched PAID amounts are blank. New automation should use the
versioned management exports with explicit reconciliation outcomes and metadata.

Full metric definitions, workbook structure, security review, query limitations,
test evidence and reproduction commands: [reporting audit](../audit/admin-reporting-system.md).
