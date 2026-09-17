# Koupreng frontend engineering audit

> **Historical discovery snapshot (2026-08-10):** this audit records the pre-migration frontend state. Current results are in `current-gap-status.md` and `../qa/verification-results.md`.

**Audit date:** 2026-08-10

**Baseline:** `main` at `83bfaed` plus the fixes recorded below

**Applications:** `apps/frontend-user`, `apps/frontend-admin`, `apps/backend`
**Method:** route-to-component-to-state-to-API-to-controller/service/entity tracing, focused unit tests, static checks, builds, and rendered browser inspection

## Executive result

Koupreng has a substantial working React/Spring product, not a prototype shell. The strongest areas are its Khmer wedding identity, public invitation renderer, invitation CRUD, template purchasing, media, guest/check-in/seating workflows, and broad admin surface. The previous frontend audit was no longer reliable: the guest feature is already modular, Organization and AI routes already exist, admin routes do not use an `/admin` browser prefix, and several endpoint/table names were inaccurate.

This pass repaired the highest-impact frontend contract failures without changing a backend endpoint or persistence schema:

- Protected invitation routes now expose the parameter names their pages actually consume. Guest, RSVP, budget, check-in, and seating requests no longer risk `/invitations/undefined/...` URLs.
- A server-backed guest list is now authoritative. Browser-only guests cannot be silently merged into a persisted invitation, and failed server imports cannot be reported or cached as successful.
- RSVP state is joined to guests by exact guest ID; the UI surfaces both delivery and attendance state.
- Payment history and receipts use the existing `/api/v1/me/payments` contract, and QR polling continues for every non-terminal server state.
- Organization management controls fail closed when ownership context is absent.
- AI fallback content is disclosed as a built-in template, backend warnings are visible, and Apply writes the accepted `storyText` field rather than an ignored `notes` field.
- Internal links use canonical dashboard paths while legacy aliases remain explicit redirects.

The application is not production-approved by this frontend pass. The historical credential incident remains a release blocker, organization roles are not enforced by downstream invitation services, the AI provider adapter is not implemented, and some dashboard failures are still rendered as credible zero values.

## Change contract

### In scope

- Inspect both React applications and trace their state to the Spring API and database model.
- Correct high-value frontend/backend contract mismatches while preserving current visual identity and public invitation behavior.
- Preserve legitimate unsaved drafts and UI preferences; stop server-owned records from silently degrading into browser-owned copies.
- Record backend-owner work as explicit gaps rather than inventing contracts in the frontend.

### Out of scope

- Git-history rewrite or secret rotation.
- Adding an external AI provider, usage billing, or moderation pipeline.
- Redesigning backend authorization around organization roles.
- Database migrations or new endpoints.
- Replacing the existing invitation template renderer or its culturally specific art direction.

### Acceptance criteria

1. Route parameters match page/API expectations.
2. Persisted invitations use the backend as guest, RSVP, payment, budget, gift, seating, and check-in authority.
3. Local fallback data is visibly and structurally limited to unsaved/local drafts.
4. Payment success never comes from query parameters or local flags.
5. AI/provider limitations are truthful and Apply uses the current invitation DTO.
6. Relevant lint, unit, build, backend, browser, StyleSeed score, and pixel checks are reported with real results.

## Architecture and data flow

### Runtime and structure

| Layer | Current implementation |
| --- | --- |
| User web | React 19, React Router, Axios, Zustand, Vite, Vitest, Playwright |
| Admin web | Separate React/Vite application with session-scoped admin authentication |
| Backend | Spring Boot 4, Spring Security, JPA, Flyway, MySQL/PostgreSQL drivers, Redis integration |
| Public media/invitation | Local or Cloudinary-backed media plus `/w/:slug` and `/i/:slug` public routes |
| Quality tooling | ESLint, Vitest, Playwright, Knip, depcheck, Maven tests, PMD, SpotBugs, JaCoCo, CI secret scanning |

### Principal trust flow

```text
route + auth guard
  -> page hook / mutation
  -> shared Axios client + bearer/cookie mode
  -> Spring Security / resource-owner check
  -> controller validation
  -> domain service transaction
  -> JPA repository + Flyway-owned table
  -> normalized response / explicit error state
```

Public RSVP and invitation-access flows cross an unauthenticated boundary and depend on slug/access-token validation plus backend abuse controls. Internal payment confirmation crosses a separate shared-secret boundary and must never be callable as a normal browser feature.

## Findings by severity

