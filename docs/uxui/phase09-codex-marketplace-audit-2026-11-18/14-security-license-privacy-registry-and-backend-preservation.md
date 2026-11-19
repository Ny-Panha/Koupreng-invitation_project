# Chapter 14 — Security, License, Privacy, Registry & Backend Preservation

## 1. Security & Authorization Invariants

- **Safe Continuation:** Unauthenticated users accessing checkout or template creation receive sanitized `next` redirect parameters. External redirect URLs (e.g. `https://attacker.site`) are discarded.
- **Cross-Account Isolation:** Session switching invalidates cached paid template entitlements, preventing User B from inheriting User A's purchased designs.
- **Backend Preservation:** 48 Flyway migrations and backend controllers remain untouched. Open gate `C08-013` (BCrypt 72-byte ceiling) preserved open.

## 2. Asset Licensing

- **Fonts:** `Moul` and `Kantumruy Pro` licensed under SIL Open Font License.
- **Icons:** `lucide-react` licensed under ISC License.
- **Template Media:** Development atelier presets retained; commercial production licensing gate preserved as `REVIEW REQUIRED`.
