# Preservation, security and rollback risks

This audit changes documentation and an isolated inventory generator only. Preserve `main` application code, applied Flyway migration files, manifests/lockfiles, media and CI/deployment configuration. Check `git diff --stat` before committing and stage only this dated audit directory. The browser runner wrote local builds/screenshots under `output/playwright/`; do not stage private traces or large generated assets.

| Contract | Current source boundary / consequence |
|---|---|
| Owner/admin access | `RequireAuth`, `RequireAdmin`, event authorization and backend roles govern access; visual CTA presence must not expand privileges. |
| Entitlement and money | Backend payment confirmation and evidence govern ownership; client return/receipt screens cannot unlock premium templates. Preserve exact order reference, amount/currency, replay prevention and USD/KHR separation. |
| Draft serialization | Creator/admin Studio must preserve unknown JSON fields, template IDs/aliases, revision conflicts and unsaved edits through preview/save/reload. |
| Preview trust | Keep iframe origin/session protocol and rendering isolation; test source/destination rather than suppressing failures. |
| Guest privacy | Published/private/password/token access, RSVP deadline and wishes moderation policy are server-owned. Avoid real guest data in audit artifacts. |
| Media | MIME/signature/size validation and owner scoping remain authoritative; HEIC or larger uploads require explicit design. |
| Migration/rollback | Existing 48 migration files are forward-only history. This audit adds no schema; rollback is reverting these audit documents alone. Later phases need separate data/compatibility plans. |

No production configuration, live ABA transaction, Telegram message, external invitation, subscription grant, mail or destructive data operation was used. Additional static source review and staging/physical verification are necessary before any security or release certification.
