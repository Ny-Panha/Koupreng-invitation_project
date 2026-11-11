# Motion, 3D and interaction audit

Current source declares feedback/overlay durations of 160/200ms in `shared/styles/semantic-tokens.css` and sets both to zero for reduced motion. The customer app lists Framer Motion and uses `shared/animations/RouteMotion.jsx`; individual invitation layouts own ceremonial scenes. The current browser suite ran primarily with reduced motion; one pointer-opening case passed with normal motion. This does **not** establish low-end frame timing or all renderer motion paths.

| Tier | Existing surface / source observation | Audit decision and acceptance |
|---|---|---|
| Functional | Save, loading, route and overlay feedback | KEEP + VERIFY: status and focus survive transitions; target ~120–220ms and no moving tap target. |
| Spatial | Editor panel/preview and mobile drawers | KEEP + VERIFY: mode switch retains form state and iframe trust; keyboard and touch reach every control. |
| Cinematic | Envelope, wax seal, paper, gallery and ceremonial openings across individual renderers | VERIFY per template: user gesture, skip/pause, static fallback, audio consent and reduced-motion path. Essential RSVP/map/payment tasks remain reachable. |
| 3D enhancement | Dedicated template scenes only | PROPOSAL after asset rights, bundle, mobile GPU/memory and fallback review. Do not put continuous WebGL in management screens. |

The `StudioPanelResize.jsx` source now exposes keyboard arrows/Home/End, pointer events and simple +/- controls; targeted AU-003 browser test passed. Physical touch, stylus, screen reader announcement and scroll interaction remain NOT TESTED. The short landscape iframe ratio failure is a motion-independent reachability investigation, not evidence that opening animations block guest tasks.
