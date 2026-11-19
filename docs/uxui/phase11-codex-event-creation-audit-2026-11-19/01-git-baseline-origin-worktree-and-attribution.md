# 01 — git baseline origin worktree and attribution

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

`main`, HEAD and cached origin are `0cf4755b645d948f1f10762075f4abd1c8e50e76`. Read-only `git ls-remote origin refs/heads/main` confirms the same remote SHA. No stage, commit, push, branch switch, PR or deployment occurred.

The initial worktree contained **2 modified tracked files and 70 untracked files**. The 72 inherited files were copied before edits; 10,351 tracked working-file hashes were captured. Gemini's two modified product files are real, but its untracked tests/config/scripts/reports also belong to the handoff. They were not treated as Codex creations.

1154 protected tracked paths were compared, including all 48 migrations. Changed protected paths: `[]`. Scoped API wrapper options accept an AbortSignal; endpoints, body contracts, global HTTP authentication and backend code remain unchanged.

[Before/after file inventory](evidence/git-worktree-baseline.json), [source operations](evidence/source-operations-and-sha.json), [Codex attribution](evidence/attributed-changes-rollback.json). Repository HEAD is not a substitute for the dirty-runtime fingerprint printed below.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
