# Source, Git and Gemini diff reconciliation

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

`main` remains `2429b76545b683fad2a0a6f328bee3264875edc3`; observed `origin/main` is `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`. All 13 local Phase06 commits remain ancestors. No fetch/pull/reset/restore/clean/commit/push/deploy was performed. No staged changes were present at the start.

Initial Gemini state: six tracked files modified; VenuesFeature.css, Phase07Marketing.test.jsx and the complete Phase07.1 report directory untracked. It was a dirty, focused working tree, not a clean checkout. Existing home components and contact logic were not newly implemented by Gemini.

Before edits, 30 allowed frontend/report files were hashed and backed up to ignored `output/phase07-codex-2026-11-18/starting-files/`; binary diff is `gemini-starting.patch` (25,583 bytes). No environment files or secrets were copied. Initial commands and untracked inventory are preserved in `initial-git.txt` / `starting-inventory.json`. Codex-only patch is generated separately against this starting state. The [final Git snapshot](evidence/git-final.txt) records the actual dirty/staged/untracked state.

[Current source preservation](evidence/source-preservation.json) includes original Gemini report hash checks and protected categories. Local `.git/info/exclude` excludes only `/output/phase07-codex-2026-11-18/`; binaries, local backups and traces are not proposed Git artifacts. [Changed-file attribution](evidence/attributed-changes.json) distinguishes Gemini, Codex and newly created source. Original historical reports remain unchanged.
