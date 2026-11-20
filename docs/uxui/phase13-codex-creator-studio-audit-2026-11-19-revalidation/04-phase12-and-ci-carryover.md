# Published Phase 12 and actual CI

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The Phase 12 checkpoint and its owner dashboard/navigation source remain preserved. The complete prior 57-entry ledger and newer namespaces are copied as historical records with their source hash. They are not retroactively closed by Studio tests. Run 44532062068 was independently queried and still shows Secret Scan and Browser E2E failures.

The entry commit’s distinct run 44544967826 is also failed in those jobs. Its browser job actually stops on ENOENT for docs/phase12/evidence/studio-template-locales-matrix.json, before guest assertions execute. CI now regenerates that source-derived fixture in the browser job using its existing PHASE12_WRITE_MATRIX opt-in. The generator passed locally. Historical Add guest failures remain a separate unchanged replay; they must never be substituted for the observed current failure.

Evidence:

- [ci-observed.json](evidence/ci-observed.json)
- [test-runs.json](evidence/test-runs.json)
- [historical-57-plus-new-ledger.json](evidence/historical-57-plus-new-ledger.json)

[Report index](README.md).
