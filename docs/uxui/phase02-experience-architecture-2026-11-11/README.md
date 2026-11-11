# KoupReng Phase 02 — complete experience architecture

**Status: COMPLETE as a Phase 02 documentation and browser-triage package.** Phase 01 remains **PARTIALLY COMPLETE**. No Phase 03–27 implementation, production source, backend, migration, dependency or existing E2E assertion was changed. Real-device, provider, MySQL and full route × state validation remain future gates, not implied PASS results.

**Source baseline:** `main` at `b36edc2b53053fb77a1ef18dd8910c80d00ea601` before this package. The user and admin route inventory tests passed: **135/135 current leaf routes** (111 user, 24 admin) assigned to target IA and one later primary phase, **62/62 feature groups**, **10/10 dedicated static renderer families**, **38/38 static aliases**, two shared identifiers and one fallback. Dynamic backend catalog count remains unknown. Ten complete journey blueprints, ten journey Mermaid diagrams and one cross-journey map cover visitor, owner, guest, operations, buyer, gift, admin, collaborator and exceptional entry. The design direction and capability tiers are proposals, not shipped changes or entitlement rules.

## Executive decisions

- Keep current URLs, aliases, guards, four management shell boundaries and renderer identities. Organize navigation around tasks and permissions without weakening server authority.
- Use a restrained cream/ink/forest/gold management foundation with three separately reviewed invitation directions: Khmer Ceremonial Heritage, Modern International Editorial and Cinematic Immersive. Essential guest facts and RSVP remain accessible without motion.
- Preserve backend truth for price/ownership, payment/settlement, RSVP/access, revisions and published state. Keep manual gift records distinct from verified provider payments.
- Classify QA-NEW-01 and QA-NEW-02 as stale exact Khmer test labels after successful current-control action checks; classify QA-NEW-03 as a short-landscape viewport-ratio assertion mismatch within simulated-engine evidence. Existing three target tests remain **FAIL** and their traces are retained. See [triage](11-qa-new-01-to-03-triage.md).
- Adopt library components only for a measured gap with pinned license/export rights; zero new dependencies or assets were installed.

## Reading order and deliverables

| Section | File | Purpose |
|---|---|---|
| Baseline | [01 Source reconciliation](01-source-reconciliation-and-open-audit-gates.md) | Counts, source boundaries and open audit gates. |
| Thesis | [02 Current vs target](02-current-vs-target-ux-architecture.md) | Whole-product diagnosis, priorities and guardrails. |
| Navigation | [03 Information architecture](03-complete-information-architecture.md), [04 Route matrix](04-all-routes-to-ia-mapping.md) | Shells, glossary, aliases and every leaf URL. |
| Journeys | [05 Ten blueprints](05-ten-user-journey-blueprints.md) | Success, denial, interruption and recovery diagrams/specifications. |
| Interactions | [06 UX laws and contracts](06-ux-laws-and-interaction-contracts.md) | Component and state behavior. |
| Visual language | [07 Art direction](07-premium-brand-and-art-direction.md), [08 Renderer tiers](08-template-experience-tiers.md) | Three directions, ten families and capability tiers. |
| Technical experience | [09 Motion/media](09-motion-3d-and-media-governance.md), [10 Responsive/a11y/localization](10-responsive-a11y-and-khmer-english-spec.md) | Motion, consent, widths, WCAG target and bilingual rules. |
| Evidence and adoption | [11 QA triage](11-qa-new-01-to-03-triage.md), [12 Library policy](12-design-system-adoption-and-library-policy.md) | Current failures, source/license/bundle choices. |
| Execution control | [13 Dependency map](13-full-product-improvement-dependency-map.md), [14 Validation](14-phase-02-validation-and-evidence-index.md), [15 Decisions](15-decisions-approvals-and-preservation.md) | Phases 03–27, exact checks and invariants. |
| Next phase | [16 Phase 03 handoff](16-phase-03-execution-handoff.md) | Actionable future visual-system prompt; no implementation yet. |

The committed [coverage generator](evidence/generate-coverage.py), [journey generator](evidence/generate-journeys.py), [group ledger](evidence/group-ledger.md), [62-group surface ledger](evidence/feature-surface-ledger.md) and [read-only browser probe](evidence/triage-browser.mjs) make counts and triage reproducible. Raw browser screenshots/traces/JSON live under local ignored `output/playwright/` and are not shipped as product assets.

## Review and remaining decisions

Owner/content review is needed for exact Khmer action labels and three family-level art priorities. Product/security decisions are needed before optional calendar, general CMS, live AI, refunds or venue bookings. Phases 21/26/27 need isolated provider/MySQL, physical phones/in-app browsers, screen readers and field performance evidence. [Decisions](15-decisions-approvals-and-preservation.md) names the authority and preservation gates. This Phase 02 completion means the **specification** is reviewable and source traced; it does not certify current product release readiness.
