# Phase 7 final engineering report

**Recommendation: Ready for code review.** Local implementation and verification are complete on `feat/phase7-guided-collaboration` in `D:/Koupreng-Phase7-worktree`, based on `0183def5`. Staging/provider/device checks remain explicit release prerequisites. No merge, push, deployment, live migration, real payment or DNS change was performed. The normal checkout's HEAD remains unchanged and its existing generated test-class changes were left alone. The user's `.env` was not modified.

## Outcome and repository findings

Koupreng retains its React 19/Vite 8/Tailwind 4/Zustand frontend, Java 25/Spring Boot 4/JPA/Flyway backend, MySQL 8 and Python worker. The initial audit found reusable editors, renderers, entitlement snapshots, organization membership, report query/export infrastructure and modal primitives. Phase 7 extends those boundaries rather than introducing parallel models, another UI framework or synthetic product telemetry.

The principal defects were unclear Studio/save/publish transitions, unbounded guest-page loading, incomplete team consent/authorization, absent entitled event analytics and fabricated admin dashboard metrics. Real SQL tests also reproduced a concurrent invitation lost update; real browser repetitions reproduced preview focus loss. Both were corrected and regression-tested. Program/story contracts, template artwork/fonts, owner financial workflows and trusted settlement semantics remain intact.

## Implemented feature matrix

Paths below are relative to the repository. Frontend paths are under `apps/frontend-user/src` unless stated otherwise; backend paths are under `apps/backend/src/main/java/com/koupreng/backend`.

| Feature | Before → implemented behavior | Principal changed files | Backend impact | Database impact | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Guided editing and save | Dense editor/direct publication → five steps plus Advanced, ordered saves, 401/409/offline recovery and retained edits | `features/invitations/InvitationForm.jsx`, `studio/StudioGuide.jsx`, `studio/useStudioPersistence.js`, `features/events/onboarding/EventDetails.jsx` | Existing DTO/save/version contract retained and strengthened for participating writes | No editor-data rewrite | 757 user tests; native save/conflict and browser regressions | Implemented |
| Publishing | Immediate toolbar action → checklist, explicit confirmation, flushed save, server-confirmed status/slug and uncertain-state recheck | `studio/PublishReview.jsx`, `features/events/onboarding/EventDetails.jsx`, event overview/creation routes | Existing authoritative publish validation and returned revision | No publication migration | Real create/edit/reload/publish/public-page journey and fixture rejection cases | Implemented |
| Mobile/preview/a11y | Hard-to-reach actions and loading/focus gaps → safe-area actions, retry, named scroll area, stable focus/iframe Escape and return | `LivePhoneSimulator.jsx`, `studio/InvitationStudio.css`, `shared/ui/Modal.jsx`, toolbar/navigation/support labels | Existing renderer/messaging nonce, origin and source validation preserved | None | 72 three-engine cases; ten Firefox repetitions; requested viewport widths | Implemented; physical checks pending |
| Package/payment clarity | Grant history could look unpaid and benefits hard to compare → configured comparison, record/seat limits, explicit nonrevenue grants and verified lifecycle | `features/subscriptions/PackageComparison.jsx`, purchase history/cards; subscription response DTO/service | Entitlement authority, server prices, immutable purchased benefits and trusted settlement retained | No pricing/payment rewrite | Real registered Free plan; native grants/entitlements; payment regression tests | Implemented; providers unverified |
| Paged guests and bulk export | Unbounded collection and mixed units → capped server pages/filters, global aggregates and at most 100 scoped selected IDs in CSV | `features/guests`, `guest/application/GuestDashboardService.java`, `guest/infrastructure/persistence/GuestDashboardRepository.java` | New DTO endpoints, event-scoped all-or-nothing selection, CSV formula protection | V49 scoped creation/ID index | HTTP/MySQL totals/bounds/redaction/selection tests; four guest scenarios and inherited import | Implemented |
| Accepted collaboration | Organization membership without complete consent/tool controls → intended-recipient one-time invite, explicit consent, owner-capacity locks and per-module authorization | `features/organizations`, event team/workspace; `organization/application/OrganizationService.java`, `invitation/application/EventCollaborationService.java` | Fresh effective roles/owner entitlement, protected financial/publish/admin operations, optimistic concurrency | V47 invite hash/expiry; V48 accepted timestamp | Real acceptance/replay/expiry/removal/quota/edit races; actual UI invite/link/accept/revoke | Implemented |
| Advanced analytics | Configured flag without a distinct event tool → server-backed daily attendance facts and current totals, date limits, accessible table/chart | `features/events/workspace/AttendanceAnalytics.jsx`, `guest/application/AttendanceAnalyticsService.java`, `guest/infrastructure/persistence/AttendanceAnalyticsRepository.java` | VIEW_REPORTS plus owner's ADVANCED_ANALYTICS; Cambodia date boundaries, no private contacts | Existing stored guest/RSVP/check-in facts | Native boundaries/denials; two browser scenarios and actual reconciled RSVP | Implemented |
| Admin truthfulness/reports | Invented growth, curves, cash, delivery/uptime and fake records → recorded totals, honest zero/unavailable states, separated currencies and report links | `apps/frontend-admin/src/features/dashboard`, `layouts/components`, `shared/ui/AnimatedNumber.jsx` | Existing dated report/export engine retained | None | 121 admin tests, native backend suite, deterministic SQL export tests, actual bilingual admin login/reports | Implemented; live bank evidence unverified |

