# Phase 3 release candidate validation

Date: 2026-10-03. Result: **local validation of the recorded Phase 2 application snapshot passed; owner/product, credential rotation, external-provider and production-scale boundaries remain open.** No new application defect requiring Phase 3 remediation was found. Phase 3 changed documentation only. Concurrent frontend dependency work is excluded at the owner's explicit request; the combined final working tree is not certified as a finished release candidate. This is not deployment approval.

## Repository state

Branch: `fix/full-ci-repair`. Starting HEAD: `29c324101a2d4d11e66ee56a82b7fa41c9ee4ef5`. Starting tree: 161 modified tracked files, 119 untracked files; 4,108 insertions / 1,737 deletions in tracked diff. A 1,714-file snapshot and full review hunks were saved outside Git before Phase 3 edits.

During validation, commits **outside this task** moved HEAD through `64fa6cc6b9cb2d18cd228a2541c9fc81d16def6a` (Phase 2 plus engineering skills), `6272befa24dc02d458c99b6ffe2012c274a8293a` (line-ending-independent skill verification), and `0bbb64875364f663b11efce6d220fe082dd0f43e` (hash validation). Final reviewed HEAD is the last of these. Consequently, Phase 2 is already committed externally; the original instruction's assumption that it remains uncommitted no longer describes the tree.

At the pre-dependency-work checkpoint, the saved pre-commit snapshot and current tree compared equal after CRLF normalization for all 1,352 non-document/non-skill application files available in the export. The 158 originally modified tracked non-document/contract files reconstructed from original saved diffs also matched normalized contents. Newly introduced AGENTS/skill-lock instructions were read and `scripts/setup-ai-skills.ps1 -VerifyOnly` passed. The additional 227 externally added tooling/instruction/documentation paths are outside the original remediation diff, and included in current-tree scanning. Together with seven Phase 3 additions, these explain the increase from 1,714 to 1,948 current files; no baseline path was removed.

During final closure, another session modified both frontend manifests/lockfiles to replace Depcheck with Knip. CI-action/POM dependency-analysis edits were also observed, briefly returned to HEAD, and CI editing resumed as that separate effort continued; this task did not restore them. The owner explicitly instructed **“Keep it separate from Phase 3.”** Concurrent frontend/CI/build-configuration edits remain untouched by this task and classified separately as CONFIG. Frontend review found development-only dependency removals, unchanged runtime dependency declarations and no added packages. Both manifests match their lockfile root development declarations at the review checkpoint; fresh-install and concurrent CI/build readiness remain uncertified in Phase 3. A user lint/test/build/Knip/dependency follow-up passed while checking the change, but does not certify the separate effort or replace its own completion review. The Phase 3 candidate/evidence below refers to the earlier fully validated snapshot; application source/security/API/migration contents remain preserved.

Final task changes: one modified tracked secret-rotation document and seven new documents. The last validation snapshot recorded **6 modified tracked / 7 untracked / 0 staged**: the secret document plus four frontend dependency files and CI from the separate effort. That ongoing effort may continue changing its files after this observation; exact snapshot status is in private `logs/final-validation.json`. No application code, test, asset, package version, price, quota, provider configuration, or migration was changed by this Phase 3 task. No staging, commits, pushes, history rewriting or deployment was performed by this task. No customer database was mutated. Owned disposable MySQL/browser processes were stopped after validation; private evidence remains outside Git.

## Phase 2 findings status

Preserved: **49 FIXED, 6 PARTIAL, 1 NEEDS_OWNER_DECISION** from Phase 1, plus **11 P2-NEW findings FIXED**. No fixed item was reopened without evidence and no unresolved commercial decision was converted into guessed code.

