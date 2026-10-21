# Koupreng premium UI/UX engineering and visual report

Local branch: `feature/premium-ux-overhaul` · 21 October 2026

## A. Executive summary

The implemented product now has a shared account/event foundation, explicit event identity, grouped navigation, useful event overviews, a focused invitation studio, an iPhone 18 Pro Max visual preview, and clearer guest/delivery/ticket workflows. The continuation improves RSVP and financial operations, dialog behavior, localization and narrow-phone layouts. Original golden-template artwork has been recovered without changing its registered renderer.

The work preserves existing services, routes, serialized invitation persistence, QR tokens, ownership checks, ticket rendering and backend-owned payment activation. There are no new libraries, backend changes, migrations, deployments, pushes or merges in this continuation.

Release approval still requires the real MySQL/provider/device checks in section L. Browser fixtures establish frontend behavior, not successful live payment or message delivery.

## B. Before and after

The original owner references in `BADUI.zip`, historical QA images and fresh renders informed the audit. The before directories show the actual local implementation at the start of each pass, which already contained some earlier redesign work.

| Screen | Before | After |
|---|---|---|
| Events | [Desktop](../qa/ux-overhaul/before/my-events-km-1440.png) | [Desktop](../qa/ux-overhaul/after/my-events-km-1440.png) |
| RSVP | [English desktop](../qa/ux-overhaul/operations-before/app-events-101-rsvp-en-1440.png) | [English desktop](../qa/ux-overhaul/operations-after/app-events-101-rsvp-en-1440.png) |
| Budget | [Khmer phone](../qa/ux-overhaul/operations-before/app-events-101-budget-km-390.png) | [Khmer phone](../qa/ux-overhaul/operations-after/app-events-101-budget-km-390.png) |
| Reports | [English desktop](../qa/ux-overhaul/operations-before/app-events-101-reports-en-1440.png) | [English desktop](../qa/ux-overhaul/operations-after/app-events-101-reports-en-1440.png) |

The operations comparison uses matching languages, viewports and fixture states. Additional populated-state evidence includes [320px RSVP](../qa/ux-overhaul/operations-populated/app-events-101-rsvp-km-320.png), [320px gifts](../qa/ux-overhaul/operations-populated/app-events-101-gifts-km-320.png) and [320px budget](../qa/ux-overhaul/operations-populated/app-events-101-budget-km-320.png). These are synthetic guest and financial records.

## C. Design system

[The design specification](../design/koupreng-design-system.md) defines the shared ownership and tokens. `workspace-ui.css` loads through `HostShell`, including on cold route visits. Cream canvas, white surfaces, deep ink, gold emphasis and supporting teal connect the management screens. Gold was adjusted to `#926c34` to maintain readable white button text; the earlier measured ratio is 4.755:1.

Shared headings, buttons, inputs, cards, status text, empty states and dialogs carry the hierarchy. Khmer headings have room for diacritics, and essential controls use readable text and touch-sized targets. Existing public invitation typography and artwork remain template-owned.

## D. Navigation and layouts

The account shell and event workspace have separate responsibilities. A verified event context owns event identity and the content geometry. Its desktop sidebar groups all 17 supported module links, supports collapse and marks the current route. The same navigation becomes a disclosure on mobile. Event switching is explicit and keeps a supported module in the URL.

The invitation editor hides the account header and condenses event context. Section navigation, editor and actual template preview share the available desktop width; phones use Edit/Preview modes. Legacy routes retain their redirects and authorization checks.

## E. Page changes

