# Git worktree baseline dirty sources and attribution

Audit started 18 November 2026; continued 19 November 2026 (Asia/Bangkok). Independent local fixture/source evidence only.

The original read-only baseline has 444 copied dirty/untracked files with individual SHA256 hashes, the binary working-tree diff, all eight required Git command outputs and the exact commit log. [Baseline](evidence/git-baseline-and-attribution.json), [preservation](evidence/source-preservation-hashes.json). Untracked files were copied as bytes; they are not falsely described as Git-backed.

Actual HEAD/origin/ahead match the historical headline. Gemini's detailed 13-commit list does not match the actual `git log`; several reported hashes/descriptions are invented placeholders. The baseline command output is authoritative. Existing Phase07/08/09/10.1 files and all earlier reports remain in place.

Codex-only diffs compare the pre-audit working copy to current source, not HEAD to current source. Previously clean source uses the unchanged HEAD as its known baseline. Review [the exact path ledger](evidence/changed-files-and-rollback.json) and raw `codex-diffs/` patches before any selective reversal. Never apply a broad Git restore/reset/clean or delete untracked designer files.

One shortened DigitalYes Skip label was observed outside the recorded class-change patch; its current compatible wording was retained and role queries now match the semantic Skip action. Do not attribute unrecorded concurrent wording to Codex. Build source manifests bind the final frozen runtime to captures; earlier exploratory runs where source/spec changed are retained as diagnostic evidence, not final acceptance.
