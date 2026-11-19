# 01 — git baseline origin and provenance

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The entry branch was `main`, with local HEAD and origin/main both at `ad02a26345f2beed2e8d0d28459de7fac1f8aef8`. Seven tracked source files were dirty and Gemini tests/config/reports were untracked. A read-only external snapshot preserved 145 files and the inherited binary-capable patch before source edits. Every reported source post-hash and all 16 inherited PNG hashes matched live bytes; all 25 JSON inputs parsed.

During QA, the user created/pushed `b18aae3f144ea599da29c13f2ef448aa33ba08a2`, which included in-progress Phase 12 work and a much larger documentation cleanup (4,262 files changed). Codex stopped source edits, reviewed the commit and remote, and asked under prompt §29. The user explicitly confirmed its origin and instructed review/resumption. This is the resumed publication ancestor; it was not a Codex audit publication. Only two executable route fixtures and a concise docs entry point were repaired from that cleanup. No blanket restore or history rewrite occurred.

See [baseline](evidence/git-baseline.json), [attribution](evidence/file-attribution.json), and [rollback](evidence/changed-files-rollback.json).

[Report index](README.md).
