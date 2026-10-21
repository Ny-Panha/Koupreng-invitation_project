# Koupreng visual and UX overhaul

## Scope and provenance

Work continues on `feature/premium-ux-overhaul`, based on local HEAD `585e9217`. That HEAD already includes the completed event-first workflows and studio/ticket commits. An unfinished redesign, screenshots, this report and the QA/design documents were present as uncommitted input. They were preserved and refined. No remote branch reset, push, merge or deployment is part of this work.

All five images in the supplied `BADUI.zip` were extracted into the ignored `.cache/ux-overhaul-references/BADUI` directory and visually inspected. They show the wedding studio, guests, delivery, QR and wishes. The existing historical 63-route audit and event-first/studio reports were read as historical evidence, not current test results. Fresh browser captures were taken before this continuation in `docs/qa/ux-overhaul/before/`.

## Problem inventory, causes and remediation

| Priority | Problem and root cause | Implemented result |
|---|---|---|
| P1 | Event modules occupied a flat horizontal row, then a large wrapping categorized block. Navigation pushed the actual work below the fold. | One grouped desktop sidebar, collapse control, mobile disclosure and one aligned module area. All supported routes remain accessible. |
| P1 | Shared workspace styles loaded only when creation/packages routes had been visited. Direct overview/QR/wishes visits inherited incomplete typography and controls. | The host shell now loads workspace tokens and common heading styles explicitly. Cold route visits have the same base design. |
| P1 | Event and module containers independently imposed viewport widths and padding. QR/wishes drifted left; editor controls competed with several navigation layers. | The event shell owns outer geometry. Wedding editing gets a focused shell and grouped studio controls. |
| P1 | Single events used the same small grid card as multi-event collections. Event/template labels and repeated actions were confusing. | Featured single-event composition, responsive multi-event grid, distinct template metadata and one management action bar. |
| P1 | Guests repeated the add action in the heading, toolbar and inline creation row. A mobile search field inherited `flex-basis: 220px` on a column axis, creating a large blank area. | One add action for each populated/empty state; dialog editing retained; mobile flex sizing corrected; row actions enlarged. |
| P1 | Overview displayed zero-value/unavailable cards and counted mere record existence as preparation. | Preparation comes from saved details, template, publication, guest aggregate and delivery aggregate. Next-step action is contextual. Activity metrics appear when applicable. |
| P1 | Overview refetched `listMine` even inside a GET-verified event context. An accessible event omitted from that collection could lose its overview. | Overview uses the already authorized current event and scoped aggregate requests. No alternate event is selected. |
| P1 | Studio preview was a generic 380 px frame with a fixed height and cropped device controls. | Requested iPhone 18 Pro Max visual frame, fixed logical screen, fit/manual zoom and preserved desktop/fullscreen/template rendering. |
| P2 | Delivery mixed dense metrics, unhelpful unpublished feedback and inconsistent language. A long Khmer CTA overflowed on phones. | Prepare/send/track composition, actual publishing route, localized readiness feedback and wrapping controls. Future stages start collapsed for a draft; publishing or recorded activity expands the relevant stage. External sends still use the existing service. |
| P2 | General invitation QR was described as suitable for personal check-in. Raw QR tokens were unnecessarily repeated as text. | Distinct general/personal purpose copy, backend PNG download/copy actions and no separate plaintext private token. |
| P2 | Wishes had a bare empty state, Khmer-only page metadata and immediate destructive removal. | Bilingual guidance and contextual invitation action, readable cards and a shared confirmation dialog before deletion. |
| P2 | Ticket controls mixed languages and preview/export actions lacked hierarchy. | Language-aware labels, grouped appearance controls, clear recipient/preview/export area and truthful unsaved-state guidance. |
| P2 | Focus recovery and reduced motion varied by route. | Shared focus styles/reduced-motion scope; Escape and focus restoration in module/overflow/mobile menus; existing modal isolation retained. |

## Page and navigation changes

The account shell, My Events, event overview, invitation studio, ticket designer, guests, delivery, QR and wishes receive direct changes. Event details, RSVP, gifts, budget, seating, check-in, reports, media and assistant inherit the same event identity, module navigation, alignment and heading contract. Their APIs and business rules remain in place.

Authentication, packages/history/checkout, profile, notifications, organizations, template browsing/demo/purchase, marketing, public invitations, personalized invitation/RSVP, payment return/status and legacy route families are included in the fresh route inventory. Previously coherent pages are reviewed and benefit from shared host styling where applicable; this is not a claim that each public template was independently redesigned. Compatibility redirects remain intact.

