# Architecture V2 Security Follow-up Register

Audit refreshed: 2026-09-15.

This document contains no credential values, authorization headers, reset tokens, payment secrets, or guest data. Keep all scan output redacted.

## Release decision

**NOT READY FOR PUBLIC RELEASE** until CRITICAL-S01 has verified external completion. Team-role functionality and retained media also have conditional HIGH gates described below.

## Open findings

### CRITICAL-S01 — Credential revocation and Git-history remediation

- **Finding:** Git history contains a previously exposed Telegram credential-shaped value and other secret-rule matches. Removing it from the current tree does not revoke it or erase prior commits.
- **Risk:** Bot impersonation, abuse of a trusted notification/payment channel, or recovery of secrets from branches, tags, forks, mirrors, caches, and old clones.
- **Repository evidence:** Gitleaks 8.30.1 reports zero findings on an exported current tracked tree. A redacted `--all` history scan reports 32 findings across 15 file/rule groups; several are fixtures/placeholders, but the known Telegram incident is real and every group still requires owner triage.
- **Required owner action:** revoke and replace the token through the provider; update only external secret stores; prove the old credential fails; review bot admins/webhooks/events; coordinate a protected `git filter-repo` rewrite across all branches/tags; invalidate caches and require fresh clones.
- **Completion evidence:** provider revocation reference/timestamp, redacted rejection test for the old token, healthy replacement deployment, redacted post-rewrite history scan, remote-ref verification, and contributor acknowledgement.
- **Status:** **OPEN / RELEASE BLOCKER.** Follow `docs/security/credential-incident-response.md`. Never paste the old or replacement value into Git, commands, issues, PRs, reports, or chat.

### HIGH-S03 — Effective organization permissions

- **Finding:** organization role labels exist, but downstream invitation, guest, media, planning, payment, export, and check-in actions do not have a product-approved permission matrix.
- **Current control:** owner identity/role cannot be assigned, changed, or removed through member APIs; inactive membership is denied; membership changes are audited; business services retain owner/admin authorization.
- **Risk:** broad future membership checks could over-authorize viewers, while the current owner-only behavior under-delivers staff roles.
- **Required action:** product/domain security must approve role × action rules, including ownership transfer policy. Implement centralized decisions/effective permissions and role-by-action allow/deny/IDOR tests before enabling team operations.
- **Status:** **OPEN / CONDITIONAL HIGH.** It does not weaken current owner-only authorization, but blocks representing team roles as operationally complete.

### HIGH-S10 — Asset redistribution evidence

- **Finding:** production redistribution rights for retained music and gallery/photo assets are not attached to the repository audit.
- **Required action:** record license/provenance evidence in the asset report or replace affected assets with approved material.
- **Status:** **OPEN / CONDITIONAL HIGH** for public distribution.

### MEDIUM-S05 — Telegram evidence retention and replay protocol

- **Current control:** detection defaults to `PAID_PENDING_REVIEW`; secret checks are constant-time; order rows are locked; fulfillment remains backend-owned and idempotent; Telegram webhook delivery supports the provider secret-token header.
- **Remaining risk:** raw message/metadata has no bounded retention cleanup, and the internal detection request has no independent signed timestamp/nonce protocol.
- **Required action:** approve retention/minimization, cleanup jobs, key-rotation cadence, and a replay-resistant request protocol if the integration crosses an untrusted network.
- **Status:** **PARTIAL / production-safe default present.** Keep `AUTO_CONFIRM_TELEGRAM_DETECTED=false` unless a separately trusted verification design is approved.

### MEDIUM-S07 — Scanner staff and revoke lifecycle

- **Current control:** check-in is owner/admin-only, row-locked, idempotent, invitation-scoped, and audited.
- **Remaining risk:** no dedicated staff permission, scanner-specific rate budget, or explicit revoke state/reason.
- **Required action:** approve the venue workflow, then add the `CHECK_IN` permission, revoke transition/audit, and measured per-scanner throttle with allow/deny/replay tests.
- **Status:** **OPEN / product design required.**

### LOW-S09 — Compatibility endpoint retirement

- **Finding:** canonical `/api/v1` endpoints and selected legacy aliases coexist.
- **Current control:** route consumers are centralized, canonical OpenAPI is drift-tested, and aliases share the same controller/security paths.
- **Required action:** instrument alias usage, publish deprecation dates, retain parity tests, and remove only in a versioned release after consumers migrate.
- **Status:** **OPEN / LOW compatibility debt.**

## Closed findings

| ID | Resolution and evidence |
| --- | --- |
| HIGH-S02 — browser cookie/CSRF policy | Cookie mode enables Spring's cookie CSRF token contract; missing-token and hostile-origin mutations are rejected, valid token requests succeed, and only explicit public recovery/provider/internal routes are exempt. Covered by `CookieCsrfSecurityTests`. |
| HIGH-S04 — paid subscription fulfillment | Trusted payment confirmation performs a locked, idempotent, transactional activation and entitlement transition based on server-owned package terms. |
| MEDIUM-S06 — external timeout/transaction boundaries | PayWay calls use 15s connect/30s request deadlines and verification occurs before the short locked completion transaction. Cloudinary uses 15s connect/60s request deadlines. Duplicate callback completion rechecks locked state. |
| MEDIUM-S08 — disposable MySQL release gate | CI provisions MySQL 8 and runs every Flyway migration plus Hibernate schema validation. Local execution remains intentionally opt-in to protect non-disposable databases. |
| Guest/RSVP/check-in/seating invariant findings | Shared validation, invitation-scoped resolution, dedicated public RSVP limits, row locks, and database uniqueness constraints now enforce the critical boundaries. |
| Current-tree secret hygiene | `.env`/runtime artifacts are ignored; examples contain placeholders; CI downloads checksum-pinned Gitleaks and scans the tracked checkout with redaction. Latest local exported-tree scan is clean. |

## Verification snapshot

| Gate | Result |
| --- | --- |
| Backend `mvnw.cmd verify` | **PASS** — 246 discovered, 245 passed, 1 disposable-MySQL skip; JAR and JaCoCo report generated |
| SpotBugs / PMD | **PASS** — zero High-threshold SpotBugs findings/errors; PMD clean |
| Cookie/authorization/payment tests | **PASS** within the complete backend suite |
| Frontends | **PASS** — 124 user and 10 admin unit tests; lint, Knip, depcheck, builds, and npm audits green |
| Controlled browser matrix | **PASS** — 12 critical plus 44 route-smoke cases across desktop/mobile projects |
| Telegram bot | **PASS** — 26 tests; Ruff, Bandit, compileall, and runtime-requirements audit green |
| Current tracked tree Gitleaks | **PASS** — zero findings |
| Full Git history Gitleaks | **FAIL / INCIDENT** — 32 redacted findings in 15 file/rule groups; CRITICAL-S01 remains open |
| Fresh MySQL | **CI GATE PRESENT; LOCAL SKIP** — requires disposable credentials or CI service container |
| Live providers/staging | **NOT CLAIMED** — follow `docs/testing/SMOKE_TEST.md` |

The automated code gates do not override the credential incident, substitute for asset rights, or prove production provider behavior.
