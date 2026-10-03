# Codex Phase 2 implementation report

Status: remediation and verification completed for the authorized scope; documented owner/product/external boundaries remain.

Baseline: branch `fix/full-ci-repair`, HEAD `29c324101a2d4d11e66ee56a82b7fa41c9ee4ef5`; 1,595 tracked files hashed before changes. The untracked Phase 1 report is preserved. All 24 report sections, endpoint/DTO/integration tables and preservation manifests were read before application changes. Baseline hashes and private test evidence live outside the repository under the Phase 2 temporary workspace.

Fresh frontend baseline: user lint/build pass, 231 tests; admin lint/build pass, 40 tests. Python baseline: 32 tests pass. Maven clean verify: 279 tests, no failures/errors, one migration skip; SpotBugs and PMD pass. Separate fresh MySQL 8.0.39 migration and Hibernate schema validation: one test passes. Existing E2E baseline: 56 pass, two known continuous-animation locator failures. Docker storage reports a read-only filesystem; a separate task-owned MySQL datadir/port is used without changing installed databases or existing containers.

No deployment, real provider/payment calls, actual secret modification, history rewriting or pushing is authorized. Historical migrations and legacy entities remain preserved.

## Completion matrix

| ID | Severity | Status | Tests | Result | Notes |
|---|---|---|---|---|---|
| PAY-001 | High | FIXED | Nine buyer-claim cases failed before; expanded37-case suite passes after, including trusted owner/template binding, amount mismatch, duplicates and late callback.; Final focused review: final-review-before.log reproduced three additional failures; final-review-after.log passes all55 tests, including39 payment cases,12 actual JWT-cookie CSRF cases, both claim aliases and3 cookie controller cases. | Verified | Actual bank/provider callbacks deliberately mocked; buyer references remain untrusted audit metadata. |
| SEC-001 | High | FIXED | Before: logs/security-auth-rsvp-before-final.log, 15 tests / 4 failures, unexpected successful email-based social takeover and generic RSVP capability disclosure.; After: security-stage2-after.log, 34 passing tests; provider subject/email drift, explicit linking conflicts, reserved synthetic email rejection and both link-route aliases reject anonymous requests.; Real MySQL: logs/mysql-integrity-upgrade-after.log, 10 passing tests across fresh/upgrade/auth/subscription suites; logs/mysql-final-mutations.log, 8 passing tests, including identity case sensitivity/uniqueness.; check-in-summary-after.log: 37 passing tests, including social-first local registration collision and same-email/different-subject rejection.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.; Frontend auth/profile/social linking23targetedPASS; full user367PASS includes actual Google widget mock, link-only protected flow and ACCOUNT_LINK_REQUIRED recovery guidance | Verified | Legacy provider identities cannot be reconstructed safely from email. Recovery/owner assistance must handle users without a current session or verified recovery route. |
| DB-001 | Medium | FIXED | Real MySQL: logs/mysql-integrity-upgrade-after.log and logs/mysql-final-mutations.log validate STAFF insert, actual admin create/update services and JWT authority conversion.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified | Changing STAFF privilege policy requires an explicit owner decision; this repair does not invent reduced or increased privileges. |
| DB-002 | High | FIXED | backend-stage4-5-after-final.log, 77 passing tests including 16 subscription service tests.; Real MySQL: logs/mysql-integrity-upgrade-after.log, four subscription integrity cases covering expired renewal, paid-history-preserving replacement, concurrent payments and rollback.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified | Existing historical subscriptions are not rewritten or deleted. |
| BE-001 | High | FIXED | Before: logs/media-before-regression.log demonstrates old cover deletion on upload failure and staged object leakage on database failure.; After: security-media-after.log and backend-stage4-5-after-final.log validate staged uploads, after-commit old deletion, rollback compensation, unknown-completion retention and cleanup failure handling.; Real MySQL: logs/mysql-final-mutations.log validates persisted references and simulated storage bytes on rollback/commit.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified | Storage cleanup is best effort. Process crashes, unknown transaction completion or cleanup failure may leave orphan objects requiring reconciliation; durable outbox retries are outside this bounded fix. |
| BE-002 | Medium | FIXED | Effectiveprodwrongdefault before; 2profile/6signedJWKS regressionsPASS | Verified | No realGoogle OAuth/providercalls |
| SEC-002 | Medium | FIXED | security-media-after.log: 94 passing targeted tests, including commit/rollback cache eviction, revoked-token stale-cache rejection, fresh-role authority and preserved STAFF mapping. | Verified | Current database reads remain part of authorization; no claim of reducing authorization query count. |
| SEC-003 | Medium | PARTIAL | Before: logs/media-before-regression.log, 11 tests / 3 failures, including forged SVG accepted as PNG.; After: security-media-after.log, 94 passing targeted tests; backend-stage4-5-after-final.log, 77 passing tests including 26 MediaService tests.; Real MySQL: logs/mysql-final-mutations.log, 8 passing tests, including two concurrent gallery uploads against a configured one-file quota.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified changes; boundary retained | PRODUCT_POLICY_REVIEW_REQUIRED: the owner must select a nonzero default per-invitation gallery/storage quota if desired. No commercial limit was invented. |
| SEC-004 | High | FIXED | Before: logs/security-auth-rsvp-before-final.log, 15 tests / 4 failures including known-contact mutation and response token disclosure.; After: security-stage2-after.log, 34 passing tests; backend-stage4-5-after-final.log, 77 passing tests including 10 RSVP service tests.; check-in-summary-after.log: 37 passing tests, including both new social-first negatives and generic RSVP regressions.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified | Shared contact values may require the personalized invitation link. Generic guest creation uses the same configured quota infrastructure as owner guest creation. |
| SEC-005 | Medium | FIXED | security-media-after.log, 94 passing tests.; Real MySQL: logs/auth-integrity-mysql-after.log and logs/mysql-final-mutations.log verify rejected login audit survives rollback with bounded reason metadata.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified | Audit persistence still depends on database availability; no external audit delivery system was introduced. |
| SEC-006 | Medium | FIXED | Cookie CORS missingheader and actual-cookie CSRF bypass failed before; ten targeted cases pass after.; Both current-user aliases emit a matching CSRF cookie/proof header, exposed only through configured CORS; 11-cookie-security-test suite passes. Contact/AI/report combined25 tests pass.; Final12-case CookieCsrfSecurityTests passes, including actual cookie JWT negative/positive proof and login response header before the first cross-origin mutation. | Verified | Existing private CORS_ALLOWED_HEADERS overrides must allow X-XSRF-TOKEN. Actual JWT-cookie transport is integration-tested; live-backend browser tests remain opt-in. |
| PAY-002 | Medium | PARTIAL | Eight policy tests pass; actual isolated MySQL concurrency/atomic bulk rejection3 tests pass (mysql-entitlement-final.log).; Four real-MySQL entitlement tests pass: serialized guest/invitation quota races, atomic bulk rejection and public-RSVP versus owner guest creation. Strict enforcement fixture uses explicit reviewed free policy; production compatibility mode remains default. | Verified changes; boundary retained | PRODUCT_POLICY_REVIEW_REQUIRED: approved free limits, team scope, branding/advanced-report scope, and commercial activation. No arbitrary free-tier restriction enabled. Existing publication/history stays accessible; subscription expiry versus premium editing policy requires review. |
| BE-003 | Medium | FIXED | Mixed-currency aggregation failed before; expanded 9-case budget suite passes after.; Budget display2 failed before nowPASS; active gift/expense display2 failed before nowPASS; expense arithmetic2PASS; Existing budget/expenses/gifts tests PASS | Verified | The historical budget goal has no stored currency; its interpretation requires owner review. Mixed item totals and active expense/gift displays remain separate USD/KHR ledgers without FX. |
| BE-004 | Medium | FIXED | Host cap preservation failed before; all three planning mutations preserve cap; 9-case suite passes. | Verified | No historical totals are guessed or rewritten. |
| DB-003 | Medium | NEEDS_OWNER_DECISION | Baseline fresh MySQL migration and Hibernate validation pass; historical customer mappings unavailable. | Owner evidence required | Historical mappings require owner backup/evidence; no guessed recovery applied. |
| BE-005 | Medium | PARTIAL | 20-invitation ORM fixture before: covers22/dashboard65 SQL; after: covers2/dashboard7 SQL. Growth regression passes.; Malicious report CSV cell regression passes in DashboardReportServiceTests (3 tests).; Same admin20-invitation fixture before22 entity loads/6 SQL, after7 entity loads/9 SQL. Full counts and five recent invitation rows preserved; combined60 target passes.; Measured20-invitation fixtures: cover SQL22→2; user dashboard65→7; admin loaded entities22→7 and SQL6→10 (extra grouped currency projection); check-in SQL23→4 and entities38→1. Bounds and result preservation pass.; check-in-summary-before.log: 27 tests / one expected query-bound failure, 20 guests yielded 23 statements and 38 entity loads.; check-in-summary-after.log: 37 tests PASS; same 20-guest fixture yields four statements and one loaded entity with total=20, active=19, remaining=1, attendingCheckedIn=9.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified changes; boundary retained | Full report/export and other legacy list/analytics payloads remain unbounded for compatibility. Production query plans/cardinality and compatible pagination are outside the measured fixture changes. |
| ARCH-001 | Medium | PARTIAL | Four adapter-double tests pass: disabled/missing configuration, five distinct operations, safe provider failure, timeout cancellation.; Two endpoint regressions pass: allfiveanonymousroutes401 before adapter calls; excessiveinput400; explicitly local response. Included in policy/admin60 passing tests.; Before4 failures now5PASS including valid provider response and outage fallback | Verified changes; boundary retained | NEEDS_PRODUCT_DECISION: provider/model/cost policy and AI/package capability activation. Internal adapters are tested; no external AI provider/key setup or paid calls occurred. |
| BE-006 | Low | FIXED | 3service negatives before; 19combinedJava passafter | Verified | No existingevent/migration deletion |
| SEC-007 | Medium | FIXED | security-media-after.log, 94 passing tests including invitation/client scoped failure counters, rejection before BCrypt, successful-password noncharging and valid guest-token bypass. | Verified | Client address identity follows the existing trusted-proxy resolver configuration; production Redis policy remains unchanged. |
| PAY-003 | Medium | PARTIAL | Two checkout policy tests pass, including new active premium entry; empty-catalog authorization reproduced before and fixed after. Combined policy/admin target60 tests passes.; Approved offer/legacy Garden/rejected unknown/new premium2PASS | Verified changes; boundary retained | NEEDS_PRODUCT_DECISION: resolve free Garden catalog versus legacy USD0.01 checkout and approve offer/provider mapping for future premium templates. No new charge, fixed-link replacement or real provider call. PRODUCT_POLICY_REVIEW_REQUIRED: owner selects prices/payment links for additional premium templates. |
| SEC-008 | Low | FIXED | security-media-after.log, 94 passing targeted tests.; Real MySQL: logs/mysql-integrity-upgrade-after.log and logs/mysql-final-mutations.log verify two concurrent reset attempts yield exactly one successful redemption.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL. | Verified | Normal database lock timeout/deadlock responses remain possible under abnormal contention; no reusable reset capability is exposed. |
| FE-001 | High | FIXED | Before cookie restoration:7 failures; Auth/profile/social linking targeted23PASS; full final user367PASS, admin46PASS; cookie/bearer CSRF header regressions | Verified | Backend cookie flag/CORS/header proof must be enabled consistently; root verified real-cookie first-mutation proof. |
| FE-002 | Medium | FIXED | QR contract4 failed before, now4PASS; existing QR tests retained | Verified | No additional product decision for this fix. |
| FE-003 | Medium | FIXED | QR contract before4 failures now4PASS | Verified | No additional product decision for this fix. |
| FE-004 | High | FIXED | Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS | Verified | Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry. |
| FE-005 | High | FIXED | Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS | Verified | Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry. |
| FE-006 | High | FIXED | Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS | Verified | Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry. |
| FE-007 | Medium | FIXED | backend-stage4-5-after-final.log, 77 passing tests including check-in undo/reactivation/non-owner cases and endpoint authorization/routing.; Real MySQL: logs/mysql-final-mutations.log verifies persistent state/history, counts, reactivation and non-owner rejection.; logs/mysql-integrity-upgrade-after.log verifies exact historical actor/time/source/note backfill during V27 to V30 upgrade.; check-in-summary-before.log reproduced 23 SQL statements / 38 entities for 20 guests; check-in-summary-after.log passes 37 tests and reduces summary to 4 SQL statements / 1 entity with unchanged active/ATTENDING counts.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.; Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS | Verified | Explicit hard deletion of an invitation/guest still follows existing cascade deletion semantics; undo itself never deletes history. Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry. |
| FE-008 | Medium | FIXED | backend-stage4-5-after-final.log, 77 passing tests including wish moderation and endpoint authorization/routing.; Real MySQL: logs/mysql-final-mutations.log verifies message-only clearing, unchanged attendance/count/guest/respondedAt, idempotency and non-owner rejection.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.; Frontend selected wish success/failure regression PASS; backend owner-only message-preserving tests and real MySQL audit by backend agent | Verified | No new broad administrator moderation privilege was added. No additional product decision for this fix. |
| FE-009 | Medium | FIXED | Both /reports and /dashboard/reports scoped-navigation/location-state tests PASS; All79 user and23 admin explicit path lines retained after route splitting | Verified | No additional product decision for this fix. |
| FE-010 | Medium | FIXED | Engine before6FAIL/1PASS; engine7+dedicated7+protocol15/admin3 PASS; QA actual owner/admin/public preview11/11PASS: actual text and Bayon font edits; wrong nonce and public forgeries ignored; 6 latest-state/reload/unmount unit regressions; final accepted production preview11 PASS and zero page errors | Verified | A trusted preview host has editing capabilities by design. No origin wildcard or production public-preview bypass remains. |
| FE-011 | Low | FIXED | Before2 failures now2PASS; 6 latest-state/reload/unmount unit regressions; final accepted production preview11 PASS and zero page errors | Verified | No additional product decision for this fix. |
| FE-012 | Medium | FIXED | Before2 failures now3 note cases PASS; failed save/summary2PASS | Verified | Venue decorative positions remain an explicitly labeled existing device-local preference; server table positions remain authoritative. |
| FE-013 | Medium | FIXED | After-change timezone-previous-day and explicit date2PASS; no before failure claimed | Verified | No additional product decision for this fix. |
| UX-001 | Medium | FIXED | 8 failing before then 8 pass including localization; final marketing targeted11 pass; focused lint pass; Seven contact service/endpoint tests plus11 UI tests and11 real marketing browser checks pass; tests use a mail double with no real SMTP delivery.; final mocked browser11 checks PASS, zero JS errors | Verified | Real delivery requires owner-configured SMTP and CONTACT_RECIPIENT. Tests verify SMTP acceptance using doubles; inbox delivery is not claimed. |
| UX-002 | Medium | FIXED | Language aliases7PASS; explicit-language RSVP regression PASS | Verified | No additional product decision for this fix. |
| A11Y-001 | High | FIXED | Before3 failures now3PASS; existing guest QR/gift modal consumers6PASS | Verified | No additional product decision for this fix. |
| A11Y-003 | Medium | FIXED | Before2 failures now2PASS | Verified | No additional product decision for this fix. |
| A11Y-004 | Medium | FIXED | Before3 failures now3PASS | Verified | No additional product decision for this fix. |
| PERF-001 | Medium | FIXED | Both lint/unit/build PASS; exact explicit route path-line preservation JSON; Measured HTML entry plus every transitive static JS import: user1,801,675->664,896 bytes; admin702,544->370,291 bytes | Verified | User main chunk remains around547kB and keeps Vite large-chunk advisory; external Telegram script is unchanged and excluded from local bundle bytes. |
| PERF-002 | Medium | FIXED | Before3 failures now3PASS: concurrency, TTL/language isolation, retry after failure | Verified | Public catalog edits may appear up to30seconds later in an already-open tab; access decisions always use the server. |
| PY-001 | High | FIXED | 7 negative failures before; 42 pytest pass after; Ruff pass; final full pytest61 PASS, Ruff PASS, Bandit zero findings/errors | Verified | Actual local secrets require owner rotation under REPO-001 |
| PY-002 | Medium | FIXED | 5 delivery negatives before; 61 Python pass; Ruff/Bandit0; final full pytest61 PASS, Ruff PASS, Bandit zero findings/errors | Verified | Per-process bounded memory; backend guards protect restart/multiworker redelivery |
| PY-003 | Low | FIXED | 12 malformed/JSON negatives before; 61pytestpass; final full pytest61 PASS, Ruff PASS, Bandit zero findings/errors | Verified | Unsupported Telegram features intentionally ignored |
| CFG-001 | High | FIXED | Compose resolved prod before regressionfailed; afterlocaldev/disabledbootstrap PASS | Verified | Not productionready; full Docker start blocked by external read-only daemon |
| REPO-001 | High | PARTIAL | Private exact comparison eight extractable candidates; zero tracked references; JWT/Telegram true local runtime flags; final exported current tree1714files Gitleaks exit0 zero matches; private runtime Boolean recheck completed | Verified changes; boundary retained | Owner must revoke and replace credentials; provider validity not tested |
| QA-001 | Medium | FIXED | Baseline two continuous-motion opener locator timeouts; physical center-pointer opening now preserves normal animation. First complete final-dist suite66PASS/two explicit live-backend skips; no failures.; Font checks await the actual selected text font; exact450px desktop geometry matches original HEAD.20 viewport cases and mandatory screenshot capture pass. | Verified | Two live-backend opt-in scenarios require an explicitly running backend. Real-device camera permissions are not exercised by these tests. |
| QA-002 | Medium | FIXED | 3 public control tests pass; old route unstable array causes before harness render loop, bounded/interrupted recorded; final mocked browser11 checks PASS, zero JS errors | Verified | Keyboard/focus/public controls pass the documented unit/browser checks. A complete assistive-technology audit is not claimed. |
| QA-003 | Medium | FIXED | Targeted contact/control suite11 pass; final mocked browser11 checks PASS, zero JS errors | Verified | Contact labels/validation/retry and accepted-delivery state are verified; real mail delivery requires configured SMTP. |
| QA-004 | Medium | FIXED | Two outage regressions fail before/pass after; final mocked browser11 checks PASS, zero JS errors | Verified | English/Khmer fallback on tested public marketing surfaces is verified with i18n unavailable; live remote localization is not required for those readable fallbacks. |
| QA-005 | Medium | FIXED | Focused ESLint pass; final mocked browser11 checks PASS, zero JS errors | Verified | Direct desktop/mobile Contact/Pricing entry and scoped styles pass browser checks; no blanket pixel-perfect claim outside tested viewports. |
| CFG-101 | Medium | FIXED | Camera policy negativefailedbefore/passafter | Verified | Camera realdevicepermission notyetverified |
| CFG-102 | Medium | FIXED | Broken wrapperbefore; all3config testsPASSafter including Help | Verified | Full launcher intentionally notrun against existing workstations services |
| REPO-101 | Low | FIXED | Local link/image resolutionfailedbefore/PASSafter | Verified | README links resolve. Eleven additional missing runtime image references were recovered byte-for-byte from local history under P2-NEW-010; no original artwork decision remains. |
| REPO-102 | Low | FIXED | 5manifest weeklytargets present/YAMLvalidated | Verified | Hosted Dependabot execution/permissions unverified |
| REPO-103 | Low | FIXED | Mutabletag regressionfailedbefore/allactionSHAcommentsPASSafter/YAMLvalid | Verified | RemoteGitHubCI notrun;setupjavav4manifest deprecation deferredversionupgrade |

