# Git baseline and source ownership

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The execution began on clean main at `54565a125e1c1cc13be9b1ed5039434f1d0b9450`, also returned by ls-remote. This is one commit after the Phase 12 baseline. The prompt’s dirty six-file expectation was stale: the entry commit already published 121 files, including both packages. All nine attributed Gemini code/test/config hashes match the preserved entry snapshot after normalizing duplicate slash spellings in the inventory. This execution does not authenticate an earlier agent identity from a commit author name.

Before changing product source, 197 inventory rows were snapshotted outside the repository; duplicate path spellings are accounted for in baseline.json. No environment secret was used as documentation. Backend tests later regenerated tracked synthetic output/admin-reporting fixtures; these are separately inventoried and excluded from the Studio publication candidate. No broad restore, clean, reset, stash or history rewrite was used.

Evidence:

- [baseline.json](evidence/baseline.json)
- [prior-package-validation.json](evidence/prior-package-validation.json)

[Report index](README.md).
