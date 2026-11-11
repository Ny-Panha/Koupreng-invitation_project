# Phase 03 execution handoff — canonical visual system

> **Future implementation prompt.** Phase 03 has **not begun** in this Phase 02 package. Execute only when the owner sends the Phase 03 task. This handoff covers the entire management visual foundation in both React apps, while protecting all invitation renderers and existing behaviors.

## Mission and source baseline

Build one canonical semantic visual system for public, account, owner and admin management experiences: color, typography, spacing, radii, elevation, borders, icon scale, focus, control states, responsive rhythm and light/dark appearance. Preserve existing component APIs where possible. Template-owned art and CSS remain independent. Work on current `main`; recheck HEAD, clean/dirty status and remote before any edit. Re-run the source inventories rather than assuming 135/62/10/38 remain current.

Read `AGENTS.md`, `.agents/ROUTER.md`, `.agents/SKILLS_INDEX.md` and select one primary and at most two supporting skills. Read this package's [IA](03-complete-information-architecture.md), [art direction](07-premium-brand-and-art-direction.md), [renderer ledger](08-template-experience-tiers.md), [accessibility/responsive spec](10-responsive-a11y-and-khmer-english-spec.md), [dependency map](13-full-product-improvement-dependency-map.md), [QA triage](11-qa-new-01-to-03-triage.md) and [preservation decisions](15-decisions-approvals-and-preservation.md). Reconcile with the current repository; Phase 01 remains **PARTIALLY COMPLETE**.

## Inspect before editing

- Customer: `apps/frontend-user/src/shared/styles/semantic-tokens.css`, `apps/frontend-user/src/assets/fonts/fonts.css`, `apps/frontend-user/src/shared/fonts/core-fonts.css`, app/root styles and `layouts/{Marketing,Auth,Host}Shell`.
- Admin: `apps/frontend-admin/src/styles/index.css`, `apps/frontend-admin/src/layouts/AdminLayout` and `features/templates/TemplateStudio.css`.
- Shared: existing `Modal`, `FormField`, `ToastContainer`, route loading/error boundaries and any vendor adaptations in `apps/frontend-user/src/shared/ui/vendor/`; inspect actual imports and tests before consolidation.
- Invitations: `apps/frontend-user/src/features/templates/registry/templateRegistry.js`, `experience/TemplateExperience.jsx` and all ten dedicated layout style boundaries. Capture current representative visuals before token changes.
- Manifests and license ledger: both `package.json` files and `docs/design/THIRD_PARTY_UI_LICENSES.md`.

## Required deliverables

1. Inventory all current token declarations/usages in both management apps; distinguish intentional renderer-owned values. Document current computed light/dark pairings and any contrast/Khmer type issues with screenshots and accessible evidence.
2. Define semantic token layers: foundations → role tokens (surface, text, action, border, focus, status) → component mappings. Include light/dark values, hover/focus/disabled/busy/error/success, spacing, radii, elevation, icon sizes and type scales. Keep the current cream/ink/forest/gold palette as a baseline, with measured contrast; gold cannot become low-contrast body text.
3. Implement the smallest shared or mirrored source arrangement practical for Vite's two apps. Avoid competing root resets or a dependency that only duplicates CSS. Preserve existing JSX/component APIs and current DOM semantics unless a focused behavior fix is separately justified.
4. Define Khmer body and display type with verified local font availability/licensing, fallback, line-height and wrap. Support English without applying Latin-only decorative fonts to Khmer text. Record numerals/date/currency styles as semantic roles, not baked copy.
5. Apply tokens to representative public, account, owner, admin and Studio management states: default, loading, empty, validation, denied, dark mode, focus, mobile and desktop. Document intentional exceptions. Keep all ten invitation families and shared/fallback renderer artwork unchanged except explicit scoped compatibility fixes with before/after proof.
6. Produce a token reference and adoption map for Phase 04 components and later Phases 06–25. Include migration guidance for any old variable names and exact rollback steps. Update source docs/tests only to reflect implemented behavior.

## Acceptance and quality gates

| Gate | Required evidence |
|---|---|
| Source/route preservation | Both route factory tests pass; all current aliases, guards and admin/editor routes remain intact. No backend/Flyway/payment/auth changes. |
| Semantic coverage | Every management shell and shared primitive maps to named role tokens or a documented exception; no duplicate global theme/reset. |
| Contrast and focus | Actual computed light/dark foreground/background and focus states checked against WCAG 2.2 AA criteria; keyboard focus visible/not obscured. Automated axe supplemented by manual checks. |
| Khmer/English | Long Khmer titles/names and mixed-script content tested with available fonts, fallback, text-spacing and 320px/200% zoom; no clipped diacritics. |
| Responsive | Screens at 320/360/390/430/600/768/820/1024/1440/1920 and breakpoint-adjacent widths as relevant, plus short landscape. Use descendant geometry/hit testing, not `scrollWidth` alone. |
| Renderer isolation | Ten dedicated families, 38 aliases, two shared IDs and fallback receive representative before/after checks so platform tokens do not recolor or reflow their published art. Dynamic catalog remains a separate API gate. |
| Performance | Compare before/after CSS/JS bundle and controlled lab LCP/CLS on representative shells; no claim of field INP from fixture observations. |
| Tests and reports | Targeted unit/route/browser tests with exact commands/counts/failures, screenshots in ignored output, written limitations, source SHA and changed-file ledger. Do not turn QA-NEW-01/02/03 red tests green by weakening them; separately scope copy/behavior test maintenance after language review. |

**Compatibility constraints:** leave server authority for price/entitlement/PAID, RSVP/privacy, editor JSON and trusted preview messaging unchanged. Preserve historical Flyway migrations. Do not initialize shadcn wholesale, install ten libraries, add Three.js, rebuild public invitations, change auth guards or implement Phases 04–27. Any visual reference/asset needs source/license/credit and export-right review. No deployment is implied by Phase 03 completion.

## Handoff output format

Return branch/HEAD/dirty status, exact token and source files changed, before/after screenshots with viewport/locale/motion, route/renderer preservation counts, tests with PASS/FAIL/SKIP/BLOCKED, remaining contrast/device/copy risks, and Phase 04 adoption notes. If a required device/provider/data gate is unavailable, mark it BLOCKED rather than inventing a PASS. Follow the user's current Git instructions for the implementation session; this document alone is not authority for future production actions.
