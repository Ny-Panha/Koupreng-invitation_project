# UX, accessibility and UI/UX Pro Max analysis

## Skill work actually performed

Read `.agents/skills/ui-ux-pro-max/SKILL.md`, used its local Python search tool, and kept proposals under this audit's evidence directory. The current product design system was not overwritten. Raw searches include:

| Query / mode | Verified output and judgment |
|---|---|
| `wedding invitation mobile SaaS --design-system` | Hero/social proof/CTA, Soft UI Evolution, pink/gold, Great Vibes + Cormorant Infant. Useful restrained depth/feedback recommendations; reject generic pink reskin and Latin-only typography for management UI. |
| `event dashboard mobile --design-system` | Separate management proposal retained in `ux-dashboard.md`; evaluate against existing event workspace, not as a new mandatory stylesheet. |
| `mobile form validation --domain ux` | Submission feedback, associated labels, blur validation, appropriate mobile keyboards. Existing FormField and creation form already implement parts of this; do not rebuild them automatically. |
| `dragging movements --domain ux` | Simple pointer alternatives and keyboard operation; directly relevant to AU-003 and future floor-plan/crop verification. |
| `responsive layout reflow --domain ux` | Operable chip overflow/disclosure and content-driven text reflow; relevant to crowded Studio tabs. |
| `reduced motion --domain ux` | Search output in `ux-motion.txt`; apply explicit no-motion paths and avoid essential actions depending on animation completion. |
| `keyboard focus modal --domain ux` | Raw output in `ux-focus.txt`; compare against existing modal focus containment/restoration and nested preview handling. |
| `premium marketplace --domain product` | Luxury/glass/3D suggestions. Reject broad blur/WebGL treatment for mobile task screens; preserve information hierarchy and clear prices/ownership. |
| `wedding --domain color` | Raw palette proposal in `ux-colors.txt`; colors are proposals, not measurements or approval to replace tokens. |
| `dashboard editor state --stack react` | Zero matches. `usestate derived state` retry returned three guidelines, including deriving values rather than duplicating state and lazy initialization. The dataset tags React 19.2.x; review against actual 19.3.1 code before applying. No fabricated result from the failed query. |
| `Khmer wedding readability --domain typography` | Returned Latin Wedding/Romance pairing, unsuitable for Khmer coverage. Narrow `Khmer` retry returned zero matches. Khmer font choices below come from actual licensed repository fonts and design judgment, not a skill database match. |

Skill recommendations are advisory. The proposed design system keeps the current coherent gold/cream/forest management palette, DM Sans/Kantumruy Pro, and independent invitation recipes. The skill's generic wedding landing structure does not justify removing existing team artwork or imposing a carousel.

## Heuristic assessment

Use the ten heuristics as a review framework, not a numerical usability score. The findings below relate observed behavior to the framework. [Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)

| Heuristic | Observed evidence / implication | Action |
|---|---|---|
| System status | Pending purchase remains pending after review; editor announces save state; upload progress exists | KEEP; test live failure/return timing |
| Real-world match | Event types, Khmer ceremony wording and currency labels are domain-specific | KEEP; clarify manual gifts versus verified receipts |
| User control | Preview returns focus/scroll without losing edits; keyboard Escape tested | KEEP; apply reachable panel switching to admin AU-001 |
| Consistency | Shared tokens/modal/form primitives exist, while admin Studio duplicates responsive layout behavior | IMPROVE admin adoption of shared interaction contracts |
| Error prevention | Server-owned entitlements, duplicate-submit guard/request identity, immutable template code | KEEP; retain exact payloads during styling |
| Recognition | Event modules and guided content steps reduce recall; five compressed admin tabs are difficult to scan | Fix AU-001 labels/layout |
| Efficiency | Search/filter/sort, contextual guest actions and touch panel switches work | KEEP; repair test selectors instead of removing controls |
| Minimal presentation | Owner screens are restrained; admin Studio packs multiple control tiers into a narrow area | Progressive disclosure, not a wholesale reskin |
| Error recovery | Synthetic 401/409/503/offline editor cases retain edits; load-failure retry blocks overwrite | KEEP; verify real backend/session recovery |
| Help | Media format limits and public unavailable states exist; unsupported HEIC/native handoffs need device-oriented guidance | Add contextual guidance in feature phases |

Additional design reasoning: predictable tabs/buttons follow familiar web conventions (Jakob's Law); stationary 44–48px primary actions reduce targeting difficulty (Fitts's Law); group related choices and disclose advanced settings to reduce choice load (Hick's Law); use proximity and common surface treatment for field/error/action groups (Gestalt). These are recommendations, not independently measured user-study results. A moving ceremonial CTA may remain tappable yet still deserves a stable hit area and explicit reduced-motion path.

## WCAG 2.2 AA target and actual evidence

- AU-002 lacks a link name on mobile; AU-003 lacks keyboard resize operation; AU-004–006 fail measured contrast. Full page/body zoom is not certified by zero overflow.
- Shared Modal isolates background with inert, traps focus (including same-origin iframe transitions), dismisses with Escape, and restores focus. Retain its behavior; focus/scroll preservation has executed browser evidence.
- FormField associates native control IDs and descriptions, marks invalid state, and announces errors. Composite controls require individual accessible-name checks; the component does not automatically label arbitrary nested widgets.
- Phone control comfort target is 44–48 CSS pixels. WCAG 2.2 AA target size is **24×24 CSS pixels with exceptions**, including sufficient spacing; a sub-44 result alone is not an AA failure. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Author-controlled dragging needs an equivalent simple pointer action unless an exception applies, and keyboard accessibility remains separately necessary. [W3C dragging guidance](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- Reflow requires availability of content/function at 320 CSS pixels, with exceptions for content requiring two dimensions. Hiding the rest of an editor behind overflow does not establish conformance. [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

Automated axe scans cover selected states. They do not establish screen-reader quality, accessible authentication for every provider, focus not obscured by a physical keyboard, or complete WCAG compliance. Those remain explicit Phase 02/device gates and feature-phase regression work.

## Reference material

No `source UI.zip` was found in the repository search. Other historical design archives and screenshots exist; they are not the requested source archive. No unseen screenshot/video comparison is claimed. Current rendered owner/admin screenshots were inspected directly. Their strongest contrast is functional: the owner mobile editor uses a deliberate preview sheet; the admin editor retains a desktop split on a phone. Adapt the working owner interaction contract while preserving each editor's data and permissions.
