# Phase 7 repository audit

Baseline: `0183def5`, including the local blank-Free-code correction. The initial
working tree was clean. Phase 7 is isolated in
`D:/Koupreng-Phase7-worktree`, branch `feat/phase7-guided-collaboration`.
The normal main checkout and its running development database stay separate.
No push, merge, deployment or production schema change is authorized.

## Verified architecture and ownership

React 19 / Vite 8 / Router 7 / Tailwind 4 / Zustand 5 use plain JavaScript;
there is no configured TypeScript gate. Java 25 / Spring Boot 4.0.8 / Spring
Security resource server / JPA / Flyway serve MySQL 8; the Telegram worker uses
Python. ArchUnit checks controller/service/persistence boundaries. The API
contract is `packages/api-contracts/openapi.yaml`. Highest migration is V46.
All V1-V46 SQL files were inventoried and hashed in the external baseline
metadata; subsequent schema changes must append migrations.

The frontend routes are composed in `app/routes/{auth,host,marketing,builder}Routes`.
`EventWorkspace` provides event identity/navigation. `InvitationForm` owns the
existing DTO and content JSON, `useStudioPersistence` serializes saves, and the
same renderer registry/adapters power previews and public invitations. Existing
custom sections coexist with dedicated layouts. Program and story contracts
remain `schedule[]`, `storyChapters[]`, show/enabled flags. Application locale
is distinct from host-authored content language.

`EntitlementService` owns actual benefits/usage; roles, event ownership and
product tiers are separate. Purchased snapshots and duration survive catalog
edits. Browser payment claims remain untrusted; trusted evidence/HMAC and
provider idempotency govern settlement. Admin reports reuse bounded snapshots,
CSV/XLSX/print HTML and export audit. Direct PDF remains unavailable.

Organizations and organization members already exist. Invitations have an
optional organization foreign key, but `EventAccessPolicy` and module access
are deliberately owner-only. Adding an existing email currently activates a
member immediately: this must change to explicit acceptance before expanding
collaboration access. Reuse these entities rather than creating parallel teams.

## Journey inventory and findings

| Journey | Existing implementation / finding | Priority |
| --- | --- | --- |
| Landing, template catalog | Existing artwork, fonts, localized marketing/catalog hooks; preserve | P2 accessibility |
| Login/registration | Existing auth/password validation, server identity and Free evaluator; preserve recent correction | P0 regression |
| Event dashboard/create | Event-scoped workspace, local draft/retry identities and covers | P1 guided entry |
| Studio | Grouped section editor and live iframe, no five-stage guide | P1 |
| Save/reopen | One writer, local draft retention, optional expectedUpdatedAt; UI loses structured 409/401 distinction | P0 |
| Preview | Existing mobile fullscreen/device frame; audit loading recovery and focus rather than replace renderer | P1 |
| Publish/share | Server validation and flush exist; toolbar publishes directly without an explanatory confirmation/checklist | P1 |
| Public invitation/RSVP | Existing renderer, guest tokens and RSVP APIs; preserve artwork/access contracts | P0 regression |
| Guests/import | Inline entry and real CSV/XLSX mapping/receipts work; primary guest fetch is unbounded and summaries mix units easily | P1 |
| QR/check-in/seating | Existing entitlement/owner guards and persisted geometry; no collaborator permissions yet | P0 regression |
| Packages/history | Authoritative current plan and configured prices; guest-record units need explanation; nonrevenue grant history can look pending | P1 |
| Payments | Existing pending/confirmed state machine and fixed-link price guard; no live provider verification | P0 preserve |
| Customer reports | Existing dashboard/RSVP reports; advanced flag lacks a distinct server-protected product capability | P1 |
| Teams | Organization UI exists; event co-management, acceptance and scoped grants incomplete | P0/P1 |
| Settings | Existing event/account controls and venueAddress separation | P0 preserve |
| Admin dashboard | Real summary service, but recent-invitation fallback can show fictional records when empty | P1 correctness |
| Admin packages/reports | Catalog revisions, snapshots and audited exports work; legacy accessibility/lint exceptions remain | P1/P2 |

