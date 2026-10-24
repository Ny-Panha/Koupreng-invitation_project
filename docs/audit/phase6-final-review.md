# Phase 6 local engineering review

Review archive: `D:/Koupreng-UXUI-Phase6/Koupreng-Phase6-Review.zip`.
Local branch: `feat/phase6-integrity-entitlements`. No push, merge, deployment,
production migration or existing user database write was performed.

## Changes

- Wedding Program uses the existing flat JSON contract with independent
  Day 1/2 dates, explicit blank-date linkage, periods/end times, preserved legacy
  agenda groups and shared date rendering. Host dates override sample headings.
- Love Story editing follows actual renderer capabilities, preserves hidden
  content, and uses the same chapters/toggles in live and public adapters.
- Studio supplies an optional conflict timestamp; the backend rejects stale
  writes and returns MySQL-normalized timestamp precision after persistence.
- Backend entitlements use configured Free or valid paid/nonrevenue grant
  snapshots. Roles, ownership and product tiers remain independent. Quota
  writes lock the owner; existing feature guards and purchased template access
  remain intact. Imports, branding changes, team capacity and external AI paths
  use configured benefits.
- Package revisions and frozen order benefits preserve existing promises,
  including duration. User cards show current plan and actual usage; admin
  cards expose revision/publication policy. Price/link mismatches fail closed.
- Only additive V44-V46 migrations were introduced. V1-V43 are unchanged.
- Four requested identities were registered only in an owned disposable native
  MySQL instance on loopback port 3416. Re-runs preserve passwords/roles/expiry.
  Grants have no fake verified payment or provider reference. Credentials are
  outside the review folder in an ACL-protected local directory.
- Reports reuse the existing ten-report catalog/query stack. CSV now has one
  interoperable header; server exports have bounded generation and outcome
  auditing, with report-denial audit inside the security chain. The export
  dialog explains count, scope, filters, columns, privacy and real formats.

## Verification

- User frontend: 691 passed; production build and lint passed.
- Admin frontend: 115 passed; production build and changed-scope lint passed.
- Backend full suite: 584 discovered, 537 passed, 47 environment gates skipped.
- Separate native MySQL regression: 30 passed; final upgrade run: 4 passed;
  final Phase 6 acceptance: 3 passed. These runs overlap.
- Worker: 72 passed, two upstream deprecation warnings.
- Chromium Studio/Phase 5 fixture regression: 13 passed; further final Studio
  verification and live HTTP captures are recorded in the review metadata.
- Skills integrity and routing validation passed.
- Actual CSV/XLSX/print HTML samples use fictional data. CSV count agrees with
  its source query; special characters/Khmer/formula prefixes round-trip safely.
  XLSX opens read-only in native Excel. All screenshots decode; provenance
  separates fixture browser tests from real HTTP/JPA/MySQL.

Exact commands, final HEAD, per-file hashes, screenshot inventory and archive
integrity are recorded in the generated handoff metadata. Raw debug logs stay
local and are excluded from the ZIP.

## Limits and release gates

Live ABA/Telegram, cloud media, Google login, external AI and physical devices
were not verified. Direct PDF is unavailable; actual print HTML is included.
Redis production behavior was not exercised. Docker was unavailable; native
MySQL provided fresh/upgrade evidence. Team co-management UI remains explicitly
unavailable; advanced analytics is a configured flag without a newly invented
premium-only product endpoint. Current-page client CSV does not create a server
export audit event; server full-result formats do. Audit retention scheduling,
comprehensive accessibility/zoom and other browsers remain follow-up work.

Full admin lint still has 22 pre-existing errors and one warning in unchanged
files. Optional optimistic timestamps preserve legacy clients; callers omitting
the timestamp do not get conflict detection. These limitations are disclosed
in the review rather than reported as completed functionality.

The concurrent user commit `44c7d1d3` and its compiled test directory remain in
the ancestry. Generated admin test outputs were restored to their original
tracked state; no user source changes were discarded.
