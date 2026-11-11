# Source reconciliation and open audit gates

**Baseline:** `main` at `b36edc2b53053fb77a1ef18dd8910c80d00ea601`, clean before Phase 02 edits. `origin/main` matched locally. Phase 01 remains **PARTIALLY COMPLETE**. Phase 02 is a specification and browser triage package; the older `docs/phase02-*` directories are a different program.

| Inventory | Current reconciliation | Evidence and boundary |
|---|---:|---|
| User declared leaf routes | 111/111 | User route factory inventory test passed; current Batch 12 JSON keys match Phase 01 ledger. |
| Admin declared leaf routes | 24/24 | Admin route factory inventory test passed; aliases and admin 404 retained. |
| Feature groups | 62/62 | Current JSON group set and [group ledger](evidence/group-ledger.md); one primary owner per group. |
| Dedicated static renderer families | 10/10 | Current `templateRegistry.js` parsed; 38/38 aliases, two shared IDs and one fallback. |
| Dynamic backend catalog | unknown | Runtime API loads catalog; no isolated live dataset enumerated. Do not equate static registry with all published products. |
| Browser failure assertions | 3/3 reproduced | Current mobile Chromium target run: 0 passed, 3 failed; retained traces and screenshots under ignored `output/playwright/phase02-foundations/results/`. |

Current sources inspected include both route factories and manifests; user `MarketingShell`, `AuthShell`, `HostShell`; admin `AdminLayout` and template Studio; static renderer registry; event creation; preview messaging; current test fixtures; the third-party license ledger; and Phase 01 reports. Both frontends use React 19, Vite 8 and Tailwind 4. The current source audit counted 48 applied Flyway migration files; this phase neither changed nor revalidated a live MySQL schema. Source reconciliation uses test-backed route identity, not a claim that every route/state combination works.

## Historical evidence and changed findings

Phase 01 reported 135/135 fictional-fixture mobile Chromium leaf render passes, targeted AU-001–006 passes in Chromium/WebKit/Firefox, 1,487 user and 195 admin unit passes, backend 145 passes/9 skips, Telegram 74 passes and single-sample LCP observations of 2.872/3.916/4.764 seconds. These are **reported baseline**, not newly run Phase 02 suites. The Phase 01 browser run had 13 passes and 3 failures; this phase reproduced those three failures with the exact target spec. Current source retained the same route and renderer counts; no added or removed URL was detected by the inventory tests and key reconciliation.

The two Khmer label failures are assertion drift against visible current controls. The preview ratio failure needs a behavioral contract based on scroll and control reachability; [triage](11-qa-new-01-to-03-triage.md) contains the engine observations. These findings do not close historical audit gaps by implication.

## Open gates with owners

| Gate | State | Owner and required evidence |
|---|---|---|
| Real iOS/Android and in-app browsers | BLOCKED by device access | Phase 16/26: physical touch, safe areas, dynamic toolbars, on-screen keyboard, reduced motion, guest opening and RSVP. |
| Screen reader and 200–400% zoom | NOT TESTED | Phase 04/26: VoiceOver, TalkBack, NVDA/JAWS and manual focus/reflow. Browser engine emulation alone is insufficient. |
| Dynamic catalog / purchased entitlement | BLOCKED by isolated provider dataset | Phase 09/10/21/25: compare active API records, slug/code, price, owned state, preview and published renderer. |
| MySQL persistence / Flyway checksums | BLOCKED by isolated database | Phases 11/13/15/17–25/27: controlled draft/save/reload, authorization and migration verification. |
| ABA PayWay and Telegram settlement | BLOCKED by sandbox/provider credentials | Phase 21/27: server-verified order status, replay/idempotency and entitlement; no mocked PAID is a settlement proof. |
| Full state × route × viewport × locale sweep | NOT TESTED | Each owning phase plus 26: priority-based matrix, screenshots, accessibility and regression evidence. |

No production JSX/CSS, payment, auth, migration or fixture source was changed. The route and renderer ledgers are specifications with proposed target states, while current route identity is source mapped. See [validation](14-phase-02-validation-and-evidence-index.md).
