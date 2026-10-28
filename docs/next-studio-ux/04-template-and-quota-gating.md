# Template identity, offers and quota UX

Royal Garden remains the stable code `royal-garden-cinematic`. Public catalog numeric IDs are retained separately from stable renderer codes. Its current Premium-inclusion configuration is not an invented individual checkout offer. Other Active templates retain their renderer mapping; drafts/inactive records stay excluded from public selection.

## Owner-scoped template access

The Studio previously checked `/me/templates/{id}/access` for a collaborator, which asks about the actor's purchase. The new protected event-scoped route checks `MANAGE_INVITATION` first, resolves an ACTIVE numeric template, then checks the event owner's purchase/package. Its response exposes only template ID and a boolean. It never exposes the owner's purchase or payment record.

Owners keep the existing personal access route. The chooser's fresh catalog/renderer/event/language checks and explicit replacement confirmation remain. Failed access or cancellation preserves the current design and event/media data. Individual purchase is offered only with backend `checkoutEligible`, amount and currency; package recommendations come from the public server projection. Preview remains separate and does not imply selectable/free access.

## Dynamic offers

`eligiblePlans` requires purchasable public records, valid backend IDs, explicit amount/currency, the requested exact feature and sufficient resource capacity. It excludes the current plan and capacities below existing verified usage. This matters here: configured BASIC guest capacity is below FREE's 20 records. No “paid is better” assumption is safe.

Null limits mean unlimited; zero means zero. A plan already containing the feature results in recheck/support guidance rather than another purchase recommendation. Catalog/current-plan failure exposes Retry without made-up offers. `/app/packages` accepts a validated internal return route and validated feature/resource keys; the originating Studio values remain mounted until deliberate navigation.

## Units and privacy

| Resource | Scope and source |
| --- | --- |
| Invitations | Account count from existing current-entitlements API |
| Guest records | Account count from that API; owner only |
| Guest records per event | Actual DB count in authorized event access |
| Team members | Existing capacity check's exact count/limit on rejection; a progress meter appears only if a verified response supplies usage |
| Attendees / seats | Existing attendance/seating domain; never substituted for guest-record usage |

`PACKAGE_LIMIT_REACHED.details` carries resource, scope, limit, used and requested. Event access includes only this event's guest quota, not other events' counts. Guest, import, event-creation and team entry points retain entered values and use these exact reasons. The UI does not synthesize quota usage from paginated guest rows. Missing usage remains unknown, rather than zero.

Ordinary invitation QR, personalized guest QR, ticket QR, check-in and gift KHQR remain distinct. No new frontend blanket Free restriction was added.

The user's subsequent guest-screen feedback explicitly removes the two visible quota panels and the count-definition paragraph. Their removal changes presentation only; machine-readable server quota enforcement and contextual rejection handling remain.

Final read-only local catalog verification finds Royal Garden at numeric backend ID 14, stable code `royal-garden-cinematic`, ACTIVE, Premium, wedding, KH/EN/BOTH. The explicit featured-code configuration includes it. Its zero standalone price is not a free offer: the server reports `checkoutEligible=false` and `PRODUCT_POLICY_REVIEW_REQUIRED`. Eligible activated owner benefits still apply. No unapproved individual price was invented, and no template/package record was changed in this phase. Production database state is unverified.
