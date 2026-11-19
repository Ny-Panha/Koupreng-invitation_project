# 29 — attributed changes snapshots and rollback

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The original external snapshot and inherited patch preserve Gemini's source bytes, tests, reports and screenshots. The source attribution register compares those entry hashes with current bytes and identifies which files the user-published b18aae3 already included. The final Git diff alone therefore cannot describe the whole Phase 12 combined effort. Backend, renderers, auth/HTTP/store and shared draft-storage source remain unchanged from ad02a263.

Selective rollback means review one named file/hunk against its recorded entry/predecessor, then prepare a new forward commit. Do not globally restore the repo, erase the documentation cleanup, rewrite history, clean ignored output or remove the preserved Phase 11 publication folder. Draft data remains stored; no migration or raw customer asset was staged.

[Attribution](evidence/file-attribution.json), [rollback instructions](evidence/changed-files-rollback.json), [source freeze](evidence/source-freeze.json) and restored fixture hashes provide the review trail. The external snapshot path is intentionally kept local and is not represented as a portable public URL.

[Report index](README.md).
