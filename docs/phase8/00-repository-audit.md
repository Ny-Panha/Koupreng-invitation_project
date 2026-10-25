# Phase 8 repository audit

Audit date: 25 October 2026. Working directory: `D:/Koupreng-invitation_project`.

- Branch `main`, HEAD `522e74844c78cbca430e2d73c52258d2c1c75929`; reported Phase 7 commit is HEAD. `git rev-list --left-right --count main...origin/main` returned `0 0`. This checks cached refs; no fetch, pull or merge was performed.
- The IDE points at the separate Phase 7 worktree. Implementation is in the requested main checkout. Pre-existing modified/untracked `apps/backend/target_test-classes` artifacts are preserved.
- Manifests confirm React 19.2, Vite 8.2, Tailwind 4.3, Router 7.18, Zustand 5, Java 25 and Spring Boot 4.0.8. Flyway currently extends through V49; no migration is needed for JSON additions.

## Existing functionality and reuse

`contentJson.schedule` is an array, normalized by `shared/program.js`; `agendaDays` has a legacy adapter. Rows preserve extension fields, but the editor and backend validator accept only days 1 and 2. Dedicated templates render individual rows without grouped date headings. Several renderers have independent countdown implementations. The shared hook replaces past/missing targets with demonstration dates, which is unsuitable for real events. A complete monthly calendar and ICS export do not exist.

`InvitationForm` owns the existing five-step guide, advanced section navigation, authenticated saves and `useStudioPersistence` queue/conflict recovery. Content and design JSON are built with explicit field lists. New fields must be included in both preview and saved/public adaptation. Template capabilities already distinguish the developer boilerplate from schedule-capable layouts. Silk Heritage supports section ordering; most other layouts have fixed positions.

## Focused implementation contract

Keep the flat schedule. Add optional `programDays` metadata with stable IDs, `dayId` references, bilingual labels/descriptions, enabled flags and array ordering. Legacy rows are adapted for editing without translating or replacing authored text. Retain unknown root and row properties on save. Use `eventDate`/`eventTime` plus additive `eventTimezone` as the canonical event; `saveTheDate` contains display options, never a second target. Date-only events use all-day export. Timed export uses an explicitly disclosed two-hour fallback unless the owner supplies an end date/time.

Reuse template wrappers/artwork, introduce shared accessible program/date behavior, extend capability resolution and keep unsupported boilerplate controls hidden. Existing legacy rendering remains available for invitations without the new program metadata. Preserve queue, publication, ownership, entitlements and collaboration checks. No production operations are authorized.

## Regression risks and validation

Risks: dropped fields in explicit serializers, numeric template aliases, empty schedules being replaced by demos, dates interpreted in browser timezone, DST gaps/overlaps, hidden section data loss, per-second screen-reader announcements, decorative fonts clipping Khmer, stale writes, UTF-8 ICS line folding and token leakage. Verify normalization, timezone/calendar boundaries, export parsing, editor operations, every registered renderer, persistence/conflict paths, full suites and responsive browser evidence. Record database/browser/device availability honestly; fixture saves are not database proof.