| Route / area | Result |
|---|---|
| `/app/events` | Featured single event, responsive multi-event cards, actual title versus template metadata, search/filter/sort and aligned actions. Pagination recovers after deleting the final item on a later page. |
| Event overview | Real preparation rules and contextual next step; applicable metrics, publication controls and actual server check-in aggregate. |
| Invitation studio | Focused shell, grouped supported sections, localized controls and truthful save states. The original template renderer and serialized autosave remain active. |
| Live preview | iPhone frame with Dynamic Island, status/home areas, fit/manual zoom and desktop/fullscreen options. Fixed logical viewport survives zoom. |
| Ticket designer | Shared visual hierarchy, recipient preview, preserved export renderer, localized loading/retry/upload/leave feedback and unsaved-state guidance. |
| Guests | One add entry point per populated/empty state, mobile rows/cards, larger actions, localized RSVP/ticket controls and preserved secure guest ticket/QR actions. |
| RSVP | Localized summary/filter/editor/wishes views, native wishes toggle, desktop table and phone cards, clear-filter recovery and retained failed edits. |
| Delivery | Prepare/send/track structure, actual publish route, contextual readiness and collapsed future stages for draft invitations. |
| QR | Aligned workspace, accurate general/personal purpose, backend PNG download, readable link action and safe missing-image recovery without printing a private payload. |
| Wishes | Contextual empty guidance, localized cards and explicit deletion confirmation. |
| Budget / gifts | Wrapping headers, no zero-stat wall on empty ledgers, separate currency summaries, narrow-phone repairs, localized categories/actions and shared expense dialog. |
| Reports | Language-aware report and attendance labels, preserved USD/KHR calculations, shared print-preview dialog and independent A4 print sizing. |
| Check-in / media | Existing functionality retained; the earlier follow-up repaired outer container geometry across eight widths. |
| Seating / settings / assistant | Supported routes retained within the shared event shell; existing feature-specific behavior remains. |
| Account / auth / templates / public | Included in the broad route audit and regression coverage; existing specialized flows remain. Payment pending/review states and neutral catalog identity are preserved. |

The route evidence covers concrete URL cases, aliases and negative probes, rather than claiming a fixed number of distinct product modules.

## F. Usability changes

A new event leads with preparation instead of a zero dashboard. Sending an unpublished invitation points to the real publishing workflow. Guests no longer compete with repeated add controls. RSVP filtering and response actions are usable directly on phones. Expense input stays visible after a failed save, and successful RSVP mutation versus failed refresh remains distinguishable.

No invented click-reduction metric is reported. The recorded browser workflows verify the actual navigation and selected event IDs.

## G. Motion and icons

New workspace/studio/overview/RSVP actions use semantic Lucide outlines. Existing legacy and template icon dependencies are retained where appropriate. Gold/teal states include readable text and focus outlines. Workspace motion uses the existing 160ms token and respects reduced motion; no animation dependency was added.

## H. Localization and accessibility

RSVP and report messages extend the existing dictionary. Budget categories translate their labels while retaining persisted API values. Gift actions, currency/Cash labels and dates follow the selected language. Ticket and QR feedback now cover additional non-happy states. User-entered guest names, wishes and vendor text remain unchanged.

Expense and report dialogs use the shared focus/isolation stack. Hidden descendants are excluded from Tab navigation; Escape and opener recovery are verified. Search fields expose the searchbox role. Narrow-phone summary cards and entry controls are checked in their containing cells as well as against the viewport.

This is not an accessibility certification. Human Khmer copy, screen-reader reading order, physical keyboard/zoom and native Safari review remain required.

## I. Performance and assets

No new runtime dependencies or heavy effects were introduced. Lazy route structure and the existing preview/export renderer remain. Actual build time and entry bundle size are recorded in the QA report; those figures do not establish a Core Web Vitals improvement.

`cover-bg.svg` and `cover-preview.svg` were restored from commit `2ba8578f`, after confirming their deletion in `2ee721af` and the retained catalog/CSS references. Git blob hashes match the originals (`0d40260dc301ee543860376992f75d5abb7779a3` and `bb414e23be34bd5f987acc1875dfe0b2c3cb9b01`). The retained [asset license notes](../frontend/user/template-asset-licenses.md) identify them as original repository artwork. The current golden route intentionally retains its Canva renderer mapping.

