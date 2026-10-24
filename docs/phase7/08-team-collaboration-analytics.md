# Team collaboration increment

The existing organization model now supplies explicit event permissions. There is
no second ownership/team store. Owners link or unlink their own organization using
a version-checked endpoint and review dialog. Membership applies to **all events
the owner links to that organization**, not an isolated event-only invite.

## Invitation and authorization rules

- Every invite, including an existing email, stays pending. A cryptographically
  random 256-bit code is returned once to the inviting owner. Only its SHA-256 hash
  is stored, with a seven-day expiry. Codes are submitted in the authenticated
  acceptance request body, not URLs. They are not stored in browser storage.
- Acceptance requires the intended account email and an unexpired, unused code.
  Acceptance clears the hash and records consent. Reissuing a pending invite rotates
  its code. Role changes cannot assign OWNER. Membership removal revokes subsequent
  event requests. No invitation email is sent or claimed to have been sent.
- Existing active organization memberships remain intact. They do not acquire new
  event rights until an owner reissues an invitation and the recipient accepts it.
- Pending and active membership slots count against the owner's account-wide team
  capacity, including an owner slot for each workspace. Owner row locks and explicit
  READ_COMMITTED transactions serialize capacity mutations. Expired grants or a
  smaller over-capacity team policy suspend collaborator event access. Owners can
  still remove members and unlink teams.
- Role and owner entitlements are re-evaluated on each server request. A member's
  personal package cannot upgrade or bypass the owner's policy. Cross-owner
  organization associations do not grant access. The legacy owner helper remains
  strict; individual participating services opt into named permissions.

| Role | Enabled event tools |
| --- | --- |
| Owner | Existing owner tools, publishing, finances, settings and team administration |
| Manager / legacy organization ADMIN | Invitation editing/media, guests/import, RSVP, seating, check-in; subject to owner benefits |
| Designer | Invitation content/design and media |
| Check-in staff | Attendance summary, limited roster, scan/manual check-in and undo |
| Viewer | Event overview and invitation preview; attendance analytics permission reserved for the next increment |
| Legacy MEMBER | Event overview and preview |

No collaborator receives publishing, finance, delivery, ticket design, access-setting
or membership administration. Platform administrator exceptions already present in
seating/check-in remain unchanged. Sidebar/direct-route UI follows the server grant;
server authorization remains mandatory. Shared event cards identify the owner and
omit owner-only deletion/edit shortcuts. Legacy automatic local-draft retries do
not submit shared event writes.

The staff roster is paged (default 50, maximum 100), searched and filtered on the
server. It contains names, groups, tables and seats; it omits phone/email, guest
tokens, QR URLs and private notes. Staff UI does not load the private guest list,
create walk-ins or offer gift recording. Manager walk-ins still use owner quotas.

## Concurrent editing and compatibility

Collaborator writes require `expectedUpdatedAt`, lock and refresh the event, and
reject stale revisions with 409. Access/team settings remain owner-only. Omitted
organization fields no longer detach a team during Studio saves. Ordinary owner
requests retain their existing API shape.

A real HTTP/MySQL race initially allowed two saves with the same revision. Explicit
READ_COMMITTED isolation on event update/team-link transactions fixed the reproduced
lost update; the test verifies one 200, one 409 and rejection of another stale save.
No automatic content merging or overwrite of newer drafts is performed.

Migrations V47 and V48 only add nullable token/consent fields and a unique token-hash
index. Existing migration files remain unchanged. V48 was appended after V47 had
already been applied to the disposable test database.

## Executed evidence

- Affected legacy services/security/OpenAPI/ArchUnit gate: 125 passed before the
  staff/consent follow-ups.
- Final acceptance gate: 45 passed, including eight real HTTP/JWT/MySQL cases,
  seven policy cases, six organization cases, five fresh/upgrade MySQL cases,
  fourteen OpenAPI cases and five ArchUnit rules.
- User gate: 113 passed across fifteen files; full user lint and production build
  passed. Separate check-in persistence/desk gate: sixteen passed.
- Chromium: seventeen Studio/address/responsive regressions passed; three team
  browser cases passed (one-time-code handling, reviewed linking at 390px and staff
  attendance without finance/private guest tools). Browser requests are intercepted
  fictional fixtures; API security evidence above uses actual HTTP and MySQL.
- Screenshots under `D:/Koupreng-Phase7-private/m3-*-browser`. Invitation codes are
  masked in evidence. The mobile team screen was visually inspected, and its select
  control was subsequently aligned with the shared form tokens.

The first native run failed because the disposable MySQL process was stopped. It
was restarted on verified loopback port 3416 and its owned data directory checked
before retries. No regular development or production schema was migrated.

## Remaining Phase 7 work

Advanced attendance analytics is not yet implemented in this increment. The generic
event guide/publish path, bounded guest dashboard/bulk operations, full accessibility
matrix, real-browser/live-backend journeys and final release review remain required.
Email delivery is intentionally outside this implementation; owners privately share
invitation codes using their chosen channel.
