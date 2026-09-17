# Repository Cleanup Inventory

> **Architecture V2 addendum (2026-09-15):** the original cleanup inventory below remains provenance for baseline `2ba8578`. From the later `main` merge base `955f8d9`, Architecture V2 records 306 Git-detected package/file renames, 42 deletion-class paths (including three semantic relocations), and 48 additions before the final documentation commit. The repository now has domain-owned backend packages, four Dockerfiles plus Compose/Nginx topology, a 191-path OpenAPI contract, expanded CI, and the canonical smoke test. Exact new deletion accounting is appended to `deletion-manifest.md`; current verification is in `verification-results.md`.

Audit date: 2026-07-21. Baseline: `2ba8578`. Branch: `chore/repository-cleanup-and-qa`.

## Method

The inventory used Git-tracked paths and blob sizes, `git status --ignored`, extension/type counts, entrypoint import graphs, router enumeration, `git grep`, Knip, depcheck, package-manager metadata, file hashes, production builds, and test execution. Ignored `.env` content was never printed or copied.

Reproduction commands:

```powershell
git ls-files
git ls-tree -r -l 2ba8578
git status --short --untracked-files=all --ignored
git diff --name-status --find-renames 2ba8578..HEAD
```

## Snapshot comparison

| Snapshot | Tracked files | Bytes | Text/binary evidence |
| --- | ---: | ---: | --- |
| Baseline `2ba8578` | 997 | 157,477,813 | 856 text, 141 binary |
| Post-code-cleanup `8ac78ee` | 835 | 56,586,154 | 727 non-media/config files, 108 media assets |

The code/asset cleanup removed a net 162 tracked files and 100,891,659 bytes (about 96.2 MiB). The deletion manifest records 188 deleted paths; the net count is smaller because tests, configuration, and documentation were added and scripts were renamed.

## Component inventory at `8ac78ee`

| Area | Files | Bytes | Classification | Basis |
| --- | ---: | ---: | --- | --- |
| `apps/backend` | 327 | 1,163,558 | KEEP | Active Maven module; 128-test suite, static analysis, and fresh migration gate |
| `apps/frontend-user` | 364 | 57,269,400 | KEEP | Active user/public app; route, asset, unit, analysis, build, and E2E evidence |
| `apps/frontend-admin` | 65 | 329,322 | KEEP | Active admin app; route, guard, unit, analysis, and build evidence |
| `apps/telegram-bot` | 10 | 54,249 | KEEP | Active FastAPI integration; 24 tests, lint, security scan, compile, and audit |
| `packages/api-contracts` | 2 | 4,228 | KEEP | Only shared package actually present; API contract material |
| `docs` | 41 | 283,425 | KEEP / REVIEW | Current reference plus explicitly identified historical/manual material |
| `infra` | 8 | 12,244 | NEEDS HUMAN REVIEW | Reusable ops assets exist, but no verified provider binding or Railway topology |
| `scripts` | 10 | 114,116 | KEEP | Reusable scripts organized by CI, development, and maintenance purpose |
| `tools` | 2 | 39,894 | KEEP | Postman collection and reusable sample data |
| `.github` | 1 | 10,831 | KEEP | Cleanup snapshot; the final workflow expands this to ten required jobs |

## Important ignored/local artifacts

| Artifact class | Disposition | Reason |
| --- | --- | --- |
| Root `.env` | KEEP LOCAL / NEVER COMMIT | Contains workstation secrets and service configuration; ignored and not inspected in reports |
| `.vscode/settings.json` | KEEP LOCAL | Developer-specific editor state |
| `apps/backend/target/**` | DELETE/REGENERATE | Maven classes, reports, and JARs; ignored build output |
| `apps/*/node_modules/**`, `dist/**` | DELETE/REGENERATE | Dependency cache and production build output |
| Python virtualenv/cache/coverage | DELETE/REGENERATE | Local interpreter and test output |
| Playwright reports/results | DELETE/REGENERATE | Browser diagnostics, ignored unless uploaded by failing CI |

## Classification decisions

- KEEP: all active application entrypoints, active routes, tests, Flyway migrations, dynamic invitation gallery folders, Canva section assets, custom-music behavior, two referenced bundled tracks, API contracts, and reusable operations assets.
- DELETE: tracked caches/build output, local database snapshot, credential-bearing artifacts, unreachable frontend implementations, duplicate route guards, unused starter/config files, superseded renderer code, unreferenced/duplicate media, and stale source-tree notes.
- RELOCATE: reusable scripts and current frontend architecture/authoring notes.
- NEEDS HUMAN REVIEW: Railway service topology/log access, music/photo licensing provenance, exact Canva visual comparison, deployment-specific infrastructure values, and standalone lesson material.

Every deleted and relocated path is accounted for in `deletion-manifest.md`.
