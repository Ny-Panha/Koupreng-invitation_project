# Phase 11 preserved evidence

This archive preserves the historical local evidence behind the [independent audit](../phase11-codex-event-creation-audit-2026-11-19/README.md). The audit verdict remains **PARTIALLY COMPLETE**. See the [publication handoff](../PHASE11_DELIVERY.md) for cleanup and publication work performed after that snapshot.

`manifest.json` records the archive checksum, every member's original path, byte count and SHA-256, and the report snapshot hashes. The archive contains fictional-fixture screenshots and metadata, command logs/results, source preimages, selective reverse patches, performance samples and historical harness scripts. It contains no installed dependencies, environment files, disposable reconstructed builds or duplicate trace binaries.

From the repository root, verify the preserved bytes without a development server:

```powershell
python scripts/phase11_evidence_archive.py verify
```

Restore missing evidence into the original ignored output directory when needed:

```powershell
python scripts/phase11_evidence_archive.py restore
```

Restoration rejects conflicting existing files and unsafe paths before writing. It never restores source files over the active application. Archive verification certifies historical bytes; it does not certify the current application, build, CI, physical devices or providers.

The older `python scripts/validate_phase11_codex_evidence.py` command additionally requires the original matching local source and built output. It is a strict audit-time check, not a fresh-clone build certificate. Its frozen worktree hashes can differ across checkout line endings or subsequent development. Do not regenerate the historical acceptance reports to make later code appear audited.

The optional historical browser configuration uses copied specs in ignored output. On Windows, restore the archive and run `python output/playwright/phase11-codex-2026-11-19/prepare_history.py` to recreate its dependency/support junctions before using `playwright.phase11-history-codex.config.js`. Current wizard tests use the committed `playwright.phase11-codex.config.js` and `phase11-codex.spec.js` directly, after a normal frontend build.

Disposable reconstructed trees, duplicate trace/screenshot copies and Python caches were removed after preservation. Original failure logs and result JSON remain available. Earlier statements that all raw binaries remain locally refer to the audit snapshot; this archive is the retained set after cleanup.