## Finding records

### PAY-001 — Unpaid customers can confirm template payment and unlock access

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplatePaymentService.java:519`.

Implementation: Buyer claim requests PAID_PENDING_REVIEW without paid metadata or access. Locked trusted paths require payable, unexpired orders; late non-paid callbacks cannot downgrade terminal states. Remote nonapproval cannot revive any terminal payment. Claim API summary and envelope now describe review processing, preserving polling and response shape.

Files: `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplatePaymentService.java`, `apps/backend/src/test/java/com/koupreng/backend/payment/application/TemplatePaymentServiceTests.java`

Tests/evidence: Nine buyer-claim cases failed before; expanded37-case suite passes after, including trusted owner/template binding, amount mismatch, duplicates and late callback.; Final focused review: final-review-before.log reproduced three additional failures; final-review-after.log passes all55 tests, including39 payment cases,12 actual JWT-cookie CSRF cases, both claim aliases and3 cookie controller cases.

Compatibility: Both claim aliases, checkout, polling, trusted admin/internal/provider/Telegram confirmation and purchased access remain.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Actual bank/provider callbacks deliberately mocked; buyer references remain untrusted audit metadata.

### SEC-001 — Email-only social linking allows account pre-hijacking

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/auth/application/AuthService.java:88`.

Implementation: Social login resolves only a verified provider subject. Email collisions return ACCOUNT_LINK_REQUIRED rather than merge accounts. Authenticated explicit linking re-verifies provider proof, serializes on the current user and rejects cross-account subjects or replacing an existing provider identity. Existing Profile exposes explicit Google/Telegram linking using real existing SDK/widgets; successful direct UserResponse updates profile without token rotation. Existing-account 409 explains sign-in/recovery then linking; no automatic retry or merge.

Files: `apps/backend/src/main/java/com/koupreng/backend/auth/application/AuthService.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/api/AuthController.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/domain/UserExternalIdentity.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/persistence/UserExternalIdentityRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/shared/config/SecurityConfig.java`, `apps/backend/src/main/resources/db/migration/V28__persist_verified_provider_identities.sql`, `apps/frontend-user/src/features/auth/components/SocialAuthButtons.jsx`, `apps/frontend-user/src/features/auth/components/socialAuthError.js`, `apps/frontend-user/src/features/auth/ProfileFeature.jsx`, `apps/frontend-user/src/features/auth/api/authApi.js`

Tests/evidence: Before: logs/security-auth-rsvp-before-final.log, 15 tests / 4 failures, unexpected successful email-based social takeover and generic RSVP capability disclosure.; After: security-stage2-after.log, 34 passing tests; provider subject/email drift, explicit linking conflicts, reserved synthetic email rejection and both link-route aliases reject anonymous requests.; Real MySQL: logs/mysql-integrity-upgrade-after.log, 10 passing tests across fresh/upgrade/auth/subscription suites; logs/mysql-final-mutations.log, 8 passing tests, including identity case sensitivity/uniqueness.; check-in-summary-after.log: 37 passing tests, including social-first local registration collision and same-email/different-subject rejection.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.; Frontend auth/profile/social linking23targetedPASS; full user367PASS includes actual Google widget mock, link-only protected flow and ACCOUNT_LINK_REQUIRED recovery guidance

Compatibility: Existing user IDs, local credentials, social-first account data, bearer/cookie response shapes and auth aliases are preserved. V28 contains no guessed backfill; legacy social accounts require a valid current session to link or verified recovery/owner assistance.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Legacy provider identities cannot be reconstructed safely from email. Recovery/owner assistance must handle users without a current session or verified recovery route.

### DB-001 — STAFF Java/API role has no compatible MySQL migration

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/user/domain/Role.java:5`.

Implementation: Forward migration V29 adds STAFF to the database ENUM while preserving ADMIN/USER ordinal order and all historical migration checksums.

Files: `apps/backend/src/main/resources/db/migration/V29__preserve_staff_role.sql`

Tests/evidence: Real MySQL: logs/mysql-integrity-upgrade-after.log and logs/mysql-final-mutations.log validate STAFF insert, actual admin create/update services and JWT authority conversion.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: The existing application policy STAFF to ROLE_ADMIN is deliberately retained. Existing rows and admin role editing remain functional.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Changing STAFF privilege policy requires an explicit owner decision; this repair does not invent reduced or increased privileges.

### DB-002 — Expired active rows can block paid subscription renewal

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/subscription/application/SubscriptionService.java:167`.

Implementation: Activation locks the user, then any active-slot subscription including an expired flagged row; closes and flushes the prior slot before activating the new paid subscription.

Files: `apps/backend/src/main/java/com/koupreng/backend/subscription/application/SubscriptionService.java`, `apps/backend/src/main/java/com/koupreng/backend/subscription/domain/Subscription.java`, `apps/backend/src/main/java/com/koupreng/backend/subscription/infrastructure/persistence/SubscriptionRepository.java`

Tests/evidence: backend-stage4-5-after-final.log, 77 passing tests including 16 subscription service tests.; Real MySQL: logs/mysql-integrity-upgrade-after.log, four subscription integrity cases covering expired renewal, paid-history-preserving replacement, concurrent payments and rollback.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: The existing generated unique active_slot safeguard is retained. Expired/replaced paid subscriptions preserve payment evidence, dates and history; duplicate paid callbacks remain idempotent.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Existing historical subscriptions are not rewritten or deleted.

### BE-001 — Failed media replacement can destroy existing files

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/media/application/MediaService.java:89`.

Implementation: Upload and validate the new storage reference first; change SQL references transactionally; delete old objects only after commit and staged objects after a definite rollback.

Files: `apps/backend/src/main/java/com/koupreng/backend/media/application/MediaService.java`

Tests/evidence: Before: logs/media-before-regression.log demonstrates old cover deletion on upload failure and staged object leakage on database failure.; After: security-media-after.log and backend-stage4-5-after-final.log validate staged uploads, after-commit old deletion, rollback compensation, unknown-completion retention and cleanup failure handling.; Real MySQL: logs/mysql-final-mutations.log validates persisted references and simulated storage bytes on rollback/commit.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: Cover, gallery, audio, video, replacement and deletion APIs retain their response shapes and user-visible features.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Storage cleanup is best effort. Process crashes, unknown transaction completion or cleanup failure may leave orphan objects requiring reconciliation; durable outbox retries are outside this bounded fix.

### BE-002 — Production Google JWKS fallback is the wrong endpoint

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/resources/application-prod.properties:48`.

Implementation: Prod default official discovery jwks_uri