The source inventory is `app/routes/{hostRoutes,builderRoutes,authRoutes,marketingRoutes}.jsx`. The [rendered inventory](../qa/ux-overhaul/routes/measurements.json) covers 64 concrete cases in 256 renders: Khmer/English at 390/1440 px. It adds `/app/events/101/tickets/design` and retains compatibility aliases, local previews and negative-route probes; these are route cases, not 64 distinct supported product modules. Final core/module repairs are covered by the separate follow-up evidence in the QA report.

## Before and after evidence

| Surface | Before this continuation | Final rendered state |
|---|---|---|
| Events | [Desktop](../qa/ux-overhaul/before/my-events-km-1440.png) | [Desktop](../qa/ux-overhaul/after/my-events-km-1440.png) |
| Overview/navigation | [Desktop](../qa/ux-overhaul/before/event-workspace-km-1440.png) | [Desktop](../qa/ux-overhaul/after/event-workspace-km-1440.png) |
| Wedding studio | [Desktop](../qa/ux-overhaul/before/invitation-studio-km-1440.png) | [Desktop](../qa/ux-overhaul/after/invitation-studio-km-1440.png) |
| Tickets | [Desktop](../qa/ux-overhaul/before/ticket-designer-en-1440.png) | [Desktop](../qa/ux-overhaul/after/ticket-designer-en-1440.png) |
| Guests | [Mobile](../qa/ux-overhaul/before/guests-km-390.png) | [Mobile](../qa/ux-overhaul/after/guests-km-390.png) |
| Delivery | [Mobile](../qa/ux-overhaul/before/delivery-km-390.png) | [Mobile](../qa/ux-overhaul/after/delivery-km-390.png) |
| QR | [Desktop](../qa/ux-overhaul/before/qr-page-km-1440.png) | [Desktop](../qa/ux-overhaul/after/qr-page-km-1440.png) |
| Wishes | [Desktop](../qa/ux-overhaul/before/wishes-km-1440.png) | [Desktop](../qa/ux-overhaul/after/wishes-km-1440.png) |

These are real browser renders using declared browser contract responses, not live-user data. The supplied BADUI references show the older original state; the before folder shows the partially completed redesign inherited at the start of this continuation. The fixture QR is generated for a synthetic public URL and checked by decoding it. The real application retains the backend PNG/guest token contract.

## Engineering boundaries and remaining release work

No production backend logic, pricing, payment reconciliation, RBAC, event ownership, migration or invitation template renderer was changed. The template engine and trusted preview messaging remain in use. Publication, guest mutation and saving require service acknowledgements. Currency display retains separate USD/KHR amounts.

Release gates remain: disposable MySQL fresh/upgrade verification including V37-V39; environment-gated integration tests; configured ABA/Telegram/email/social providers; physical Safari/camera/native sharing and keyboard behavior; human Khmer copy/assistive-technology review; deferred collaboration features. The missing golden-template artwork was subsequently recovered exactly from local Git history; see the continuation below.

See the [design system](../design/koupreng-design-system.md) for tokens/component ownership and the [verification report](../qa/koupreng-visual-verification.md) for current results, reproduction instructions and known limitations.

## Major implementation files

Paths below are relative to `apps/frontend-user/` unless noted.

| Files | Purpose |
|---|---|
| `src/layouts/HostShell.{jsx,css}`, `components/HostNav.jsx` | Cold-load shared styles, focused studio offsets, consistent icons and mobile menu focus recovery. |
| `src/shared/styles/workspace-ui.css` | Shared palette, accessible action gold, focus, typography and reduced motion. |
| `src/features/events/workspace/EventWorkspace.{jsx,css}` | Verified event identity, grouped sidebar/disclosure, explicit switching and module width ownership. |
| `src/features/events/EventsFeature.{jsx,css}`, `components/EventCard.jsx` | Featured/grid states, distinct metadata, localized dates, readable sync feedback and keyboard overflow menu. |
| `src/features/dashboard/DashboardFeature.jsx`, `DashboardPage.css` | Contextual overview/checklist, applicable metrics, real checked-in aggregate and existing publication workflow. |
| `src/features/invitations/InvitationForm.jsx`, `studio/*`, `InvitationPlanEssentialEditor.css` | Focused sections, actual save feedback, language-aware appearance controls and mobile preview conflict repair. |
| `src/features/invitations/LivePhoneSimulator.{jsx,css}` | iPhone 18 Pro Max hardware presentation, fixed logical viewport and fit/zoom/desktop controls. |
| `src/features/tickets/{TicketDesigner,TicketActions}.jsx`, `tickets.css` | Consistent designer controls, recipient preview and export/share presentation without changing the renderer or API. |
| `src/features/guests/GuestsPage.{jsx,css}`, `components/Guest{Filters,Table}.jsx` | One add action, dialog editing, compact toolbar, corrected mobile flex basis and usable row actions. |
| `src/features/invitations/InvitationDeliveryManager.jsx`, `InvitationPages.css` | Publish-first preparation, progressive send/track disclosure and responsive delivery controls. |
| `src/features/qr/*`, `src/features/wishes/*` | Consistent page composition, truthful QR purpose, PNG download, contextual wishes guidance and deletion confirmation. |
| `src/shared/ui/ChatBot.{jsx,css}` | A closed workspace launcher in normal document flow, avoiding covered form/table actions. |
| `src/shared/utils/localDate.js` | Calendar-day presentation without a UTC date shift. |
| `tests/e2e/premium-workspace.spec.js`, `support/overhaulFixtures.js`, current studio tests | Behavioral, keyboard, geometry, privacy, viewport and export regressions using explicit test fixtures. |
| `eslint.config.js`, repository `scripts/qa/capture-ux-overhaul.mjs` | Ignore generated result traversal and reproduce route screenshots/measurements with provenance. |

