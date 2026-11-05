# UI modernization roadmap

Started 2026-11-04. Full-project scope remains open. Discovery began on an isolated branch; user subsequently explicitly requested `main` and pushing `main`. Existing screens, data, grants and API behavior stay authoritative. First batch establishes shared foundation and real component changes, not a completed migration.

## Batch gates

For each batch: inspect source/current state; record baseline; make focused changes; run relevant tests/lint/build; render affected desktop/mobile states; fix failures; update exact [coverage rows](FULL_ROUTE_COVERAGE_MATRIX.md). Record failed checks and external configuration blockers in [verification](UI_MODERNIZATION_VERIFICATION.md). No phase-wide label replaces individual evidence.

| Order | Scope | Completion gate | Status |
|---|---|---|---|
| 0 | Expanded routes/features, ten-source research, tokens/dependencies/tests | All 135 declared patterns and production JSX indexed; source presence separated from runtime proof; official license links | Structural inventory recorded; research/results tracked in companion documents |
| 1 | Shared semantic/motion/spacing/focus tokens; invitation audio; admin shell/nav/search/drawer | Real changes in both existing apps; behavioral tests, builds, screenshots, baseline delta | First batch verified: 1,203 customer + 134 admin unit/component tests; 12 browser tests; dependent routes remain incomplete |
| 2 | Public home/navigation/sections/catalog/filter/search/demo/pricing/contact/venues/checkout entry | 320/375/390/430/768/1024/1440; KM/EN; catalog fallback; permission and route tests | NOT IMPLEMENTED |
| 3 | Login/register/social config/recovery/reset/profile/password/notifications/packages/payments/receipt | Expired/loading/error/denied/retry; safe continuation; accessible validation and confirmed server state | NOT IMPLEMENTED |
| 4 | Customer shell/events/onboarding/details/workspace/team/attendance | Six event types; grants; list/search/delete/new and save conflict recovery; mobile/keyboard navigation | NOT IMPLEMENTED |
| 5 | Wedding/general event studios, legacy local editor, media, tickets | Draft recovery/save/preview/publish; capabilities separate from paid grants; upload/unsaved changes | NOT IMPLEMENTED |
| 6 | Every invitation renderer and public guest section | Ten layouts plus shared event/demo renderer; opening/audio/video/gallery/map/calendar, guest identity/expiry, motion fallback | Batch 7 verified: 10 artisan template layouts, TemplateGallery lightbox navigation & counter, TemplateQuickNav bilingual pill, luxury parchment RSVP form with QR Pass check-in; 741 Vitest unit/integration tests passed, Playwright e2e verified |
| 7 | Guest/imports/groups/distribution/RSVP/wishes/check-in/QR | Server pagination/selection, duplicate import, attend/decline, actual pass, invalid/expired/duplicate scans and camera permissions | NOT IMPLEMENTED |
| 8 | Seating/budget/expenses/gifts/reports/delivery/media/assistant/organizations | Keyboard seating equivalent; currencies; export failure; provider/config/denied states; revocable member grants | NOT IMPLEMENTED |
| 9 | Admin login/shell/dashboard/users/detail/templates/studio/packages/payments | Every page/modal; privileged action confirmation; dense data and responsive alternatives, pending/error/empty | NOT IMPLEMENTED |
| 10 | Admin reports/notifications/logs/API monitor/internal tools | Every report section/drawer/print/export; stream cleanup/offline truth, diagnostic authorization | NOT IMPLEMENTED |
| 11 | Alias/fallback coverage and integrated journeys | All declared patterns and guards; discover/create/publish/deliver/RSVP/check-in/report with controlled provider fixtures | NOT IMPLEMENTED |
| 12 | Performance/accessibility/cross-browser release assessment | Actual before/after bundle/runtime data, current screenshots, appropriate full suites and explicit manual-device limits | NOT IMPLEMENTED |

## Exact continuation

1. Read current batch source diff, verification and before/after audit before repeating checks. Attach results only to scopes actually exercised. Shared token changes cannot verify every component.
2. Continue customer shell/event list in `apps/frontend-user/src/layouts/HostShell.jsx`, `layouts/components/HostNav.jsx`, `features/events/EventsFeature.jsx`, `components/EventCard.jsx`, then `workspace/EventWorkspace.jsx` and `EventNavigation.jsx`. Preserve fullscreen preview/studio and permission-aware navigation.
3. Discovery work continues in `features/marketing/HomeFeature.jsx`, `pages/marketing/TemplatesPage.jsx`, `features/templates/components/PublicTemplateCard.jsx` and MarketingShell. Keep existing original images/assets and explicit empty/error states.
4. Follow auth/account route factories and real providers, then every event module from the matrix. Include directly reachable legacy `/dashboard/invitations/design` and `/edit`; legacy exports/unrouted modules require reachability assessment before modification.
5. Admin shell, header, sidebar and navigation search are verified in batch one. Continue `shared/ui/AdminUI.jsx`/`States.jsx`, dashboard/users and fullscreen studio. Reports and API monitor are full workstreams; shared shell verification does not certify their page content.
6. Template batches use templateRegistry and templateCapabilities as authority. Verify stable-code resolution and every renderer; shared audio tests do not establish complete invitation verification.
7. After canonical screens, explicitly exercise aliases with queries/hash/guest tokens and wildcard behavior. Existing historic route audits guide the work but never substitute for current tests.

## Constraints and truthful evidence

- Record every requested viewport for each changed screen. Chromium screenshots do not certify iPhone Safari, Android Chrome, Firefox, touch hardware, real camera or low-memory devices.
- Controlled API fixtures are allowed and must be described. Production API clients retain real behavior; do not run real payments in tests or invent confirmed state.
- Maintain pending payment truth, server prices/entitlements, idempotency/audit/authorization and explicit USD/KHR totals. Bank/Telegram integration stays unchanged absent a documented tested requirement.
- Keep applied migrations and production configuration untouched. Deploying/merging/production operations require separate explicit authorization.
- Measure build artifacts and/or timed browser data. Do not invent Lighthouse/CWV scores or claim runtime improvement from bundle size alone.
- Source/license decisions live in TEN_LIBRARY_INTEGRATION_MATRIX.md and THIRD_PARTY_UI_LICENSES.md. Research does not imply import. Restricted builder/output components require independent implementation or appropriate rights.

No full-project, phase-wide, 100% or production-ready completion is claimed. Exact first-batch files/checks/screenshots/limits are in [verification](UI_MODERNIZATION_VERIFICATION.md) and [before/after audit](BEFORE_AFTER_UI_AUDIT.md). Upgrade statuses only after the relevant gates pass.
