# KOUPRENG E-INVITATION
## Ultimate Full-Project UX/UI, Interaction, Motion & Visual Experience Transformation — Master Scope

**Scope version:** 1.0 | **Prepared:** 11 November 2026  
**Repository:** [Ny-Panha/Koupreng-invitation_project](https://github.com/Ny-Panha/Koupreng-invitation_project)  
**Program:** 27 proposed phases / five execution waves  
**Status:** Planning specification only. No implementation, production deployment, code changes, or new browser tests are claimed here.

> **Mission:** Transform the *entire* active E-Invitation experience into a cohesive, distinctive, premium, accessible, high-performance product without losing working workflows, domain rules, data integrity, creator customization, guest convenience, Cambodian wedding identity, or the team's prior work. The quality objective is not maximal effects on every element; it is appropriate cinematic excellence, precise usability, visual consistency, craftsmanship, and reliable operation on real devices.

## 1. Grounded current baseline

This plan uses the repository's **10 November 2026 Phase 01 audit** as its starting evidence, not as a fresh test run. At that snapshot, the project had separate customer/admin React 19 frontends using Vite 8 and Tailwind 4, a Spring Boot backend, MySQL/Flyway, and FastAPI/Telegram support. The audit listed **111 customer and 24 admin leaf route patterns (135 total)**. It reported 1,391 customer unit tests and 191 admin unit tests passing, but live provider/device/database certification remained incomplete.

Confirmed existing issues include an inaccessible/clipped mobile admin template preview (AU-001), unlabeled mobile external-preview action (AU-002), mouse-only editor divider (AU-003), and three contrast issues (AU-004–006). The audit's single diagnostic LCP samples were roughly 4–5 seconds: neither field-performance certification nor grounds for unmeasured speed claims. Existing UX documentation and component/renderer code must be revalidated against the current branch before edits.

**Source of truth:** `docs/audits/phase01-2026-11-10/` — especially `03-feature-and-route-inventory.md`, `05-confirmed-bug-register.md`, `08-design-system-proposal.md`, `10-modernization-backlog.md`, `11-prompt-02-implementation-plan.md`, `12-phase-03-to-14-roadmap.md`, `14-team-preservation.md`, and `15-limitations-and-coverage.md`. Work under the repository's `.agents/ROUTER.md` and use the right task-specific skill, never all skills at once.

## 2. Entire-product scope — what “full project” means

**Included applications/roles:**

- Public marketing, product pages, contact/help, venue discovery, localization, and search/discovery.
- Authentication, registration, recovery, Google/Telegram handoffs, account/profile, plans, and entitlements.
- Premium/free template marketplace, galleries, compatibility/ownership states, demo, checkout, and template registry.
- Event-owner creation/onboarding, event home/workspace, creation/editing, drafts, publish, plans, settings, sharing, and collaboration.
- Creator Studio: guided and advanced editor, data/sections/themes, preview, images, crop/focal controls, audio/video, uploads, autosave, conflicts, errors, and template fidelity.
- Guest-facing personalized and public invitation experiences, cinematic openings, date/program/venue/map/calendar/media, RSVP, wishes, gifts, consent, error and access states.
- Guest records, groups, pagination, import, RSVP administration, delivery, ticket design/export, QR, guest check-in, seating/floor plan, expenses/budget, gift records, attendance, reports, and analytics.
- Template purchases, ABA PayWay links/returns, pending/review/verified states, contributions, receipts, histories and server-authoritative entitlement communication.
- Admin application: login/dashboard, users/roles, template Studio and catalog, packages, payments, notifications, moderation/management, reporting, audit logs and API monitor.
- Cross-cutting systems: design tokens, themes, layout/safe area, navigation, fields/validation, focus/keyboard, localization, accessibility, motion/reduced motion, loading/error/empty states, notifications, print/download, security feedback, performance, observability, QA, documentation, and release readiness.

**Explicitly optional new product initiatives (not falsely described as implemented):** separate owner calendar, general marketing content CMS/publishing, live AI-provider integration, real-time venue booking, and refunds. Each requires a product decision, backend/API/data/security design and a separate acceptance gate; a UI mockup does not count as a functional feature.

### Completeness rule

No active route, feature, reusable component, modal/drawer, responsive breakpoint, role/state, or template family is exempt by default. The phase owner must trace every source route and meaningful UI state to an inventory row with an explicit outcome: **UPGRADED**, **PRESERVED + VERIFIED**, **BLOCKED (reason/owner)**, or **DEPRECATED (approved and proven)**. Do not claim 100% coverage from counting redesigned pages alone. Active aliases, permissions, destructive actions, empty/loading/error states and actual backend-integrated journeys are part of the inventory.

## 3. Global premium design principles

1. **One recognizable platform brand, distinct invitation art direction.** Owner/admin product chrome can use the existing ivory/cream, forest green, ink and gold semantic foundation. Template-specific colors, fonts, illustrations and scenes remain independent.
2. **Khmer-first craftsmanship.** Preserve legitimate project fonts, Khmer script support and long-name reflow. Respect English/KM language switching, numerals, calendar semantics, line height and appropriate contrast. Do not apply Latin-only scripts to Khmer body content.
3. **Function first, polish always.** Use obvious visual hierarchy, recognition rather than recall, progressive disclosure, appropriate touch sizes, clear status and safe recovery. Apply Nielsen's heuristics plus Jakob's, Hick's, Fitts's and Gestalt principles to concrete flows.
4. **Art-directed motion system.** Standard UI feedback should be modest; special ceremonial scenes may be rich and opt-in. Every essential task must work with motion reduced, 3D unavailable, keyboard-only, low power and slow networks.
5. **Depth that serves meaning.** Restrained shadows, textures, parallax, layered storytelling, and optional GPU 3D only where they improve comprehension or emotion. No heavy persistent shader backgrounds on dense management tools.
6. **State integrity.** Never lose drafts, race-order preview messages, silent form changes, unknown serialized JSON, server-owned price/access decisions, ownership checks or auditability for visual fidelity.
7. **Evidence-based upgrades.** Record baseline, change, tests and before/after screenshots for every phase. A mock/test fixture PASS is not proof of live integration.
8. **Licensed originality.** All ten previously considered React UI libraries may provide inspiration, but copy/install only reviewed components with appropriate source, license and redistribution rights. No unlicensed proprietary component or template-pack redistribution.

## 4. Five-wave, 27-phase execution plan

### WAVE I — FOUNDATION, BRAND SYSTEM AND MOTION PLATFORM (PHASES 01–06)

#### Phase 01 — Fresh complete inventory, visual baseline and risk map
**Coverage:** both apps; 135-audit route baseline and any newly added routes; shared and domain components; every invitation renderer; role/permitted/denied states; keyboard, responsive and motion settings.

**Work:** reconcile current main HEAD to source; route+feature+state+template registry; capture before screenshots for representative states at 320/390/768/1024/1440 and long/short viewport; classify existing reusable UI, duplicated patterns, bugs, hidden overflow, missing content/states and visual debt. Review current test/CI status and previous evidence without erasing failed runs. Establish comparable baseline Lighthouse/lab metrics and bundles where reproducible.

**Deliverables:** `route-feature-state-matrix`, annotated before gallery, design debt/bug backlog, component inventory, UX-flow diagrams, risk-ranked priority map, evidence limitations register.

**Exit:** 100% active route patterns accounted for; no undocumented critical role or template; new vs historical test results clearly distinguished.

#### Phase 02 — Experience architecture, customer journeys and premium art direction
**Coverage:** first visit → discover → select → sign in → create → customize → publish → share → guest view/RSVP → manage/measure → admin maintain; include all exceptions/returns.

**Work:** map navigation, information architecture, role-specific task priorities, responsive shell requirements, editorial design language, content tone, clear pricing/status vocabulary, image/motion references and separate directions for Khmer ceremonial versus modern international templates. Define experience tiers: essential, enhanced, cinematic. Establish annotated Figma-equivalent design specs or structured design docs with flow and state diagrams.

**Deliverables:** product UX specification, end-to-end journey diagrams, content/label system, design direction boards, interaction grammar, no-dead-end navigation map.

**Exit:** each major journey has a valid starting point, primary action, errors, recovery and completion; design directions align across app while keeping template identities independent.

#### Phase 03 — Canonical visual tokens, typography, theme and responsive foundations
**Coverage:** both React apps and their shared semantic roles; management light/dark modes; existing brand artwork and fonts; template isolation.

**Work:** refine existing `semantic-tokens.css`, sync mechanism, spacing, density, type scale, weights, grid, borders, radii, elevation, gradients, icon sizing, interaction contrasts, forced color/zoom behavior; preserve DM Sans and Khmer Kantumruy/Battambang base where appropriate. Correct AU-004–006. Document template-safe usage, responsive breakpoint semantics and safe areas.

**Deliverables:** versioned semantic token guide, bilingual type specimens, all meaningful component state swatches, responsive layout rules, visual snapshots, contrast tests.

**Exit:** no new competing root reset/theme; management states measurable and legible; no accidental recolor of published invitation recipes.

#### Phase 04 — Full reusable component system and interaction contracts
**Coverage:** buttons, links, form fields, select/search/combobox, date/time, upload, steps, radio/check, cards, tables, modals, dialogs, drawers, sheets, tabs, menus, popovers, breadcrumbs, tooltips, alerts/toasts, badges, skeletons, empty/error/permission states, previews, status indicators, pagination, data charts, tables and file export.

**Work:** audit existing primitives before extending; eliminate demonstrably inconsistent behavior, not arbitrary existing implementations; standardize hover/focus/pressed/disabled/loading/success/warning/error/danger states; ensure keyboard semantics, focus restore, mobile navigation, active affordances and predictable content layout. Preserve the existing Modal focus/inert/preview behavior and admin equivalent boundaries.

**Deliverables:** component catalog with code ownership, variants and story/state examples; semantic API contracts; usage rules; unit/a11y/screenshot coverage.

**Exit:** all upgraded screens use approved primitives or documented intentional exceptions; no second modal/focus manager or conflicting theme reset.

#### Phase 05 — Motion, transitions, cinematic and 3D platform
**Coverage:** standard microinteraction system, route/overlay transitions, preview transitions, hover/touch depth, template-specific ceremonial effects, optional 3D assets, media/audio controls.

**Work:** define purposeful tiers: functional (~120–220ms), spatial (~200–350ms), and cinematic (per scene, controlled and skippable). Prefer current Framer Motion/CSS/Web Animations; use Three.js/React Three Fiber only for approved individual scenes after dependency/license/mobile performance review. Engineer envelope/wax-seal, layered paper, parallax and scroll scenes as reusable opt-in compositions; provide static fallback, skip/pause controls, deterministic reduced-motion path, accessible focus/navigation, load priority and memory cleanup. Audit real tapping of animated CTAs.

**Deliverables:** motion tokens, scene contract, example compositions, storyboard per approved invitation family, 3D fallback policy, runtime performance traces and motion regression tests.

**Exit:** animation never gates RSVP, editor save, login, navigation or payment; no unexpected autoplay; low-end and reduced-motion alternatives function; nonessential JS/WebGL costs justified.

#### Phase 06 — Global layout, navigation and responsive platform
**Coverage:** user marketing/auth/owner shells and distinct admin shell; header, sidebar, bottom navigation, mobile drawers, navigation breadcrumbs, search, locale/appearance controls, consent and app-switch return.

**Work:** consolidate shell spacing/hierarchy and menu behavior without breaking routes; ensure proper touch navigation, focus, safe-area padding, keyboard resize, sticky actions, short viewport/virtual keyboard, tablets, wide desktop and 400% reflow; fix admin Studio AU-001–003 as the critical mobile foundation gate if not already fixed earlier.

**Deliverables:** shell and breakpoint specs, accessible navigation contract, responsive geometric tests, desktop/phone screenshots, route identity preservation report.

**Exit:** all essential navigation reachable without hidden-clipped controls or hover-only interaction; mobile admin Studio Edit/Preview works; desktop layout preserved.

### WAVE II — PREMIUM MARKETPLACE AND CREATOR EXPERIENCE (PHASES 07–15)

#### Phase 07 — Marketing experience and brand storytelling
**Coverage:** `/` landing, marketing navigation, contact, pricing entry, help/about aliases, venue discovery/detail, FAQ/support content, footers and SEO metadata.

**Work:** create editorial art-directed responsive hero, recognizable product storytelling, authentic proof only, template highlight modules, transparent CTA hierarchy, tasteful cinematic scroll sections, optimized illustrations/media, accessible contact form, functional search/links, and honest venue listings (existing static venues are not live booking inventory). Decide whether separate About/Help content merits actual routes rather than silently declaring features.

**Exit:** clear first-visit discovery path, working navigation and contact recovery, fast loading with LCP evidence, content parity across Khmer/English, no fabricated reviews/metrics.

#### Phase 08 — Identity, authorization-facing UX, profiles and account life cycle
**Coverage:** registration, email/password login, Google and Telegram login, forgot/reset/change password, email verification if present, session expiry, admin-vs-customer entry, profile/account security, logout and return-to-intended-page.

**Work:** premium but conventional form UX; password toggles, strength/validation feedback, clear access-denied, failed-provider/cancel/retry states, safe account recovery, keyboard labels, locale copy, mobile virtual keyboard and session restoration. Preserve validated `next` targets, real auth boundaries and server trust.

**Exit:** all normal/error/expired/cancel/return states tested; staging-provider paths marked verified or blocked honestly; no auth/security logic changed purely for visual novelty.

#### Phase 09 — Template marketplace, plans, demo and purchase decision
**Coverage:** `/templates`, browse/catalog/details/demo, search/filter/sort/category, template compatibility, free vs premium/owned flags, thumbnails, previews, `/pricing`, package/plan choice and checkout/return guidance.

**Work:** luxury grid/list composition, honest clear commercial states, fast high-quality media presentation, preview drawer/fullscreen, accessible filter controls, comparison and favorite/recent only if API-ready, responsive pricing and checkout, skeleton/zero results/error/retry; maintain registry IDs and server-owned ownership/prices.

**Exit:** every active template discoverable and renderable; server entitlement governs CTA; preview works touch/keyboard and does not grant paid access; checkout states are unambiguous.

#### Phase 10 — Template art direction, registry and complete visual families
**Coverage:** every registered dedicated and shared invitation layout, legacy aliases, sample/demo and real published representation; e.g. existing Royal Garden Cinematic, Khmer Celestial, Silk Heritage, Event Essential families as confirmed in source.

**Work:** individually audit composition, unique palette, photography, ornament, Khmer script, section sequencing, cover/opening, RSVP integration, music, scroll storytelling and visual transitions. Define quality tiers without forcing one universal wedding theme. Build reusable accessible sections (hero, family, program, date, venue/map, photos, gift, RSVP) while preserving every template's renderer-specific identity and data bindings. Provide tasteful static mode and no-motion mode.

**Exit:** per-template mobile/desktop fidelity matrix complete; sample and authored content correctly mapped; no duplicate template slug/ID, no layout corruption, no proprietary component redistribution.

#### Phase 11 — Event creation/onboarding and draft-safe wizard
**Coverage:** all event types, template-to-create intent, stepper, event name/date/time/timezone, venue, couple/hosts, content, validation, session switch, retry/back, drafts, onboarding success, new/existing event handling.

**Work:** progressive-disclosure wizard, visual progress with direct wayfinding, clear field grouping, live non-blocking validation, preview context, helpful Khmer content and short mobile steps; maintain request identity/idempotency, persistence and edit restoration.

**Exit:** fresh and resumed creation with source-backed backend save, refresh, errors, duplicate-submit prevention and preserved template intent; long Khmer text/keyboard/device tests.

#### Phase 12 — Owner home, workspace, event management and calendar concept
**Coverage:** dashboard, event list/search/filter/sort, event overview, workspace modules, event status, invitations and shortcuts, upcoming dates, status/action center, alerts and role-aware cards.

**Work:** premium information architecture, user-owned truthful KPIs, event-centric contextual navigation, mobile task card layouts, desktop dense views, meaningful zero-data illustrations without false numbers. Owner calendar is **a proposed feature, not an existing separate route**: build only after API/date/timezone definition and approval.

**Exit:** all existing actions and event-specific routes remain accessible; dashboard reflects server truth; analytics and calendar never invent events or settlement figures.

#### Phase 13 — Complete creator Studio and advanced invitation editor
**Coverage:** guided+advanced flows, content, sections, story, date/program, hosts/family, visual style, templates, interactive settings, draft/autosave, undo/redo when supported, preview, publish checks, conflicts and ownership controls.

**Work:** premium desktop workbench and genuinely usable mobile stacked studio; coherent layers/section organization, inspector grouping, drag alternatives, direct preview and device presets, responsive composition, real save/status feedback, keyboard navigation, status history. Safeguard existing owner serialization, unknown JSON roundtrips, trusted iframe preview, save revision/conflicts, 401/409/503/offline recovery, and entitlements. Large files may be refactored only in bounded, tested units.

**Exit:** long real edit/preview/save/reload roundtrip and published parity on mobile+desktop; no lost data; all authoring operations keyboard/touch operable; source and fixture state contracts pass.

#### Phase 14 — Complete media studio, photo/design tools and asset workflows
**Coverage:** image library, upload/replace/remove, albums/gallery, responsive crops/focal points, orientation, picture ordering, ticket imagery, videos, invitation audio, icons, fallback assets and limits.

**Work:** visually polished asset grid, upload progress, retry/cancel, processing states, permission/error messages, mobile crop controls, content previews and optimization. Existing MIME/signature/size restrictions remain authoritative. HEIC support is an **evaluation/change-control item**, not something to silently allow; verify actual privacy, conversion/memory and storage implications.

**Exit:** real staging upload and edited-media rendering, EXIF/orientation and oversized/unsupported errors, keyboard controls, persisted ordering and predictable cleanup; no accidental media disclosure.

#### Phase 15 — Review, publish, preview, share and access experience
**Coverage:** pre-publish validation, public/private/password/guest-token access, publishing state, canonical link/slug/QR preview, ownership, SEO/meta preview where applicable, sharing/copy/Telegram/WhatsApp/Web Share handoffs, edit/unpublish, link errors.

**Work:** clear review checklist, polished preview and responsive overlays, publish guard/confirmation, correct privacy indicators, share sheet and return flows, readable direct/expired/denied states, reliable copy/export and safe navigation. No public link until server confirms publish; no outbound message from automated fixture tests.

**Exit:** end-to-end staging create → edit → publish → view/return → revoke/restrict flows prove server access, not only frontend mock states.

### WAVE III — IMMERSIVE GUEST EXPERIENCE AND EVENT OPERATIONS (PHASES 16–21)

#### Phase 16 — Entire guest-facing invitation/player experience
**Coverage:** public invitation opens (all registered renderers), ceremonial scenes, personalization, program, location and directions, calendar, gallery, audio/video consent, couple story, gifts, RSVP entry, errors and in-app browsers.

**Work:** editorial guest readability, immersive but optional cinematic sequencing, polished scroll positions, stable opening CTA, progress/skip/pause, safe fixed buttons, respectful media and accessibility; robust Telegram/Facebook/Messenger/WhatsApp browser behavior and native map/calendar deep links.

**Exit:** guest can view and complete essential task on real iPhone/Android and at least representative in-app clients; no scroll trap, fake autoplay success, blocked action, non-dismissable scene, or data leaked across guest tokens.

#### Phase 17 — Guest CRM, groups, import and delivery management
**Coverage:** guest list/cards/table, search, filters, groups, pagination, bulk actions, dedupe, CSV/Excel import, guest access codes, messages, status, private guest notes and delivery reports.

**Work:** premium mobile cards and desktop table, intuitive high-volume search/filter, accessible import wizard and mapping, partial-error review, clear unsent/sent/failed status, consent-aware communication, action confirmations and transactional feedback. Preserve server counts, recipient permissions and real outbound constraints.

**Exit:** controlled staging import/edits/duplicates/pagination, accessible bulk workflows, no incorrect send status or unintended dispatch, data count matches backend.

#### Phase 18 — RSVP lifecycle, guest interaction and wishes/privacy
**Coverage:** invitee/general/personalized/private/password RSVP, plus-ones/guest count, questions, validation, deadlines, cancel/change, confirmation, owner RSVP board, wishes and privacy.

**Work:** exceptionally clear RSVP form and confirmations, event-specific messaging, single-action mobile flow, conflict/expiry recovery, accessible error states, owner insights and filters. The existing public-wishes feed is empty by intentional backend policy; new public display requires explicit privacy/moderation specification.

**Exit:** real staging public/guest-token/deadline/duplicate/denied/confirmed flows, correct counts and permission boundaries; no implied public wishes feature without backend policy.

#### Phase 19 — Floor plan, seating arrangement and guest assignment
**Coverage:** banquet tables/floor plan, table editing/placement, automatic arrangement, guest assignment, capacities, drag/zoom/pan, list fallback, exports and venue-specific rules where implemented.

**Work:** premium room-canvas visuals with accessible non-drag editing; labeled table list and assignment details on mobile, pointer/keyboard controls, conflict/capacity warnings, meaningful zoom/reset, autosave/state preservation.

**Exit:** persistent real guest/table assignments on phone/desktop, no inaccessible drag-only essential action, capacity integrity and print/export fidelity.

#### Phase 20 — Ticket design, QR, delivery, attendance and check-in
**Coverage:** invitation ticket designer, personalized ticket preview/export, QR identity/download/print, invitee delivery and tracking, staff check-in desk, scan results, duplicate/re-entry, offline/error handling where supported, attendance summaries.

**Work:** elegant print-safe visual design, truthful delivery/check-in statuses, camera permission and scan UX, simple manual lookup fallback, high-visibility verified/invalid indicators, mobile scanning layout and accessible attendance controls.

**Exit:** QR/ticket export rendered and scannable on test devices; controlled check-in denies invalid/duplicate tokens as policy requires; owner/role audit integrity preserved.

#### Phase 21 — Gifts, purchases, payments, contributions and transactional UX
**Coverage:** guest gifts/manual contribution capture, template purchase, plans/benefits/entitlements, ABA PayWay link/QR/external app switch, pending/failed/verified/review/cancel/expiry states, receipts/history and Telegram evidence processing.

**Work:** premium trust-oriented payment instructions, clear USD/KHR values, exact order reference, safe recovery from app switch, distinction between **owner-recorded gift** and **provider-verified payment**, meaningful pending/review state and honest refund/cancel messaging. Keep server-side verified amount/currency/order match, idempotency, settlement evidence and one-time entitlement updates. Never unlock from client-only payment screenshot or simple return page.

**Exit:** isolated MySQL/sandbox/mock-provider concurrency/replay/timeout/denial checks, distinct visible financial statuses and real client return tests; no live financial transaction required or represented as complete.

### WAVE IV — BUSINESS OPERATIONS, ADMIN AND CMS (PHASES 22–25)

#### Phase 22 — Budget, expenses, analytics, reporting and business insights
**Coverage:** owner budget/expenses, gifts/accounting, RSVP/attendance reporting, template sales/order analytics, charts, filters, date ranges, USD/KHR, pagination, exports and empty/denied states.

**Work:** compact premium charts and tables, faithful data visualization, responsive metrics, time/date/currency clarity, report drill-down, export/print design and useful error recovery. Never animate misleading or fabricated data. Source-backed aggregation and permissions required.

**Exit:** controlled database fixtures match shown counts, money, dates and exports; no currency mixing or stale figures masquerading as live.

#### Phase 23 — Team, organization, notifications, preferences, support and AI decision
**Coverage:** event team and roles, invitation acceptance/revoke, organization permissions, settings, profile, language/appearance, account notifications, help/support, access upgrades and optional AI writing assistance.

**Work:** role-aware permission clarity, coherent settings IA, confirmation patterns, notification preferences/states, helpful success/error empty views. AI UI may display existing local fallback honestly; a real provider requires separate consent/cost/rate-limit/API/privacy approval. No fabricated LLM output or unapproved new subscription gating.

**Exit:** real accepted/revoked collaborator checks, permission denial UX, notification behavior, stable settings under refresh; optional features explicitly approved or deferred.

#### Phase 24 — Full admin platform modernization
**Coverage:** admin login/dashboard, user detail/status/role, moderation, packages, subscriptions, payments, notifications, reports, exports, audit/system logs, API monitor and admin shell.

**Work:** sophisticated high-density desktop views and task-focused mobile alternatives, semantic status and danger colors, filtering/sorting/selection, guarded critical mutations, loading/error/permission handling, readable data tables, export flows and human-readable audit context. Maintain separate admin auth boundary and never expose privileged actions just because UI is present.

**Exit:** isolated admin CRUD/deny/logout/timeout/error regression across each active route; AU-005/006 corrected; no unsafe payment/user-role mutation regression.

#### Phase 25 — Admin Template Studio, content management and template publishing pipeline
**Coverage:** admin template create/edit, metadata and registry, availability/pricing/configuration, demo/preview, section/block editors, media, layout variants, version/publish state and licensed art; optional broader page CMS scope.

**Work:** world-class responsive template authoring with full mobile Edit/Preview, desktop split, accessible keyboard/pointer resizer and preview link, all editable sections and precise mode changes. Preserve immutable catalog identity, unknown block JSON, serialized fields, iframe origin/session protocol, unsaved edits, loading error retention and preview roundtrips. Make export/import/versioning only where backend capabilities genuinely exist. General marketing-page CMS is currently **missing** and cannot be declared complete without a separate approved data/publishing module.

**Exit:** create/edit/preview/reload/publish across available admin template flows with 320–1440 evidence; compare all five section controls; security roles and template fidelity remain correct.

### WAVE V — SYSTEM-WIDE QUALITY, TRUST AND RELEASE (PHASES 26–27)

#### Phase 26 — Cross-cutting accessibility, multilingual, responsive, security, performance and PWA/device validation
**Coverage:** *all* routes, states, components and template layouts already touched; production-like conditions, low bandwidth/CPU/memory, 200–400% zoom, screen readers, keyboard, in-app webviews, landscape, text spacing, light/dark and reduced motion.

**Work:** formally audit WCAG 2.2 AA (including applicable exceptions and manual checks), keyboard paths, labels, role/status, focus-not-obscured, target size, contrast, disabled/loading states, Khmer wrapping, safe-area, language and time semantics, RTL only if actually supported; optimize LCP/INP/CLS through fonts/images/chunks/caching/hydration rather than cosmetic animation. Security UX must never disclose privileged state; run contract reviews and dependencies/asset-license checks. Cross-phase checks began at Phase 01 and recur in every phase; this phase deepens and certifies them, not postpones basic quality.

**Targets:** field p75 Core Web Vitals LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 where field data exist; otherwise reproducible lab comparisons; no new critical contrast, keyboard, focus, form or clipping blocker. 44–48px is the preferred task-control comfort target, not an invented blanket WCAG AA rule.

**Exit:** precise PASS/FAIL/BLOCKED browser/device/a11y matrices, before/after metrics, no undocumented exceptions, real-client coverage and actionable unresolved list.

#### Phase 27 — Final complete regression, release readiness, handover and evidence package
**Coverage:** both frontend apps, backend critical journeys, MySQL/Flyway, provider mocks, Telegram worker, session/permission/payment/data contracts, Docker/Nginx/TLS/cache/origin, deployment/rollback and backup integrity.

**Work:** run lint/unit/component/integration/contract/E2E/visual/performance/security/secret/dependency tests; live disposable owner+guest+admin+payment simulations; verify MySQL fresh/upgrade/concurrency; smoke full route matrix; validate production config only in an authorized safe environment; review animation/asset licensing and accessibility; rehearse rollback and restoration; hand off documentation, design system, code owner map, acceptance ledger, unresolved limitations and user guidance.

**Exit:** approved release checklist; all blocking P0/P1 resolved or explicitly declined with authority; complete test accounting with no fake PASS from skipped tests; environment-dependent gates marked BLOCKED until actually run; reproducible evidence and rollback instructions.

## 5. Quality gate required at the end of **every** phase

Each phase must produce all of the following—not merely a beautiful screenshot:

1. **Inventory mapping:** impacted routes, role tasks, data states, component variants, template layouts, responsive modes and backend dependencies. Update a unique `SCOPE-ID` for each task; no silent omissions.
2. **Before evidence:** source revision, route/viewport, screenshot, relevant performance/accessibility finding, user flow and reason for change.
3. **Implementation evidence:** changed files and rationale, preserved contracts, UI library code/license provenance, migration/compatibility notes if relevant.
4. **After evidence:** screenshots at phone, tablet and desktop; normal/reduced motion; realistic Khmer/English content; light/dark if applicable; hover/touch/keyboard as applicable.
5. **Functional regression:** primary success and failure flows; real state and permission checks; persistence/refresh/return; failed network and duplicate action handling.
6. **Accessible behavior:** keyboard tab/focus, role/name/state, readable contrast, target and zoom, short viewport, notifications and errors; document manual unverified steps.
7. **Performance budget:** before/after route JS/CSS/media and targeted lab interactions; reject unjustified motion/3D regressions; no fabricated Lighthouse score.
8. **Test truthfulness:** exact commands, passed/failed/skipped, fixture versus live provider/database, device/browser/platform; preserve previous failure logs.
9. **Preservation review:** authorization/entitlement, template ID, draft JSON, API DTO, USD/KHR, role, security, media and original branding. No destructive schema/asset or legacy alias removal without proof.
10. **Handoff:** changelog, risks, QA evidence, release/rollback plan and next-phase dependency. No completed label without evidence.

### Minimum responsive and interaction matrix

- Widths: **320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440** CSS px, plus boundary-adjacent widths for changed breakpoints; not necessarily every combination for every change, but all critical page families must be covered.
- Height/zoom: short mobile landscape, safe area, virtual keyboard, text enlargement and 200/400% equivalent reflow.
- Input: mouse, touch, keyboard; screen reader for applicable workflows; no hover-only/drag-only essential control.
- Themes/language: management light/dark, English/Khmer and long localized content; invitation-specific visual themes protected.
- Browsers: Chromium, Firefox, WebKit as test engines; physical Android Chrome and iPhone Safari; actual Telegram/Facebook/Messenger/WhatsApp in-app clients when relevant. Emulation is not physical-device certification.
- States: default, hover, focus, pressed, active, disabled, loading, success, empty, error, offline, 401/403/409/429/503, denied/expired/pending, and realistic data extremes as applicable.

## 6. Full feature-family coverage ledger

| Family | Proposed primary phase(s) | Verification scope |
|---|---:|---|
| Marketing, landing, venue, contact, help, metadata | 06–07 | Public route and conversion path |
| Account, register/login/recovery, Google/Telegram, profile | 08, 23 | Provider return/session and accessibility |
| Marketplace, catalog/filter/demo, packages/price/checkout | 09–10, 21 | Entitlement and per-renderer identity |
| Event creation, wizard, save/intention/duplicate | 11 | Real persistence and back/retry |
| Dashboard, events/workspace, optional calendar | 12 | Truthful server-backed actions and dates |
| Guided/advanced editor, sections/styles, preview/save/publish | 13, 15 | Roundtrip and trusted preview |
| Media, crop/focal/gallery, audio/video | 14, 16 | Media constraints and device budgets |
| Public guest invitation, maps/calendar, opening/scene | 10, 16 | Per-template fidelity and app handoff |
| Guest groups/CRUD/import/delivery | 17 | Pagination, bulk errors, consent |
| RSVP/wishes/privacy | 18 | Token/deadline/duplicate/confirmation |
| Seating/banquet | 19 | Capacity, drag alternative, persistence |
| Tickets/QR/check-in/attendance | 20 | Print/scanning/duplicate/role |
| Gifts, template purchase, ABA/Telegram, receipts | 21 | Amount/currency/order/replay |
| Budget, expenses, finance and event reports | 22 | Report/export accuracy |
| Teams, org/roles, notifications/settings, optional AI | 23 | Auth and product-truth labels |
| Admin user/payment/packages/notifications/reports/logs | 24 | Role-safe mutation and management tables |
| Admin Template Studio and optional general CMS | 25 | Responsive/editing/serialization/content lifecycle |
| Global visual system, motion, layout, accessibility, performance, QA | 01–06, 26–27 | Every route, state and environment |

## 7. Phase dependencies, approvals and safeguards

- The Phase 01 current-head inventory is a precondition to claiming full scope. Foundational design-system and interaction contracts (02–06) precede broad visual migration.
- Phase 10 template data and rendering contracts inform Studio (13), guest visuals (16), and CMS (25); do not replace all renderer engines with a generic skin.
- Phase 11/13/15 publishing and state flows require live persistence verification before celebrating creator-to-guest UX (16–18).
- Financial UI (21–22, 24) must consume authoritative backend states. ABA/Telegram reconciliation and MySQL concurrency gates remain security blockers for any release that accepts money.
- Cross-cutting a11y/security/performance checks run **every phase**; Phase 26 is the final broad certification. Do not defer obvious blocker fixes to 26.
- Preserve project-specific knowledge in `.agents/ROUTER.md` and the audit. No repo-wide makeover branch without scoped review and reversible commits.
- New capability (general CMS, live AI provider, owner calendar, venue booking, refunds, cloud 3D renderer, marketing automation) requires a separate product story, API/data/privacy/security definition, cost/performance budget and explicit approval. Optional enhancement must not masquerade as an existing feature or delay critical parity.

## 8. Library strategy — inspiration does not mean installing everything

Use the ten libraries as a *reference library* for design language and appropriately licensed patterns: Animate UI, Badtz UI, Lightswind UI, Kokonut UI, Untitled UI, shadcn/ui, React Bits, Aceternity UI, Magic UI, Skiper UI. The repository's `docs/audits/phase01-2026-11-10/07-ui-library-evaluation.md` and `docs/design/THIRD_PARTY_UI_LICENSES.md` document known scope and redistribution constraints. Keep existing React 19/Tailwind 4/Vite 8/Framer Motion/Lucide stack as the starting point, not an excuse to install ten component libraries, multiple motion engines, new global CSS resets or WebGL everywhere. Log every adopted exact component, source revision, terms, adaptation, dependencies, test evidence and template-export rights.

## 9. Execution rules for Codex and the team

**Per-phase instruction:** Read current source, `.agents/ROUTER.md`, these phase requirements and the audit; reconcile actual HEAD first. Define every relevant route/state; baseline; implement *that whole phase*, not a single illustrative feature; preserve current domain rules; test; document; create reviewable commits/PRs only when authorized. Never push to main or deploy production by assumption. Work in a feature branch or worktree with safe review. Do not remove team-created designs, historical migrations, licensed media, template aliases or old JSON compatibility without evidence and approval.

**Definition of done for the whole program:** Every active source route and every meaningful task is mapped; each received an evidence-backed upgrade or explicit preservation verification. All authorized premium template families are visually coherent and functionally complete; user/guest/admin journeys operate on real supported devices; no critical a11y, responsive, security, privacy, payment or data-loss blocker remains; performance is measured and acceptable; release gates run successfully or are transparently documented as blocking. A collection of attractive screenshots alone **does not** satisfy completion.

## 10. Suggested final handover package

- `docs/uxui/MASTER_SCOPE.md` — this versioned scope and approval state.
- `docs/uxui/ROUTE_FEATURE_STATE_MATRIX.csv` — all actual current routes (including aliases) and variant coverage.
- `docs/uxui/DESIGN_SYSTEM.md` — tokens, typography, accessibility, components, responsive and motion contracts.
- `docs/uxui/TEMPLATE_ART_DIRECTION.md` — per-template style/scene/performance/rights and fallback policy.
- `docs/uxui/PHASE_XX_ACCEPTANCE.md` — checklists, changes, before/after images, tests and known limitations per phase.
- `docs/uxui/RELEASE_EVIDENCE.md` — production-readiness tests, devices/providers, MySQL migrations, performance, accessibility and rollback.

**Important:** All paths above are **proposed deliverable locations**. This document does not state that these files or corresponding work have already been created in the GitHub repository.

---

**Planning summary:** All 27 phases are mandatory *as review/coverage work* for the full UX/UI program. A feature-specific implementation can be correctly retained when evidence proves its UX, visual and functional quality is already sufficient; “full scope” does not authorize needless rewriting. Optional new business capabilities remain contingent on explicit requirements and backend validation.
