# 16 — Draft Isolation, Legacy Ownerless Drafts, and JSON Roundtrips

## 1. Account Isolation
- `getDraft(id, ownerUserId)` strictly checks owner identity; drafts belonging to User A cannot be accessed or overwritten by User B.
- Legacy ownerless drafts (`ownerUserId == null`) are protected and never auto-assigned silently to foreign logged-in accounts.

## 2. Unknown JSON Preservation
- `contentPayload` spreads `...safeJson(invitation?.contentJson)` at the base.
- `designPayload` spreads `...safeJson(invitation?.designJson)` at the base.
- Custom nested objects, vendor metadata, and unknown array items survive edit->save->reload roundtrip.

See [Unknown JSON Roundtrip](evidence/unknown-json-roundtrip.json) and [Legacy Drafts](evidence/legacy-ownerless-draft-recovery.json).
