# Final security assessment

Guest tokens previously exposed other guests' private RSVP messages and protected ticket/pre-wedding media through guest-view. The endpoint now returns no public wishes and uses the existing public-media exclusions; organizer access remains tested. The MySQL regression failed before and passed after.

A deterministic two-transaction MySQL test proved a delayed profile flush could restore the old password hash and token version after reset. Hibernate now updates only changed user columns; reset invalidation survives that profile commit. Existing locking, cache invalidation, role checks and reset single-use behavior remain intact.

Diagnostics redact credential-bearing guest path segments and sensitive query keys, including encoded keys/prefixes. Actual servlet paths used for routing and authorization are untouched. Tests retain numeric IDs and benign pagination. Historical diagnostic retention still requires owner review; old logs were not erased.

Receipt access checks ownership before requiring authoritative PAID state. Expiry/replacement no longer rewrites paid history; nonfinancial demo grants are excluded from payment collections. Purchased snapshots supply historical package names. Explicit zero and legacy PAID-only amount fallback are preserved. No client return flag approves payment. Delivery preparation retains sent/failed/responded/viewed/reminder history and avoids duplicate preparation events.

## Dependencies

Both lockfiles patch follow-redirects 1.16.1 to 1.16.2, closing [the high advisory](https://github.com/advisories/GHSA-mrwp-f3q8-3g9p). Each final npm audit exits 1 with four moderate development-tool chain findings, zero high/critical. The minimatch fix requires a major lint-tool dependency change; this is recorded as accepted P2 exposure in trusted workflows, without a force-audit downgrade or suppression.

The stale installed Python trust bundle was vulnerable. Runtime requirements now pin certifi 2026.10.23; the refreshed venv and runtime/development/installed audits pass. Remote images must be rebuilt to inherit [the vendor fix](https://github.com/advisories/GHSA-6q48-6c7w-9gw2); their current trust stores were not inspected.

Configured Dependency-Check 13.0.0 fails anonymous NVD refresh with [the documented empty-key bug](https://github.com/dependency-check/DependencyCheck/issues/8715). Its 13.0.1 fix was unpublished at verification. A published 12.2.2 fallback attempt ended exit 1 without a fresh report or recoverable terminal cause. October 30 cached data is not current passing evidence. CVSS 8, zero-hour freshness and the existing scoped suppression were unchanged. No fake key, new suppression, scanner downgrade or cached-JAR modification was applied.

## Secrets and limits

Current tracked plus new nonignored source was scanned under the CI policy and with fingerprint/inline allowances bypassed: zero findings. The strongest history scan includes all local refs and merge-parent diffs: **58 detection records, 27 rule/path groups, 23 files**. These are neither 58 unique credentials nor 58 proven active secrets. Fixtures/examples coexist with historical Telegram/private-key incident candidates. Existing incident documents require owner triage and revocation/rotation evidence; none was fabricated. History was not rewritten. See [sanitized counts](evidence/secret-scan-summary.json).

No live payment, broadcast, provider authentication, production exploit or production data mutation was executed. Current Java vulnerability evidence and historical credential remediation remain release blockers. TLS, CORS/CSP/cookies, proxy trust, Redis limits, storage and provider secrets require verification on the actual deployment target.