| Remaining ID | Retained status | Phase 3 verification / closure boundary |
| --- | --- | --- |
| SEC-003 | PARTIAL; OWNER_DECISION_REQUIRED | Media type/signature/size/request count and configured cumulative-cap race pass; default total gallery cap stays disabled. Owner selects product quota |
| PAY-002 | PARTIAL; OWNER_DECISION_REQUIRED | Trusted subscription/purchase composition and strict fixture quotas/races pass. Compatibility defaults preserved; unwired team/branding/advanced-report/AI commercial dimensions disclosed |
| BE-005 | PARTIAL | Exact query improvements preserved; remaining full lists/reports/exports classified without changing response shapes |
| ARCH-001 | PARTIAL; OWNER_DECISION_REQUIRED | Safe provider abstraction/timeout/fallback passes; no external adapter/provider/key enabled |
| PAY-003 | PARTIAL; OWNER_DECISION_REQUIRED | Existing ACTIVE Garden USD 0.01 static offer retained; new/unknown templates cannot invent checkout eligibility |
| REPO-001 | PARTIAL; owner/external action | Current-tree scan and redacted configuration preparation complete; historical credential revocation remains unverified |
| DB-003 | NEEDS_OWNER_DECISION | Recovery procedure verified; no authoritative historical customer mappings supplied; V16 unchanged |

The Phase 2 implementation report remains the finding-by-finding record. Browser fixture/harness corrections during Phase 3 (Windows path separators, offline font/SDK responses and contract-shaped fixtures) are not application fixes or P3 findings.

## P3 new findings

**0 new application issues found; 0 application fixes required.** Fresh gate failures attributable to private QA harness configuration were resolved in that harness. No `P3-NEW-###` was invented for pending owner choices or unrelated tooling commits.

## Owner decisions still required

| Decision | Reviewable artifact | Required approval |
| --- | --- | --- |
| Media count/storage policy and FREE/BASIC/PRO/PREMIUM entitlements | [OWNER_ENTITLEMENT_DECISION.md](OWNER_ENTITLEMENT_DECISION.md) | Explicit scopes/limits, zero-price free baseline, expiration behavior, team/report/branding/AI boundaries and activation plan |
| Template pricing/checkout | [OWNER_TEMPLATE_PRICING_DECISION.md](OWNER_TEMPLATE_PRICING_DECISION.md) | Garden free-catalog versus optional paid-offer meaning; exact paid catalog/offer/provider mapping; no new prices proposed |
| AI product/provider | [OWNER_AI_DECISION.md](OWNER_AI_DECISION.md) | Provider/model, backend credentials, data policy, input/output/token/cost ceilings and package rules |
| Historical template recovery | [PHASE2_TEMPLATE_RECOVERY.md](PHASE2_TEMPLATE_RECOVERY.md) | Pre-V16 backup or other authoritative row-ID mapping, exact remediation approval and isolated recovery evidence |
| Credential revocation/replacement | [PHASE2_SECRET_ROTATION_REQUIRED.md](PHASE2_SECRET_ROTATION_REQUIRED.md) | Category-level owner/provider rotation and consumer verification; no credential values in Git |
| Production list/export scale | [PAGINATION_READINESS.md](PAGINATION_READINESS.md) | Expected cardinality, additive paging/streaming strategy and actual query-plan/heap evidence |

Fresh isolated catalog evidence contains BASIC USD 0.01, PRO USD 199, PREMIUM USD 499 and no zero-price FREE row. These are preserved migration seed values, not new proposals or an inventory of customer data. Strict enforcement must not be enabled by guessing that BASIC is free.

## External configuration required

Each column describes a different evidence level. A local or mocked pass does not certify a provider account, webhook registration, real payment, delivery or physical device.