Files: `apps/backend/src/main/resources/application-prod.properties`, `apps/backend/src/test/java/com/koupreng/backend/shared/config/GoogleProfileConfigurationTests.java`, `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/identity/GoogleIdentityVerifierTests.java`

Tests/evidence: Effectiveprodwrongdefault before; 2profile/6signedJWKS regressionsPASS

Compatibility: Explicitoverride bindingretained

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No realGoogle OAuth/providercalls

### SEC-002 — Cache eviction before commit can leave revoked JWTs or roles stale

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/auth/application/AuthService.java:161`.

Implementation: Cache eviction runs after a successful transaction commit. JWT admission and authority come from current database status, deletion flag, token version and role; a stale cached snapshot is evicted and cannot override fresh state.

Files: `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/session/UserAuthCacheService.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/security/AppJwtAuthenticationConverter.java`

Tests/evidence: security-media-after.log: 94 passing targeted tests, including commit/rollback cache eviction, revoked-token stale-cache rejection, fresh-role authority and preserved STAFF mapping.

Compatibility: Token format and existing STAFF to ROLE_ADMIN mapping are preserved. Outside-transaction callers still evict immediately.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Current database reads remain part of authorization; no claim of reducing authorization query count.

### SEC-003 — Invitation media bypasses configured signature and count checks

Status: **PARTIAL**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/shared/security/ApiWebMvcConfig.java:32`.

Implementation: Media uses shared configured signature/type/size validation, validates complete batches before uploads, enforces configured maxFiles and serializes invitation media mutations under READ_COMMITTED. A configurable per-invitation gallery limit prevents concurrent overshoot when enabled.

Files: `apps/backend/src/main/java/com/koupreng/backend/media/application/MediaService.java`, `apps/backend/src/main/java/com/koupreng/backend/shared/security/FileUploadValidator.java`, `apps/backend/src/main/java/com/koupreng/backend/shared/security/ApiSecurityProperties.java`, `apps/backend/src/main/java/com/koupreng/backend/invitation/infrastructure/persistence/UserInvitationRepository.java`, `apps/backend/src/main/resources/application.properties`, `.env.example`

Tests/evidence: Before: logs/media-before-regression.log, 11 tests / 3 failures, including forged SVG accepted as PNG.; After: security-media-after.log, 94 passing targeted tests; backend-stage4-5-after-final.log, 77 passing tests including 26 MediaService tests.; Real MySQL: logs/mysql-final-mutations.log, 8 passing tests, including two concurrent gallery uploads against a configured one-file quota.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: Unicode/Khmer filenames and all nine existing supported format cases remain accepted, including the audio/mp3 alias. Existing media is never deleted to satisfy a limit. The gallery limit defaults to zero/unbounded, preserving existing commercial policy.

Regression: Implemented changes pass targeted and complete gates; unresolved boundary is explicit below.

Remaining risk: PRODUCT_POLICY_REVIEW_REQUIRED: the owner must select a nonzero default per-invitation gallery/storage quota if desired. No commercial limit was invented.

### SEC-004 — Generic RSVP can impersonate an existing guest and reveal their token

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/rsvp/application/RsvpService.java:61`.

Implementation: Generic public RSVP rejects an existing guest selected only by email/phone with RSVP_GUEST_LINK_REQUIRED. A fresh generic guest response strips inviteToken and qrCodeUrl. Optional central entitlement checks apply only to new generic guest creation. Both generic public RSVP entry points use READ_COMMITTED so a pre-lock contact lookup cannot retain a stale quota count snapshot.

Files: `apps/backend/src/main/java/com/koupreng/backend/rsvp/application/RsvpService.java`, `apps/backend/src/main/java/com/koupreng/backend/rsvp/api/dto/RsvpResponse.java`

Tests/evidence: Before: logs/security-auth-rsvp-before-final.log, 15 tests / 4 failures including known-contact mutation and response token disclosure.; After: security-stage2-after.log, 34 passing tests; backend-stage4-5-after-final.log, 77 passing tests including 10 RSVP service tests.; check-in-summary-after.log: 37 passing tests, including both new social-first negatives and generic RSVP regressions.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: Personalized guest-token RSVP continues to update the intended guest. Existing owner attendance management and response DTO field names remain available; public wish compatibility responses redact capability values.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Shared contact values may require the personalized invitation link. Generic guest creation uses the same configured quota infrastructure as owner guest creation.

### SEC-005 — Failed login audit events are rolled back

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/auth/application/AuthService.java:115`.

Implementation: Authentication rejection writes a dedicated REQUIRES_NEW audit transaction with fixed descriptions and a bounded reason code.

Files: `apps/backend/src/main/java/com/koupreng/backend/audit/application/AuditLogService.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/application/AuthService.java`

Tests/evidence: security-media-after.log, 94 passing tests.; Real MySQL: logs/auth-integrity-mysql-after.log and logs/mysql-final-mutations.log verify rejected login audit survives rollback with bounded reason metadata.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: Normal transactional business audits remain unchanged. Audit user association and event naming are retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Audit persistence still depends on database availability; no external audit delivery system was introduced.

### SEC-006 — Cookie CSRF header is missing from default CORS policy

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/shared/config/SecurityConfig.java:147`.

Implementation: Allow X-XSRF-TOKEN in reviewed defaults and env example; preserve credentialed CORS allowlist. Added explicit CSRF matcher to prevent automatic cookie credentials inheriting resource-server bearer exemption (P2-NEW-003). Authenticated current-user responses expose X-XSRF-TOKEN for allowed cross-origin cookie bootstrap; response body is unchanged. All successful cookie-auth response paths expose real X-XSRF-TOKEN; initial login no longer depends on a same-host readable cookie or a subsequent /me bootstrap.

Files: `apps/backend/src/main/java/com/koupreng/backend/shared/security/ApiSecurityProperties.java`, `apps/backend/src/main/java/com/koupreng/backend/shared/config/SecurityConfig.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/security/CookieCsrfProtectionMatcher.java`, `apps/backend/src/main/resources/application.properties`, `apps/backend/src/main/resources/application-prod.properties`, `.env.example`, `apps/backend/src/test/java/com/koupreng/backend/auth/infrastructure/security/CookieCsrfSecurityTests.java`

Tests/evidence: Cookie CORS missingheader and actual-cookie CSRF bypass failed before; ten targeted cases pass after.; Both current-user aliases emit a matching CSRF cookie/proof header, exposed only through configured CORS; 11-cookie-security-test suite passes. Contact/AI/report combined25 tests pass.; Final12-case CookieCsrfSecurityTests passes, including actual cookie JWT negative/positive proof and login response header before the first cross-origin mutation.

Compatibility: Public auth/recovery/payment callback/internal/public invitation exceptions retained. Cookie unsafe mutations require proof; explicit valid bearer headers remain supported; invalid bearer never falls back.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Existing private CORS_ALLOWED_HEADERS overrides must allow X-XSRF-TOKEN. Actual JWT-cookie transport is integration-tested; live-backend browser tests remain opt-in.

### PAY-002 — Purchased package capabilities and limits are not enforced

Status: **PARTIAL**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/subscription/domain/SubscriptionPackage.java:39`.

Implementation: Central EntitlementService composes free/purchased/ACTIVE PAID unexpired package template access. Optional strict policy requires a reviewed zero-price baseline; owner locks and READ_COMMITTED guard invitation/guest creation/import limits, with shared QR/seating/check-in feature controls. Default compatibility mode preserves all current free capabilities. Central policy and transactional quota boundaries are ready; commercial activation and remaining team/branding/report policy require owner review.

Files: `apps/backend/src/main/java/com/koupreng/backend/entitlement/application/EntitlementService.java`, `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationService.java`, `apps/backend/src/main/java/com/koupreng/backend/guest/application/GuestService.java`, `apps/backend/src/main/java/com/koupreng/backend/invitation/application/QrCodeService.java`, `apps/backend/src/main/java/com/koupreng/backend/seating/application/SeatingService.java`, `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplatePaymentService.java`

Tests/evidence: Eight policy tests pass; actual isolated MySQL concurrency/atomic bulk rejection3 tests pass (mysql-entitlement-final.log).; Four real-MySQL entitlement tests pass: serialized guest/invitation quota races, atomic bulk rejection and public-RSVP versus owner guest creation. Strict enforcement fixture uses explicit reviewed free policy; production compatibility mode remains default.

Compatibility: Existing route aliases, free/current templates, separate purchase history, static checkout and trusted confirmation preserved.

Regression: Implemented changes pass targeted and complete gates; unresolved boundary is explicit below.

Remaining risk: PRODUCT_POLICY_REVIEW_REQUIRED: approved free limits, team scope, branding/advanced-report scope, and commercial activation. No arbitrary free-tier restriction enabled. Existing publication/history stays accessible; subscription expiry versus premium editing policy requires review.

### BE-003 — Budget aggregation and CSV lose currency meaning

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/budget/application/BudgetService.java:204`.

Implementation: Budget totals retain separate USD/KHR ledgers. Mixed-currency legacy aggregate fields are null with totalsComparable=false; no invented FX conversion. CSV appends currency while retaining existing columns. All active budget/expense/gift/dashboard summaries keep totals and category percentages within each currency. Mixed legacy totals remain unavailable; no invented FX or null-as-zero goal comparison.

Files: `apps/backend/src/main/java/com/koupreng/backend/budget/domain/BudgetTotals.java`, `apps/backend/src/main/java/com/koupreng/backend/budget/api/dto/BudgetResponse.java`, `apps/backend/src/main/java/com/koupreng/backend/budget/api/dto/BudgetSummaryResponse.java`, `apps/backend/src/main/java/com/koupreng/backend/budget/application/BudgetService.java`, `apps/backend/src/test/java/com/koupreng/backend/budget/application/BudgetServiceTests.java`, `apps/frontend-user/src/features/budget/currencyTotals.js`, `apps/frontend-user/src/features/budget/components/BudgetSummaryCards.jsx`, `apps/frontend-user/src/features/budget/components/BudgetProgress.jsx`, `apps/frontend-user/src/features/budget/components/CategoryBreakdown.jsx`, `apps/frontend-user/src/features/budget/mixedCurrency.test.jsx`, `apps/frontend-user/src/features/expenses/expenseTotals.js`, `apps/frontend-user/src/features/expenses/ExpensesList.jsx`, `apps/frontend-user/src/features/expenses/components/ExpenseSummaryCards.jsx`, `apps/frontend-user/src/features/expenses/mixedLedger.test.jsx`, `apps/frontend-user/src/features/expenses/expenseTotals.test.js`, `apps/frontend-user/src/features/gifts/components/GiftStatsCards.jsx`, `apps/frontend-user/src/features/dashboard/DashboardFeature.jsx`

Tests/evidence: Mixed-currency aggregation failed before; expanded 9-case budget suite passes after.; Budget display2 failed before nowPASS; active gift/expense display2 failed before nowPASS; expense arithmetic2PASS; Existing budget/expenses/gifts tests PASS

Compatibility: Both budget item/record APIs remain. Single-currency and empty legacy totals retain their numerical behavior. Per-item currency, existing USD legacy displays, gift stats, cap editing, forms and CSV workflows retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: The historical budget goal has no stored currency; its interpretation requires owner review. Mixed item totals and active expense/gift displays remain separate USD/KHR ledgers without FX.

### BE-004 — The two budget APIs disagree about total_budget

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/budget/application/BudgetService.java:85`.

Implementation: Planning item create/update/delete no longer overwrite host-entered total_budget with a calculated estimate.

Files: `apps/backend/src/main/java/com/koupreng/backend/budget/application/BudgetService.java`, `apps/backend/src/test/java/com/koupreng/backend/budget/application/BudgetServiceTests.java`

Tests/evidence: Host cap preservation failed before; all three planning mutations preserve cap; 9-case suite passes.

Compatibility: Host-entered cap, item CRUD, legacy budget records and summary routes remain.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No historical totals are guessed or rewritten.

### DB-003 — V16 rewrites historical template choices and purchase references

Status: **NEEDS_OWNER_DECISION**. Phase1 source reference: `apps/backend/src/main/resources/db/migration/V16__keep_single_invitation_template.sql:40`.

Implementation: Verified V16 destructive remapping has no reliable per-row reversal. Added isolated-copy recovery procedure requiring authoritative mapping and forward-only operations.

Files: `docs/PHASE2_TEMPLATE_RECOVERY.md`

Tests/evidence: Baseline fresh MySQL migration and Hibernate validation pass; historical customer mappings unavailable.

Compatibility: All historical migrations and current template references/IDs/history preserved.

Regression: No application or customer-data mutation.

Remaining risk: Historical mappings require owner backup/evidence; no guessed recovery applied.

### BE-005 — Unbounded lists and per-record queries increase DB/heap work

