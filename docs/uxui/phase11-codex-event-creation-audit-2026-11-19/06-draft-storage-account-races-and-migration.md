# 06 — draft storage account races and migration

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

The deployed `koupreng.onboarding.<user.id>` key was retained. No nonexistent underscore-key migration was invented. Session storage is a tab-session convenience, not cloud or guaranteed browser-restart persistence; there is no wizard TTL contract.

A keyed account/token/status lifetime replaces post-render identity resets. Immediate auth-store subscription cancels owned network operations, and late mocked promises are independently ignored. A real Axios adapter proved the original queued-request credential race before cancellation fixed it. The no-undefined-key, account switch, stale grant, malformed storage and denied storage cases are executable tests.

Request identity and immutable submitted payload are checkpointed synchronously before POST; acknowledged ID is checkpointed before upload. Photo bytes are never serialized. Reload requires reselecting the File. When storage is blocked, UI explicitly states that refresh recovery is unavailable; this audit does not promise duplicate suppression after losing all local identity.

[Draft state/race ledger](evidence/draft-lifecycle-races.json). Wider AUTH/cookie/provider/device gates keep their original dispositions.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