| ID | Severity | Finding | Status |
| --- | --- | --- | --- |
| FE-001 | CRITICAL | Invitation subroutes declared `:id` while pages read `invitationId`, producing undefined API scope | FIXED |
| FE-002 | CRITICAL | Server guests could be mixed with stale browser guests; mutations could silently fall back locally | FIXED |
| SEC-001 | CRITICAL | Credential material remains in Git history even though the current tree is sanitized | OPEN — RELEASE BLOCKER |
| FE-003 | HIGH | AI backend is a stub but the UI labeled local copy as generated and applied an ignored `notes` field | FRONTEND FIXED; PROVIDER OPEN |
| BE-ORG-001 | HIGH | Organization roles do not authorize invitation/check-in/seating operations | OPEN — BACKEND CHIEF |
| FE-004 | HIGH | Cookie-auth mode does not establish a verified refresh session before protected rendering | OPEN |
| BE-SEAT-001 | HIGH | Seat capacity is checked through read/count/write without an explicit concurrency guard | OPEN — BACKEND CHIEF |
| FE-005 | MEDIUM | Dashboard `safeLoad` converts individual API failures to empty values while retaining “Backend data” provenance | OPEN |
| FE-006 | MEDIUM | `/dashboard/events` primarily models local wedding drafts/invitations while a separate backend `Event` aggregate exists | OPEN CONTRACT DECISION |
| FE-007 | MEDIUM | Guest import-file/export/grouped/send-list endpoints are not fully represented in the UI | PARTIAL |
| FE-008 | MEDIUM | RSVP PATCH/DELETE and true bulk seat assignment have no complete host workflow | PARTIAL |
| FE-009 | MEDIUM | Protected-route browser tests historically proved redirects more than authenticated workflows | IMPROVED; MORE COVERAGE NEEDED |
| FE-010 | MEDIUM | Several large feature/CSS files and the invitation renderer increase bundle and change risk | OPEN |
| FE-011 | LOW | Some feature pages still use bespoke modal/toast/inline style patterns | OPEN |

### FE-001 — route parameter contract mismatch

- **Evidence:** `hostRoutes.jsx` declared `:id` for guest, RSVP, budget, check-in, and seating pages while those pages/hooks destructured `invitationId`.
- **Business impact:** authenticated navigation could call multiple backend domains using `undefined`, show generic errors, or select unrelated local context.
- **Resolution:** standardized those route declarations on `:invitationId`; retained `:id` where pages consume `id`; updated route-contract tests.
- **Verification:** router and focused feature tests cover the exact paths.

### FE-002 — mixed guest authority and false-success persistence

- **Evidence:** `useGuests` called a nonexistent `listMy`, selected the first invitation when the requested ID did not match, merged manual browser guests into backend records, and requested a nonexistent RSVP client method. Import mutations wrote browser state even after server failure.
- **Business impact:** hosts could see or act on guests belonging to a different event, believe an import succeeded when the server rejected it, or lose changes on another device.
- **Resolution:** exact invitation selection; real `listMine` and `listByInvitation` clients; strict RSVP-to-guest ID join; server-only mutation policy for persisted invitations; local-only behavior remains available for an unsaved draft.
- **Tests:** exact-route authority, no cross-invitation fallback, failed-import non-persistence, mapping, and visible RSVP status.

### SEC-001 — historical credential incident

- **Evidence:** `README.md`, `docs/security/credential-incident-response.md`, and prior security reports record exposed credential material in Git history. Current-tree removal does not revoke the credential.
- **Business impact:** account takeover, fraudulent provider activity, and secondary-secret exposure remain possible until operational remediation is completed.
- **Required owner action:** rotate/revoke affected credentials, verify old values are rejected, coordinate a full-history rewrite, force all collaborators to re-clone, and rerun history scanning. Do not perform this as an incidental frontend commit.

### FE-003 — AI capability truth and invitation update contract

- **Evidence:** `AiInvitationAssistantService` always returns `enabled=false`, an empty body, and a warning; no provider adapter is called. The hook substituted local text, the result omitted warnings, and Apply sent `notes`, which is absent from `InvitationRequest`.
- **Business impact:** users were told an AI operation succeeded and content was saved when neither claim was true.
- **Resolution:** mark fallback source as `LOCAL_TEMPLATE`, show provider warnings, synchronize result edits, and apply a DTO-safe payload to `storyText`.
- **Open backend work:** select/provider contract, secret management, timeout and bounded retry policy, moderation, rate/usage limits, privacy policy, telemetry, and tests.