## J. Verification

The full frontend suite passed **546 tests in 101 files**. The main focused browser run passed **48 desktop/mobile checks**; the later critical-route run passed **12**, and retained-workflow runs passed **14**. These suites overlap. The final dialog correction additionally passed **10 targeted component tests and 2 focused browser checks**. Lint and the production build passed. The populated visual matrix has **64 renders**, covering four modules, both languages and all eight requested widths, with no clipped checked elements or uncaught errors.

See [current commands, counts and limitations](../qa/koupreng-visual-verification.md). Tests include the complete frontend unit suite and targeted desktop/mobile browser suites for operations, isolation, payment pending states, iPhone fit/zoom, autosave, ticket export and public rendering. Historical backend/worker results are distinguished from this frontend-only continuation.

Before/after screenshots, populated width measurements, retained workflow images and fixture report PDFs are committed alongside the audit. Expected-failure browser cases deliberately return synthetic 503 responses to verify recovery. These are not live HTTP/provider checks.

## K. Major file groups

- `layouts/HostShell*`, `layouts/components/HostNav.jsx`, `shared/styles/workspace-ui.css`: common brand/layout ownership and keyboard navigation.
- `features/events/*`, `features/dashboard/*`: event presentation, identity, preparation and pagination.
- `features/invitations/studio/*`, `LivePhoneSimulator*`: focused editing and live device viewport.
- `features/guests/*`, `features/rsvp/*`: guest and response actions, mobile presentation and language-aware feedback.
- `features/expenses/*`, `features/gifts/*`, `features/reports/*`: active financial modules, dialogs, currency presentation and A4 output.
- `features/qr/*`, `features/wishes/*`, `features/tickets/*`: safe utility states, confirmation and consistent preview/export controls.
- `shared/ui/{Modal,SearchInput,EmptyState}*`, `shared/i18n/*`: reusable focus, search, state and translation rules.
- `tests/e2e/*`, `scripts/qa/capture-ux-overhaul.mjs`, `docs/qa/ux-overhaul/*`: reproducible synthetic browser evidence.

## L. Remaining release work

| Priority | Required verification |
|---|---|
| P1 | Disposable MySQL fresh/upgrade migration execution, including applicable V37–V39, and the 31 environment-gated backend checks. |
| P1 | Real ABA/Telegram trusted-alert reconciliation and configured email/social provider checks. A browser return never confirms payment. |
| P1 | Physical camera scanning, native sharing and Safari/iOS behavior on an actual phone. |
| P2 | Human Khmer copy and assistive-technology review; the current automated evidence does not replace these. |
| Deferred product scope | Collaboration functionality remains deferred by the earlier implementation scope. |

The earlier missing golden artwork issue is resolved. Other release gates remain open; fixture passes do not close them.

## M. Manual review

1. Run the existing backend and frontend locally against a disposable development environment; do not use production data for test mutations.
2. Sign in, open My Events, create or choose a draft and verify the event title/ID in the workspace. Switch events and return to the collection.
3. Open the invitation studio, change a field, wait for server-confirmed saving, refresh and verify persistence. Switch to the iPhone preview, adjust fit/zoom and use the mobile Preview tab.
4. Add/edit a guest, review its personalized ticket and QR, then test RSVP filtering and editing. Confirm cancellation before deleting a response or wish.
5. Record a USD and a KHR expense/gift. Verify separated summaries, installment totals and retained fields on a simulated network failure in development.
6. Open Reports, use keyboard navigation in print preview, change zoom and save the A4 output. Screen zoom must not scale the printed report.
7. Check unpublished Delivery guidance, QR reload/download/link behavior and pending payment recovery. Finish physical camera, native share and provider checks separately.

The iPhone frame is a visual simulator with a chosen 440×956 logical screen and a 440×860 invitation viewport. It is not a native iOS/Safari emulator.
