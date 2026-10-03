# Phase 2 secret rotation required

REPO-001 remains **PARTIAL: manual owner action required**. Removing a credential from tracked files does not revoke it. No credential was changed, no provider was contacted, and no Git history was rewritten during this implementation.

## Verified exposure and current reference flags

The redacted Phase 1 full-history scan found 32 matches: one private-key material match, 21 historical secret candidates, five test-fixture candidates and five placeholder candidates. These are scanner matches, not 32 verified active credentials. The private-key match is in historical `credential_info.txt`; Telegram token candidates and signing/internal-secret candidates appear in historical environment examples. Other historical log/document matches still require owner classification.

A private exact comparison on 2026-10-02 inspected eight extractable historical candidates against current tracked text files under 2 MB and existing local root/app runtime environment files. It emitted only metadata and Boolean flags:

| Category | Same historical value in current tracked files | Same historical value in local runtime configuration | Required owner action |
| --- | --- | --- | --- |
| JWT signing secret | false | **true** | Replace signing material and invalidate existing sessions/tokens |
| Telegram bot token | false | **true** | Revoke through the owning BotFather account and replace |
| Historical internal payment secret candidates | false | false | Confirm earlier rotation; rotate if provenance is uncertain |
| Historical private-key material | false | false | Identify the issuer/account, revoke that key and replace if still trusted |

The runtime comparison concerns the existing untracked local `.env`. No values or fingerprints are included here. A false exact-match flag does not prove revocation or prove that a different exposed credential is absent. Fourteen remaining historical candidates were not extracted by this narrow comparison. External secret stores, deployed services, CI secrets, caches, forks, clones and provider-side validity were not inspected.

## Manual owner checklist

1. In the Telegram bot owner's BotFather account, revoke the exposed token and generate a new token. Store it in local untracked environment configuration or the appropriate secret store. Inspect bot administrators and webhook configuration.
2. Generate new JWT signing material. Update only the relevant private configuration, restart affected local services and invalidate sessions/tokens signed using the previous material. Coordinate any other consumer before changing a shared signing secret.
3. Identify the historical private key's provider and account without copying the key into tickets or chat. Revoke the corresponding key at its issuer, replace any remaining consumers and review access logs where available.
4. Review historical internal payment, webhook, database and OAuth/API-key candidates. Confirm previous rotations or rotate them. Keep the bot and backend internal payment secret synchronized; register the webhook with the matching new webhook secret when the owner chooses to operate it.
5. Verify the old credentials are rejected using provider/admin controls and isolated checks. Review payment-confirmation audit records and authentication activity for misuse. Record completion by category, date and owner, with no secret values.
6. Treat history cleanup as a separate owner-coordinated action after revocation. Review the existing [incident-response procedure](security/credential-incident-response.md). No force push, remote ref update or history rewrite is authorized by this implementation task.

## Evidence and completion condition

The audit's external evidence directory contains redacted history metadata and `logs/current-secret-reference-flags.json`. Do not commit raw scanner matches, secret-bearing environment files or replacement values. A current-tree scanner pass proves only that its rules found no tracked matches at that snapshot.

Close REPO-001 only after the owner records credential revocation/replacement and verifies affected consumers. This document and future scanning reduce recurrence; they do not complete rotation.

## Phase 3 runtime preparation (2026-10-03)

Only known-variable presence/nonempty/nonplaceholder Boolean flags were emitted while inspecting existing private local environment files. No values, fingerprints, raw matches or replacement credentials were recorded. “Configured” below means a nonempty value in those files, not that a running process loaded it, that it is valid, or that it has been rotated. External secret stores and provider accounts remain uninspected.

| Redacted category | Application references / local configuration flag | Expected environment variable | Owner/external action | Post-rotation validation |
| --- | --- | --- | --- | --- |
| JWT signing material | Bound; configured **true**; Phase 2 historical exact-match flag true | `JWT_SECRET` | Owner replaces signing material and coordinates restart/session invalidation | New controlled token accepted; tokens signed with old material rejected; logout/reset token-version invalidation still passes |
| Telegram bot token | Bound; configured **true**; Phase 2 historical exact-match flag true | `TELEGRAM_BOT_TOKEN` | Owner revokes/reissues through BotFather and updates backend/bot consumers | Owner confirms old token revoked; controlled sandbox login/webhook registration with replacement works; subject binding remains enforced |
| Telegram webhook secret | Bound; configured **true** | `TELEGRAM_WEBHOOK_SECRET` | Owner updates private config and provider webhook registration together | Missing/wrong/old header rejected; intended replacement header accepted with allowlisted controlled update; replay/idempotency tests pass |
| Internal payment secret | Bound; configured **true** | `ADMIN_PAYMENT_SECRET` in backend and bot | Owner synchronizes replacement across consumers and reviews confirmation audit history | Missing/wrong/old `X-ADMIN-PAYMENT-SECRET` rejected; replacement accepted on a controlled fixture; public detection cannot settle payment |
| OAuth credentials | Public client-ID references configured **true**; no OAuth client-secret binding in current ID-token verification flow | `GOOGLE_CLIENT_IDS` (fallback `VITE_GOOGLE_CLIENT_ID`), `TELEGRAM_CLIENT_ID` | Owner reviews registrations/origins; revoke exposed provider secrets if any exist outside this application's current bindings | Configured audience/issuer/signature and provider-subject verified; wrong audience rejected; existing account requires authenticated linking. Client IDs are identifiers, not secret rotation proof |
| SMTP credentials | Bound; username/password nonempty **false** | `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`; transport host/port and `CONTACT_RECIPIENT` also required | Owner supplies/replaces transport credentials and sender/recipient settings | Authorized sandbox SMTP accepts intended contact; bad auth/unavailable transport fails truthfully and preserves entries; acceptance is not inbox delivery |
| Cloudinary/provider credentials | Bound; API key/secret nonempty **false**; local storage remains available | `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`, `STORAGE_PROVIDER` | Owner provisions/replaces provider credentials and permissions | Authorized sandbox upload/replace/delete succeeds; failed replacement preserves original; denied credential cannot mutate storage |
| ABA/provider credentials | Current static-link integration has no merchant secret/API-key binding | `PAYMENT_PROVIDER_MODE`, `ABA_PAYWAY_STATIC_LINK`, `ABA_SUBSCRIPTION_BASIC_LINK`, `ABA_SUBSCRIPTION_PRO_LINK`, `ABA_SUBSCRIPTION_PREMIUM_LINK` | Owner verifies account/link ownership and settlement workflow; future API-secret configuration requires an approved adapter | Authorized provider sandbox verifies amount/currency/order reconciliation, delayed duplicate confirmations and rejected forged notifications; links alone prove no settlement |
| Private keys | No external private-key-file binding identified; JWT currently symmetric | No current private-key environment variable | Owner identifies historical key issuer and revokes/replaces wherever trusted; do not add a guessed application binding | Issuer rejects old key; affected consumer accepts replacement through its documented configuration |
| Database credentials | Bound; local password configured **true** | `DB_USERNAME`, `DB_PASSWORD` | Owner rotates if exposed and updates all intended consumers; disposable test credentials are separate | Application reconnects with least intended permissions; old credentials rejected; Flyway/Hibernate validation passes on an isolated upgrade copy |

No automatic rotations, provider requests, credential-bearing output, history edits or customer database mutations occurred in Phase 3. Nonplaceholder flags do not assess strength or authenticity. The earlier historical exposure remains unresolved until the owner records category-level revocation and verification.
