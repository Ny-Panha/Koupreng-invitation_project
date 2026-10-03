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
