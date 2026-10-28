# Current-main audit — 28 October 2026

Initial and tracking HEAD: `64ef06fde54f6985faea609b69e485652e80bfa1`. Work is in the original directory on `main`; no merge/rebase, new branch, worktree or clone. The pre-existing compiled `TemplateCatalogServiceTests.class` change and two `output/*-rendered-live.png` files are excluded from this work.

The attached master prompt is the requested specification. Its historical HEAD and observations are audit leads, not evidence of the current state. The current source and real local package records were inspected before implementation.

## Baseline

- User frontend: 151 files, 1,103 tests passed (68.28 seconds).
- Admin frontend: 121 tests passed (25.63 seconds).
- Worker: 74 tests passed (1.74 seconds), one dependency warning. The default Python 3.15 lacks pytest; the existing worker virtual environment supplies the installed dependencies.
- Full backend: 646 tests, one failure, zero errors, 68 skipped. The existing OpenAPI drift failure includes the prior catalog/Admin compatibility fields. The contract will be regenerated and reviewed with this phase's additive API metadata, rather than weakening the check.
- User/Admin lint and builds are baseline gates; their fresh logs are retained under `.cache/next-studio-ux/`.

## Existing boundaries and observed gaps

| Area / route | Existing server authority | Observed frontend gap / planned change |
| --- | --- | --- |
| Studio `/app/events/:eventId/invitation` | `MANAGE_INVITATION`, owner template access, content/media policies, optimistic revision | Dense legacy rows; no reusable field guidance/summary; native template/wording confirmation; failed save toast can use success styling |
| Event workspace `/app/events/:eventId/*` | Accepted event permissions plus owner's benefits, checked per request | Access is loaded only once; refresh on identity/focus/rejection and expire stale feature hints |
| Templates / chooser | ACTIVE numeric catalog IDs, individual purchase or eligible owner subscription | Generic Premium rejection; add eligible purchase/package explanation without discarding draft |
| Guests / import | `MANAGE_GUESTS`, account and event guest-record limits, `GUEST_IMPORT`, owner lock | Generic messages lose quota units/scope; add exact backend context and preserve entered batches |
| Invitation QR / guest tickets | Owner benefits `QR_INVITATIONS`, scoped event/guest IDs | QR hook discards structured error status/code; distinguish permission, package, unpublished, token and transport failures |
| Check-in | `MANAGE_CHECKIN` + owner `QR_CHECK_IN` | Differentiate a check-in restriction from an ordinary invitation QR restriction |
| Seating | `MANAGE_SEATING` + owner `SEATING` | Contextual permission/feature explanation |
| Video / monogram / illustrated map | Event authorization and purchased owner's specific Premium snapshot policy | English/static locks; shared bilingual feature cards and contextual upgrade entry |
| Gift KHQR | Existing gift/owner contract, independent currency/payment instrument | Preserve; do not map it to QR check-in or charge for ordinary gift display |
| Packages | Public visibility, active records, server payment resolver, immutable purchase snapshots | Public response has booleans but no projection of Premium-only/media/import policy; add server-derived feature keys |

`InvitationService.update` already passes the event owner to `applyRequest`; `EventCollaborationService` checks accepted membership, role, owner team entitlement and team capacity. Platform ADMIN is not a paid tier. These checks remain intact.

`EntitlementService` already serializes invitation/guest/team creation through the owner lock. Its errors identify feature/quota failure but omit the exact feature, resource, scope and counts. Add safe structured details after the existing authorization checks; do not derive usage from a paginated guest list. Extend authorized event access with only that event's guest-record quota, not other events' usage.

## Real configuration

See [public packages](evidence/baseline-public-packages.json) and the read-only [Free policy query](evidence/baseline-free-policy.txt). Values are observations, not a hardcoded frontend benefit matrix:

| Code | Price | Invitations / account guests / event guests | Invitation QR | Check-in | Premium templates |
| --- | --- | --- | --- | --- | --- |
| FREE (active, non-public baseline) | USD 0 | 1 / 20 / 20 | Yes | No | No |
| BASIC | USD 0.01 | 1 / 3 / 3 | Yes | No | No |
| PRO | USD 199 | 20 / 2000 / 500 | Yes | Yes | Yes |
| PREMIUM | USD 499 | 999 / 99999 / 5000 | Yes | Yes | Yes |

The current policy additionally reserves video, monogram and illustrated map for activated `PREMIUM` snapshots; guest import is enabled unless its existing JSON benefit explicitly disables it. Eligible offers must reuse this exact policy and the public catalog's `purchasable` flag.

## Alerts and Studio inventory

`shared/ui/toast.js` already exposes four toast methods and dispatches `koupreng:toast`; `ToastContainer` deduplicates message text and cleans timers, but lacks persistent critical errors, structured title/action and bilingual dismissal. `Modal` already owns portal isolation, stacking, focus containment, Escape and focus restoration. `ConfirmDialog` already supplies destructive/loading presentation. Adapt them behind one feedback facade; do not introduce a competing modal engine.

Studio keeps six tabs, guided/advanced modes, localized authoring, trusted iframe preview, persisted split presets and revision/conflict recovery. Preserve their business logic and section keys. New field/section/validation primitives and container queries will improve form hierarchy; Focus on Editing will use the existing layout rather than replace the splitter. Screenshots are captured before and after from actual rendered pages using clearly labelled owner/event fixtures.

## Scope and risks

Changes target the existing entitlement/public-package/error DTOs and application services; the shared HTTP/feedback/access layer; existing Studio components; feature entry points for guests, QR, seating/check-in, tickets/media and packages; tests, OpenAPI and these reports. No data migration or package/price mutation is required.

Critical checks: permission before benefits, owner rather than collaborator package, no pending-payment unlock, nullable limits, no cross-event usage leak, single confirm submission, retained drafts, no noisy autosave success, unchanged template artwork, current complete template registry, and real disposable-database authorization tests. Physical devices and manual screen-reader hardware must be reported separately from automated browser evidence.
