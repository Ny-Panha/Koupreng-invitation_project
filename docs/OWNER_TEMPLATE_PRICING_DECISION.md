# Owner template pricing decision — PAY-003

Status: **OWNER_DECISION_REQUIRED**. Preserve the authorized legacy Garden/static offer. No new prices, payment links or real payments were created.

## Verified inventory scope

The table is a read-only inventory of a separately migrated, fresh isolated MySQL 8.0.39 database on 2026-10-03. It is not a claim about deployed/customer catalog rows. Current `templates` stores `code`, not a distinct `slug` column; the public `/templates/slug/{code}` lookup uses that code.

| ID | Code / slug lookup | Status | Premium | Display price | Actual checkout eligibility | Provider/link configuration | Purchase requirement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `royal-khmer-wedding` | INACTIVE | false | USD 0.00 | No | No approved offer mapping | Inactive catalog; preserve historical references/renderer |
| 2 | `garden-royal-khmer-wedding` | ACTIVE | false | USD 0.00 | Yes: server-owned USD 0.01, `LEGACY_STATIC_OFFER` | Existing static mode; `ABA_PAYWAY_STATIC_LINK`; link/account must be owner verified | Free catalog access retained; optional legacy purchase flow preserved |
| 3 | `khmer-celestial` | ACTIVE | false | USD 0.00 | No: `PRODUCT_POLICY_REVIEW_REQUIRED` | No approved checkout mapping | Free template access; no inferred payment requirement |

**Premium inventory: zero premium rows in this fresh final-chain catalog, active or inactive.** An owner must inventory any admin-created/edited premium rows in the intended runtime database before approval. Frontend demo/renderer metadata is not financial catalog authority. Restored assets do not activate paid offers.

## Current authority

`TemplateCheckoutPolicy` permits only the ACTIVE Garden code (case-insensitive). Its USD 0.01 amount/currency are server-owned, independent of admin display-price edits or premium flags. Public DTOs separately expose `checkoutEligible`, `checkoutAmount`, `checkoutCurrency`, and `checkoutPolicy`; clients consume those fields. Setting another row ACTIVE/premium or editing its price alone cannot authorize checkout. Existing payment retry/idempotency, owner binding, trusted confirmation and purchased access are preserved.

The free Garden catalog entry and optional paid static checkout express an unresolved product choice. Keep both existing authorized behaviors pending approval. Premium access, when configured, requires independently purchased access or an eligible paid package's premium-template flag; compatibility mode does not make premium templates free.

## Owner configuration required

For each intended paid row, provide the exact template ID/code, active/premium status, display price/currency, approved server offer amount/currency, verified provider mode/account/link mapping and package versus individual purchase rule. Confirm whether the legacy Garden offer should stay optional and reconcile marketing copy with that decision. Use `PAYMENT_PROVIDER_MODE`, `ABA_PAYWAY_STATIC_LINK` and package link variables only for their existing supported scopes; package links are not automatic per-template links.

Validate any approved additions on an isolated database and provider sandbox, including forged client amount/status, unauthorized ownership, retries, expiry and delayed confirmation. Register approval date/owner. Real-provider link ownership and settlement remain unverified here. Historical template recovery is governed separately by [PHASE2_TEMPLATE_RECOVERY.md](PHASE2_TEMPLATE_RECOVERY.md); V16 must remain immutable.
