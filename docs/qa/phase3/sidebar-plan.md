# Phase 3 sidebar and workspace plan

Baseline: clean `main` at `968f848cda4c45a6ddcb9bd188a1fbfdcae42811`.
The Phase 2 archive SHA-256 is
`811d9c1240ccc3ebea7e12b543b29157baa77820c0b213d787d16575fe3beeaa`.
Its seven requested reports, route inventory and representative responsive
screenshots were reviewed. The current merged guest workspace is newer than
those screenshots, so the before set is captured from the actual current build.

## Measured causes

At 1440×900 the host header occupies 112px; the full-width event header consumes
another 119px. The 220px navigation starts at y=282.55 and is 756.80px tall,
placing its bottom outside the viewport. All 17 destinations share one scrolling
container, with no pinned context/footer. `overflow-x:hidden` on the unbounded
parent also creates an `overflow-y:auto` ancestor for the sticky navigation.
Below 1100px the menu becomes an inline grid, moving task content down instead
of overlaying it. At 1920px separate 1440/1600/1180px container limits compete.
Sixteen focused baseline unit tests pass; all 22 baseline captures have no
uncaught page errors. Raw measurements and images are in the Phase 3 review folder.

## Implementation

1. Retain the verified event loader, user/event remount boundary, route inventory,
   backend services and dedicated Studio editor. Extract navigation presentation.
2. Keep Dashboard, Invitation Studio, Guests, RSVP and Delivery directly visible.
   Put all remaining existing destinations into labeled disclosure groups.
   Auto-reveal the active group and retain the host's UI preferences across routes.
3. Use a 276px expanded sidebar and 72px accessible icon rail. Default to expanded
   at ≥1440px, rail at 1024–1439px, and a modal drawer below 1024px. A bounded
   resize handle adds little value beyond these modes and will not be introduced.
4. Separate sidebar context, scrolling body and utility footer. Reuse the existing
   modal focus/inert/scroll-lock infrastructure for the drawer. Provide keyboard
   tooltips, focus outlines, Escape, backdrop dismissal and focus restoration.
5. Compact the account header only within the event shell. Remove the unbounded
   scroll ancestor and competing wide-page limits. Keep document scrolling for
   tasks, with only the sidebar destination body independently scrollable.
6. Keep Studio's focused layout; expose event navigation from its toolbar. Avoid
   duplicate switchers and preserve existing save/history/leave guards.
7. Refine the overview without inventing progress: retain persisted checklist
   logic, prioritize operational actions after publication, bound imagery and
   reduce redundant shortcuts. Leave account/public/invitation themes unchanged.
8. Verify unit tests, lint/build, all 18 navigation regressions, both languages,
   required widths/heights, zoom-equivalent CSS viewports, cross-route flows,
   performance and actual screenshot review. Package independent evidence and
   verify ZIP integrity/image decoding. Keep existing external release gates.

## Research applied

The application uses its existing Khmer Premium tokens and Lucide icons.
These sources inform behavior; their branding and exact layouts are not copied:

- [Atlassian navigation](https://support.atlassian.com/jira-software-cloud/docs/what-is-the-new-navigation-in-jira/): recoverable collapse and context separation.
- [Material adaptive navigation](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns): adapt navigation to available window space and prioritize actions.
- [Linear workspace concepts](https://linear.app/docs/conceptual-model): persistent scoped identity and workspace switching.
- [Notion sidebar](https://www.notion.com/help/navigate-with-the-sidebar): familiar collapsible sections and explicit sidebar controls.

These are adapted design decisions, not vendor certification. Physical-device,
Safari, real providers, MySQL migration certification and 31 environment-gated
backend tests remain release limitations. No push or deployment is authorized.
