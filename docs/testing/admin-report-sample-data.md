# Admin report sample data

The local development database contains 50 labeled reporting scenarios. Each
scenario links a synthetic user and invitation to one payment record. Existing
accounts, package prices, and customer records are preserved.

## Run or preview

Run from the repository root with Python and the MySQL command-line client:

```powershell
python scripts/maintenance/seed-admin-reports.py --dry-run
python scripts/maintenance/seed-admin-reports.py
```

The script reads the root `.env`, requires an explicit `dev` profile, and accepts
only a local MySQL database. Use `--env-file` for another local development
configuration or `--mysql` if the client executable is outside the usual path.

The inserts run in one transaction. Stable identifiers and checks prevent
duplicate records on reruns. The script inserts missing fixtures and preserves
existing dates and values. It does not run during normal application startup.

## Included records

| Record | Count |
| --- | ---: |
| Synthetic users | 50 |
| Private invitations | 50 |
| Inactive test templates | 6 |
| Template payment orders | 25 |
| Subscriptions | 25 |
| Guests | 250 |
| RSVP responses | 200 |
| Check-in records | 100 |
| Active check-ins | 66 |
| Audit events | 50 |
| System notifications | 50 |

Payment states include 25 `PAID` records and five each of `PENDING`,
`PAID_PENDING_REVIEW`, `FAILED`, `REJECTED`, and `EXPIRED`. Only 15 payments meet
the report's receipt rules. Five amount mismatches and five browser-claim
records exercise exception handling without contributing verified receipts.

Subscription prices come from the existing BASIC, PRO, and PREMIUM catalog.
The inactive test templates have their own explicit USD or KHR prices.
Currency totals remain separate; no exchange rate is assumed.

## Find the data in admin reports

Open the admin app's **Reports** workspace and choose **All time** to include
expired subscription history. For a custom range, use `createdFrom` and
`createdTo` from the generated summary; the ending date is exclusive.

- Search for `QA Reports 50` in invitations, engagement, users, and templates.
- Filter payments, reconciliation, and subscriptions by provider
  `QA_REPORT_FIXTURE` through the API. Order codes start with `QA50-`.
- Use the overview, engagement charts, reconciliation outcomes, currency
  filters, pagination, and CSV/XLSX exports to check the dataset.
- Monetary chart groups with fewer than five payments remain suppressed by
  the existing reporting rules.

All sample users have no password, invitations are private, and test templates
are inactive. Notifications use the system channel. The seed performs no bank
API calls, merchant-alert ingestion, external delivery, or real settlement.

The generated counts, dates, and expected receipt totals are saved in
[sample-data-50.json](../../output/admin-reporting/sample-data-50.json).

## Verify the generator

```powershell
python -m unittest discover -s scripts/qa -p test_seed_admin_reports.py -v
```
