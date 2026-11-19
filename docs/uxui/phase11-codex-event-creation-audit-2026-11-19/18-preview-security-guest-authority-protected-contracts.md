# 18 — preview security guest authority protected contracts

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Protected-source comparison covers backend, all 48 Flyway migrations, payment/Telegram areas, template/registry/renderers, marketing and public RSVP. Changed protected paths: `[]`. No price, entitlement, guest-token, nonce/origin/session, publication, currency or unknown-JSON authority was moved into the browser.

C10-001's independent guest RSVP state lifetime remains intact. The full user suite executes the existing negative privacy tests; the renderer regression covers ten families while respecting planned skips. Private draft account races received new tests instead of weakening guest/public behavior.

API wrappers only forward optional request cancellation; existing endpoints, payload authority, upload progress argument and local-draft behavior remain compatible. The real Axios credential race was repaired in onboarding's request lifetime, without altering shared authentication headers or server auth rules.

Inherited C08-013 remains a backend identity/security policy issue: BCrypt rejects beyond 72 UTF-8 bytes. No frontend truncation or invented migration was used. [Preservation hashes](evidence/source-operations-and-sha.json), [complete ledger](evidence/historical-57-plus-new-ledger.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
