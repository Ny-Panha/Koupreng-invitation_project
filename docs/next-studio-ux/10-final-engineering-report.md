# Engineering delivery

The landing and event-management experience now share a clean cream/forest/brass visual system and a matching dark palette. My Events and event overview have clearer hierarchy; all requested management tools receive consistent surfaces, controls, responsive spacing and short reduced-motion-aware transitions. Khmer/English and light/dark controls are visible in the navbar, Studio and preview controls. Theme and interface language changes retain authored Studio values.

The guest count explanation and both quota panels marked by the user are removed. Nonessential Studio guidance is reduced. Important validation, permissions, publication and recovery information remains available.

## Feedback and authorization

The existing React modal/toast infrastructure now has one queued feedback facade, cancel-focused confirmations, persistent actionable errors, duplicate protection and contextual subscription dialogs. No popup library or new runtime dependency was installed. Deliberate saves show success only after server confirmation; autosave remains quiet.

Feature decisions distinguish authentication, permission, capability, verified owner benefits, quota, payment state and transport/validation errors. Offers are loaded from the current server package catalog, filtered by the exact required benefit/capacity and rendered with server prices/currencies. A collaborator cannot unlock an owner's event by buying a personal plan. Pending/review payments, platform Admin status and browser claims do not activate benefits.

Backend changes are additive DTO/error metadata and protected owner-scoped template-access lookup. The existing enforcement and reconciliation policies remain. An open Studio retains a recovery draft when authority is revoked, while disabling mutation. Unknown stable template codes now fail visibly instead of inheriting the default design renderer; explicit Admin presets still work.

## Catalog and data state

Starting main `64ef06fde54f6985faea609b69e485652e80bfa1` already contains the previous Royal Garden catalog repair. This phase verifies it rather than creating a duplicate record. Real local public catalog: Royal Garden ID 14, `royal-garden-cinematic`, ACTIVE, Premium, wedding, KH/EN/BOTH; explicitly listed in the featured-code configuration. Standalone checkout is blocked by the existing zero-price product-policy review. No unapproved price was invented. Local database visibility is verified; production database state is unverified.

There are no migrations or live application-record mutations in this phase. No payment verification bypass, template-art replacement, production deployment, container restart or DNS change occurred. Security/integrity writes use owned disposable MySQL schemas.

## Verification and evidence

The final current Chromium gate passes 111 tests with 29 intentional skips, including all requested management screens, preference/draft retention, accessibility, four actual pixel comparisons and Royal Garden V3.2 flows. Supplementary Firefox/WebKit, operations and real-catalog checks bring the selected final browser total to 144 passed, 29 skips and zero failures. User unit tests pass 1,144 cases, Admin 121 and worker 74. The ordinary backend reports 649 with zero failures/errors and 71 skips; separate real disposable MySQL runs pass 18 security and 41 integrity cases. Lint, builds, architecture/OpenAPI and repository instruction checks pass. Exact commands, supplementary browser results and scope distinctions are in [the QA report](07-qa-playwright-results.md).

Reviewed screenshots and limitations are linked in [visual verification](08-visual-regression.md), [project-wide design](12-project-wide-design.md) and [known limitations](09-known-limitations.md). The historical 930-case inventory is not fully green and is not represented as such. Browser fixtures and synthetic payments are clearly separated from actual database enforcement.

## Change map

- Backend: entitlement projection/denial details, immutable DTOs, controller/service authorization and real MySQL regression harness/tests; reviewed OpenAPI contract.
- Shared frontend: feedback/access components, entitlement refresh, API error metadata, modal/toast behavior, appearance/preferences and semantic theme stylesheet.
- Studio/event modules: fields/toolbars, template confirmation and renderer guard, retained drafts/recovery, contextual locks, simplified copy, dashboard/guest presentation and local color-role adoption.
- Tests/evidence: component/unit, current browser flows, four Windows Chromium pixel baselines, reviewed before/after and responsive light/dark captures, sanitized local business-policy/catalog evidence.

Work remains in the original directory on `main`. Pre-existing compiled test changes and unrelated live screenshots are excluded. Generated historical/Admin test artifacts are excluded. The immutable remote `origin/main` SHA is delivered in the completion message after a normal push and remote-head comparison; [the push receipt](11-main-push-receipt.md) describes the release identification.
