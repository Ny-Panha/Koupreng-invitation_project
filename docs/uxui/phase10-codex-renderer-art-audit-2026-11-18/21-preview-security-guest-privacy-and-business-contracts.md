# Preview security guest privacy and business contracts

Audit started 18 November 2026; continued 19 November 2026 (Asia/Bangkok). Independent local fixture/source evidence only.

C10-001 is a real guest privacy repair: a token change remounts the guest form’s state boundary; denied lookup cannot resurrect cached private details; a submission completing after that authority unmounts cannot change the new URL, cache or receipt. Eight new tests prove three negative privacy cases and 401/403/409/429/500 failure/retry behavior. Existing language, saved-response and canonical submission tests remain.

Demo renderer forms are not API submissions. Their feedback explicitly says nothing is sent; injected PublicRsvpForm still owns slug/token/access identity and only confirms after its service acknowledgement. No backend endpoint, price, payment status, entitlement or hash algorithm changed.

The preview helper checks exact origin, source window, nonce and allowed message shape. Existing negative unit tests cover wrong origin/source/session, prototype-like keys, malformed arrays/fields, unknown types and top-level published-route inactivity. New browser injections target a real embedded `/templates/.../demo` channel; the wrong `/preview` Boilerplate fixture was corrected because that local-only lookup route has no Boilerplate data entry. [Preview outcomes](evidence/preview-negative-tests.json).

Same-origin allow-scripts + allow-same-origin is not isolation against arbitrary executable child code. These frames run the trusted application renderer; the nonce/source/origin protocol is the live editing authority, not a legal sandbox guarantee. No sandbox weakening or raw executable template system was added. Untrusted text is rendered as JSX; URL/media and serialization contracts retain their existing validators. Unknown JSON roundtrip and entitlement tests remain in full suites; no universal security certificate is claimed.

Protected backend/Flyway/payment/worker/manifests stay unchanged by Codex. C08-013 remains with identity/security, including old-hash compatibility/API tests and Khmer UTF8 bounds. No arbitrary frontend 72-character limit was added.
