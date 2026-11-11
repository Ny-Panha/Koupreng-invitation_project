# Performance, assets and dependency baseline

The browser runner built both Vite applications successfully as prerequisites for the current Phase 02 foundation and route checks. Its configured build directory (`output/playwright/phase02-foundations/*-build`) was reused without emptying, so a directory-wide asset sum would include stale chunks and is **not** a valid current bundle measurement. A current three-route Chromium lab script (`evidence/performance-current.mjs`) captured **one cold fictional-fixture sample per route** with 390×844 DPR2, reduced motion, 4× CPU throttle, 150ms latency and 200,000 bytes/s download. Raw observers and resource timings are in [`performance-current.json`](evidence/performance-current.json). The run has no interaction and cannot yield INP; it is not Lighthouse, field data or a distribution.

| Current single lab sample | LCP observer | CLS observer | Requests / long tasks |
|---|---:|---:|---:|
| Home | 2.872s | 0.000628 | 29 / 2 |
| Event creation | 3.916s | 0 | 65 / 2 |
| Public invitation | 4.764s | 0 | 88 / 2 |

**Current source signals:** user manifest lists React 19.3.1, Vite 8.3.5, Tailwind 4.3.3, Framer Motion 14.5.0, Lucide and Zustand; admin lists dnd-kit. `App.jsx` fetches dynamic active templates and loads global providers before the route; renderer layouts are lazy in `templateRegistry.js`. `semantic-tokens.css` already defines reduced-motion timing. Media and audio in the built output include multi-megabyte assets; storage size alone does not establish route transfer or LCP impact. Historical 2026-11-10 lab LCP values (4.004s home, 4.592s creation, 4.988s invitation) are **historical diagnostic samples**, not today's field performance.

**Next reproducible measurement:** use a clean isolated outDir, fixed SHA/fixture/viewport/browser and cold/warm runs (at least three per surface). Record encoded and decoded JS/CSS/media, font and hero request priority, long tasks, LCP element, CLS sources, and input responsiveness for landing, catalog, event creation, workspace, user/admin Studio, public invitation, checkout and RSVP. Repeat normal and reduced motion with explicit CPU/network settings; use field p75 targets of LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 only when real field data exist. Keep raw runs and distributions; do not infer INP from no interaction.

Asset and licensing audit must retain original art and template mappings. Examine the landing phone preview, venue background, 4K source art, audio/video initialization and each renderer's request fan-out before replacing or optimizing assets. Existing `docs/design/THIRD_PARTY_UI_LICENSES.md` is the provenance ledger; current upstream license terms require a fresh exact-component check before adoption.
