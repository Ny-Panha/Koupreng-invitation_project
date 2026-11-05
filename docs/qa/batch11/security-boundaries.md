# Batch 11 security boundaries

These are regression results within the tested fixtures, not a complete platform security certification. See [test results](test-results.md) for commands, failures and environment.

| Boundary | Evidence and result |
|---|---|
| Customer authentication | All 84 declared authenticated patterns redirect an anonymous browser to login with the intended route. Cookie/local-storage mode is exercised through actual login and reload in the live journey |
| Administrative UI | All 22 guarded admin patterns reject anonymous access. USER, STAFF, SUPERADMIN and invalid roles cannot mount the fullscreen editor or issue its admin requests. Expired admin tokens and customer-app storage do not establish an admin session |
| Administrative backend | Full backend security tests and real MySQL reporting checks reject a normal owner with 403. Database-backed authorities remain authoritative; no role, permission or entitlement implementation was broadened |
| Event/team scope | Existing real MySQL collaboration tests cover invitation consent, viewer/designer/check-in roles, removed/expired grants, ownership quotas and stale saves. The Batch 11 journey rejects an unrelated actor's scan |
| Guest identity | Personalized server tokens remain invitation scoped. RSVP revision keeps one linked response. Guest tokens are redacted from diagnostic query strings and known public guest-token path segments |
| Financial integrity | Pending return pages ignore browser success flags. An unverified receipt is rejected. Real MySQL payment evidence and subscription/entitlement tests cover trusted confirmation, replay/concurrency and frozen benefits. No actual settlement or provider transaction was performed |
| Redirect safety | Existing safe-auth redirect tests remain in the passing suite. Workspace redirects forward an explicit operational allowlist and plain anchors; credentials are not carried into unrelated workspaces |
| Diagnostic privacy | Case-insensitive/encoded key tests, fully encoded URLs, nested objects/arrays/numbers, structured API-key headers, cookie/Bearer values, payment/provider references, session names/notes and free-text error fields are covered. Useful order codes, numeric guest IDs, durations and benign filters remain visible |
| Export injection | Existing CSV/XLSX/report tests remain active. Diagnostic CSV uses the shared formula-safe cell encoder after recursive privacy filtering. Backend report exports retain their existing encoders and authorization |
| Audit/check-in truth | Check-in responses, repeat scans, summaries, reversal and administrative report counts come from persisted backend state. API monitor duplicate frames do not increment totals twice; aborted old connections cannot overwrite reconnection state |

## Confirmed privacy defects repaired

The former query regex omitted encoded/mixed guest-token names and payment references. Metadata handling left non-string secret containers and free-text strings intact. QA export sanitized only `path`, leaving session notes/names and other diagnostic strings untouched. The revised filter normalizes keys, scrubs nested values and known token-bearing public URL paths, and filters the entire whitelisted export payload before JSON/CSV serialization.

This filter is intentionally bounded: it is not a general data-loss-prevention system. Arbitrary unlabelled personal information, unknown provider-specific credential syntax, opaque encoded blobs and unrecognized token URL structures require additional controls. Browser and server logging policy must still avoid collecting secrets in the first place. Sanitized diagnostics do not authorize wider access to audit or payment records.

## Preserved invariants

No production secrets, schema migrations, payment verification services, invitation renderers, authentication stacks, roles or access policies were replaced. Test-only nonfinancial grants are clearly identified as disposable fixtures. No live notifications were dispatched. Audit records and historical delivery statuses were not rewritten.
