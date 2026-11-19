# 25 — changed files preservation selective rollback

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

The [attribution register](evidence/attributed-changes-rollback.json) compares each changed source/test/config against the captured inherited bytes. The page/CSS retain Gemini's original work; Codex changes are separate hunks. Initial clean tracked sources are reconstructed from HEAD only when their byte hash matches the captured preimage. New tests/config are identified as Codex creations; inherited test adaptations assert selected accessible names and cancellation options rather than weaken behavior.

`output/playwright/phase11-codex-2026-11-19/codex-only.patch` is a forward patch from inherited state to Codex state. A reverse **check** is read-only. Actual rollback requires owner authorization, exact current postimage hashes and a vetted `git apply --reverse --check`. Any hash drift must stop automatic reversal for reconciliation. No rollback was executed, no blanket restore suggested.

New report hashes are in the ignored external package manifest to avoid self-referential digests. The upstream Gemini documentation and its 15 PNGs remain byte-preserved. Backend/Flyway/payment/guest/registry/marketing/package protected comparisons are explicit in [source operations](evidence/source-operations-and-sha.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
