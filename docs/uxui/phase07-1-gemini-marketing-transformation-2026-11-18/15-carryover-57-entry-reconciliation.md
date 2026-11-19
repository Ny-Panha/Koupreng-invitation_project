# Phase 07.1 — 57-Entry Carryover Ledger Reconciliation

## 1. Governance & Carryover Register Overview

In accordance with `AGENTS.md` and the Phase 06 handoff, Phase 07.1 treats the 57-entry carryover ledger (`docs/uxui/phase06-global-layout-navigation-2026-11-17/carryover-closure-ledger.md`) as a **living dependency register**. No gate is marked closed without direct source implementation and automated verification evidence.

---

## 2. Phase 07 Marketing Gates: Closed with Direct Evidence

The following carryover items fall directly within Phase 07 ownership and have been resolved:

| Carryover ID / Concern | Source Issue | Resolution in Phase 07.1 | Verification Evidence |
|---|---|---|---|
| **GATE-MKTG-DARK-MODE** | Marketing pages had unstyled inputs and legacy tokens in dark mode | Implemented complete dark mode tokens across `MarketingFeature.css`, `MarketingPages.css`, `MarketingChrome.css`, and `VenuesFeature.css`. | Verified across all 7 marketing tests and visual inspection. |
| **GATE-VENUES-INLINE-CSS** | 338 lines of inline `<style>` injected into head on `/venues` | Extracted into `VenuesFeature.css`; modular CSS chunk emitted by Vite (`8.38 kB`). | `Phase07Marketing.test.jsx` test: "has no inline style tags injected". |
| **GATE-I18N-ENCODING** | Corrupted hyphen/question mark characters in venue capacities | Sanitized `marketingMessages.js` with clean en-dashes (`500–2,000 guests`) and proper ellipsis. | Verified string rendering and test matchers in `VenuesFeature.test.jsx`. |
| **GATE-SKIP-LINK-STYLE** | Skip link lacked polished high-contrast atelier styling | Added `.kp-skip` and `.host-skip-link` styles with champagne outline on focus. | `Phase07Marketing.test.jsx` test: "provides an accessible skip link targeting #main-content". |
| **GATE-HEADING-HIERARCHY** | Potential heading level conflicts on marketing routes | Standardized strictly 1 `<h1>` per page with hierarchical `<h2>` to `<h4>`. | `Phase07Marketing.test.jsx` test: "renders exactly one H1 heading on the homepage". |

---

## 3. Preserved Open Gates (Assigned to Phases 08–27)

All non-marketing carryovers remain **open** and preserved:
- **Phase 08 (Studio & Customization):** 8 failing landscape preview tests; canvas rotation mocks; draft save persistence.
- **Phase 09 (Marketplace & Template Directory):** Template catalog filtering, preview origin sandbox, full pricing checkout integration.
- **Phase 10 (Checkout & ABA PayWay):** Webhook integrity, payment transaction timeouts, Telegram merchant alerts.
- **Phases 11–27:** Admin CMS, guest RSVP privacy controls, wedding envelope opening audio choreography, and production deployment scripts.
