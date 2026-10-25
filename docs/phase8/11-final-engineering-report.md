# Phase 8 final engineering report

Implemented in `D:/Koupreng-invitation_project` on `main`, based on `522e7484`. The IDE's separate Phase 7 worktree and its code were not edited. Verification preceded the user's explicit request to commit and push the Phase 8 changes to GitHub `main`.

## Result

Compatible wedding templates now support editable multi-day programs, grouped timelines, Save the Date, timezone-aware live countdowns, Gregorian event calendars and safe downloadable ICS events. Khmer/English labels and numeral choices work without translating authored content. Existing artwork and opening interactions remain. Event Essential uses the full multi-day editor for weddings and its neutral activity editor for other event types. The developer boilerplate retains its capability exclusions.

## Reuse and changes

Reused the flat `contentJson.schedule` contract, legacy adapter, template registry/skins, five-step Studio guide, advanced section system, `useStudioPersistence`, server revision checks and existing invitation authorization/publication endpoints. Added day metadata and date presentation settings, shared calendar/time/export behavior, and a complete editor for arbitrary program days. Existing root/row/day extension fields survive save; disabled content stays stored. Legacy layouts remain available for records without the new metadata.

The shared countdown no longer invents future demo targets for missing or past events. Timers pause in background tabs, recompute on return and remain local to their component. Calendar exports use configured timezones, explicit ends or a disclosed two-hour fallback, with an all-day representation when time is absent. The independent parser and actual SQL-backed UI journey verify the exported instant.

Browser testing exposed a real expired-session recovery problem. Scoped save options now allow the existing Studio queue to retain unsaved edits after a 401 instead of being redirected away. The server's expiry and permissions remain unchanged. Event settings and adapters also preserve intentionally cleared canonical dates/times over stale customization JSON.

## API and database

No endpoint, DTO, table or Flyway migration changed. Existing content JSON gained additive optional fields. The content policy now accepts up to 30 program days and validates the new shape, bounded text, references, timezone and end semantics. Release frontend/backend together because older validators reject days beyond two. All V1–V49 migration files remain untouched.

No payment/gift/subscription/team/analytics feature was rewritten. Test fixture grants were nonrevenue records restricted to the owned loopback disposable schema. Existing authorization, stale-write and payment regression tests pass. No production deployment, container restart, DNS change, pull, merge or destructive repository operation occurred. Publishing the verified changes to GitHub `main` was separately authorized by the user.

## Coverage and release assessment

The [compatibility matrix](05-template-integration.md) covers every static catalog template plus Event Essential. [Verification results](07-test-results.md) record the final full suites, exact skips, three-engine browser/a11y checks, 72 width/language captures, matched Phase 7 comparisons and a genuine create/edit/save/reload/publish/public/export journey. [Representative screenshots](08-visual-regression.md) and machine-readable parser/SQL evidence are included.

Local automated gates are passing. The implementation is ready for code review and staging verification. Physical mobile devices, human screen readers, Khmer family/editorial review and external-service/production checks remain release checks; they are not claimed as verified. Review the [known limitations](10-known-limitations.md) before production release.