Status: **PARTIAL**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/reporting/application/DashboardReportService.java:89`.

Implementation: Owner invitation covers use one scoped batch projection; owner dashboard batches guests/RSVP/pending counts instead of per-invitation queries. Report CSV uses the existing formula-neutralizing exporter (P2-NEW-002). Admin dashboard and overview now use aggregate projections plus existing Top5/Top10 recent-row bounds; system health and alerts aggregate payment states without full-table entity loading. Scoped batching, count projections, bounded recent rows and check-in aggregates remove measured entity/SQL growth without truncating full reports. Check-in summary uses one scoped active-check-in/RSVP EXISTS aggregate instead of a per-check-in RSVP lookup and entity hydration.

Files: `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationService.java`, `apps/backend/src/main/java/com/koupreng/backend/invitation/infrastructure/persistence/UserInvitationRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/media/infrastructure/persistence/MediaFileRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/guest/infrastructure/persistence/GuestRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/rsvp/infrastructure/persistence/RsvpRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/reporting/application/DashboardReportService.java`, `apps/backend/src/test/java/com/koupreng/backend/reporting/application/QueryGrowthIntegrationTests.java`, `apps/backend/src/main/java/com/koupreng/backend/checkin/application/CheckInService.java`, `apps/backend/src/test/java/com/koupreng/backend/checkin/application/CheckInSummaryQueryIntegrationTests.java`, `apps/backend/src/test/java/com/koupreng/backend/checkin/application/CheckInServiceTests.java`

Tests/evidence: 20-invitation ORM fixture before: covers22/dashboard65 SQL; after: covers2/dashboard7 SQL. Growth regression passes.; Malicious report CSV cell regression passes in DashboardReportServiceTests (3 tests).; Same admin20-invitation fixture before22 entity loads/6 SQL, after7 entity loads/9 SQL. Full counts and five recent invitation rows preserved; combined60 target passes.; Measured20-invitation fixtures: cover SQL22→2; user dashboard65→7; admin loaded entities22→7 and SQL6→10 (extra grouped currency projection); check-in SQL23→4 and entities38→1. Bounds and result preservation pass.; check-in-summary-before.log: 27 tests / one expected query-bound failure, 20 guests yielded 23 statements and 38 entity loads.; check-in-summary-after.log: 37 tests PASS; same 20-guest fixture yields four statements and one loaded entity with total=20, active=19, remaining=1, attendingCheckedIn=9.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: Owner scoping, all existing rows, aggregate meanings and export columns remain; no arbitrarily truncated lists. Counts remain per guest, not attendee quantity. An undone ATTENDING guest is excluded and an active guest without an RSVP contributes to active count but not attendingCheckedIn. List and mutation APIs are unchanged.

Regression: Implemented changes pass targeted and complete gates; unresolved boundary is explicit below.

Remaining risk: Full report/export and other legacy list/analytics payloads remain unbounded for compatibility. Production query plans/cardinality and compatible pagination are outside the measured fixture changes.

### ARCH-001 — Spring AI actions are placeholders disconnected from FastAPI

Status: **PARTIAL**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/integration/ai/application/AiInvitationAssistantService.java:24`.

Implementation: Five authenticated AI routes use an internal provider boundary with distinct operations, bounded wait/cancellation and safe adapter-failure fallback. source explicitly distinguishes AI_PROVIDER from LOCAL_TEMPLATE. No actual provider implementation, key, paid call or generated local text represented as AI. UI applies AI label only for enabled=true, source=AI_PROVIDER and real provider identity; disabled/unknown/error responses use the existing explicitly labeled local formatter.

Files: `apps/backend/src/main/java/com/koupreng/backend/integration/ai/application/AiInvitationProvider.java`, `apps/backend/src/main/java/com/koupreng/backend/integration/ai/application/AiInvitationAssistantService.java`, `apps/backend/src/main/java/com/koupreng/backend/integration/ai/api/AiInvitationAssistantController.java`, `apps/backend/src/main/java/com/koupreng/backend/integration/ai/api/dto/AiInvitationDraftResponse.java`, `apps/backend/src/main/java/com/koupreng/backend/integration/ai/api/dto/AiInvitationDraftRequest.java`, `apps/backend/src/test/java/com/koupreng/backend/integration/ai/application/AiInvitationAssistantServiceTests.java`, `apps/frontend-user/src/features/ai-assistant/model/responseSource.js`, `apps/frontend-user/src/features/ai-assistant/hooks/useAiAssistant.js`, `apps/frontend-user/src/features/ai-assistant/components/AssistantResult.jsx`, `apps/frontend-user/src/features/ai-assistant/sourceContract.test.js`

Tests/evidence: Four adapter-double tests pass: disabled/missing configuration, five distinct operations, safe provider failure, timeout cancellation.; Two endpoint regressions pass: allfiveanonymousroutes401 before adapter calls; excessiveinput400; explicitly local response. Included in policy/admin60 passing tests.; Before4 failures now5PASS including valid provider response and outage fallback

Compatibility: Existing fields/routes and local template fallback remain; response fields source/operation and input bounds are additive. Local template generation and copy/apply actions preserved; all existing request fields retained.

Regression: Implemented changes pass targeted and complete gates; unresolved boundary is explicit below.

Remaining risk: NEEDS_PRODUCT_DECISION: provider/model/cost policy and AI/package capability activation. Internal adapters are tested; no external AI provider/key setup or paid calls occurred.

### BE-006 — Legacy event domain failures become generic HTTP 500

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/event/application/EventService.java:120`.

Implementation: DomainApiException404/409 stable EVENT codes

Files: `apps/backend/src/main/java/com/koupreng/backend/event/application/EventService.java`, `apps/backend/src/test/java/com/koupreng/backend/event/application/EventServiceTests.java`, `apps/backend/src/test/java/com/koupreng/backend/event/api/LegacyEventEndpointTests.java`

Tests/evidence: 3service negatives before; 19combinedJava passafter

Compatibility: All11 ADMIN-only routes and lifecycle/soft-delete preserved

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No existingevent/migration deletion

### SEC-007 — Invitation password verification lacks a focused failure limiter

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationService.java:397`.

Implementation: A per-invitation/per-client failure budget is checked before password hashing. Wrong attempts increment the existing rate-limit storage; successful passwords do not consume the failure budget.

Files: `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationPasswordAttemptLimiter.java`, `apps/backend/src/main/java/com/koupreng/backend/invitation/application/InvitationService.java`, `apps/backend/src/main/java/com/koupreng/backend/shared/security/RateLimitService.java`, `apps/backend/src/main/java/com/koupreng/backend/shared/config/AppProperties.java`, `apps/backend/src/main/resources/application.properties`, `.env.example`

Tests/evidence: security-media-after.log, 94 passing tests including invitation/client scoped failure counters, rejection before BCrypt, successful-password noncharging and valid guest-token bypass.

Compatibility: Public access, valid guest tokens, correct invitation passwords and existing rate-limit backend/failure policy are preserved. The configurable default is five failed invitation passwords per minute.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Client address identity follows the existing trusted-proxy resolver configuration; production Redis policy remains unchanged.

### PAY-003 — Template catalog/admin pricing does not drive checkout eligibility

Status: **PARTIAL**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplatePaymentService.java:62`.

Implementation: TemplateCheckoutPolicy shares server-owned offer price/eligibility with public catalog DTO. Existing authorized Garden USD0.01 static offer and bank links remain. Other active premium entries expose PRODUCT_POLICY_REVIEW_REQUIRED instead of inventing provider links or using arbitrary display prices. Checkout requires a real eligible catalog template even when catalog is empty (P2-NEW-004), and uses server-owned template name/amount/currency. Checkout consumes server eligibility/amount/currency; only the existing approved Garden legacy offer uses .01USD. No unknown ID becomes the first arbitrary catalog template.

Files: `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplateCheckoutPolicy.java`, `apps/backend/src/main/java/com/koupreng/backend/payment/application/TemplatePaymentService.java`, `apps/backend/src/main/java/com/koupreng/backend/template/api/dto/PublicTemplateResponse.java`, `apps/frontend-user/src/features/payments/checkoutOffer.js`, `apps/frontend-user/src/features/payments/checkoutOffer.test.js`, `apps/frontend-user/src/features/payments/TemplateCheckoutPage.jsx`

Tests/evidence: Two checkout policy tests pass, including new active premium entry; empty-catalog authorization reproduced before and fixed after. Combined policy/admin target60 tests passes.; Approved offer/legacy Garden/rejected unknown/new premium2PASS

Compatibility: Existing route aliases, free/current templates, separate purchase history, static checkout and trusted confirmation preserved. All designs/previews remain usable; existing fixed Garden checkout retained.

Regression: Implemented changes pass targeted and complete gates; unresolved boundary is explicit below.

Remaining risk: NEEDS_PRODUCT_DECISION: resolve free Garden catalog versus legacy USD0.01 checkout and approve offer/provider mapping for future premium templates. No new charge, fixed-link replacement or real provider call. PRODUCT_POLICY_REVIEW_REQUIRED: owner selects prices/payment links for additional premium templates.

### SEC-008 — Concurrent reset requests can consume a token twice

Status: **FIXED**. Phase1 source reference: `apps/backend/src/main/java/com/koupreng/backend/auth/application/AccountService.java:93`.

Implementation: Password reset locks the token row and then the user row before validating expiry/use, changing the credential/token version and marking the token consumed.

Files: `apps/backend/src/main/java/com/koupreng/backend/auth/application/AccountService.java`, `apps/backend/src/main/java/com/koupreng/backend/auth/infrastructure/persistence/PasswordResetTokenRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/user/infrastructure/persistence/AppUserRepository.java`

Tests/evidence: security-media-after.log, 94 passing targeted tests.; Real MySQL: logs/mysql-integrity-upgrade-after.log and logs/mysql-final-mutations.log verify two concurrent reset attempts yield exactly one successful redemption.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.

Compatibility: Reset request/response contracts and token format are unchanged. Cache invalidation occurs only after commit.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Normal database lock timeout/deadlock responses remain possible under abnormal contention; no reusable reset capability is exposed.

### FE-001 — Cookie-mode reload loses frontend authentication

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/stores/useAuthStore.js:36`.

Implementation: Cookie mode bootstraps a validated current-user server response, deduplicates in-flight bootstrap, handles expired/outage states explicitly and guards late login/logout responses. Cross-origin CSRF response proof is captured and sent on unsafe requests.

Files: `apps/frontend-user/src/stores/useAuthStore.js`, `apps/frontend-user/src/stores/useAuthStore.test.js`, `apps/frontend-user/src/features/auth/hooks/useAuth.js`, `apps/frontend-user/src/app/providers/AuthProvider.jsx`, `apps/frontend-user/src/app/guards/RequireAuth.jsx`, `apps/frontend-user/src/shared/api/httpClient.js`

Tests/evidence: Before cookie restoration:7 failures; Auth/profile/social linking targeted23PASS; full final user367PASS, admin46PASS; cookie/bearer CSRF header regressions

Compatibility: Bearer session/local-storage modes, expiry handling, profile update and logout token revocation preserved. Cookie metadata never acts as authorization.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Backend cookie flag/CORS/header proof must be enabled consistently; root verified real-cookie first-mutation proof.

### FE-002 — Standalone QR preview reads incompatible DTO fields

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/qr/components/QrPreview.jsx:10`.

Implementation: Render actual qrCodeDataUri and qrPayload DTO fields.

Files: `apps/frontend-user/src/features/qr/components/QrPreview.jsx`, `apps/frontend-user/src/features/qr/qrContract.test.jsx`

Tests/evidence: QR contract4 failed before, now4PASS; existing QR tests retained

Compatibility: Invitation/guest QR payload, image and legacy response aliases retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### FE-003 — QR download routes are not implemented

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/qr/api/qrApi.js:30`.

Implementation: Download the existing returned PNG after validating its data URI and PNG signature; reuse loaded QR DTO.

Files: `apps/frontend-user/src/features/qr/api/qrApi.js`, `apps/frontend-user/src/features/qr/hooks/useQrCode.js`, `apps/frontend-user/src/features/qr/qrContract.test.jsx`

Tests/evidence: QR contract before4 failures now4PASS

Compatibility: Invitation/guest filenames and existing endpoint response shape retained; no new absent download routes.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### FE-004 — Rejected server check-in becomes fabricated local success

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx:286`.

Implementation: Server invitation attendance is authoritative; rejected scan/manual/camera calls never turn into local success. Existing local drafts are an explicit separate persistence mode.

Files: `apps/frontend-user/src/features/invitations/hooks/useCheckInDesk.js`, `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx`, `apps/frontend-user/src/features/invitations/checkIn.persistence.test.jsx`, `apps/frontend-user/src/features/guests/api/guestApi.js`, `apps/frontend-user/src/shared/storage/hostPlanningStorage.js`

Tests/evidence: Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS

Compatibility: Existing desktop/mobile desk, scanner, guest metadata, notes, filters, duplicate warnings, sounds, celebration and local drafts retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry.

### FE-005 — Walk-in guests remain local for server invitations

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx:556`.

Implementation: Walk-in registration creates a server guest before checking in its returned ID. Partial retry reuses the registered guest and retains failed gift data.

Files: `apps/frontend-user/src/features/invitations/hooks/useCheckInDesk.js`, `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx`, `apps/frontend-user/src/features/invitations/checkIn.persistence.test.jsx`, `apps/frontend-user/src/features/guests/api/guestApi.js`, `apps/frontend-user/src/shared/storage/hostPlanningStorage.js`