No new runtime dependency was introduced. Existing lazy page/template loading remains intact. Performance reporting is limited to observed build size/time; native browser/provider performance was not inferred from fixture tests.


## Operations continuation — 21 October 2026

The working tree was clean at `6d1a0dbe` on the same feature branch. A new browser audit captured RSVP, gifts, budget and reports before editing. The active budget route uses `ExpensesList`, rather than the older, unused `BudgetPage`; changes target the active route.

| Finding | Root cause | Implemented correction |
|---|---|---|
| RSVP stayed bilingual in English mode; editing controls were English-only in Khmer mode. | Static strings across page/table/editor/wishes components. | Existing message dictionary extended with `rsvp` and `reports`; localized response statuses, filters, headings, actions and dates. |
| Response management required horizontal table scrolling on phones. | Desktop table composition at all widths. | Readable response cards at 700px and below; desktop table retained, native wishes toggle and 44px edit/delete controls. |
| Expense editor allowed focus outside its overlay; failed-save feedback appeared behind it. | Separate nonsemantic overlay, without shared focus isolation. | Shared dialog, localized close control, focus containment/recovery, busy-state protection and error feedback beside retained fields. |
| Print preview included hidden export buttons in its focus loop. | Shared dialog checked only a control's own display style. | Ancestor visibility/inert/disabled checks; regression tests cover forward/reverse Tab through visible controls. |
| A4 print output could retain screen zoom or empty application geometry. | Preview transformations and application containers participated in print layout. | Print-specific shell isolation and sizing; zoom cleared for output; desktop/mobile PDFs both contain two pages for the same fixture. |
| Budget/gift header actions squeezed Khmer headings into narrow columns. | Header child used zero flex basis beside an unsized action. | Content has an explicit wrapping basis; actions move below the heading on phones. |
| Mixed-currency summary cards clipped at 320px despite the original control check passing. | Fixed icon/text intrinsic widths expanded summary tracks. | Flexible tracks and compact summaries; decorative icons yield space at small widths. Geometry checks now include summary cards and strong text. |
| Gift entry showed `addItemBtn`; KHR expense controls displayed dollar-only labels. | Missing local keys and hardcoded currency suffixes. | Added real translated gift actions, localized Cash/currency/date labels; explicit selected currency remains authoritative. |
| Deleting the last event on a later page left the collection blank. | Pagination index outlived the reduced collection. | Clamp the displayed page to the available collection; navigate from the clamped index. |
| QR image failure printed a private QR payload as its fallback. | Payload used as placeholder text. | Human-readable unavailable state with actual reload; token-bearing links use a readable action label. Authorized URL/download behavior remains unchanged. |
| Ticket loading, leave warnings and media labels still mixed languages. | Incomplete state/localization coverage. | Localized loading skeleton/error recovery, leave confirmation and upload feedback. |
| Golden cover SVGs were missing although their catalog/CSS paths remained. | Original assets deleted in `2ee721af`. | Restore the two original SVGs byte-for-byte from `2ba8578f`; keep the current Canva renderer mapping. No replacement art or template rewrite. |

Comparable captures are in `operations-before/` and `operations-after/`. Populated records are covered separately in `operations-populated/` at all eight requested widths and both languages. They are synthetic browser DTOs, not live customer/provider evidence. See the [QA report](../qa/koupreng-visual-verification.md) and [engineering/design report](koupreng-premium-ux-final-report.md).
