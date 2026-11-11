# Phase 03 — canonical visual foundations

**Status: PARTIALLY COMPLETE.** Source baseline `main` at `c4af9e822f071fcdcbe036d8bcbf1b6eeff6c0ed`. The shared management token source, admin mirror, shell adoption, local admin management font, light/dark mapping and selected browser QA are implemented. Physical device, native Khmer copy/diacritic review, dynamic backend catalog and complete interaction/state certification remain open. This is Phase 03 foundation coverage, not a release certificate for all routes.

The existing source inventory remains **111 user + 24 admin = 135 leaf routes**, **62 feature groups**, **10 dedicated renderer families / 38 static aliases**, two shared identifiers and one fallback. Route tests passed. Browser fixtures exercised 11 management groups plus 12 representative renderer identifiers; they do not certify every route or live data state.

## Shipped foundation

- Edit `apps/frontend-user/src/shared/styles/semantic-tokens.css`; run `node scripts/sync-design-tokens.cjs`; the generated admin copy is `apps/frontend-admin/src/styles/application-tokens.css`. `--check` detects drift.
- `--ui-theme-*` roles own management colors in both apps. Existing `--ui-*` values remain as compatibility values. Customer `--app-*` and admin Tailwind aliases resolve to the new roles. Invitation renderer palettes remain separate.
- Marketing, auth, owner workspace, admin shell and Template Studio chrome use the roles. Admin management text uses locally bundled DM Sans, Kantumruy Pro and Moul; the Studio font picker still requests its existing broad remote font catalog.
- Before and after: 52 read-only Chromium captures each at 390/1440px and selected dark modes. The capture manifest, image comparison and reproducible scripts are in [evidence](evidence/). Full screenshots/builds are in ignored `output/playwright/uxui-phase03-2026-11-11/` on this workstation.

## Verification snapshot

`node scripts/sync-design-tokens.cjs --check` PASS; focused tests 4 user + 8 admin PASS; full tests 1,487 user + 195 admin PASS; both ESLint runs PASS; both isolated Vite builds PASS; 52 after captures with no page exceptions; 95 route-width probes with no document overflow; five selected axe scans with zero violations. Happy DOM emitted blocked remote iframe/font and local API messages during passing unit suites. Exact commands and limits are in [11](11-automated-testing-and-exact-commands.md).

## Reference index

1. [Source baseline and inventory](01-source-baseline-and-token-inventory.md)
2. [Canonical visual language](02-canonical-visual-language.md)
3. [Semantic token reference](03-semantic-token-reference.md)
4. [Typography and font loading](04-khmer-latin-typography-font-loading.md)
5. [Themes and cascade](05-themes-dark-mode-and-css-cascade.md)
6. [Responsive contracts](06-responsive-spacing-and-layout-contracts.md)
7. [Surface adoption](07-real-surface-adoption-matrix.md)
8. [Accessibility and visual QA](08-accessibility-contrast-and-visual-qa.md)
9. [Renderer preservation](09-renderer-isolation-and-preservation.md)
10. [Performance and payload](10-performance-payload-and-font-results.md)
11. [Exact test commands](11-automated-testing-and-exact-commands.md)
12. [Changed files and rollback](12-files-changed-migrations-and-rollback.md)
13. [Phase 04 handoff](13-phase04-component-adoption-plan.md)
14. [Open gates](14-open-gates-decisions-and-limitations.md)
15. [Evidence index](15-before-after-evidence-index.md)