| Integration | IMPLEMENTED | LOCALLY_TESTED | MOCK_TESTED | REQUIRES_OWNER_CONFIG | REQUIRES_SANDBOX_TEST | REQUIRES_REAL_DEVICE |
| --- | --- | --- | --- | --- | --- | --- |
| Google OAuth | Backend ID-token verification/subject binding; interactive widget and explicit linking | Signed local JWKS issuer/audience/key/expiry/email tests; identity SQL constraints | Widget callbacks/linking and browser SDK stand-in | Approved client IDs/origins and recovery/linking policy | Real provider login and rejected audience/origin; no provider call here | Target-browser/mobile interaction pending |
| Telegram login | Verified subject/token flow and explicit link path | Backend verifier/identity/authorization tests | Controlled login responses and SDK stand-in | Bot/login registration, client ID, allowed origin and rotated token | Actual controlled provider login/link conflict | Target-device flow pending |
| Telegram payment webhook | Required secret, allowlists, retryability and backend financial idempotency | FastAPI HTTP/security/retry tests and Java confirmation tests | Telegram/backend transports and payment evidence | Rotated bot/webhook/internal secrets, registered webhook, approved sender/group IDs, auto-confirm decision | Controlled provider notifications, retries and reconciliation | Optional device confirmation UX pending |
| SMTP contact | Validated/rate-limited backend delivery; truthful acceptance feedback | Endpoint validation/origin/rate-limit and browser pending/error/entry retention | JavaMailSender and HTTP 503/502/429/success | Host/port/credentials/sender/recipient | Authorized transport acceptance and rejection; acceptance differs from inbox delivery | Target mobile form validation pending |
| Cloudinary/storage | Local/provider storage boundary; staged replacement/rollback cleanup | Signature/type/size checks and MySQL transactions/quota races | Storage bytes/upload/delete/compensation | Storage mode, account and restricted credentials | Actual provider upload/replace/delete and cleanup failures | Optional mobile upload behavior pending |
| ABA/provider payment | Authorized legacy static checkout, trusted reconciliation and purchased access | Buyer claims cannot settle; ownership/amount/terminal-state/idempotency tests | Remote transaction checks/callbacks/Telegram evidence | Verified account/links, sender allowlists and settlement policy | Controlled actual provider settlement/replay; no real payment here | Target banking/mobile return UX pending |
| AI provider | Internal adapter abstraction only; no external implementation | DTO limits, auth, timeout/cancellation and truthful fallback | Adapter doubles only | Approved provider/model/secret/limits/cost/entitlements; adapter implementation needed | Deferred until adapter and explicit approval | Optional target-client copy/apply flow pending |
| QR camera | Browser scanner plus same-origin gateway camera policy | QR DTO/PNG/signature/scanner paths and config checks | Browser/scanner responses | Secure origin and permission policy | No financial provider sandbox needed; local authenticated API camera flow still opt-in | **Required:** physical camera, lighting, permission denial, duplicate scans and orientation |

Existing local environment files have some credential references, not proof that a service loaded them or that they are safe/valid/rotated. SMTP and Cloudinary credentials were not configured in inspected files. All such observations are Boolean-only and detailed in the rotation document. No actual credentials, keys, bank links or secret fingerprints are included here.

## Database validation

Owned disposable **MySQL 8.0.39**, loopback port 13306, separate datadir and new schemas; no installed/customer schema reused. Full integration run: **19 tests / 8 classes PASS, zero failures/errors/skips**. A separate fresh catalog run passed one fresh-migration/schema test before read-only inventory. This extra test is a repeat, not a twentieth unique integrity scenario.

Covered: empty database/full Flyway chain through V30, Hibernate schema validation, representative V27-to-V30 upgrade, preserved checksums/users/legacy Event data, case-sensitive provider subject uniqueness and ownership constraints, STAFF persistence/admin authority compatibility, reset redemption race, subscription renewal/replacement/active-slot race/rollback, public RSVP versus owner quota race and atomic import rejection, media commit/rollback and gallery-cap race, check-in undo/recheck history and wish-only moderation, and persisted USD/KHR reporting semantics.

All **27 migration files** match the starting application snapshot. **Zero historical SQL edits, zero checksum changes**. V16 remains unchanged. The upgrade test compares applied checksums before/after. Fresh schema success cannot prove lost historical customer mappings; DB-003 remains open.

## Security validation

Fresh Java/Python/frontend/MySQL tests continue to enforce PAY-001 buyer-claim versus trusted-payment authority; SEC-001 provider-subject identity and explicit linking; SEC-004 RSVP capability authority/non-disclosure; actual JWT-cookie CSRF proof and hostile-origin rejection; revoked-token/role freshness; password-reset locking; invitation password throttling; fail-closed Telegram webhook configuration/secrets; retry/idempotency; owner/admin authorization; signature/type/size/media caps; CSV formula neutralization; and exact-origin/source/session preview messaging.

