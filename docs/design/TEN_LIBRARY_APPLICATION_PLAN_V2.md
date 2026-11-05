# Ten-library application decisions — V2

Reviewed 2026-11-04/05 using the official pages below and the existing
[research matrix](TEN_LIBRARY_INTEGRATION_MATRIX.md) and
[license ledger](THIRD_PARTY_UI_LICENSES.md). This increment imports no component
source or artwork from these libraries and adds no runtime dependencies. All
implementations listed here are original project work, informed by general UX
principles. No library installation or source adaptation is claimed.

| Library / current official evidence | Concrete deficit and target | Candidate, scope, dependency concern | Decision and actual application | Verification |
| --- | --- | --- | --- | --- |
| [Animate UI](https://animate-ui.com/docs/installation), [terms](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md) | Abrupt Floral opening on `/templates/khmer-floral-gold/demo`, `/i/:slug` | Dialog/entrance timing; public components with Commons Clause, primitive + Motion dependencies | Inspired by staged entrance/exit timing; original cover release and welcome fade, existing modal/provider. Source not adopted. | Recorded opening, immediate Skip/Escape, reduced motion, video recovery |
| [Badtz UI](https://www.badtz-ui.com/docs), [terms](https://github.com/badtzx0/badtz-ui/blob/main/LICENSE.md) | Studio styles lacked discoverable examples | Expandable option cards, free catalogue / separate Pro; commercial redistribution restrictions and helper dependencies | Inspired by progressive disclosure; original radio gallery with live owner-data miniatures inside the existing Studio. No restricted source. | Keyboard radio selection, save/reload, phone/public rendering |
| [Lightswind](https://lightswind.com/license) | Flat stationery and identical floral distribution | Atmospheric backgrounds; free/Pro scope; site prohibits source resale/builders despite repository MIT file | Original paper grain, varied watercolor scene corners and botanical linework. No imported shaders, GSAP or WebGL. | Seven viewport captures, overflow and frame timing |
| [Kokonut](https://kokonutui.com/docs/cards/liquid-glass-card), [free MIT scope](https://github.com/kokonut-labs/kokonutui/blob/main/LICENSE) | Song/video overlap and missing retry affordance | Free Now Playing vs distinct Pro audio card; CVA/shadcn helpers would duplicate existing foundations | Inspired by compact media feedback; existing single native audio controller, actual play/error state, silent Floral film and replay. Pro card not adopted. | Gesture play, pause, route cleanup, real browser video and failure |
| [Untitled UI React](https://www.untitledui.com/react/docs/introduction), [free MIT scope](https://github.com/untitleduico/react/blob/main/LICENSE) | Unclear style/media selection and upload errors | Free base fields vs PRO examples; React Aria would introduce a parallel primitive system | Original labeled fields, bounded controls, type/size validation, upload status and media removal. | Owner upload contract, keyboard controls, persistence, stale-event tests |
| [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/base/dialog), [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) | Gallery/map/video need consistent focus and dismissal | Free source; current dialog uses Base UI, absent from this repository | Existing project Modal already solves focus/scroll restoration. Reused it rather than adding another foundation; source not adopted. | Tab containment, Escape, focus return, axe |
| [React Bits](https://www.reactbits.dev/get-started/installation), [terms](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) | Opening and photos lacked paced reveals | Public / separate Pro; Commons Clause; some examples add GSAP/ScrollTrigger | Original CSS fade choreography and bounded petal presets using installed stack. No copied animation code or separate engine. | Motion recording, no-motion/reduced-motion paths, frame sample |
| [Aceternity](https://ui.aceternity.com/licence) | Portraits lacked paper depth; program hierarchy flat | 3D layers/timeline; custom free/paid terms restrict marketplace/template redistribution | Independent diagonal portraits, torn/arch/gold frames, original program layouts. Source and distinctive compositions not copied. | All program variants, gallery/modal behavior and viewport captures |
| [Magic UI](https://magicui.design/docs/components/number-ticker), [free MIT](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md) | Counters and date variants needed stable numeric structure | Free ticker vs Pro assets; Motion helpers unnecessary for existing countdown | Existing canonical countdown and locale formatting retained; tabular numerals and original ornate counters. No new ticker dependency. | Leap date, timezone, expiry and valid ICS download tests |
| [Skiper](https://skiper-ui.com/docs/quick-start), [terms](https://skiper-ui.com/docs/terms-of-service) | Missing contextual section access and small gallery overview | Dynamic island/carousel concepts; free attribution vs Pro and component-specific dependencies | Original registered-section dock, peeking carousel, grid/filmstrip and small thumbnails. Free-source attribution scope remains unresolved, so no source adoption. | Actual section availability, safe areas, touch/keyboard gallery, modal hiding |

The guest invitation stays one floral stationery design. The editor uses existing
form primitives. Free MIT candidates were evaluated but none offered enough benefit
to justify a second Aria/Base UI/Radix foundation. Any future copied component needs
an exact pinned source revision, dependency review and license notice in the ledger.

UI/UX Pro Max was run with `wedding invitation floral gold --design-system` and
`mobile invitation music navigation --domain ux`. Its generic landing-page structure
was rejected in favor of the supplied recording; usable guidance included visible
focus, 44px touch targets, controls that avoid obscuring content and restrained
transitions. Koupreng premium UX guided Khmer line height, ceremony hierarchy and
opening consent. Frontend design guided deliberate stationery composition and
original artwork. QA routing used `koupreng-qa-release` with `playwright`.
