# Settings, security and data

Settings continue to use the same validated invitation payload/revision as Studio. Existing privacy-change confirmation, owner-only access settings, conflict recovery, private unsaved export and canonical date/venue fields are retained. Added guidance explains this ownership and the need to save/reload between editors. Both language completion counts are visible; comprehensive wording navigation belongs to Studio.

The only production backend change is the additive program `iconKey: none` allowlist entry. Payment reconciliation, subscriptions, gift balances/currencies, tokens, roles, media ownership and existing design/locale policies are unchanged. No Flyway file is modified and no production migration is executed.

The new HTTP/MySQL journey checks rich program/map/monogram/family persistence, 409 retry protection, owner-downgrade collaborator rejection, cross-event rejection, public suppression of Premium designs, stable access identity and private-source recovery. Existing tests cover Free/Basic, expired Premium, stale old clients, concurrent locales, publication authority and revoked membership. SVG export never accepts uploaded executable SVG or external paint references; image signatures remain validated through existing upload infrastructure.

The opt-in integration guard adds only `127.0.0.1:3420/phase12_disposable`, retaining the exact old task-owned test address. The native MySQL instance lives entirely under ignored `.cache/phase12`, binds loopback and uses a private generated password. No existing MySQL/Redis/container service is restarted. Redis absence uses the existing database fallback in tests.

`git ls-files backups` confirms the historical guest-data dump is not tracked; `/backups/*.sql` remains ignored. No dump is read into evidence or shipped. The three exact fictitious-fixture Gitleaks fingerprints remain unchanged. Current-tree and commit-range scan evidence is recorded in the release receipt; no history rewrite or claim that inherited history is exposure-free is made.