Published `/w` and `/i` pages ignored forged editor query/messages in browser tests. Pending claims do not unlock purchased access; confirmed server PAID state is required. Storage failures preserve prior references/bytes and have rollback compensation. Scope does not prove absence of all vulnerabilities; real-provider settlement and historical secret revocation remain outside local validation.

## API compatibility

The complete Phase 2/current checked-in OpenAPI documents are semantically equal: **239 operations**, unchanged routes, aliases, DTO fields, enums, components and security definitions. **13 contract OpenAPI tests plus 1 disabled-docs test PASS** inside clean Maven verify. Application and Telegram source code matches the saved Phase 2 snapshot after line-ending normalization, supplementing the contract for internal endpoints not represented in public OpenAPI. Concurrent development-tool dependency files are the disclosed exception to full-tree snapshot equality.

Auth/current-user aliases, public invitation/RSVP/access endpoints, admin/payment routes, Telegram internal payment paths and legacy Event/audit models remain. Phase 3 introduced no additive or breaking API change and no pagination envelope. Existing Phase 2 additive APIs/fields remain documented by that report.

## Frontend validation

User: **370 tests / 79 files PASS**; lint, production build, Knip and dependency checks PASS. Newly built production assets were used for browser probes. Phase 2 route splitting, session bootstrap/linking, authoritative check-in/walk-ins/gifts, QR contract, guest import preview/commit, RSVP owner actions, report exports, currency separation and preview retry fixes retained. Required artwork remains byte-exact and decodes in the built app.

Marketing contact pending submission disables submit and does not claim success before SMTP acceptance; HTTP 503/502/429 retains entries and error feedback. Pricing/home/venues stay readable with an unavailable translation API. Guest tools show loading/error without false success; empty guest list remains usable. Unit suites also cover failed gifts/attendance/undo/import/RSVP/seating/report refresh/export and draft storage failure. Offline browser font CSS and provider SDK stand-ins are fixture provisions, not provider/font-network verification.

## Admin validation

Admin: **49 tests / 12 files PASS**; lint, build, Knip and dependency checks PASS. Authenticated desktop/mobile screens cover dashboard/users/templates/payment review/reports/logs. Aggregate count/revenue tests preserve full count and mixed-currency meaning; STAFF continues its existing ROLE_ADMIN mapping. Actual admin editor live names/gate/font remain stable after all load retries; wrong-session messages ignored. Dashboard SQL/entity fixture matches Phase 2. No sales/permission redesign occurred.

## Accessibility validation

Actual tested scope: marketing/mobile navigation/chat accessible names and focus; labelled contact inputs; venue and shared modal keyboard containment/Escape/restoration; selected date movement/Enter/Escape and focus return; seating table arrow-key movement and numeric coordinate alternative; visible 3px keyboard outline; rendered reduced-motion chat animation at 0s. Fresh DatePicker/Modal/seating/marketing component tests additionally exercise month boundaries, nested modal/inert restoration, retained failed-save edits and labels.

The separate final browser probe has **7 passing checks**: five accessibility scenarios and two guest loading/error/empty-state scenarios. Contact was rendered with CSS zoom 2 at 1440px, no document overflow. This is a browser reflow approximation, **not native browser zoom certification**, exhaustive screen-reader testing or formal WCAG certification. Automated fixture checks do not establish every control's accessible name/contrast or every device/browser combination. WCAG audit-patterns skill applied to scope and evidence limits.

## Browser validation

Complete available repository E2E suite: **66 PASS, 2 intentionally skipped** (same opt-in live-backend public personalized-invitation test in desktop/mobile projects, requiring `QA_PUBLIC_INVITATION_PATH`/`QA_GUEST_NAME` and a real API-created fixture). No real bank/Google/Telegram/SMTP/AI calls or physical camera use.

