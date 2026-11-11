# Motion, optional 3D and media governance

Framer Motion already exists in the customer app; CSS transitions are sufficient for most management UI. Every animation below is a **proposal** with a static no-JS rendering path. Durations are initial test budgets, not measured current timings. No global smooth-scrolling engine or new 3D runtime is approved.

| Pattern / owner | Trigger, purpose and tentative timing | Interruption, focus, equivalents and fallback |
|---|---|---|
| Microfeedback / shared | Pointer or key press: 80–160ms color/scale at most; confirm action availability | Hit box stays fixed; keyboard focus ring independent; touch pressed state; static style if motion reduced/no JS. |
| Form error / shared | Validation response: immediate inline message, optional ≤120ms emphasis | Focus first invalid field, announce once; no shake that obscures text; no animation needed. |
| Loading/progress / shared | Request begins; skeleton only if useful, no indefinite fake percent | Cancelable request where safe, status text; reduced motion static indicator; server response controls success. |
| Route transition / shells | After navigation, ≤180ms opacity only if content ready | Focus main heading immediately; Back/interrupt cancels; no delay to login, save, payment or navigation. |
| Drawer/dialog / shared | Open/close ≤200ms, ease-out; reveal context | Focus management synchronous, Escape/close restore, touch/keyboard equivalent; instantly open under reduced motion. |
| Editor panel/preview / Studio | Edit ↔ Preview changes panel ≤180ms | Preserve unsaved values, focus moves to selected panel control/heading; iframe loading independent; no animation gate. |
| Template card / public | Hover/focus/tap subtle border or lift ≤160ms | Same information on touch/keyboard; no hover-only price/use CTA; static card valid. |
| Scroll story/gallery / renderer | User scroll or selects image; ≤250ms reveal | No scroll-jacking; stable anchors; keyboard next/previous and static image; cancel on navigation. |
| Ceremonial opening / renderer | Explicit Open; family-specific 300–900ms scene only after essential content is available | Skip, replay, pause and reduced-motion immediate reveal; audio never auto-starts; no RSVP/map wait. |
| Optional 2.5D/3D / renderer | Guest opt-in only after capability/asset review | Fallback to 2D/static; disable on low memory/power, hidden tab or reduced motion; no WebGL on management. |
| Celebration / renderer | Server-confirmed RSVP or publish; restrained ≤500ms detail | Announcement and next action first; no confetti covering CTA; static success state. |

**Critical-path rule:** login, editor save, navigation, map, RSVP, checkout, server payment status and permission recovery must respond independently of cinematic motion. Main-thread work for a transition should fit a frame budget on a representative low-end phone; measure long tasks and INP in Phase 26. Lazy-load renderer-specific media/effects after essential text and controls; pre-size images to avoid CLS. Video/audio require user consent and accessible controls. Audio pauses on visibility loss/background, stops on route leave, and resumes only after renewed user action. Autoplay permission or iframe `allow` does not count as user consent.

Use `prefers-reduced-motion` to remove nonessential movement and parallax, preserve focus and meaning, and present scene content immediately. For no-JS or failed media, server/static markup should still expose title, date/place and permitted action where architecture allows. Stable CTA bounding boxes are required during every opening; pointer hit testing, keyboard activation and focus timing must be checked, without force-click as sole evidence.

**Library gate:** consider Three.js/React Three Fiber only for a named renderer effect after measuring current bundle increment, memory/GPU use, low-end frame time, battery impact, code splitting and asset licenses. Reject if equivalent 2D/CSS depth meets the concept. Phases 05/10/16 own proofs in normal/reduced motion, cold/warm cache, Chromium/WebKit/Firefox, physical iOS/Android and in-app browsers.
