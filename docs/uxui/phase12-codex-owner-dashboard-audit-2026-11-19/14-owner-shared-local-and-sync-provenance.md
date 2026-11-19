# 14 — owner shared local and sync provenance

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Server identity is a valid numeric backend ID, while unsaved changes, local provenance and sharing are separate facts. Shared cards do not expose owner destructive/edit actions. Local/non-numeric records use the supported legacy editor path; valid backend IDs use the verified workspace. A partial save retains original request UUID and local payload through existing Phase 11 mechanisms. No local badge grants owner/server authority.

Authenticated list/sync now requires actual ownerUserId proof. Ownerless legacy records remain unchanged in browser storage and are excluded from automatic claim/upload to the account that happens to open Events. This is a privacy boundary for Events, not a new certification of every legacy Studio/storage consumer. That broader authored-draft recovery/ownership review belongs in the explicit Phase 13 handoff.

The legacy storage implementation itself was not rewritten or erased. [Account evidence](evidence/account-event-races.json), [negative tests](evidence/negative-tests.json) and full current unit suites document the preserved/repaired behavior. Ambiguous stale server/local combinations remain a bounded partial gate rather than universal provenance certification.

[Report index](README.md).