### BE-ORG-001 — organization roles stop at organization management

- **Evidence:** organization membership/roles exist and an invitation may reference an organization. Invitation, check-in, seating, budget, guest, and delivery service guards remain owner/admin oriented rather than resolving organization permissions.
- **Business impact:** UI role descriptions can imply planner/check-in access that the backend rejects; adding frontend-only permissions would create a security illusion.
- **Required backend contract:** define resource permissions per role, centralize policy evaluation, cover object-level authorization with integration tests, then expose effective permissions to the UI. Until then, owner-only operational controls are the truthful posture.

### FE-004 — auth refresh and unauthorized-state behavior

- **Evidence:** storage can be configured for bearer or cookie mode; cookie mode deliberately removes the access token, but initial protected state does not first validate `/api/auth/me`. The user Axios client also lacks the explicit unauthorized-session cleanup behavior present in admin.
- **Business impact:** refresh can produce stale protected UI, redirect loops, or inconsistent expiry handling depending on deployment mode.
- **Recommendation:** add one bootstrapping auth state (`checking`, `authenticated`, `anonymous`), validate cookie sessions with credentials, centralize 401 cleanup, and test refresh/expiry in both storage modes.

### BE-SEAT-001 — capacity under concurrent assignment

- **Evidence:** seating checks current assignment totals before save without an entity version or locking strategy visible in the flow.
- **Business impact:** two check-in desks could over-allocate a table under concurrent requests.
- **Recommendation:** enforce capacity in one transaction with pessimistic/optimistic concurrency, return `409 Conflict`, and test simultaneous assignments. The frontend should refresh the plan and preserve the operator's pending selection after a conflict.

### FE-005 — dashboard partial failures look like zero activity

- **Evidence:** `DashboardFeature.safeLoad` maps failed guest/RSVP/budget/gift/check-in/seating requests to empty arrays/null while the aggregate source remains `backend`.
- **Business impact:** a host can interpret a service outage as zero guests, zero spend, or zero attendance.
- **Recommendation:** return per-widget `{data,error,stale}` results, show compact retry states, and only compute aggregate metrics from successfully loaded sources.

## Implemented files

- Routing: `src/app/routes/hostRoutes.jsx`, `src/app/router.test.jsx`
- Guest authority: `features/guests/hooks/*`, `features/guests/model/guestMappers.js`, guest table/card/stats/status components and tests
- RSVP persistence: `features/rsvp/api/rsvpApi.js`
- Payment state/history: payment service, status mapper, QR/history views and tests
- Organization authorization UI: organization detail helper and tests
- AI truth/contract: AI hook, result component/styles, invitation update mapper and tests
- Canonical links: dashboard, host navigation, invitation delivery/list/check-in/seating views
- Design governance: root `STYLESEED.md` and `.styleseed/effective-rules.md`

## Verification record

| Gate | Result |
| --- | --- |
| Focused user tests | PASS — 6 files, 21 tests |
| User lint / full tests / build | PASS — ESLint; 16 files / 55 tests; Vite production build (791 modules) |
| Admin lint / full tests / build | PASS — ESLint; 3 files / 8 tests; Vite production build; Knip and depcheck clean |
| Backend tests / verify | PASS — Maven verify: 137 tests run, 0 failures, 0 errors, 1 skipped; SpotBugs 0 issues; PMD passed |
| Playwright browser matrix | PASS — 56/56 tests across desktop Chromium and Pixel-class mobile Chromium |
| StyleSeed score | PASS — 89/100 (minimum required 80) |
| Rendered desktop/mobile inspection | PASS — authenticated guest authority/RSVP and AI local-template/provider-warning surfaces inspected at both viewports |

The user build still reports a 1,064.46 kB minified entry chunk (295.29 kB gzip), which is retained as performance debt rather than hidden by raising the warning limit. User Knip also reports two pre-existing unused files: `features/dashboard/api/dashboardApi.js` and `shared/utils/slugify.js`. These were not deleted during a contract-focused repair.

## Delivery and rollout notes

- No backend contract, migration, or data rewrite is included.
- Existing local draft keys are preserved; no browser data is wiped.
- The guest change only tightens authority for invitations that the server recognizes. Unsaved/local drafts retain local planning behavior.
- Rollback is a normal source revert. No database rollback is needed.
- Before release, complete the external security incident steps and staging-only provider/payment checks documented above.
