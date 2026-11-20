# Phase 13 Creator Studio independent revalidation

**PHASE 13 STATUS — PARTIALLY COMPLETE.** This execution repairs confirmed local account/data-loss/UX defects. A reviewed development checkpoint is separate from production release certification. See [actual publication decision](evidence/publication-readiness.json) and [observed result](evidence/publication-result.json).

Entry was clean `main` at `54565a125e1c1cc13be9b1ed5039434f1d0b9450`, already published locally and remotely. The old purported Codex certification is superseded by this package. Every prior claim remains available in Git and its original package. The nine Gemini code/test/config hashes match the entry snapshot; only 5/16 inherited screenshot hashes match.

Current exact command results, including failed attempts, are in [test-runs.json](evidence/test-runs.json). Suites overlap and are never summed. Entry full suites reproduced 1,821 user and 202 admin tests. Final full user: **1,841 passed / 248 files**, exit 0. Backend: 680 executed, zero failures/errors, 82 configured skips (598 non-skipped). Telegram: 74 passed. Final Studio: **78 passed** at one worker, plus **3 passed** dirty-exit cases; the earlier default two-worker run separately passed 75 cases before added assertions. Owner-dashboard replay: **27 passed**. All other cross-phase/CI replays are recorded individually; pending files are not passes.

Confirmed repairs cover real Axios account dispatch/late stages, ownerless recovery, nested JSON and alternate adapters, existing gallery preservation, stable ambiguous creates, keyboard ownership/denied status, late image acknowledgements, actual dark contrast, compact short landscape, keyboard action reachability, WebKit focus return and CI matrix generation. No backend, migration, template art, price/entitlement or dependency change occurred.

Exact F13.1 grading: **1 BLOCKED — EXTERNAL, 0 FAILED, 0 NOT APPLICABLE, 20 PARTIALLY COMPLETE, 2 REVIEW REQUIRED, 31 VERIFIED — LOCAL**; total 54. The historical 57 remain 29 verified closed, two N/A, six review, 16 external blocked and four deferred, with all newer namespaces retained. Original N13 arithmetic is 35 IDs / 38 executions; semantic scope differs and is mapped [case by case](evidence/negative-tests.json).

Observed entry CI run [44544967826](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44544967826) failed Secret Scan and Browser E2E. The latter stopped on a missing generated matrix, not guest assertions. Current local fixes are not retroactive CI success. Physical devices/AT/native zoom/IME/Khmer review, live providers/MySQL/public parity, rights, memory/latency and field CWV remain open.

There are 31 named topic reports plus this index. Compact selected management-only before/after images are in visuals/. Larger raw traces/logs/renderer screenshots stay local, with hashes and exact scope recorded. Backend-generated tracked reporting output is excluded and retained for review. No destructive rollback is performed.

- [Git baseline and source ownership](01-baseline-and-provenance.md)
- [Claims, counts and evidence mismatches](02-claim-reconciliation.md)
- [Routes, editor modes and authority partitions](03-routes-roles-and-editor-modes.md)
- [Published Phase 12 and actual CI](04-phase12-and-ci-carryover.md)
- [Workbench visual direction and changed chrome](05-visual-direction-and-comparison.md)
- [Toolbar status and real keyboard ownership](06-toolbar-status-and-commands.md)
- [Six categories, mobile select and focus](07-section-navigation-and-aria.md)
- [Inspector hierarchy and authored input](08-inspector-fields-and-validation.md)
- [Template compatibility and server entitlements](09-template-selection-and-entitlements.md)
- [Preview origin, source, session and edit targets](10-preview-protocol-security.md)
- [Device simulation and preview dialog](11-preview-devices-focus-and-zoom.md)
- [Split pane pointer, keyboard and storage](12-split-resize-and-cancellation.md)
- [Snapshots, conflicts and acknowledgements](13-autosave-revision-and-races.md)
- [Undo, navigation and document lifetimes](14-history-navigation-and-account-switch.md)
- [Deep JSON and alternate readers](15-json-and-locale-roundtrips.md)
- [Ownerless recovery and stable creation identity](16-legacy-recovery-and-create-retries.md)
- [Mutation authority and revocation](17-permissions-and-revoked-grants.md)
- [Publish review and private/public truth](18-publish-state-truth.md)
- [Media limits, pending replacements and provenance](19-media-contract-and-rights.md)
- [Khmer, English and date/time coverage](20-khmer-english-ime-and-dates.md)
- [Loaded axe, focus and accessibility limits](21-accessibility-and-physical-gaps.md)
- [Responsive geometry and reachability](22-responsive-and-keyboard-geometry.md)
- [Reference products, skills and observable UX laws](23-reference-libraries-skills-and-ux-laws.md)
- [Bundle and runtime evidence](24-performance-and-resources.md)
- [N13 matrix and confirmed repairs](25-negative-matrix-and-defects.md)
- [Exact invocations and retained failures](26-commands-failures-and-regressions.md)
- [Exact F13.1 gate disposition](27-independent-54-gates.md)
- [All 57 historical entries and newer namespaces](28-historical-ledgers-and-owners.md)
- [Reviewed hunks and safe rollback](29-attribution-and-selective-rollback.md)
- [Development-checkpoint publication decision](30-publication-hard-gates.md)
- [Implementation-free Phase 14.1 Media Studio handoff](31-phase14-1-handoff.md)
