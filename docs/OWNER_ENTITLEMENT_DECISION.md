# Owner entitlement decision — PAY-002 / SEC-003

Status: **OWNER_DECISION_REQUIRED**. Phase 3 leaves `ENFORCE_PACKAGE_POLICY=false`, `FREE_PACKAGE_CODE` blank and the global gallery cap disabled. No commercial restrictions or prices were introduced.

## Evidence and package baseline

The isolated fresh MySQL 8.0.39 catalog on 2026-10-03, after the complete migration chain and Hibernate validation, contains the following values. This is migration seed evidence, **not an inventory of a deployed or existing customer database**. Admin edits and existing databases may differ.

| Stored plan | Invitations | Guests/account | Guests/invitation | Team members | Seed price |
| --- | ---: | ---: | ---: | ---: | --- |
| FREE | No final-chain row | — | — | — | No approved free plan |
| BASIC | 1 | 40 | 40 | 1 | USD 0.01 |
| PRO | 20 | 2,000 | 500 | 5 | USD 199.00 |
| PREMIUM | 999 | 99,999 | 5,000 | 25 | USD 499.00 |

V19 renamed the former FREE row to BASIC and ENTERPRISE to PREMIUM. These historical values are retained, not proposed pricing. None of the final seed plans is zero-price. Enabling strict policy without an approved ACTIVE zero-price `FREE_PACKAGE_CODE` produces `ENTITLEMENT_POLICY_UNCONFIGURED` for an account without an eligible paid plan; BASIC cannot serve as that free plan at its current price.

## Capability decision matrix

The FREE column represents the unresolved free product tier. BASIC/PRO/PREMIUM columns describe existing stored flags/limits, not promises of enforcement. “Strict” means only when the owner explicitly enables package policy. Compatibility mode retains ownership, authentication, public-access and trusted-payment checks.

| Capability | FREE | BASIC seed | PRO seed | PREMIUM seed | Current enforcement / compatibility | Technical support | Owner decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Invitations | Decide | 1 | 20 | 999 | Strict creation checks nondeleted invitation count under owner lock; compatibility has no package creation cap | Implemented and MySQL race tested | Approve limits, scope and expired-plan treatment |
| Guests/invitation | Decide | 40 | 500 | 5,000 | Strict owner creation/import and public RSVP share transactional quota; compatibility unrestricted by plan | Implemented and race tested | Approve per-event limits and handling existing guests |
| Guests/account | Decide | 40 | 2,000 | 99,999 | Strict account count under owner lock; reads/history remain usable | Implemented | Approve aggregate count semantics |
| Free templates | Available | Available | Available | Available | Free template access remains available, independent of package enforcement | Implemented | Approve free catalog |
| Premium templates | Decide | Flag false | Flag true | Flag true | Always requires independently purchased access or ACTIVE/PAID/started/unexpired subscription with this flag; compatibility does not bypass purchase | Implemented | Approve paid catalog and any exclusions |
| Invitation QR | Decide | Flag true | Flag true | Flag true | Feature checked in strict mode; compatibility allows | Implemented | Approve free eligibility |
| Seating | Decide | Flag false | Flag true | Flag true | Mutation feature checked in strict mode; compatibility allows | Implemented | Approve free eligibility and historical read access |
| QR check-in | Decide | Flag false | Flag true | Flag true | Scan/manual/undo mutations check strict feature; server remains authority in either mode | Implemented | Approve access after plan expiration |
| Organizations/team | Decide | Flag false / 1 | Flag true / 5 | Flag true / 25 | Commercial team flag/cap not wired to organization routes; existing membership/owner checks remain | Central helper exists; route integration pending | Per-account versus per-organization capacity, roles and invitation ownership |
| Basic reports | Decide | No separate flag | No separate flag | No separate flag | Existing authenticated owner/admin report access preserved | Implemented | Define baseline report set |
| Advanced reports | Decide | Flag false | Flag true | Flag true | Commercial advanced-analytics flag not wired to report routes | Flag supported; route integration pending | Define advanced report boundaries; keep exports/history available |
| Branding removal | Decide | Flag false | Flag true | Flag true | Commercial branding flag not wired | Flag supported; presentation integration pending | Define branding elements, preview/public/export scope |
| Media/gallery | Decide | No package field | No package field | No package field | Type/signature/size checks active; 5-file request cap; global `UPLOAD_MAX_GALLERY_FILES_PER_INVITATION=0` disables cumulative count cap | Positive configured gallery cap enforced under invitation lock; race tested | Approve count/storage scope, values and oversized historical galleries |
| AI | Decide | Flag false | Flag true | Flag true | Paid provider disabled; truthful local fallback; package AI flag not wired to assistant route | Adapter boundary and flag available; no real provider implementation | Approve provider, eligibility, usage/output/cost budget before integration |

Null numeric quota means unlimited, zero means no new additions, and negative values fail with configuration review. An inactive/hidden sales package does not silently revoke an already-paid subscription. Pending, unpaid, inactive, future-start or expired subscriptions cannot grant premium-template access. No guessed template purchases or provider confirmations are accepted.

## Media technical closure and remaining policy

`FileUploadValidator` and `MediaService` retain extension/MIME/signature validation, per-file sizes (images 5 MiB, music 15 MiB, video 50 MiB), framework request limits and configured request `maxFiles`. A gallery mutation locks the invitation before counting stored gallery entries; concurrent mutations cannot bypass an enabled cumulative cap. Storage replacement/rollback compensation remains covered. SEC-003 stays PARTIAL because the desired production/product quota is unresolved. A request cap of five is not a total gallery or storage quota.

## Owner approval record

Approve an explicit FREE/BASIC/PRO/PREMIUM matrix, catalog and paid-access rules; quota scope and numbers; organization roles/capacity; reporting/branding/AI boundaries; media count/storage policy; and behavior after expiry. Record approver, date and rollout/rollback plan. Then implement unwired approved dimensions and verify an isolated strict-mode matrix before changing runtime configuration. Current compatibility defaults remain until that approval.
