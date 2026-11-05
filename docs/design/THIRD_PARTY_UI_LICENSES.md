# Third-party UI source and license ledger

Research date: **2026-11-04**. Scope: premium UI modernization beginning in the existing customer/admin applications. This ledger tracks source provenance separately from design inspiration. It does not replace the repository's dependency/license inventory or `ai-skills.lock.json`.

## Batch-one adoption record

| Local work | Source provenance | Copied code/assets | Added dependencies | License action |
| --- | --- | --- | --- | --- |
| Existing semantic tokens, admin shell/navigation/search, shared invitation audio control and its WithJoy/Bliss integrations | Original edits to existing Koupreng source; general interaction principles recorded in [the research matrix](TEN_LIBRARY_INTEGRATION_MATRIX.md) | None from the ten researched UI sources | None | No new third-party component notice required; preserve existing repository notices |

**There are currently no newly vendored components to attribute in this batch.** Do not label original work as a port, installation or integration of a third-party component. Existing dependencies retain their own upstream licenses; they were not relicensed by this research.

## License evidence reviewed

Each link points to official upstream evidence. `main`/`Master` links are mutable research references, not pinned import revisions. Any future source adoption needs a commit permalink and saved notices.

| Source | Observed license scope | Decision for this batch |
| --- | --- | --- |
| Animate UI | [MIT + Commons Clause](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md), copyright Elliot Sutton. Components themselves cannot be sold/redistributed in their original form. | Inspiration only; no original source embedded in invitation output |
| Badtz UI | [MIT plus additional restriction](https://github.com/badtzx0/badtz-ui/blob/main/LICENSE.md), copyright Badtz. Commercial redistribution/sale requires significant modification; minor changes do not suffice. | Inspiration only; no reliance on marketing claims of unrestricted use |
| Lightswind UI | [Repository MIT](https://github.com/codewithMUHILAN/Lightswind-UI-Library/blob/Master/LICENSE), copyright Muhilan, versus [site restrictions](https://lightswind.com/license) on builders, competing kits, templates and raw-source redistribution | No copied source; exact artifact/terms conflict must be resolved before adoption |
| Kokonut UI | [Free repository MIT](https://github.com/kokonut-labs/kokonutui/blob/main/LICENSE), copyright kokonutUI. [Now Playing](https://kokonutui.com/docs/cards/liquid-glass-card) is free; Audio Player Card is Pro. | Independent audio control improvements; no Pro card source |
| Untitled UI | [Free React repository MIT](https://github.com/untitleduico/react/blob/main/LICENSE), copyright Untitled UI. [Documentation](https://www.untitledui.com/react/docs/introduction) distinguishes free core from PRO examples. | Independent operational layout improvements; PRO excluded |
| shadcn/ui | [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md), copyright shadcn | Eligible for a future verified gap; no source copied this batch |
| React Bits | [MIT + Commons Clause](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md), copyright David Haz. Restrictions also cover component redistribution/ports, hosted copies of tools, and standalone exported packs. | No source/components/tool exports in commercial template output |
| Aceternity UI | [Custom license](https://ui.aceternity.com/licence): end-product permission, source redistribution restrictions, marketplace/theme/template restrictions; separate third-party items can carry their own terms | Original composition only; no copied marketplace/template source |
| Magic UI | [Free repository MIT](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md), copyright Magic UI; paid Pro assets are separate | Eligible after component review; reuse existing local counter first |
| Skiper UI | [Quick Start](https://skiper-ui.com/docs/quick-start) permits personal/commercial use and requires attribution for free usage; [general terms](https://skiper-ui.com/docs/terms-of-service) reserve content rights | No copied source; exact component permissions and visible attribution placement unresolved |

## Required record before copying any future component

Append one row per component with:

`Library | Component | Upstream commit permalink | License permalink | Free/Paid evidence | Local files | Modifications | Dependencies and their licenses | Required notice/attribution location | Builder/export exposure | Verification evidence`

Retain the full applicable copyright, permission and warranty notices with substantial MIT-derived source. Preserve every additional clause, component-level attribution and asset license. A paid version's terms cannot be inferred from a free repository. Modifying restricted code is not permission to discard its restrictions.

Builder reachability includes the editor, commercial template marketplace, template registry, preview renderer and public/generated invitation output. Keep restricted components out of all of these unless the exact applicable license permits the use. No paid source, premium downloads, credentials or license keys are introduced by this batch.

The research matrix records candidate concepts and technical risks. It does not grant legal clearance to copy a similarly named component from another registry or repository.

## Batch 6 — Vendored Components Ledger (2026-11-05)

| Library | Component | Upstream commit permalink | License permalink | Free/Paid evidence | Local files | Modifications | Dependencies and their licenses | Required notice/attribution location | Builder/export exposure | Verification evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| **shadcn/ui** | Accordion | [`shadcn-ui/ui@4a259c7`](https://github.com/shadcn-ui/ui/tree/4a259c79f91a566453716d16f8ef940e2cf6f7c6) | [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) | Official open registry | `apps/frontend-user/src/shared/ui/vendor/shadcn/Accordion.jsx`, `Accordion.css` | Adapted to React 19 JSX without external Radix primitives; integrated Koupreng gold theme and Chevron rotation animation | React 19, Lucide React (ISC) | Header notice in file | None (RUNTIME USED on `/pricing` SaaS marketing page only) | `Accordion.test.jsx` (3 passed), `PricingFeature.test.jsx` (15 passed) |
| **Untitled UI** | EmptyState | [`untitleduico/react@9c5bc54`](https://github.com/untitleduico/react/tree/9c5bc5462cfefb794f99723cfcaee0bba8123c5e) | [MIT License](https://github.com/untitleduico/react/blob/main/LICENSE) | Free React core repository | `apps/frontend-user/src/shared/ui/vendor/untitledui/EmptyState.jsx`, `EmptyState.css` | Styled with Koupreng tokens, responsive action slots, centered/left alignments | React 19, Lucide React (ISC) | Header notice in file | None (RUNTIME USED on `/templates` and `/venues` public catalogs only) | `EmptyState.test.jsx` (2 passed), `HomeFeature.test.jsx` (5 passed) |
| **Magic UI** | NumberTicker | [`magicuidesign/magicui@11a87e5`](https://github.com/magicuidesign/magicui/tree/11a87e5b2210bb218901ebad83f2dc4b3972a9ad) | [MIT License](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md) | Free open registry component | `apps/frontend-user/src/shared/ui/vendor/magicui/NumberTicker.jsx` | Adapted from TS to React 19 JSX; integrated `useInView`, `usePrefersReducedMotion`, and custom prefix/suffix | React 19, Framer Motion (MIT) | Header notice in file | None (RUNTIME USED on `/` homepage marketing metrics ribbon only) | `NumberTicker.test.jsx` (1 passed), `HomeFeature.test.jsx` (5 passed) |
| **Kokonut UI** | BentoCard | [`kokonut-labs/kokonutui@d4d8ef0`](https://github.com/kokonut-labs/kokonutui/tree/d4d8ef0b33c16f2c25ae9a2e6f48ea92c90ad7bf) | [MIT License](https://github.com/kokonut-labs/kokonutui/blob/main/LICENSE) | Free open repository component | `apps/frontend-user/src/shared/ui/vendor/kokonutui/BentoCard.jsx`, `BentoCard.css` | Adapted to Koupreng ivory & gold aesthetic, Kantumruy Pro typography, and icon/badge layout | React 19 | Header notice in file | None (RUNTIME USED on `/pricing` and `/` SaaS marketing pages only) | `BentoCard.test.jsx` (1 passed), `PricingFeature.test.jsx` (15 passed) |
| **Animate UI** | AnimatedTabs | [`imskyleen/animate-ui@6cf146a`](https://github.com/imskyleen/animate-ui/tree/6cf146ad98539ca6be8766100ef2a2ce1b1580e0) | [MIT + Commons Clause](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md) | Free public component registry | `apps/frontend-user/src/shared/ui/vendor/animateui/AnimatedTabs.jsx`, `AnimatedTabs.css` | Adapted to React 19 JSX and Koupreng gold indicator pill | React 19, Framer Motion (MIT) | Header notice in file; Commons Clause notice | Strictly SaaS marketing and host shell surfaces; isolated from builder export; UNUSED IN RUNTIME | `AnimatedTabs.test.jsx` (1 passed) |
| **React Bits** | FadeContent | [`DavidHDev/react-bits@df296e8`](https://github.com/DavidHDev/react-bits/tree/df296e83896570cbf0dcb7e30c459ca2a5789f2a) | [MIT + Commons Clause](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) | Free public component | `apps/frontend-user/src/shared/ui/vendor/reactbits/FadeContent.jsx` | Adapted from GSAP to Framer Motion + CSS for zero added bundle size and reduced-motion compliance | React 19, Framer Motion (MIT) | Header notice in file; Commons Clause notice | Strictly SaaS marketing surfaces; isolated from template output; RUNTIME USED on `/` | `FadeContent.test.jsx` (1 passed), `HomeFeature.test.jsx` (5 passed) |
| **Aceternity UI** | CardHoverEffect | [`Aceternity UI Registry`](https://ui.aceternity.com/components/card-hover-effect) | [Custom License](https://ui.aceternity.com/licence) | Free component catalogue | `apps/frontend-user/src/shared/ui/vendor/aceternity/CardHoverEffect.jsx`, `CardHoverEffect.css` | Adapted to React 19 JSX and Koupreng ivory/gold theme | React 19, Framer Motion (MIT) | Header notice in file; Aceternity custom license notice | Strictly SaaS marketing surfaces; isolated from template redistribution; UNUSED IN RUNTIME | `CardHoverEffect.test.jsx` (2 passed) |