## Test matrix and actual limits

| Layer | Passed | Failed | Skipped / not run |
| --- | --- | --- | --- |
| Current user Vitest | 757 in 126 files | 0 | No additional type checker is configured |
| Current admin Vitest | 121 in 21 files | 0 | None |
| Unique backend results | 608 of 611 | 0 failures/errors | Three deliberately guarded historical Phase 6 database-provisioning cases |
| Post-V49 native HTTP/SQL/OpenAPI/architecture | 35 (overlaps backend total) | 0 | Docker unavailable; native MySQL used |
| Worker | 72 | 0 | Two upstream warnings |
| Final axe/keyboard/reflow, three engines | 72, plus ten repeated Firefox preview passes | 0 | Physical devices, browser chrome zoom and human screen readers not run |
| Actual browser/API/SQL journeys | 4 | 0 | No live external providers |
| Inherited Chromium regression journeys | 20 | 0 | No claim that every existing browser spec was executed in every engine |
| Lint/build/routing/skills | Both apps pass; routing and integrity pass | 0 | Environment-specific deployment gates remain |

See `10-test-results.md` for commands, durations, earlier failures/corrections, exact skip rationale and performance evidence. The full backend run had 607 passes/four skips; the opt-in benchmark subsequently passed, giving the unique 608/three-skip result. Focused reruns are not added to totals. Happy-dom external-resource diagnostics and worker warnings are documented rather than hidden.

## UX and evidence review

Before/after screenshots compare the actual baseline build and current UI using identical fictional inputs in both languages at phone/desktop sizes. Empty admin screenshots make the removal of fabricated metrics directly reviewable. Guest cards explain separate record/seat/attendee units, guides retain advanced editing and Khmer typography/artwork remain established project assets. Separate successful real integration screenshots prove local service wiring, rather than treating intercepted fixtures as backend proof. `11-visual-regression.md` and the screenshot manifest explain provenance, widths and masked evidence.

The review package at `D:/Koupreng-UXUI-Phase7` includes all reports, selected screenshots, deterministic export samples, migration/query-plan/benchmark summaries, local commit history and a binary-safe patch against `0183def5`. It contains no `.env`, fixture credentials, database dump, dependencies or private runtime traces. Its ZIP is a review artifact, not a deployed build or production database backup.

## Security and accessibility

Authorization remains server-owned. Accepted membership, effective role, current owner subscription and capacity are rechecked per request. Member personal tiers cannot confer owner benefits. Owner-only publication, finances, access settings, delivery/tickets and team administration remain restricted. Contribution fields are redacted and protected from delegated writes. Token expiry/versioning, HMAC/trusted payment evidence, server-owned prices and idempotent settlement remain enforced. Concurrent edit/capacity tests and revocation/IDOR tests pass. No browser or unverified claimant action grants paid access.

Axe checks cover modified critical screens and login/register in both languages without exclusions. Keyboard tests cover preview/dialog containment, iframe boundaries, Escape, trigger restoration, nested background isolation, reflow/text spacing and retained edits. Contrast and accessible-name defects were repaired. These results support improved accessibility; they do not establish full WCAG conformance, Khmer pronunciation quality or physical Safari behavior. See `04-localization-accessibility.md` and `12-security-accessibility-audit.md`.

## Migrations and data integrity

All 43 historical SQL migration blobs through V46 retain their hashes. Only V47, V48 and V49 were added, producing 46 actual migration files. Fresh/representative upgrades preserve existing owner and pending-member data. Legacy ACTIVE membership without explicit consent gains no new event permissions. V49 serves the bounded stable guest order; EXPLAIN chooses its covering backward scan without filesort.

SQL work was confined to `phase7_disposable` and generated test schemas on the verified task-owned loopback 3416 server. The normal port-3306 schema was not migrated. Local demo accounts are fictional nonrevenue grants; no existing customer/demo record was overwritten. Migrations are forward-only; staging backup/upgrade/recovery rehearsal and a separately authorized production rollout are required. Do not edit or delete an already-applied V47–V49.

## Remaining validation and release recommendation

`13-known-limitations.md` records external ABA/bank/Telegram/email/OAuth/cloud integration, production Redis/topology, physical devices/keyboards/safe areas, screen readers and Khmer editorial review. Analytics intentionally reports stored latest RSVP/current facts, not invented activity or recurring revenue. Team codes require private manual sharing and do not imply email delivery. Generic invitations use the existing saved preview route. Direct server PDF and real-time multi-user presence were not added.

The next release step is code review, followed by staging validation with reviewed configuration, backups, real provider test credentials and manual device/accessibility coverage. No production-ready recommendation or deployment approval is inferred from these local gates.
