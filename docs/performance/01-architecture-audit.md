# Architecture audit — 2026-10-20

## Scope and evidence

Inspected the monorepo structure, dependency manifests, Spring modules and repositories,
migrations V1–V36, React routing and invitation loading, Telegram worker, CI and
deployment configuration. This is a source review plus local experiments, not a
production capacity certification. Existing untracked admin sample-data work is excluded.

## Verified architecture

| Area | Repository evidence |
| --- | --- |
| User/admin clients | Independent React 19 SPAs, Vite 8, Tailwind 4, React Router 7; Zustand in user app |
| Backend | Java 25, Spring Boot 4.0.8, Web MVC, Spring Security OAuth2 resource server, JPA |
| Storage | MySQL 8, Flyway history currently through V36; PostgreSQL driver retained as well |
| Redis | Already configured for shared rate limiting in Compose; auth cache infrastructure also exists |
| Worker | FastAPI 0.139.2 Telegram integration, httpx 0.28.1; not evidence of a separate deployed AI inference service |
| AI | Optional backend assistant integration, disabled by default |
| Operations | Docker Compose, Nginx gateway and static servers, Prometheus config, backup scripts, Cloudflare tooling |
| QA | Vitest, Playwright desktop/mobile Chromium, Maven/JUnit/ArchUnit, environment-gated MySQL integrity tests, pytest |

Backend modules use `api`, `application`, `domain`, and `infrastructure` packages.
ArchUnit checks controller/persistence and domain dependencies. Existing JPA entities
live in domain packages; this investigation does not relocate them. Open Session in
View is disabled. Read paths generally use read-only transactions and selected
entity graphs. Both clients already split routes; template registry layouts are lazy.

## Important request flows

1. Authentication: JWT validation and database-backed user authorization; rate-limit
   filters and optional cookie/CSRF handling precede application services. Authorization
   must not rely on a stale shared cache.
2. Public invitation: lazy public route → concurrent invitation, media and cached
   template-catalog requests → adapter/draft conversion → template registry/layout.
   Backend validates publication, moderation and visibility before returning guest-safe DTOs.
3. Personalized RSVP: published/access-checked invitation → guest-token lookup → RSVP
   upsert → notifications. RSVP guest uniqueness is enforced by MySQL; mutation
   concurrency has dedicated MySQL integrity tests. A unique constraint alone does
   not establish every concurrent update is safe.
4. Owner workflows: owner/organization checks → invitations, guest import, check-in,
   seating, gifts/budget/reports. Existing list/export contracts sometimes return full
   collections, so pagination needs coordinated client/API work.
5. Payments: server-owned orders/prices → claimant evidence → evidence review/manual
   confirmation → transactional fulfillment and notification delivery. Default Telegram
   auto-confirm is false. No payment verification or fulfillment changes are proposed.
6. Reporting: newer admin read repository uses JDBC projections/paging; several owner
   dashboard paths still hydrate complete guest/RSVP/payment histories for summary counts.

## Bottleneck ranking before implementation

| Priority | Finding / hypothesis | Evidence and next measurement | Risk |
| --- | --- | --- | --- |
| 1 | Repeated RSVP aggregate scans/round trips | `RsvpService.summaryForInvitation` issues six queries; compare actual MySQL service/query timings at varying guest counts | Low: preserve DTO/access/mutation paths |
| 2 | Unnecessary template dependency loading | Public/draft adapters import a broad template barrel with layout/CSS exports; compare built route resources before/after direct imports | Low if rendered output stays identical |
| 3 | Owner dashboard memory grows with history | `DashboardReportService.getMyDashboard` loads all guests, RSVPs and orders | Medium: projections and recent-list contracts need cross-checks |
| 4 | Import validation round trips | `GuestService` validates contacts and token uniqueness per row; preview uses sets for in-file duplicates | Medium: DB collation, uniqueness and partial-import behavior must remain correct |
| 5 | Public rendering gates on slowest auxiliary request | `PublicInvitationFeature` awaits invitation, media and catalog together | Medium: catalog/media influence layout/cover; removing wait can change first render |
| 6 | Low-budget deployment tuning | No production hardware profile or measured pool saturation; Docker daemon unavailable locally | Tune only after isolated measurements |

## Existing controls and debt

Unique invitation slug/access token, guest invite token, guest contact constraints,
RSVP guest constraint, transaction/evidence identifiers and indexes already exist.
V13 supplies invitation owner/deleted/created indexes; V17 supplies normalized contact
uniqueness; V33–V34 preserve payment evidence/delivery fields. Do not add duplicate
indexes or edit historical migrations. New schema work would start at **V37**, not V34.

Actuator/Micrometer/Prometheus and a bounded development SQL/request monitor exist.
No checked-in repeatable full-stack performance baseline was found for this audit's
RSVP workload. Existing marketing/template screenshots and metrics are historical,
not a comparable current baseline. Development instrumentation must be disabled in
performance runs. Review production MySQL dialect selection (base configuration
defaults to MariaDBDialect), resource budgets, retained PostgreSQL configuration and
unbounded list/export memory separately; none proves a production slowdown by itself.
