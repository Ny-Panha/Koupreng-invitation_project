# Phase 14.1 — Canonical Ten UI Library Decisions and Licenses

## 1. Evaluation of Ten Catalogs
Rather than importing proprietary code, each reference catalog was studied for design patterns and implemented natively:

| Catalog | Decision | License / Terms | Architectural Role in Phase 14.1 |
|---|---|---|---|
| **Animate UI** | Original Inspiration | Custom / Restricted | Spring-curve transition variables in CSS with reduced-motion support |
| **Badtz UI** | Original Inspiration | Commercial restriction | Compact card metadata footer pattern using native HTML elements |
| **Lightswind UI** | Original Inspiration | Restricted redistribution | 2D focal framing overlay geometry with SVG crosshairs |
| **Kokonut UI** | Original Inspiration | MIT with caveats | Multi-file preflight queue tray with individual progress indicators |
| **Untitled UI** | Original Inspiration | Commercial UI kit | Category segmented controls and asset action ergonomics |
| **shadcn/ui** | Adopt Existing Pattern | MIT | Radix-inspired accessible modal pattern for focal point inspector |
| **React Bits** | Reject / Avoid | Attribution uncertainty | Avoided heavy WebGL shaders that harm low-end mobile performance |
| **Aceternity UI** | Original Inspiration | Free tier restrictions | Subtle card hover depth via CSS box-shadow without framer-motion |
| **Magic UI** | Original Inspiration | Commercial / MIT mix | Micro-progress pulse for upload confirmation checkmarks |
| **Skiper UI** | Original Inspiration | Commercial template | Keyboard-driven gallery reordering with move earlier/later actions |

- [Machine Evidence: Ten UI References](evidence/ten-ui-references.json)
