# API, database and compatibility

## Safe extensions

- Organization member creation returns a one-time invitation token only in the creation result. Ordinary member lists never return that token/hash. Authenticated `/organizations/invitations/accept` binds the code to the intended account email, expiry, unused state and capacity.
- `/invitations/{id}/access` exposes effective permissions and owner feature names. `/invitations/{id}/team` links/unlinks an owner-controlled organization with the required expectedUpdatedAt.
- Event summaries identify owner/shared events. Existing owner-only methods remain strict; specific operational services opt into module permissions. Financial/gift fields remain owner-controlled.
- `/invitations/{id}/check-in/roster` is a bounded contact/token-free staff roster.
- `/invitations/{id}/guests/overview`, `/guests/page` and `/guests/export-selection` extend existing guest APIs. Collection/import/QR/seating contracts remain compatible. New pages have explicit record/seat/attendee units.
- `/invitations/{id}/analytics` requires VIEW_REPORTS and the event owner's ADVANCED_ANALYTICS. Date ranges contain at most 366 inclusive Cambodian calendar dates; current totals and daily stored facts are separate.
- Subscription responses identify nonrevenue demo grants without exposing administrator identity or payment evidence. Existing benefit snapshots and trusted payment reconciliation rules remain intact.

`packages/api-contracts/openapi.yaml` was regenerated and checked against the actual Spring runtime. Controllers call application services and return DTOs; ArchUnit passes. No browser action can activate paid access. Team quotas count ACTIVE/INVITED membership entries across an owner's organizations, including the owner entry per organization.

## Migrations and data safety

The baseline contains **43 migration files through V46** (version numbers have historical gaps). SHA-256 verification confirms every baseline file unchanged. Phase 7 adds only:

| Migration | Purpose |
| --- | --- |
| V47__organization_invitation_acceptance.sql | Nullable invite SHA-256 hash and expiry, unique hash index |
| V48__organization_event_acceptance_proof.sql | Nullable explicit acceptance timestamp |
| V49__index_guest_dashboard_order.sql | Invitation/creation/ID index for the new stable bounded guest page order |

Legacy organization membership is preserved. A legacy ACTIVE member without explicit acceptance proof does not acquire new event permissions. Owners can reissue an invitation and obtain consent. Existing owner membership remains protected.

Native MySQL tests exercised fresh schemas and representative upgrades, including V46 owner/pending-member preservation. These migrations were applied only to task-owned schemas on loopback port 3416. The working development `koupreng_db` on port 3306 was not migrated. No historical migration, production data or Phase 6 demo record was replaced.

Migrations are forward-only. Do not remove/rename/edit applied V47–V49 on a migrated environment. Remediation should revoke/unlink the affected collaboration grant and use a reviewed forward migration if schema changes are needed; no destructive down migration is supplied. Deployment and production migration require separate approval.

`D:/Koupreng-UXUI-Phase7/migration-verification.json` records unchanged historical hashes and the new checksums. Native tests use generated schema names or the explicitly guarded phase7_disposable database. Three historical Phase 6 provisioning tests were deliberately not enabled because their guard targets the separate Phase 6 demo database.

The post-V49 native gate passed 35 tests: 11 real HTTP/MySQL Phase 7 cases, five fresh/upgrade migration cases, 14 OpenAPI cases and five architecture cases. MySQL EXPLAIN now chooses `idx_guests_invitation_created_id` for the newest-first ID page, reporting `Backward index scan; Using index` instead of `Using filesort`. This verifies the access path on disposable fixtures, not a production throughput guarantee.