Tests/evidence: Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS

Compatibility: Existing desktop/mobile desk, scanner, guest metadata, notes, filters, duplicate warnings, sounds, celebration and local drafts retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry.

### FE-006 — Check-in gifts never persist to server ledger

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx:218`.

Implementation: Desk gifts use the shared server ledger schema, local calendar date and USD/KHR currency. Success follows acknowledgement; failed gift forms remain available.

Files: `apps/frontend-user/src/features/invitations/hooks/useCheckInDesk.js`, `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx`, `apps/frontend-user/src/features/invitations/checkIn.persistence.test.jsx`, `apps/frontend-user/src/features/guests/api/guestApi.js`, `apps/frontend-user/src/shared/storage/hostPlanningStorage.js`

Tests/evidence: Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS

Compatibility: Existing desktop/mobile desk, scanner, guest metadata, notes, filters, duplicate warnings, sounds, celebration and local drafts retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry.

### FE-007 — Check-in undo changes local state only

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx:624`.

Implementation: DELETE /api/v1/invitations/{invitationId}/guests/{guestId}/check-in returns MessageResponse and marks the existing check-in inactive while appending an immutable UNDONE event. Recheck-in reuses the state row and appends CHECKED_IN; repeated undo is idempotent. Undo uses authorized guest-ID DELETE acknowledgement before removing attendance; failures retain checked-in state.

Files: `apps/backend/src/main/java/com/koupreng/backend/checkin/api/CheckInController.java`, `apps/backend/src/main/java/com/koupreng/backend/checkin/application/CheckInService.java`, `apps/backend/src/main/java/com/koupreng/backend/checkin/domain/GuestCheckIn.java`, `apps/backend/src/main/java/com/koupreng/backend/checkin/domain/GuestCheckInEvent.java`, `apps/backend/src/main/java/com/koupreng/backend/checkin/infrastructure/persistence/GuestCheckInRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/checkin/infrastructure/persistence/GuestCheckInEventRepository.java`, `apps/backend/src/main/java/com/koupreng/backend/admin/application/AdminManagementService.java`, `apps/backend/src/main/resources/db/migration/V30__preserve_check_in_undo_history.sql`, `apps/frontend-user/src/features/invitations/hooks/useCheckInDesk.js`, `apps/frontend-user/src/features/invitations/InvitationCheckInPage.jsx`, `apps/frontend-user/src/features/invitations/checkIn.persistence.test.jsx`, `apps/frontend-user/src/features/guests/api/guestApi.js`, `apps/frontend-user/src/shared/storage/hostPlanningStorage.js`

Tests/evidence: backend-stage4-5-after-final.log, 77 passing tests including check-in undo/reactivation/non-owner cases and endpoint authorization/routing.; Real MySQL: logs/mysql-final-mutations.log verifies persistent state/history, counts, reactivation and non-owner rejection.; logs/mysql-integrity-upgrade-after.log verifies exact historical actor/time/source/note backfill during V27 to V30 upgrade.; check-in-summary-before.log reproduced 23 SQL statements / 38 entities for 20 guests; check-in-summary-after.log passes 37 tests and reduces summary to 4 SQL statements / 1 entity with unchanged active/ATTENDING counts.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.; Before desk9 failures; after scan/manual/camera/load/walk-in/partial retry/gifts/undo/local quota scenarios PASS; Full user final367PASS

Compatibility: Path ID is guestId, not checkInId. Existing manual/scan check-in, ownership plus administrator guard and configured QR entitlement checks remain. Active summaries/lists/admin analytics exclude undone entries; guests and RSVP rows are untouched. Existing desktop/mobile desk, scanner, guest metadata, notes, filters, duplicate warnings, sounds, celebration and local drafts retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Explicit hard deletion of an invitation/guest still follows existing cascade deletion semantics; undo itself never deletes history. Transport failure can leave a server mutation outcome uncertain; retained forms/errors require deliberate reconciliation, never an automatic duplicate retry.

### FE-008 — Active wish deletion calls missing endpoint

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/wishes/api/wishesApi.js:21`.

Implementation: DELETE /api/v1/invitations/{invitationId}/wishes/{wishId} clears only RSVP.message with a scoped bulk update and returns MessageResponse. Preserve existing frontend wish-only DELETE contract; backend now clears wish text without deleting attendance.

Files: `apps/backend/src/main/java/com/koupreng/backend/rsvp/api/RsvpController.java`, `apps/backend/src/main/java/com/koupreng/backend/rsvp/application/RsvpService.java`, `apps/backend/src/main/java/com/koupreng/backend/rsvp/infrastructure/persistence/RsvpRepository.java`, `apps/frontend-user/src/features/wishes/api/wishesApi.js`, `apps/frontend-user/src/features/wishes/wishes.test.jsx`

Tests/evidence: backend-stage4-5-after-final.log, 77 passing tests including wish moderation and endpoint authorization/routing.; Real MySQL: logs/mysql-final-mutations.log verifies message-only clearing, unchanged attendance/count/guest/respondedAt, idempotency and non-owner rejection.; Final isolated MySQL gate: logs/mysql-complete-integrity-v2-final.log, seven classes / 18 tests PASS, zero failures/errors/skips, 33.988 seconds; includes generic RSVP versus owner guest quota race and current check-in summary aggregate JPQL.; Frontend selected wish success/failure regression PASS; backend owner-only message-preserving tests and real MySQL audit by backend agent

Compatibility: wishId is the RSVP record ID. Owner attendance editing and RSVP deletion remain separate functions. Scoped message clearing bypasses PreUpdate so original respondedAt is preserved. Guest record, RSVP status/count/respondedAt preserved; failed moderation keeps the wish visible.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No new broad administrator moderation privilege was added. No additional product decision for this fix.

### FE-009 — General report aliases lack invitation context

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/app/routes/hostRoutes.jsx:72`.

Implementation: Both report aliases resolve invitation context through the existing scoped resolver before mounting FinancialReport.

Files: `apps/frontend-user/src/app/routes/hostRoutes.jsx`, `apps/frontend-user/src/app/routes/reportAliases.test.jsx`, `apps/frontend-user/src/app/routes/InvitationScopedRedirect.jsx`

Tests/evidence: Both /reports and /dashboard/reports scoped-navigation/location-state tests PASS; All79 user and23 admin explicit path lines retained after route splitting

Compatibility: Existing scoped route and legacy aliases retained; navigation state is passed through.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### FE-010 — Published renderer accepts unvalidated preview messages

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/templates/experience/TemplateExperience.jsx:318`.

Implementation: Embedded preview requires exact origin, window source, random session and typed bounded payload. Messages target an explicit origin; published /w and /i never enter preview channels. P2-NEW-011 repairs stale iframe-load retries in both editors; retries use current state, replace old load timers and cancel on unmount.

Files: `apps/frontend-user/src/shared/preview/previewMessaging.js`, `apps/frontend-user/src/shared/preview/previewMessaging.test.js`, `apps/frontend-user/src/features/templates/experience/TemplateExperience.jsx`, `apps/frontend-user/src/features/templates/experience/TemplateExperience.security.test.jsx`, `apps/frontend-user/src/features/templates/layouts/previewSecurity.test.jsx`, `apps/frontend-user/src/features/invitations/LivePhoneSimulator.jsx`, `apps/frontend-user/src/features/invitations/InvitationPreviewFeature.jsx`, `apps/frontend-admin/src/shared/preview/previewMessaging.js`, `apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx`, `apps/frontend-user/src/shared/hooks/usePreviewSyncRetries.js`, `apps/frontend-admin/src/shared/hooks/usePreviewSyncRetries.js`

Tests/evidence: Engine before6FAIL/1PASS; engine7+dedicated7+protocol15/admin3 PASS; QA actual owner/admin/public preview11/11PASS: actual text and Bayon font edits; wrong nonce and public forgeries ignored; 6 latest-state/reload/unmount unit regressions; final accepted production preview11 PASS and zero page errors

Compatibility: All dedicated layouts, opening controls, uploaded local files, user phone/full preview and admin studio edits retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: A trusted preview host has editing capabilities by design. No origin wildcard or production public-preview bypass remains.

### FE-011 — Legacy toast listener cleanup removes wrong function

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/shared/ui/ToastContainer.jsx:35`.

Implementation: Retain the exact legacy listener and clear/deduplicate active toast timers on dismiss/unmount. P2-NEW-011 repairs stale iframe-load retries in both editors; retries use current state, replace old load timers and cancel on unmount.

Files: `apps/frontend-user/src/shared/ui/ToastContainer.jsx`, `apps/frontend-user/src/shared/ui/ToastContainer.test.jsx`, `apps/frontend-user/src/shared/hooks/usePreviewSyncRetries.js`, `apps/frontend-admin/src/shared/hooks/usePreviewSyncRetries.js`

Tests/evidence: Before2 failures now2PASS; 6 latest-state/reload/unmount unit regressions; final accepted production preview11 PASS and zero page errors

Compatibility: Existing typed/legacy events and styling retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### FE-012 — Seating position save discards plain-text table notes

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/seating/hooks/useSeating.js:188`.

Implementation: Store coordinates alongside preserved plain text or all existing JSON metadata. Return explicit failed-save acknowledgement.

Files: `apps/frontend-user/src/features/seating/hooks/useSeating.js`, `apps/frontend-user/src/features/seating/model/tableNotes.js`, `apps/frontend-user/src/features/seating/notesContract.test.js`, `apps/frontend-user/src/features/seating/seatingSummary.test.jsx`

Tests/evidence: Before2 failures now3 note cases PASS; failed save/summary2PASS

Compatibility: Existing malformed/plain notes are preserved as notesText; JSON keys are not discarded.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Venue decorative positions remain an explicitly labeled existing device-local preference; server table positions remain authoritative.

### FE-013 — Default finance dates derive UTC calendar day

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/gifts/hooks/useGifts.js:19`.

Implementation: Default finance dates use local calendar year/month/day instead of UTC serialization.

Files: `apps/frontend-user/src/shared/utils/localDate.js`, `apps/frontend-user/src/shared/utils/localDate.test.js`, `apps/frontend-user/src/features/gifts/hooks/useGifts.js`, `apps/frontend-user/src/features/expenses/hooks/useExpenses.js`, `apps/frontend-user/src/features/invitations/hooks/useCheckInDesk.js`

Tests/evidence: After-change timezone-previous-day and explicit date2PASS; no before failure claimed

Compatibility: Explicit chosen dates remain exact; shared desk/gift/expense paths use one helper.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### UX-001 — Contact form simulates delivered inquiry

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/marketing/ContactFeature.jsx:18`.

Implementation: Real public contact submission; only SMTP_ACCEPTED acknowledges success; errors retain entries and prevent duplicate in-flight requests Public contact endpoint validates fields, limits abuse and returns acknowledged SMTP acceptance only after mail transport succeeds; configuration/outage/rate failures retain truthful UI state.

Files: `apps/frontend-user/src/features/marketing/ContactFeature.jsx`, `apps/frontend-user/src/features/marketing/ContactFeature.test.jsx`, `apps/backend/src/main/java/com/koupreng/backend/contact/api/ContactController.java`, `apps/backend/src/main/java/com/koupreng/backend/contact/api/dto/ContactRequest.java`, `apps/backend/src/main/java/com/koupreng/backend/contact/application/ContactService.java`, `apps/backend/src/test/java/com/koupreng/backend/contact/application/ContactServiceTests.java`, `apps/backend/src/test/java/com/koupreng/backend/contact/api/ContactEndpointTests.java`

Tests/evidence: 8 failing before then 8 pass including localization; final marketing targeted11 pass; focused lint pass; Seven contact service/endpoint tests plus11 UI tests and11 real marketing browser checks pass; tests use a mail double with no real SMTP delivery.; final mocked browser11 checks PASS, zero JS errors

Compatibility: Existing Khmer style, language options and routes preserved; contact now requires email

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Real delivery requires owner-configured SMTP and CONTACT_RECIPIENT. Tests verify SMTP acceptance using doubles; inbox delivery is not claimed.

### UX-002 — Default KH language renders English RSVP labels

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/invitations/PublicRsvpForm.jsx:77`.

Implementation: Normalize KH/km/KHMER/EN/BOTH consistently; explicit language takes precedence over the legacy default mode.

Files: `apps/frontend-user/src/shared/i18n/invitationLanguage.js`, `apps/frontend-user/src/features/invitations/PublicRsvpForm.jsx`, `apps/frontend-user/src/features/invitations/PublicRsvpForm.language.test.jsx`, `apps/frontend-user/src/features/templates/experience/config/templateExperienceContent.js`

Tests/evidence: Language aliases7PASS; explicit-language RSVP regression PASS