Additional fresh-production browser probes, counted separately from E2E: **62 screen checks** (31 families at 1440×1000 and 390×844), **11 preview security/editor checks**, **11 restored-asset byte/decode/containment checks**, **11 marketing feedback/keyboard checks**, **7 final accessibility/guest-feedback checks**; all pass. The initial five accessibility checks were rerun in the final seven and are not added twice.

Screen families: Home, Templates, Pricing, Contact, Login, Register, Profile, Dashboard, creation, Editor, Preview, Guests, RSVP, Wishes, QR, Check-in, Seating, Budget, Gifts, Reports, Organizations, Notifications, payment history, template checkout, packages, and admin dashboard/users/templates/payment review/reports/logs. Tests opened authenticated user/admin content with contract-shaped local fixture responses. Final screen sweep recorded **0 uncaught page errors, 0 console errors, 0 broken decoded images, 0 document horizontal overflow and 0 detected raw translation keys** under its checks. Provider SDK/font stand-ins deliberately avoid external calls. Representative desktop/mobile screenshots were inspected; all screen artifacts remain private.

## Performance comparison

Exact Phase 2 method repeated: HTML entry scripts + modulepreloads + recursively resolved static JS imports; excludes deferred route chunks and external Telegram SDK. Query counts use the same local Hibernate fixture sizes and statistics reset points.

| Metric | Phase 2 | Phase 3 | Change |
| --- | ---: | ---: | ---: |
| User initial static JavaScript | 664,896 bytes | 664,896 bytes | 0 |
| Admin initial static JavaScript | 370,291 bytes | 370,291 bytes | 0 |
| User initial gzip JavaScript | 200,496 bytes | 200,496 bytes | 0 |
| Admin initial gzip JavaScript | 117,136 bytes | 117,136 bytes | 0 |
| Invitation cover query count, 20 invitations | 2 SQL | 2 SQL | 0 |
| User dashboard, 20 invitations | 7 SQL | 7 SQL | 0 |
| Admin dashboard, 20 invitations | 10 SQL / 7 entities | 10 SQL / 7 entities | 0 |
| Check-in summary, 20 guests | 4 SQL / 1 entity | 4 SQL / 1 entity | 0 |

No material measured regression. Constant query counts do not bound response size, row counts, heap or production database aggregate cost. No production LCP/INP, throughput or latency claim is made. Remaining API categories and export/legacy compatibility are in PAGINATION_READINESS.md.

## Final complete test gates

| Gate | Final result | Evidence relative to private Phase 3 evidence root |
| --- | --- | --- |
| User lint/test/build/Knip/dependencies | All exit 0; 370 PASS | `logs/user-*.log` |
| Admin lint/test/build/Knip/dependencies | All exit 0; 49 PASS | `logs/admin-*.log` |
| Backend offline clean Maven verify | Exit 0; 432 discovered, **413 PASS / 19 opt-in MySQL skips**, 0 failures/errors | `logs/maven-clean-verify.log`, `logs/backend-verify-summary.json` |
| SpotBugs / PMD | PASS; SpotBugs 0 bugs/errors | Same verify log and private Maven reports |
| OpenAPI | 13 contract tests + 1 disabled-docs test PASS, included in the 413 | Verify summary; `logs/phase3-integrity-api.json` |
| Python pytest/Ruff/Bandit/compileall | All exit 0; 61 PASS, Bandit 0 findings | `logs/python-*`; pytest 2 dependency deprecation warnings |
| Isolated MySQL integrity | 19 PASS / 8 classes; no skips/errors | `logs/mysql-integrity.log`, `logs/mysql-summary.json` |
| Separate fresh MySQL catalog/schema | 1 PASS; read-only inventory | `logs/mysql-catalog.log`, `logs/catalog-inventory.tsv` |
| Repository policy/configuration | 6 PASS, no skips | `logs/config-repository.log` |
| Installed pinned skill verification | Exit 0 | `logs/skills-verify.log` |
| Complete available browser E2E | 66 PASS / 2 opt-in live-backend skips | `logs/e2e.log`, private E2E results |
| Supplemental production browser QA | 102 unique checks PASS | Screen 62 + preview 11 + assets 11 + marketing 11 + final accessibility/feedback 7 |
| Exact bundle/query fixtures | Match Phase 2 | `frontend-bundle-metrics.json`, verify query-count lines |
| Final Git/documentation review | No application changes; manifest complete; whitespace/links checked | [PHASE3_CHANGE_REVIEW.md](PHASE3_CHANGE_REVIEW.md) |

