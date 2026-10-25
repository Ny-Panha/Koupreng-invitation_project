# Phase 9 repository audit

Audit date: 25 October 2026 (Asia/Bangkok). Initial checkout: `D:/Koupreng-invitation_project`, clean `main`, HEAD `3452e436`, local tracking ref `origin/main` at the same commit. No remote fetch is implied. Phase 8 is committed in `9606873f`; Phase 7 ends at `522e7484`. Work proceeds on `feat/phase9-studio-media-tickets`.

The source manifests verify React 19.2, Router 7.18, Zustand 5, Tailwind 4.3, Vite 8, Java 25 and Spring Boot 4.0.8. The backend uses JPA, Flyway and MySQL; the Python worker remains separate. The checked-in OpenAPI contract is `packages/api-contracts/openapi.yaml`. Latest migration is V49; media types are stored as strings, allowing additive purposes without changing historical SQL.

Reused boundaries: serialized Studio persistence/revisions, template capability registry, mounted section editors, Phase 8 flat schedule/day metadata and canonical dates, package benefit snapshots, event owner/collaborator permissions, media validation/storage compensation, ticket design versioning and canvas renderer. No replacement application, media service or template engine is needed.

Baseline user tests: 895 passed in 129 files. Admin: 121 passed in 21 files. Full backend, worker, lint/build and browser results are recorded in `12-test-results.md`; historical Phase 7/8 results are comparisons only. Task logs live in ignored `.cache/phase9`. A new task-owned MySQL 8.0 instance uses loopback 3416 and an isolated data directory, not the normal application database.

Source inspection includes user/admin route registries, public invitation adapters, shared UI/token owners, authentication redirects, event tools, subscriptions/snapshots, invitation/media/ticket services, storage adapters, security filters and browser fixtures. Review findings and implementation decisions appear in the following reports. No environment file, existing data, remote branch, production container or DNS record is modified.