Compatibility: Khmer, English and bilingual formats remain supported.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### A11Y-001 — Shared modal has no focus management

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/shared/ui/Modal.jsx:21`.

Implementation: Portal modal with contained/initial/restored focus, background inert handling and top-dialog-only Escape.

Files: `apps/frontend-user/src/shared/ui/Modal.jsx`, `apps/frontend-user/src/shared/ui/Modal.test.jsx`

Tests/evidence: Before3 failures now3PASS; existing guest QR/gift modal consumers6PASS

Compatibility: Existing visuals, close options, backdrop behavior and nested modals retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### A11Y-003 — Date picker lacks full calendar semantics and keyboard behavior

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/shared/ui/DatePicker.jsx:124`.

Implementation: Named month controls, calendar dialog/grid semantics, selected/current date, roving focus and arrow/Home/End/PageUp/PageDown/Enter/Escape support.

Files: `apps/frontend-user/src/shared/ui/DatePicker.jsx`, `apps/frontend-user/src/shared/ui/DatePicker.test.jsx`

Tests/evidence: Before2 failures now2PASS

Compatibility: Khmer calendar appearance and explicit date selection retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### A11Y-004 — Seating positioning lacks observed keyboard alternative

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/seating/components/SeatingFloorPlan.jsx:714`.

Implementation: Focusable table/stage/entrance/walkway controls use arrows and coordinate inputs alongside pointer drag; Shift+arrow moves5percent.

Files: `apps/frontend-user/src/features/seating/components/SeatingFloorPlan.jsx`, `apps/frontend-user/src/features/seating/components/SeatingFloorPlan.css`, `apps/frontend-user/src/features/seating/seatingAccessibility.test.jsx`

Tests/evidence: Before3 failures now3PASS

Compatibility: Original pointer/touch editing, auto-arrange, ornaments, collision behavior and read-only table details retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: No additional product decision for this fix.

### PERF-001 — Eager routes load heavy initial bundles

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/app/router.jsx:3`.

Implementation: React.lazy page modules and accessible Suspense loading states defer editor/host/admin routes until requested.

Files: `apps/frontend-user/src/app/routes/lazyRoutePages.js`, `apps/frontend-user/src/app/router.jsx`, `apps/frontend-user/src/app/routes/hostRoutes.jsx`, `apps/frontend-user/src/app/routes/marketingRoutes.jsx`, `apps/frontend-user/src/app/routes/authRoutes.jsx`, `apps/frontend-user/src/app/routes/builderRoutes.jsx`, `apps/frontend-admin/src/app/App.jsx`

Tests/evidence: Both lint/unit/build PASS; exact explicit route path-line preservation JSON; Measured HTML entry plus every transitive static JS import: user1,801,675->664,896 bytes; admin702,544->370,291 bytes

Compatibility: All79 user/23 admin explicit path lines preserved; dynamic template registry/designs and deep links retained.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: User main chunk remains around547kB and keeps Vite large-chunk advisory; external Telegram script is unchanged and excluded from local bundle bytes.

### PERF-002 — Catalog fetch ownership duplicates requests

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/app/App.jsx:21`.

Implementation: Public list callers share pending requests and a30second memory cache keyed by exact request language. Explicit force refresh remains possible; failures evict entries.

Files: `apps/frontend-user/src/features/templates/api/templateCatalogApi.js`, `apps/frontend-user/src/features/templates/api/templateService.js`, `apps/frontend-user/src/features/templates/catalogCache.test.js`, `apps/frontend-user/src/shared/api/httpClient.js`

Tests/evidence: Before3 failures now3PASS: concurrency, TTL/language isolation, retry after failure

Compatibility: Dynamic templates and public response shape/premium flags retained; permission/entitlement calls are never cached.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Public catalog edits may appear up to30seconds later in an already-open tab; access decisions always use the server.

### PY-001 — Missing webhook secret permits forged privileged Telegram payloads

Status: **FIXED**. Phase1 source reference: `apps/telegram-bot/main.py:195`.

Implementation: Mandatory startup config and constant-time webhook authentication before processing

Files: `apps/telegram-bot/main.py`, `apps/telegram-bot/README.md`, `apps/telegram-bot/tests/test_main.py`, `apps/telegram-bot/tests/test_webhook_security.py`

Tests/evidence: 7 negative failures before; 42 pytest pass after; Ruff pass; final full pytest61 PASS, Ruff PASS, Bandit zero findings/errors

Compatibility: Requires both secrets locally; configured parsing/allowlists/payments and health preserved

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Actual local secrets require owner rotation under REPO-001

### PY-002 — Transient backend failures are acknowledged and deduplicated before success

Status: **FIXED**. Phase1 source reference: `apps/telegram-bot/main.py:206`.

Implementation: PROCESSING/ACCEPTED cache; release claim on failure/cancellation,503 transient retry,completed duplicate ack

Files: `apps/telegram-bot/main.py`, `apps/telegram-bot/tests/test_webhook_delivery.py`, `apps/telegram-bot/README.md`

Tests/evidence: 5 delivery negatives before; 61 Python pass; Ruff/Bandit0; final full pytest61 PASS, Ruff PASS, Bandit zero findings/errors

Compatibility: Terminal business errors retained; financial backendidempotency unchanged

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Per-process bounded memory; backend guards protect restart/multiworker redelivery

### PY-003 — Malformed nested message values produce uncontrolled HTTP 500

Status: **FIXED**. Phase1 source reference: `apps/telegram-bot/main.py:230`.

Implementation: Validate nested update/message/chat/sender/callback/reply shapes before claims and payment

Files: `apps/telegram-bot/main.py`, `apps/telegram-bot/tests/test_webhook_delivery.py`

Tests/evidence: 12 malformed/JSON negatives before; 61pytestpass; final full pytest61 PASS, Ruff PASS, Bandit zero findings/errors

Compatibility: Supported message variants retained; malformed200ignore,invalidJSON400

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Unsupported Telegram features intentionally ignored

### CFG-001 — Production Compose settings are rejected by production security validation

Status: **FIXED**. Phase1 source reference: `docker-compose.yml:43`.

Implementation: Explicit local development compose consistent with HTTP/MySQL defaults

Files: `docker-compose.yml`, `docs/deployment/DOCKER.md`, `scripts/qa/config-regression.test.mjs`

Tests/evidence: Compose resolved prod before regressionfailed; afterlocaldev/disabledbootstrap PASS

Compatibility: Same topology/volumes/routing; no sample data or first-admin bootstrap

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Not productionready; full Docker start blocked by external read-only daemon

### REPO-001 — Historical private-key and credential material survives current-tree secret scanning

Status: **PARTIAL**. Phase1 source reference: `.github/workflows/ci.yml:27`.

Implementation: Manual rotation checklist and redacted categories/reference flags

Files: `docs/PHASE2_SECRET_ROTATION_REQUIRED.md`

Tests/evidence: Private exact comparison eight extractable candidates; zero tracked references; JWT/Telegram true local runtime flags; final exported current tree1714files Gitleaks exit0 zero matches; private runtime Boolean recheck completed

Compatibility: No secret changes or history rewrite

Regression: Implemented changes pass targeted and complete gates; unresolved boundary is explicit below.

Remaining risk: Owner must revoke and replace credentials; provider validity not tested

### QA-001 — Celestial scroll E2E times out on an infinitely animated opener

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/tests/e2e/khmer-celestial-scroll.spec.js:12`.

Implementation: Browser automation opens the real animated control with a physical center-pointer action. Preview tests use legitimate nonce/origin/source handshakes, reject published forgeries and wait for dynamically loaded fonts. The old width fixture was corrected to verified original geometry; no invitation artwork or animation was changed for tests.

Files: `apps/frontend-user/tests/e2e/khmer-celestial-scroll.spec.js`, `apps/frontend-user/tests/e2e/khmer-celestial-guest-banner.spec.js`

Tests/evidence: Baseline two continuous-motion opener locator timeouts; physical center-pointer opening now preserves normal animation. First complete final-dist suite66PASS/two explicit live-backend skips; no failures.; Font checks await the actual selected text font; exact450px desktop geometry matches original HEAD.20 viewport cases and mandatory screenshot capture pass.

Compatibility: Normal-motion opening, existing keyboard interactions, guest text fit, viewport containment, font-family/loading and strict geometry assertions remain.

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Two live-backend opt-in scenarios require an explicitly running backend. Real-device camera permissions are not exercised by these tests.

### QA-002 — Essential public menu and chat icon buttons lack accessible names

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/layouts/components/Header.jsx:209`.

Implementation: Named icon controls/fields, toggle expanded/control state, Escape mobile navigation, focus rings, focus-contained venue dialog and restore trigger focus

Files: `apps/frontend-user/src/layouts/components/Header.jsx`, `apps/frontend-user/src/shared/ui/ChatBot.jsx`, `apps/frontend-user/src/shared/ui/ChatBot.css`, `apps/frontend-user/src/features/marketing/VenuesFeature.jsx`, `apps/frontend-user/src/features/marketing/PublicControls.test.jsx`

Tests/evidence: 3 public control tests pass; old route unstable array causes before harness render loop, bounded/interrupted recorded; final mocked browser11 checks PASS, zero JS errors

Compatibility: Existing Khmer style, language options and routes preserved; contact now requires email Existing menu, chat, venue routes, Khmer/English labels and styling retained

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Keyboard/focus/public controls pass the documented unit/browser checks. A complete assistive-technology audit is not claimed.

### QA-003 — Contact labels are unassociated with controls and plan selector is unnamed

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/marketing/ContactFeature.jsx:130`.

Implementation: Associated labels, required email/name/message, API limits and visible focus rings

Files: `apps/frontend-user/src/features/marketing/ContactFeature.jsx`

Tests/evidence: Targeted contact/control suite11 pass; final mocked browser11 checks PASS, zero JS errors

Compatibility: Existing Khmer style, language options and routes preserved; contact now requires email

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Contact labels/validation/retry and accepted-delivery state are verified; real mail delivery requires configured SMTP.