The 19 skipped MySQL tests in ordinary Maven verify are run separately and pass on isolated MySQL. Unique regular test successes: **984** = user 370 + admin 49 + Java 413 + isolated MySQL 19 + Python 61 + config 6 + E2E 66. The separate catalog repeat and 102 supplemental browser checks are additional evidence, not included in that total. Nonfatal unit environment/transport diagnostics and Python dependency deprecations are not silently equated with browser console errors or failed gates. This table records the validated Phase 3 scope before the separately excluded dependency changes; their current fresh-install/full-gate readiness remains the other effort's responsibility. User follow-up logs are under `logs/followup/` and do not increase the unique test count.

Private evidence root: `C:/Users/ASER Nitro/.codex/tmp/einvite-phase3-20261003`. Scripts, saved source snapshot/diffs, test summaries, builds and screenshots stay outside Git. Detailed owner/customer/secret data must remain private; the repository retains this redacted summary.

## Current-tree secret scan

**Gitleaks 8.30.1 PASS: 1,948 current files, exit 0, zero detected matches.** The final scan exports exactly tracked and nonignored untracked current files into an owned private directory, including externally added tooling and Phase 3 documents, and invokes `dir` with redaction. Raw matches are never printed. Evidence: `logs/gitleaks-final-refresh-summary.json`; redacted report/log remain private. Ignored private `.env`, caches and disposable evidence are outside this Git-candidate scope. A clean tree scan does not revoke historical credentials or certify ignored/deployed configuration.

## Complete working-tree review

[PHASE3_CHANGE_REVIEW.md](PHASE3_CHANGE_REVIEW.md) classifies all **287 unique reviewed paths**: original 280 Phase 2 working-tree changes plus seven new Phase 3 documents (secret document expansion overlaps baseline). Primary categories: CONFIG 8, BACKEND 70, DATABASE 3, TEST 84, FRONTEND 96, RESTORED_ASSET 11, DOCUMENTATION 15; SECURITY/BUG_FIX/ACCESSIBILITY/PERFORMANCE tags overlap these. No obvious temporary/generated material needed removal. Required tests/assets/evidence retained. The saved diff preserves reviewability after external Phase 2 commit.

## Remaining risks

Unapproved free/paid/media/expiry/team/report/branding/AI policy; Garden catalog/offer interpretation; incomplete actual runtime premium inventory; authoritative historical template recovery; historical credential revocation; real provider registrations/settlement/storage/SMTP and physical camera behavior; full list/report/export memory/query scale; storage orphan reconciliation after crashes/unknown completion/best-effort cleanup; process-local Telegram retry cache relies on backend financial idempotency. Separately excluded concurrent dependency edits need their own manifest/lock/fresh-install validation before certifying the combined tree. Existing marketing feature promises must be reconciled with approved enforceable package rules before commercial rollout. Native zoom/screen-reader/cross-browser/device breadth remains unverified. No speculative architectural fix was introduced.

## Proposed commit plan

[PHASE3_COMMIT_PLAN.md](PHASE3_COMMIT_PLAN.md) gives exact current documentation groups, finding IDs, tests and dependencies, plus logical Phase 2 review groups. Do not recreate/split externally committed Phase 2 history. Remaining eight files are ready for owner review; no staging or commit was executed.

## Hosting readiness blockers

Informational only: owner-approved product/offer/AI policy and any required unwired implementation; recorded secret revocation/replacement and intended secret-store configuration; actual provider sandbox verification; authoritative recovery plan for affected customer mappings; production-scale paging/export/query-plan assessment; secure-origin real-device QR tests; intended deployment-origin/cookie/CORS/TLS configuration and operational backups/monitoring. **No application was hosted or deployed in Phase 3.** Local candidate validation does not close these blockers.
