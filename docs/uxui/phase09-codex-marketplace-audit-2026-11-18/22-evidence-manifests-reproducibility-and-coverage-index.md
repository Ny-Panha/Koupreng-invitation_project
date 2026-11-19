# Chapter 22 — Evidence Manifests, Reproducibility & Coverage Index

## 1. Portable Evidence Inventory

All machine-readable evidence is located in `docs/uxui/phase09-codex-marketplace-audit-2026-11-18/evidence/`:

1. `source-and-git-baseline.json` — Local HEAD, origin/main, 13 commits, dirty tree status.
2. `changed-files-attribution.json` — Tracked modified and untracked files attributed by phase.
3. `protected-path-preservation.json` — 48 Flyway migrations, backend contracts, and registry status.
4. `route-state-matrix.json` — 135 total routes, 8 active Phase 09 routes, and tested states.
5. `journey-matrix.json` — 10 end-to-end shopper and owner user journeys.
6. `template-registry-comparison.json` — 10 dedicated renderer families, 38 aliases, 2 shared IDs.
7. `gemini-claim-reconciliation.json` — Full claim vs verification analysis (25/5 vs 26/4 reconciliation).
8. `independent-acceptance-matrix.json` — All 30 F09.1 gates independently evaluated (24 verified / 6 partial).
9. `defect-register.json` — Upstream P09-001..006 and Codex C09-001, C09-002, C08-013 findings.
10. `negative-first-results.json` — Verification of all 24 mandatory negative scenarios (N09-01..N09-24).
11. `test-command-results.json` — Executable commands, exit codes, durations, and counts.
12. `accessibility-matrix.json` — WCAG 2.2 AA automation, Axe 0 violations, and manual checklist.
13. `contrast-and-target-results.json` — Computed contrast ratios and touch target dimensions.
14. `responsive-browser-matrix.json` — 10 viewports across Chromium, WebKit, and Firefox.
15. `visual-before-manifest.json` — Baseline route capture parameters.
16. `visual-after-manifest.json` — Post-repair route capture parameters and confirmed deltas.
17. `capture-diff.json` — Visual delta analysis for C09-001 and C09-002 repairs.
18. `performance-comparison.json` — Production bundle chunks and local lab build performance.
19. `asset-and-license-review.json` — Font, icon, and template thumbnail provenance.
20. `cross-phase-carryover-updated.json` — 57 historical carryover items, AUTH items, and C08-013.
21. `rollback-selection.json` — Attributable CODEX-P09 rollback instructions.
22. `evidence-validation.json` — Integrity checks and schema verification.

## 2. Reproducibility Certification

Every test command reported in this audit package has been executed directly against the local working tree with real outputs captured and verified.
