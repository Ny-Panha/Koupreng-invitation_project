# Design system adoption and library policy

**Current:** customer semantic tokens and shared Modal/FormField/feedback/skeleton/error boundary, separate admin CSS, renderer-owned invitation art, plus existing vendored adaptations listed in [`THIRD_PARTY_UI_LICENSES.md`](../../design/THIRD_PARTY_UI_LICENSES.md). **Target:** one semantic management role system across both apps, with deliberate template isolation. Phase 03 establishes tokens/type/state roles; Phase 04 consolidates primitives; Phases 10/16 preserve and verify renderer identity. A shared token does not authorize a universal invitation theme.

| Candidate | Specific possible gap and existing alternative | React 19/Vite 8/Tailwind 4 and cost gate | A11y/mobile and license/export decision |
|---|---|---|---|
| Animate UI | Studio tabs/drawer; current CSS/Framer Motion and existing `AnimatedTabs` adaptation | Extra animation patterns/peer dependencies must be measured; no new global runtime | Focus/reduced motion and small-screen controls; MIT + Commons Clause in ledger, isolated from builder/export pending exact terms. |
| Badtz UI | Expandable public template card; current catalog card | Likely animation/dependency cost vs simple in-house expansion | Hover cannot be sole action; ledger notes modification/redistribution restriction; inspiration only pending current component rights. |
| Lightswind UI | Wizard/upload/dashboard concepts; current wizard/shared fields | Potential GSAP/WebGL/utility conflicts; no adoption without bundle proof | Site/source terms conflict for builders/templates per ledger; no source copied. |
| Kokonut UI | Media/account cards; current media controls and `BentoCard` adaptation | Existing React JSX integration, no need to add Pro/player packages | Keyboard/audio consent; free MIT component scope differs from Pro; keep export boundary. |
| Untitled UI | Empty/table/form states; current `EmptyState` adaptation and shared forms | React Aria/helper/theme additions could duplicate primitives | Test focus/labels/long Khmer; free MIT vs Pro rights, no blanket import. |
| shadcn/ui | Combobox/sheet/accordion where current primitive has a proven gap; existing Accordion adaptation | Tailwind 4 styling and potential Radix dependencies must be measured per component | Existing Modal/focus manager retained; MIT core with notice, no assumption about third-party subcomponents. |
| React Bits | Renderer-specific reveal; current Framer Motion/CSS and FadeContent adaptation | OGL/GSAP bundles only if named effect needs them | Semantic static content, reduced motion and touch; MIT + Commons Clause limits redistribution of components/tool packs. |
| Aceternity UI | Marketing timeline/hover card; current CSS/card and unused adaptation | Framer Motion already available; avoid duplicated visual framework | Tap/keyboard and low-power; custom license restricts marketplace/template source reuse; no copied invitation export. |
| Magic UI | Verified metrics/notification accents; existing NumberTicker adaptation | Reuse current Motion; never animate a fabricated figure | Reduced motion and final value announcement; free MIT vs paid Pro separate. |
| Skiper UI | Optional carousel/context menu; current gallery/controls | Dependency/drag cost unknown until pinned version review | Keyboard alternative, touch, attribution and template rights unresolved per ledger; inspiration only. |

The “existing adaptation” entries are already in the repo and are not new Phase 02 installations. The license ledger documents seven pinned vendor adaptations; before any further adoption, record exact upstream commit and component license, free/paid provenance, dependency licenses, commercial use, export/builder exposure, required notices and measurable bundle/a11y impact. Mutable upstream terms must be rechecked at adoption. This phase installs **zero** dependencies and copies **zero** assets/components.

## Semantic adoption path

1. Phase 03 maps current customer/admin color, type, spacing, radius, focus and state variables to semantic roles; tests both light/dark management appearance. It leaves template CSS scoped.
2. Phase 04 standardizes button/link, field, feedback, dialog, tabs, tables and loading/empty/error states around existing components; each has keyboard/touch/Khmer variants. Do not add a second modal or feedback host.
3. Phase 05 adds motion tokens and reduced-motion behavior after interaction semantics are stable.
4. Phase 06 applies tokens and components to shells/nav, then domain phases adopt by task; Phases 10/16 review invitation-specific systems separately.

Acceptance for each adopted primitive: source/notice ledger entry, before/after bundle size, focus/name/role/value, 320px and short landscape geometry, long Khmer/English, reduced motion, error/disabled/loading, and regression against the existing component. No selection is made solely because a library is visually fashionable.
