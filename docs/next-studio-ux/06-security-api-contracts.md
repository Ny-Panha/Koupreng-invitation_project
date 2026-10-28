# Security and API contracts

## Additive public package projection

`GET /api/v1/public/packages` adds `eligibleFeatures: string[]`. The catalog's existing visibility/activity/payment-resolution rules still decide which records are purchasable. Projection calls the same feature function as enforcement. This response describes an offer; it never grants access or activates a subscription.

## Protected event responses

`GET /api/v1/invitations/{id}/access` adds `quotas.guestsPerInvitation = {limit, used, remaining}` after VIEW_EVENT authorization. No account-wide usage is exposed through this event route.

`GET /api/v1/invitations/{id}/templates/{templateId}/access` requires MANAGE_INVITATION before template lookup, resolves ACTIVE status, checks the event owner's purchase/package, and returns `{templateId, hasAccess}` with `Cache-Control: no-store`. Unrelated/unaccepted/expired collaborator access is denied even if the actor bought Premium. A viewer cannot probe template existence through this route.

## Error metadata

The existing body/status/code/message contract remains. Optional `details` contains only safe context:

```json
{"code":"PACKAGE_FEATURE_REQUIRED","details":{"feature":"PRE_WEDDING_VIDEO"}}
```

```json
{"code":"PACKAGE_LIMIT_REACHED","details":{"resource":"guestsPerInvitation","scope":"EVENT","limit":20,"used":20,"requested":1}}
```

Template denials additionally identify the backend numeric template ID. No tokens, guest names, merchant evidence or purchase records are added. Generic 403 remains permission help. 401 preserves recovery/re-auth guidance; 400/422 validation, 409 conflict, 429 rate limit and transport failures retain distinct states.

## Preserved invariants

- Controllers call application services and immutable DTOs. ArchUnit remains green.
- Owner locks still serialize capacity-affecting operations. Null unlimited and zero limits retain their meaning.
- Event ownership/membership precedes resource reads and feature checks. Platform role does not become paid access.
- Existing server-owned prices/currencies, order PENDING state, HMAC/transaction provenance and trusted reconciliation are unchanged.
- Purchased immutable snapshots remain independent of later catalog edits; expiry/downgrade and explicit demo grants retain existing semantics.
- Safe return routes allow only internal app/template destinations; external/protocol-relative/login/traversal inputs are rejected.
- The facade renders text through React. No untrusted HTML injection or new secret storage is introduced.

The real test harness creates a random strict `koupreng_studio_<32 hex>` schema only on the existing loopback MySQL server. CREATE must succeed before it owns a DROP target. It removes that schema in `finally`, keeps credentials private and refuses stale Surefire evidence after a compilation failure. Migration tests create and remove their own independently guarded schemas. No live migration/payment/deployment was performed.
