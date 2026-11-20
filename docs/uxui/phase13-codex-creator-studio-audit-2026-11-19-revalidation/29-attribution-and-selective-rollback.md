# Reviewed hunks and safe rollback

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The initial tree was clean, and all original Gemini code hashes match entry bytes. Every current publication candidate has an explicit reason and hash in changed-files.json. The 121-file entry commit is retained; old report claims and unsafe broad rollback prose remain historical, with a supersession notice pointing here. No entire Studio/docs directory is selected for removal.

The new reverse patch covers only attributable Codex tracked hunks. git apply --check --reverse is a dry-run, and its result is recorded; no reverse application is authorized by this document. New files are separately hashed rather than implicitly deleted. Test-generated reporting outputs, raw traces, user media, environment files and ignored caches are excluded. Actual rollback still needs an explicit affected-file/owner decision.

Evidence:

- [changed-files.json](evidence/changed-files.json)
- [safe-rollback.json](evidence/safe-rollback.json)
- [baseline.json](evidence/baseline.json)

[Report index](README.md).