## Reuse and design system

Reuse `Modal`, `ConfirmDialog`, state/toast components, `GuestInlineForm`,
`GuestTable`, existing organization APIs/UI, `StudioSections`, `StudioToolbar`,
`LivePhoneSimulator`, `ProgramDetails`, renderer capabilities and report query
infrastructure. Existing workspace forest/ivory/gold tokens and established
Khmer fonts remain the visual baseline. No new UI framework or competing
translation system is needed. Required versus optional publishing information
must follow existing event-type business rules.

## Executed baseline

| Gate | Result |
| --- | --- |
| User Vitest / build / lint | 736 passed / passed / passed |
| Admin Vitest / build | Initial concurrent run 114 passed, 2 report UI timing failures; clean isolated rerun 116 passed / build passed |
| Admin full lint | 11 errors and 1 warning in existing files; the older 22-error count is outdated |
| Backend full suite including OpenAPI / ArchUnit | 589 discovered: 542 passed, 47 environment-gated skips, no failures/errors |
| Worker pytest | 72 passed, 2 upstream deprecation warnings |
| Chromium Studio/address/import/seating baseline | 12 passed |
| Native MySQL fresh/upgrade/retired-Free checks | 4 passed; owned loopback server with generated disposable schemas |

Actual command logs are private under `D:/Koupreng-Phase7-private/baseline-*`.
The first admin failures are recorded as baseline timing failures, not Phase 7
regressions. External fonts/iframe loads are intentionally disabled in unit DOM
tests. Docker is unavailable; native MySQL 8.0.39 supplies real SQL validation.
There are no live payment, cloud provider, physical-device or screen-reader
success claims. Browser availability and automated accessibility tooling will
be checked separately.

## Implementation sequence and affected boundaries

1. Studio: reuse forms for a guided/advanced mode, structured failure states,
   review checklist/confirmation and publish result; add mobile controls and
   preview recovery with focused tests.
2. Accessibility/localization: audit modified journeys, fix baseline lint and
   meaningful names/focus/reflow; preserve authored Khmer/English content.
3. Package history: correct nonrevenue grant presentation, explain units and
   expose actual comparison data without changing benefits.
4. Guest dashboard: add bounded server queries/summary and selection export,
   with explicit record/attendee definitions and existing import entry points.
5. Collaboration: extend existing organization invitations with expiring,
   hashed acceptance tokens; add explicit per-module permissions to event
   access. Owner-only publishing/finances/team administration stay restricted.
   Membership removal and owner plan expiry must invalidate collaborator access.
6. Analytics: reuse recorded guest/RSVP/check-in facts for a bounded period and
   gate advanced analytics on the owner's server entitlement. No synthetic
   DAU, recurring revenue, views or conversions.
7. Full regression, disposable MySQL upgrade/fresh/security tests, real HTTP
   integration, browser/visual/a11y evidence and a candid release recommendation.

Proposed changes concentrate in Studio components/persistence, shared UI and
locale helpers, subscriptions, guest/reporting services and repositories,
organization membership, event access, routes/navigation and focused tests.
New endpoint DTOs extend the existing API envelope. New schema belongs after
V46. Controllers continue to call application services.

## Risks and mitigations

- Expanding owner-only helpers globally would grant viewer write access.
  Introduce explicit permissions and test each participating module instead.
- Organization membership does not prove invitation acceptance. Require a
  scoped expiring token plus authenticated intended recipient; never expose
  token hashes or raw tokens in list responses/audit logs.
- Owner quotas must govern collaborator writes; member personal plans must not
  grant upgrades, and concurrent invitations must lock the owner capacity.
- Legacy null organization DTO values must not silently detach a team during
  autosave. Explicit team linking/unlinking must remain owner-controlled.
- New migration resources in the main build could auto-reload into the normal
  developer API. Separate worktree/build directories prevent that.
- Exports and analytics must omit guest tokens/private contacts where not needed,
  separate currencies, and clearly define the stored units and date boundaries.

Discovery and baseline gates are complete. Proceed with focused implementation
and tests; preserve the baseline metadata and all existing user data.
