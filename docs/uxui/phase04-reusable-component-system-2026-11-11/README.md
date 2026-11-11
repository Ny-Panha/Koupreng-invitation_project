# Phase 04 — reusable component system

**Status: PARTIALLY COMPLETE.** Nine existing shared primitives received bounded API, accessibility, feedback, or theme improvements across the user and admin apps. The 135 route contracts are reconciled to 62 named feature groups and later-phase owners. This is not full adoption of every family or every route state. No Phase 05 implementation is included.

Starting source: `1dc4b24b9d3049c3fd147ee545cb3b6b39738cf9` on clean `main`, matching `origin/main` at start. Final commit and remote verification are recorded in the delivery response. Work uses fictional fixtures, local browser builds, and current source; it does not certify a live backend or production device.

## Deliverables

| Document | Purpose |
|---|---|
| [01](01-starting-source-and-baseline.md) | Source, route, and test baseline |
| [02](02-component-and-usage-inventory.md) | Component family inventory and dispositions |
| [03](03-component-architecture-and-api-contracts.md) | API and state contracts |
| [04](04-actions-links-navigation.md) | Action/navigation adoption |
| [05](05-forms-inputs-and-validation.md) | Fields and validation |
| [06](06-dialogs-drawers-popovers-and-focus.md) | Focus/overlay preservation |
| [07](07-feedback-status-loading-error-states.md) | Honest status/feedback |
| [08](08-data-cards-tables-search-pagination.md) | Table/card patterns |
| [09](09-media-studio-charts-export-adapters.md) | Specialized boundaries |
| [10](10-khmer-english-typography-and-theme-states.md) | Language and theme |
| [11](11-accessibility-and-responsive-qa.md) | Responsive/a11y results |
| [12](12-route-adoption-and-preservation-matrix.md) | 135 leaf adoption matrix |
| [13](13-visual-evidence-and-performance.md) | Captures and local lab |
| [14](14-exact-tests-and-known-failure-register.md) | Exact QA ledger |
| [15](15-changed-files-risks-and-rollback.md) | Changed files and rollback |
| [16](16-open-gates-and-deferrals.md) | Unfinished gates |
| [17](17-phase05-motion-platform-handoff.md) | Phase 05 handoff |

Machine-readable [component register](evidence/component-register.json), [route ledger](evidence/route-adoption.json), corresponding [component table](evidence/component-register.md) and [route table](evidence/route-adoption.md) are tracked. The [before](evidence/before-manifest.json) and [after](evidence/after-manifest.json) manifests index 104 ignored screenshots. [Capture diff](evidence/capture-diff.json), [responsive/a11y probes](evidence/responsive-a11y-results.json), and [lab summary](evidence/lab-summary.json) are synthetic evidence with reproducible scripts in `evidence/`.

The Phase 03 canonical tokens remain the single token source. No package, license, backend, migration, template registry, or preview protocol change was made.
