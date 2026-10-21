# Koupreng workspace design system

The workspace combines warm Cambodian invitation branding with clear event management. Refine existing components and their shared CSS; public invitation templates retain their own ceremonial typography and rendering engine.

## Tokens and ownership

`src/shared/styles/workspace-ui.css` owns the workspace roles. `HostShell.jsx` imports this stylesheet, so a direct visit to any host route receives the same tokens. They are scoped to `.dash-wrapper`, `.workspace-page` and `.workspace-dialog`, rather than the public template document.

| Role | Variable | Value |
|---|---|---|
| Canvas | `--ws-canvas` | `#FBF6EE` |
| Surface | `--ws-surface` | `#FFFFFF` |
| Inset surface | `--ws-surface-subtle` | `#F6F1E9` |
| Text | `--ws-ink` | `#1F2421` |
| Supporting text | `--ws-muted` | `#59615C` |
| Border | `--ws-border` | `#E6DCCB` |
| Strong border | `--ws-border-strong` | `#D5C5AD` |
| Brand/action | `--ws-gold` | `#926C34` |
| Gold hover/text | `--ws-gold-dark` | `#76572D` |
| Selected surface | `--ws-gold-light` | `#F5EFDF` |
| Focus/supporting accent | `--ws-teal` | `#0F766E` |

Success, warning and destructive states use existing `StatusBadge` variants and component styles. They combine words with color. The suggested `#967037` gold measured 4.497:1 against white, just below 4.5:1. Action gold is therefore `#926C34` (4.755:1); dark gold is 6.622:1 against white. Do not substitute pale decorative gold for actionable text.

## Type, spacing and surfaces

Use the existing local `--font-sans` stack: Noto Sans Khmer, Kantumruy Pro, DM Sans, then system fallbacks. Public ceremonial Moul/serif headings remain in the template renderer. Workspace page headings are 26-36 px, section headings 20-24 px, body/forms 15-16 px and supporting/navigation text 13-14 px. Khmer headings and body use approximately 1.7-1.8 line height, with wrapping and room for diacritics. Do not apply uppercase transformations to Khmer labels.

Use the existing 4/8/12/16/20/24/32/40/48/64 px spacing scale. Controls use 10-12 px radii, cards 16-20 px, and status pills a fully rounded edge. Prefer a border and restrained shadow. A preview device can use a stronger hardware shadow without applying that elevation to ordinary cards.

## Shared components

Reuse `.workspace-page`, `.workspace-section`, `.workspace-section-heading`, `.workspace-button`, `.workspace-notice` and `.workspace-badge`. Primary workspace buttons use gold; supporting actions use a white bordered surface. Aim for 44-48 px controls. Disabled and saving states reflect actual availability and server acknowledgements.

Continue using `Modal`, `ErrorState`, `SkeletonCard`, `SkeletonTable`, `ResponsiveTable` and `StatusBadge` from `shared/ui`. Modal manages background isolation, focus containment, Escape and focus restoration. Destructive wish removal now uses that same confirmation dialog. Lists retain their real mutation/service hooks.

## Account and event composition

Account pages use the existing host navigation and a centered 1320 px content contract. The event shell can use up to 1600 px to accommodate a 220 px navigation sidebar and a flexible module. The event header owns identity, publication status, date, venue and the explicit event selector. Route modules occupy one `.event-workspace-content` area; avoid another viewport-based outer width or fixed-header offset inside it.

Desktop navigation has five functional groups, a visible active state, and a compact collapsed option. All 17 supported module links are retained, including the assistant. Below 1100 px, the same navigation becomes a disclosure menu. Its trigger exposes expansion state; opening focuses the current module and Escape returns focus to the trigger. Event switching preserves a supported module in the URL and remounts its verified context.

## Invitation and ticket studios

The wedding studio has a focused shell with account navigation removed, a compact event header, grouped design/content/guest-experience sections, editor controls and the real template preview. At desktop widths, columns use 220 px navigation, flexible controls and preview space. Smaller screens use an edit/preview switch and a section selector. History/save states reflect the existing serialized writer; no presentation layer is allowed to claim a save before acknowledgement.

The live phone defaults to an iPhone 18 Pro Max frame with a Dynamic Island, status bar and home indicator. [Apple's specifications](https://support.apple.com/en-asia/148591) list a 1320 x 2868 display. This implementation chooses a 3x logical representation: 440 x 956. The decorative status/home regions leave a 440 x 860 invitation viewport. Hardware outline and chrome dimensions are visual approximations, not an Apple dimensional drawing or a Safari/iOS emulator.

Fit scales the entire frame to available space without changing the iframe's logical viewport. Manual zoom and the 1200 x 800 desktop view remain available. `ResizeObserver` updates fit after panel/fullscreen changes. The preview continues using the existing trusted iframe messaging and template engine.

Ticket controls share the same surfaces and language selection. Preview and export still use `ticketRenderer`; owner/guest tokens, server designs and 2x/3x export behavior are unchanged.

## Icons, motion, responsive and accessibility rules

New account/event/studio/overview actions use Lucide outline icons at 18-20 px; established legacy modules retain their existing icon dependency. Use semantic icons and accessible names, never emoji for management actions. Avoid gratuitous icon replacement inside public templates.

Workspace transitions use `--ws-motion: 160ms`; reduced-motion preferences disable workspace transitions and animations. Keep primary actions readable, active states identifiable beyond color and visible teal focus outlines. Native selects remain keyboard operable. The event overflow menu closes on Escape and restores focus. The host mobile menu also supports Escape and focus recovery.

At 320/375/390/430/768/1024/1440/1920 px, check both root geometry and actual essential controls. Guest/delivery data becomes readable mobile rows/cards, with row actions still reachable. Complex legacy tables may keep a named horizontal scroll region; this is distinct from whole-page overflow. Reserve bottom room for the support widget and verify dialogs with the on-screen keyboard on physical devices.

Automated browser and keyboard evidence is recorded in the QA report. This document does not assert assistive-technology certification or native Safari/device verification.


## Response and financial operations

RSVP uses the same workspace heading and surface roles, with a four-card summary that becomes two columns on phones. The native wishes button exposes its selected state. Below 700px each response is a labeled card with the guest, response, party size, date, wish and reachable edit/delete actions. Filtered empty results provide a clear-filter action. A saved mutation and a failed list refresh remain distinct states.

Budget and gifts use wrapping page headers and compact currency summaries. USD and KHR stay explicit; no implicit exchange or combined currency balance is introduced. Empty ledgers lead with guidance and one record-creation entry point. On narrow screens decorative summary icons yield room to names and amounts. Gift entry labels stack above controls, while existing records remain readable cards.

Use the shared `Modal` for expense and report editing/preview. It isolates background content, restores the opener, and skips descendants of hidden sections in its Tab loop. Keep save errors inside the dialog and retain input until the server confirms success. Search controls expose the searchbox role and a localized clear action where supplied. Shared empty states prefer workspace gold/cream tokens when within a workspace, preserving their existing defaults elsewhere.

Report preview uses the same dialog, with keyboard-accessible zoom/print/exit controls. Printed A4 output clears screen zoom and application navigation geometry. Currency totals and report calculations remain owned by the existing model and server contracts.