### QA-004 — Backend i18n outage exposes translation keys on public marketing pages

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/shared/i18n/useBackendMessages.js:48`.

Implementation: Complete English/Khmer home and venues local fallback dictionaries preserving original Khmer copy

Files: `apps/frontend-user/src/shared/i18n/marketingMessages.js`, `apps/frontend-user/src/shared/i18n/messagesDictionary.js`, `apps/frontend-user/src/shared/i18n/marketingFallback.test.jsx`

Tests/evidence: Two outage regressions fail before/pass after; final mocked browser11 checks PASS, zero JS errors

Compatibility: Existing Khmer style, language options and routes preserved; contact now requires email Original Khmer marketing copy retained; complete English translation fallback added

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: English/Khmer fallback on tested public marketing surfaces is verified with i18n unavailable; live remote localization is not required for those readable fallbacks.

### QA-005 — Direct Contact entry relies on styles emitted by an absent Pricing component

Status: **FIXED**. Phase1 source reference: `apps/frontend-user/src/features/marketing/ContactFeature.jsx:31`.

Implementation: Contact independently imports existing pricing styles; scoped to these pages and wraps long text on mobile

Files: `apps/frontend-user/src/features/marketing/PricingContact.css`, `apps/frontend-user/src/features/marketing/PricingFeature.jsx`

Tests/evidence: Focused ESLint pass; final mocked browser11 checks PASS, zero JS errors

Compatibility: Existing Khmer style, language options and routes preserved; contact now requires email Original pricing card/background/ornament styling scoped and independently imported by Contact

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Direct desktop/mobile Contact/Pricing entry and scoped styles pass browser checks; no blanket pixel-perfect claim outside tested viewports.

### CFG-101 — Gateway disables the camera required by QR check-in

Status: **FIXED**. Phase1 source reference: `infra/nginx/docker/gateway.conf.template:35`.

Implementation: Same-origin camera allowed, microphone denied

Files: `infra/nginx/docker/gateway.conf.template`, `docs/deployment/DOCKER.md`, `scripts/qa/config-regression.test.mjs`

Tests/evidence: Camera policy negativefailedbefore/passafter

Compatibility: Manual entry retained, secure context/browserpermission stillrequired

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Camera realdevicepermission notyetverified

### CFG-102 — Local stack launcher forwards to a nonexistent script

Status: **FIXED**. Phase1 source reference: `run-local-stack.ps1:22`.

Implementation: Correct nested target,repo root ascension,raw argument forwarding

Files: `run-local-stack.ps1`, `scripts/maintenance/dev/dev.ps1`, `scripts/qa/config-regression.test.mjs`

Tests/evidence: Broken wrapperbefore; all3config testsPASSafter including Help

Compatibility: Existing Admin/User/Ngrok/Bot/NewWindow aliases preserved

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Full launcher intentionally notrun against existing workstations services

### REPO-101 — README links and setup paths no longer match its location

Status: **FIXED**. Phase1 source reference: `docs/README.md:3,154,207-214,311,328-335`.

Implementation: Correct docsrelative links/helperpaths and showcase actualexistingCelestialart

Files: `docs/README.md`, `scripts/qa/repository-policy.test.mjs`

Tests/evidence: Local link/image resolutionfailedbefore/PASSafter

Compatibility: No artwork/runtimefeature changed; SECURITY.md localdocslink preserved

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: README links resolve. Eleven additional missing runtime image references were recovered byte-for-byte from local history under P2-NEW-010; no original artwork decision remains.

### REPO-102 — No scheduled dependency update or advisory workflow is tracked

Status: **FIXED**. Phase1 source reference: `.github/workflows/ci.yml:3-9,282-336`.

Implementation: Scheduled reviewable npmuser/npmadmin/Maven/Python/Actions updates

Files: `.github/dependabot.yml`, `scripts/qa/repository-policy.test.mjs`

Tests/evidence: 5manifest weeklytargets present/YAMLvalidated

Compatibility: No dependency updates applied or automerge configured

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: Hosted Dependabot execution/permissions unverified

### REPO-103 — Third-party CI actions use mutable major-version tags

Status: **FIXED**. Phase1 source reference: `.github/workflows/ci.yml:27,42,75,265`.

Implementation: Official action currentv4/v5 tags resolvedbygit lsremote then read pinned manifests, pinnedimmutableSHAwithversioncomments

Files: `.github/workflows/ci.yml`, `scripts/qa/repository-policy.test.mjs`

Tests/evidence: Mutabletag regressionfailedbefore/allactionSHAcommentsPASSafter/YAMLvalid

Compatibility: Same majorversions/inputs/cache/build behavior, added configregressions+actualMySQLauthCItests

Regression: Applicable targeted tests and final complete gates pass; see evidence above and Final verification.

Remaining risk: RemoteGitHubCI notrun;setupjavav4manifest deprecation deferredversionupgrade


## Feature preservation and integration groups

| Group | Decision | Implementation | Reason |
|---|---|---|---|
| BG-01 | LEGACY_PRESERVED | 11 ADMIN Event routes retained and error semantics repaired; Event service/security tests. | No evidence for a second modern event UI. |
| BG-02 | EXISTING_UI_SUFFICIENT | Main invitation editor still persists design/content/customization through the primary DTO. Dedicated GET/PUT preserved. | A second editor would compete with existing saved designs. |
| BG-03 | IMPLEMENTED | Scoped server dashboard/RSVP/guest reports and CSV controls extend existing reporting surfaces; loading/empty/error/retry states. | Financial reporting and invitation deep links retained. |
| BG-04 | IMPLEMENTED | Owner attendance edit/remove controls are separate from message-only wish moderation; removal confirmation and honest failure. | Removing a response has different attendance impact from hiding its wish. |
| BG-05 | IMPLEMENTED | CSV/XLSX read-only server preview, row errors/counts, explicit import and server export/group/send-list controls; JSON/local utilities retained. | Preview validates without writes; import revalidates authoritatively. |
| BG-06 | PRODUCT_DECISION_REQUIRED | Privacy-aware aggregate API retained; no public guest identity exposure or forced public count UI. | A guest-facing count display has no approved product purpose. |
| BG-07 | EXISTING_UI_SUFFICIENT | Current admin system/recent logs UI retained; legacy query and both audit stores preserved. | Historical query UI requires an owner need; no duplicate admin log page. |
| BG-08 | IMPLEMENTED | Capacity/occupied/free/assignment summary enriches the existing seating screen; alternate contracts retained. | Floor plan, notes, assignment and exports remain available. |
| BG-09 | PRODUCT_DECISION_REQUIRED | Static checkout, provider-create endpoint, trusted callbacks/internal reconciliation and current admin review retained. Buyer review is untrusted; terminal states preserved. | No unknown provider configuration, invented offer prices or duplicate payment system. |

## Mounted integration repairs

| Family | Before | After | Test |
|---|---|---|---|
| FG-01 | QR DTO aliases and absent download routes | Actual QR data/payload; validated local PNG download | QR contract tests and browser preview |
| FG-02 | Server rejection fell through to local success | Server scope writes attendance only after acknowledgement; local drafts explicit | Desk negative/preservation and backend ownership tests |
| FG-03 | Walk-ins were local only | Persist guest first; retry partial attendance/gift without duplicate guest | Desk persistence tests |
| FG-04 | Desk gifts diverged from ledger | Existing authoritative gift schema/API; separate USD/KHR; legacy drafts retained | Desk gift failure/retry and finance tests |
| FG-05 | Undo changed local state only | Authorized idempotent undo; durable event history; inactive counts excluded | Unit/controller and actual MySQL undo/recheck tests |
| FG-06 | Wish delete endpoint missing | Message-only moderation preserves attendance/guest/history | Owner isolation and MySQL mutation tests |
| FG-07 | Timer claimed nonexistent contact delivery | Validated/rate-limited SMTP acceptance, honest errors/retry | 7 backend,11 UI,11 mocked browser checks; no real mail |
| FG-08 | Disabled placeholder could appear as AI output | Five internal adapter operations, timeout/error handling and explicit local source | Adapter/endpoint/source tests; external provider remains owner decision |

## Feature Preservation Manifest validation

Each original major capability is classified below. PRESERVED means its source/contracts/assets remain available, with the applicable complete regression suite and integrity checks; it does not claim successful real provider, mail, camera-device or production operation. IMPROVED adds verified repairs. No unexplained REGRESSION is accepted.

| Original capability | Result | Evidence / compatibility |
|---|---|---|
| Account register/login/logout | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Google/Telegram login | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Password change/recovery/reset | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Profile/avatar | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Catalog/template previews | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. All tracked template media and registries retained;11 missing original images restored byte-for-byte from local history. |
| Invitation lifecycle | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Customization/design/content JSON | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Public/password/token/personalized invitation | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Guests CRUD/group/search/import/export/send list | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| RSVP/wishes/summary/owner management | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Invitation and guest QR | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| QR/manual check-in/idempotency | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Tables/seating/assignments/export | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Budget cap/items/summary/CSV/planning | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Wedding gift ledger | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Share-link/email/reminder delivery | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Notifications/read states/admin status | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Organization/team/role editing | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Template checkout/poll/claim/access | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. All tracked template media and registries retained;11 missing original images restored byte-for-byte from local history. |
| Payment trusted reconciliation/callback | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Subscription catalog/purchase/history/poll/activation | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Unified history/details/receipts | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| User/invitation/admin dashboards/reports/CSV | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Admin management/moderation/analytics | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Dual audit models/system logs | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. No legacy model/API deletion. |
| Legacy event lifecycle (11 routes) | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. No legacy model/API deletion. |
| AI copy/story/formal/translate/timeline | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| English/Khmer message dictionaries | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Health/docs/metrics/security infrastructure | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Retained guest-payment/webhook/Telegram/payout schemas | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Marketing/venues/contact | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Auth/account/social | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Templates/dedicated layouts | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. All tracked template media and registries retained;11 missing original images restored byte-for-byte from local history. |
| Server invitation lifecycle | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Local draft lifecycle | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. Local storage/IndexedDB compatibility retained; server failures do not fabricate local success. |
| Rich builder/live simulation | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Guest management | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Published/personalized invitation | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| RSVP/wishes | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Delivery | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Media | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Check-in desk | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Seating | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Budget/expenses | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Gifts/financial reports | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| AI copy assistance | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Organizations/members | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Notifications | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Template payments/subscriptions | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. All tracked template media and registries retained;11 missing original images restored byte-for-byte from local history. |
| Admin dashboard/users | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |
| Admin template studio | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. All tracked template media and registries retained;11 missing original images restored byte-for-byte from local history. |
| Admin operations/reports | PRESERVED | Existing routes/source/data retained; baseline assets/entities/aliases and full regression checked. |
| Shared UI | IMPROVED | Existing contracts/data retained; full backend/frontend regression and additive API/schema review. |

Telegram health, webhook, docs, startup command registration, /start/menu/help/profile/pricing, callback buttons, trusted /paid/detect/confirm and payment parsing: **IMPROVED** by mandatory secret authentication and retry-safe/schema-safe processing; all61 Python tests pass. No real Telegram message is sent.

The user’s detailed preservation list is covered by these families: account/avatar/social/bearer/cookie; invitation lifecycle/access/drafts/editor/templates/media; guest/RSVP/deadline/wishes/QR/check-in/camera/manual/offline; seating/capacity/assignment/export; budgets/expenses/gifts/planning/USD/KHR/CSV; delivery/reminders/notifications/teams; checkout/poll/history/access/subscriptions/receipts/activation/reconciliation; admin/moderation/users/templates/packages/reports/dual audits; EN/KM; bot commands; AI fallback; health/filters/contracts/migrations/historical payout schemas.

## Performance measurements

| Scope | Before | After | Method / limit |
|---|---:|---:|---|
| User initial JS | 1,801,675 bytes | 664,896 bytes | Fresh build entry plus required static JS imports; deferred route chunks preserved. |
| Admin initial JS | 702,544 bytes | 370,291 bytes | Same build method; total assets are not erased. |
| Invitation covers (20 invitations) | 22 SQL | 2 SQL | Isolated Hibernate statistics; all covers retained. |
| User dashboard (20 invitations) | 65 SQL | 7 SQL | Scoped batches; full counts and recent5 preserved. |
| Admin dashboard (20 invitations) | 22 loaded entities /6 SQL | 7 entities /10 SQL | Count projections and bounded recent rows; extra query keeps revenue currency-safe. |
| Check-in summary (20 guests) | 23 SQL /38 entities | 4 SQL /1 entity | Scoped aggregate; undone attendance excluded. |
| Catalog simultaneous requests | Duplicate independent fetches | Shared in-flight fetch/cache | Dedup/invalidation/failure tests; no fabricated production request-rate metric. |

The original Phase1/early summary user figure1,801,652 differs23 bytes from the retained fresh Phase2 baseline artifact1,801,675; this table uses the actual artifact for a consistent comparison. These are fixture/build measurements, not production latency or mobile LCP/INP claims. BE-005 remains PARTIAL: full report/export payloads and other legacy list/analytics contracts are retained; broad pagination/query-plan work requires compatible API design and representative production cardinality. No unmeasured index or hosting change is added.

## Final verification

| Gate | Result | Evidence |
|---|---|---|
| User frontend | PASS:370 tests /79 files; lint/build; Knip/depcheck0; original assets rebuilt | logs/final-user-preview-{lint,test,build,knip,deps}.log; accepted final-v4-dist-frontend-user |
| Admin frontend | PASS:49 tests /12 files; lint/build; Knip/depcheck0 | logs/final-admin-preview-{lint,test,build,knip,deps}.log; accepted final-v4-dist-frontend-admin |
| Backend clean verify | PASS:432 discovered,413 passed,19 opt-in SQL skips; SpotBugs0/PMD pass | logs/maven-final-clean-verify.log;2m44s; Maven offline clean verify |
| OpenAPI | PASS:13 tests; runtime contract refreshed | logs/openapi-final-complete.log |
| Actual MySQL8.0.39 | PASS:8 classes /19 tests,0 skips; fresh and V27 upgrade through V30 | logs/mysql-all-eight-final-import-refresh.log;1m28s; isolated owned datadir/port/schema, Hibernate validation |
| Python | PASS:61 pytest; Ruff; Bandit0 findings/errors; compileall | logs/python-final-pytest.log; logs/python-final-ruff.log; logs/python-final-bandit.json; logs/python-final-compileall.log |
| Config/repository | PASS:6 tests; YAML/pins/config/launcher checks | logs/config-repo-final-resumed.log; scripts/qa/*.test.mjs |
| Browser/E2E | PASS:66 cases;2 explicit live-backend opt-in skips;0 failures on accepted restored-assets build | logs/e2e-final-preview-all-routes.log;about1 minute; final-v4 desktop Chromium and Pixel7 |
| Security regressions | PASS:55 final payment/cookie/claim target plus complete backend/Python/frontend negative suites | final-review-after.log; real-cookie CSRF, issuer/provider subject, ownership, replay/retry, reset/quota/subscription races |
| Current-tree secrets | PASS:Gitleaks8.30.1 exit0; redacted JSON array contains0 findings | logs/gitleaks-final-refresh-redacted.json;1714 exported tracked/nonignored files incl restored SVG; ignored runtime/history separately documented |
| Preservation/integrity | PASS:1595 baseline files present; historical migrations/assets/skills/audit hash unchanged; no lost API/DTO/enums/routes | logs/final-integrity.json;231→239 OpenAPI operations;80 user/23 admin route patterns retained |
| Tests added | 62 new regression-test files; existing suites expanded | logs/added-test-files.json;25 Java,30 user,3 admin,2 Python,2 config/repository files |
| Real marketing/preview probes | PASS:marketing11; final accepted-build preview11; no page errors; owner/admin edits retained after retries | logs/browser-marketing-after-final.log; logs/browser-final-preview.log; browser-final-assets/logs/browser-preview-live-after.json; controlled API/offline font doubles |
| Original asset recovery | PASS:11 original files /6,300,244 bytes; byte-exact local-history and build copies;11 browser decode/containment checks | logs/restored-original-assets.json; logs/browser-restored-assets.json; only absent assets restored |
| Diff/cleanup | PASS:whitespace and complete ownership review; no tracked file deletion | logs/final-git-status.txt; logs/final-git-diff-stat.txt; qa-final-review.md; final frontend/backend review records |

Builds/tests use the installed lockfile environment. Browser network/API doubles are identified in their evidence; the two live-backend opt-in cases remain explicitly skipped. Actual disposable MySQL checks separately cover migrations, upgrade, rollback, identity uniqueness, password reset races, active subscription uniqueness, attendance history, upload compensation/quota races and currency projections. No existing database/provider is mutated.

## Source, cleanup and final Git review

Complete review was divided by ownership: backend security/payment/data services; frontend routes/adapters/state/accessibility; QA Python/config/CI/browser; root finance/policy/contracts and cross-layer integrity. Removed only unused private cover-query, old payment sort/revenue-sum helpers and imports after replacement/caller verification. Existing tests/features/entities/assets/migrations/legacy APIs were preserved. No speculative file deletion.

Final SHA-256 baseline comparison covers1,595 tracked files: zero missing files, zero changed historical migrations, zero changed tracked media/font assets and zero changed .agents skills. Phase1 report hash matches exactly. OpenAPI comparison preserves every old operation, schema field and enum value; new endpoints/fields are additive, with intentional mixed-currency null totals and stricter identity/payment/CSRF semantics documented. Current exported tracked/nonignored added tree Gitleaks8.30.1:0 findings; private .env/history are a separate rotation boundary.

Final git status and diff --stat are saved in the external evidence directory. Working-tree changes remain uncommitted and unpushed. No deployment, real payment/AI/mail/Telegram call, secret rotation or history rewrite occurred. No hardcoded runtime credentials/debug bypass were introduced; fictional test/example values remain isolated fixtures.


## New findings and manual decisions

| ID | Severity | Status | Finding | Tests |
|---|---|---|---|---|
| P2-NEW-001 | Medium | FIXED | Late callbacks downgrade/revive terminal payments | 39 payment regressions |
| P2-NEW-002 | Medium | FIXED | Report CSV formula injection | DashboardReportService CSV negatives |
| P2-NEW-003 | High | FIXED | Automatic JWT-cookie CSRF bypass | 12 actual cookie-security cases |
| P2-NEW-004 | Medium | FIXED | Empty catalog checkout eligibility bypass | Unknown-template negative; payment/policy suite |
| P2-NEW-005 | Medium | FIXED | Venue detail render loop | Bounded before reproduction; UI/browser after checks |
| P2-NEW-006 | Medium | FIXED | Historical revenue combines USD/KHR | 2 before failures;57 target,3 UI,1 MySQL after |
| P2-NEW-007 | Medium | FIXED | Seating edits/failed saves lose unsaved layout | 3 before failures; dirty-state and accessibility after |
| P2-NEW-008 | Low | FIXED | Selected couple font remains hardcoded | Before typography failure;20 unit and11 browser after |
| P2-NEW-009 | Medium | FIXED | File guest rows bypass validation | 4 before failures;29 import/preview after |
| P2-NEW-010 | Medium | FIXED | Active template artwork references missing files | 11 byte-exact restores;11 browser decode checks; accepted66-case E2E |
| P2-NEW-011 | Medium | FIXED | Delayed iframe load retries restore stale editor values | 6 unit regressions;11 final production browser checks including retention after retries |

New issues use P2-NEW identifiers and explicit evidence. Business policy and historical data recovery will be recorded as NEEDS_PRODUCT_DECISION rather than fabricated.

### P2-NEW-001 — Late callback can downgrade terminal payment state

Status: FIXED. Current-source inspection found recordNonPaidCallback unconditionally applied signed failure/cancellation statuses to an already paid order. Restricted those transitions to payable states and added lateFailureCallbackCannotDowngradePaidOrder. Included in the passing39-case payment suite. No provider calls occurred.

### P2-NEW-002 — Report CSV formula cells

Status: FIXED. DashboardReportService.csvValue now reuses CsvExportUtils to neutralize formula prefixes and escape quotes/newlines, retaining all export columns. Malicious HYPERLINK-cell regression passes in the 3-case DashboardReportServiceTests suite.

### P2-NEW-003 — JWT cookies bypass CSRF

Severity: High. Status: FIXED; 12 targeted cookie security tests pass, including real JWT-cookie proof and cross-origin bootstrap aliases. A real cookie JWT request without any CSRF token succeeded with HTTP 200 before the change; existing mocked-user tests missed the bypass. Spring Security 7 resource-server defaults ignore CSRF for requests recognized by the configured token resolver, including this project's automatic cookie token. CookieCsrfProtectionMatcher restores unsafe cookie protection while preserving explicit bearer-header and existing public endpoint exemptions. See CookieCsrfSecurityTests for missing/invalid/valid proof, bearer precedence and hostile-origin checks. Primary source: https://github.com/spring-projects/spring-security/blob/7.0.7/config/src/main/java/org/springframework/security/config/annotation/web/configurers/oauth2/server/resource/OAuth2ResourceServerConfigurer.java.

### Measured query baseline

QueryGrowthIntegrationTests seeds 20 invitations in isolated H2 with ORM statistics: invitation covers before22/after2 SQL statements; user dashboard before65/after7. Bounds fail before and pass after implementation. This measures ORM statement growth, not production latency or MySQL optimizer behavior. Statistics API reference: https://docs.hibernate.org/orm/7.1/javadocs/org/hibernate/stat/Statistics.html.

### Business policy and recovery

DB-003: see PHASE2_TEMPLATE_RECOVERY.md. Historical mappings cannot be inferred safely; owner evidence and explicit approval for an exact forward mapping are required. Current customer records and historical migrations remain unchanged. Further conservative policies are recorded in PHASE2_PRODUCT_POLICY_DECISIONS.md.

### P2-NEW-004 — Empty catalog bypasses checkout eligibility

Severity: Medium. Status: FIXED. The regression failed before: any positive template ID could create an order when the catalog was empty. Checkout now requires an actual eligible catalog record and stores its server-owned name, price and currency. Payment/policy/admin target60 and final payment39 tests pass. Historical order lookup, claim, trusted reconciliation and purchase history remain available without guessed catalog rewrites.

### P2-NEW-006 — Historical report revenue combines currencies

Severity: Medium. Status: FIXED. Two before-failing fixtures summed USD10 and KHR40000 into40010. RevenueTotals and a currency-grouped SQL projection now return separate ledgers; a mixed legacy total is null with revenueComparable=false, while single-currency/empty totals retain compatible values. User/admin dashboards, overview and payment reports use the same rule. The admin display labels each currency separately. Revenue target57, UI3 and actual MySQL ReportingIntegrityMySqlTests1 pass, including paidAmount preference, pending exclusion, current/legacy rows, bounded recent rows and preserved order metadata. No FX conversion or payment data mutation occurs.

### P2-NEW-009 — Guest file imports bypass row validation

Severity: Medium. Status: FIXED. Four before-failing fixtures accepted invalid CSV/XLSX email/length/numeric/quote values. Shared preview and actual import now apply GuestRequest bean constraints, reject malformed numeric seat counts, and return controlled row errors for unmatched CSV quotes. Nine-test before gate had4 failures;29-test after gate passes with zero failures/errors/skips. The owner-only preview performs no saves, token creation or quota mutations. Actual import preserves its201 response and partial-row/error counts, revalidates on submission and keeps transactional quota rejection. Existing service constructors remain compatible; Spring supplies the shared Validator in production. Files: GuestService.java, GuestController.java, GuestImportFilePreviewResponse.java, GuestImportPreviewTests.java and GuestImportPreviewEndpointTests.java. Evidence: logs/guest-import-validation-before.log and logs/guest-import-validation-after.log. Multiline CSV support and production-size parsing/cardinality are not claimed by these fixtures.

### P2-NEW-011 — Delayed iframe retries restore stale editor values

Severity: Medium. Status: FIXED. Final accepted-build browser tracing showed the owner editor sending the edited name and then resending Original host from an earlier iframe-load callback. Both editors scheduled the same five retries with an old form closure. Each application now uses usePreviewSyncRetries: pending retries read the latest synchronization callback, a new iframe load replaces prior retries, and unmount cancels pending timers. Six unit regressions verify edited state, repeated load and unmount; the final production-build browser probe verifies owner/admin names remain edited after all load retries, actual cross-origin font selection and public/nonce forgery rejection. No diagnostic logging or transformed JavaScript is included in the final build. Evidence: logs/preview-stale-retry-before-diagnostics.json (temporary response-only tracing), logs/final-user-preview-test.log, logs/final-admin-preview-test.log and logs/browser-final-preview.log. CSS font imports are fulfilled by an explicit offline stylesheet fixture; actual font downloads are not claimed. Related audit IDs: FE-010 and FE-011.


# Additional Phase2 QA discoveries

## P2-NEW-005 — Venue detail route render loop — FIXED
Source: apps/frontend-user/src/features/marketing/VenuesFeature.jsx getVenues(t) array used as effect dependency. Every render allocated array; /venues/:id effect set a new selected object, repeating render/effect indefinitely. Negative test run was bounded/interrupted after10s; no completed failure count claimed. Memoized array and stable route selection fix. Final focused PublicControls test and actual browser /venues/1 keyboard open/trap/Escape/restore-focus pass. Evidence logs/public-controls-before.log (incomplete), public-marketing-after.log (11 focused combinedPASS), browser-marketing-after.json (11 mocked browserchecksPASS). Existing four venue entries/route/style preserved. Root reserved additional ID005; outside canonical56.

## P2-NEW-008 — Celestial ignores admin couple font choice
Actual browser: /templates/42 admin > Theme & Styles > Colors & Fonts > Bayon font card. Editor updated and valid nonce/origin/source channel processed font configuration, but real couple DOM computed style remained Moul, Noto Sans Khmer, serif. Initial ten protocol/owner/admin/public-route checks passed; stronger applied-style assertion failed once. Evidence logs/browser-preview-live-font-final.log and browser-preview-live-after.json. Font loading/config success does not establish visible typography correctness. Frontend agent owns minimal typography wiring and negative-first tests; repeat actual font-card browser check required. Preserve original ornaments/animations/media/Khmer typography unless explicitly selected. Root reserved additional ID008; outside canonical56.

After frontend typography correction: actual Bayon card/browser applied style PASS (`Bayon, Noto Sans Khmer, serif`); whole owner/admin/public preview probe11/11PASS, zero JavaScript errors. Evidence logs/browser-preview-live-font-fixed.log. Status **FIXED**; source tests before/after owned by frontend agent. Original ornaments/animations/default fonts preserved.


### P2-NEW-007 — Seating edits discard unsaved floor-plan state

Severity: Medium. Status: FIXED. Changing venueLayout reinitialized positions and cleared unsaved state; a swallowed server save failure also cleared the canvas dirty marker. Three before-failing cases now pass. Position initialization no longer replaces ongoing edits when only venue metadata changes; failed saves remain dirty and propagate honest retry feedback. Keyboard and numeric movement retain the pointer-based floor plan and its notes/layout data. Sources: apps/frontend-user/src/features/seating/components/SeatingFloorPlan.jsx, apps/frontend-user/src/features/seating/hooks/useSeating.js and apps/frontend-user/src/features/seating/seatingAccessibility.test.jsx. Evidence: p2new007-a11y004-before.log; final targeted seating tests and final367-case user suite. All existing local/server venue objects and table assignments remain.

### P2-NEW-010 — Active templates reference missing original artwork

Severity: Medium. Status: FIXED. DigitalYes/Emerald catalog metadata and the active Canva Khmer renderer referenced eleven absent image files. Local Git history proves deletion in2ee721a while source references remain. Recovered the exact eleven original blobs fromd484ad24, also verified identical to the immediate pre-deletion tree: public/templates/canva-luxury/emerald-luxury.jpg and public/invitations/canva-khmer/CoverKhmer.svg plus sections/{hero,details,program,location,story,gallery,gift,rsvp,footer}.webp. Only absent targets were written; no current tracked asset was changed. SVG checked for active script/foreignObject/event-handler/javascript/external references; binary signatures checked. Production build copies match all recovered bytes. Eleven browser transport/decode/390px containment checks pass and the complete accepted-assets E2E suite passes66 cases with two explicit live-backend skips. Evidence: logs/restored-original-assets.json, logs/browser-restored-assets.json and logs/e2e-final-assets-all-routes.log. Restored original artwork totals6,300,244 bytes; no art was generated, replaced or optimized, and no Git history was rewritten.


## Final disposition and remaining actions

FIXED: 49, PARTIAL: 6, NOT_CHANGED: 0, NEEDS_OWNER_DECISION: 1. Eleven additional P2-NEW issues were fixed.

Remaining owner actions: revoke/rotate historically exposed secrets (REPO-001); provide authoritative pre-V16 template mapping (DB-003); approve the free/package/gallery/AI/team/branding/report policy and future checkout offers; choose an AI provider if wanted; configure SMTP recipient/transport before real contact delivery. See PHASE2_SECRET_ROTATION_REQUIRED.md, PHASE2_TEMPLATE_RECOVERY.md and PHASE2_PRODUCT_POLICY_DECISIONS.md. Original Emerald/Canva artwork was recovered exactly from local history; no replacement artwork was fabricated. Docker full-stack startup remains externally constrained by the daemon filesystem; live provider/payment/SMTP/real-device camera behavior was deliberately not exercised.
