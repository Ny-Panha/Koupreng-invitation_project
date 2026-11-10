# Responsive design-system proposal — not implemented

Refine `apps/frontend-user/src/shared/styles/semantic-tokens.css` and its existing sync flow. Reuse `workspace-ui.css`, `app-experience.css`, admin styles and `scripts/sync-design-tokens.cjs`. Do not create a competing global theme or replace invitation recipes.

## Proposed contract

| Layer | Existing foundation to keep | Bounded refinement |
|---|---|---|
| Brand/surfaces | Cream `#fbf6ee`, white, forest `#2e433a`, ink `#1f2421`, gold action `#926c34` | Use semantic text/status roles to fix AU-004–006; measure each actual light/dark surface |
| English body | Locally hosted DM Sans | 16px default forms/body; 14px secondary copy where readable; avoid 11px essential instructions |
| Khmer body | Kantumruy Pro; Battambang font files already present | Generous unitless line-height around 1.75–1.9; test diacritics, wrapping and long names; choose per current surface before adding weights |
| Display | Existing template-owned Moul/serif/calligraphy choices | Display-only usage; keep native script coverage and licensed assets; do not use Latin wedding font results for Khmer forms |
| Spacing | 4/8/12/16/24/32/48px semantic scale | 16px narrow gutters, compact grouped fields, 24px panel spacing when room permits |
| Shape | 12px controls, 20px panels, existing shadow levels | Preserve existing variants rather than restyling every feature |
| Controls | `--ui-control-min-height:44px` | 44–48px primary touch targets, clear focus, disabled/loading/error/empty/success states with text; AA target-size exceptions assessed separately |
| Motion | Existing 160/200ms feedback/overlay durations and reduced-motion override | Animate opacity/transform sparingly; stationary interactive hit areas; no input blocked by ceremonial motion |
| Themes | Existing appearance provider and independent invitation themes | Test semantic text/surface combinations in both management modes; do not recolor a published invitation when owner theme changes |

No new font, color mode or universal page layout is required by the audit. Existing brand choices remain the baseline; contrast fixes must be demonstrated on actual rendered elements.

## Responsive behavior contract

Use content-driven stacking, with existing breakpoints consolidated only where behavior is equivalent. Proposed testing bands: 320–599 single-column phone; 600–767 intermediate; 768–1023 tablet; ≥1024 desktop layouts when both panes actually fit. These are planning bands, not permission to blindly change every 768/1024 rule. Probe 599/600/601, 767/768/769, 1023/1024/1025 around the affected components in implementation.

- Single-column forms on phones; full-width or compact toolbars with labeled overflow. Input labels/errors remain associated and in reading order.
- Shared dialogs already use dynamic viewport bounds and safe-area insets. Reuse these contracts; test virtual keyboard and 390px short-height cases on devices.
- Admin Studio switches Edit/Preview before their minimum combined widths cease fitting. Keep one authoritative form state, unsaved-change guard and trusted preview handshake. Desktop retains a resizable split; keyboard/simple-tap alternatives accompany dragging.
- Tables preserve real semantics. Use the existing guest mobile-card composition for row tasks; horizontally scroll genuinely two-dimensional data with clear affordance, while keeping names/actions reachable. Do not turn every table into arbitrary stacked divs.
- Sticky actions must reserve content space and respect safe-area bottom; focus/validation cannot land behind them. Native scrolling remains the default; no smooth-scroll engine is proposed.
- Detect clipped essential descendants and hit-test primary actions. `scrollWidth <= innerWidth` is necessary in many screens but does not catch AU-001.

## Shared component evolution

| Component family | Exact existing area | Phase 02 acceptance |
|---|---|---|
| Buttons/status | `shared/ui/LoadingButton`, `StatusBadge`, workspace buttons | Same naming/state semantics across affected admin/guest surfaces; tokens tested on actual backgrounds |
| Fields/inputs/selects | `shared/ui/FormField`, date/time controls, native fields | Labels, input mode, errors, required/invalid descriptions; preserve keyboard and native picker behavior |
| Dialogs/drawers | `shared/ui/Modal`, admin package modal, owner preview | Focus/scroll return, inert background, Escape, short-height reflow; no state loss on responsive mode switch |
| Navigation | `layouts/components/HostNav`, admin Studio tabs | Visible/tappable current task; accessible names survive hidden labels; no hover-only essential action |
| Tables/cards | `ResponsiveTable`, guest cards, admin table wrappers | Useful row actions on narrow screens, accessible column/field labels, intentional contained overflow |
| Media | `InvitationMediaManager`, `mediaLibraryModel`, editor upload controls | Keep type/size policy/progress/retry; expose unsupported-format guidance; no schema/storage change |
| Feedback | `shared/feedback`, skeletons, toast/loading/error UI | Distinct loading/success/error/empty and retry behavior without changing entitlement decisions |

Color and typography work belongs in shared roles only when it fixes a shared cause. AU-001 is a targeted admin layout repair; it does not justify merging the two Studio implementations or rewriting 4,371 lines of template-editor behavior.
