# Royal Garden V3.2 — audit

Baseline: `26040416338266f93520a61101737785a336fdf5`, clean `main`, fetched and fast-forward checked on 2026-10-28.

The V3.1 entrance, inline muted film, one music element, protected video provider, information artwork and inner scroll root already work. Preserve their architecture and source assets.

`SaveTheDate` has a date-only month grid, but highlights only the main event and exposes raw time/zone text. `eventCalendarExport` exports one allowlisted event. `groupProgram` and `serializeProgramDays` already preserve IDs, unknown properties and authoritative array order. `WeddingProgramEditor` already provides up to 30 days / 200 ceremonies, bilingual titles/descriptions, locations, enable flags, icons and reordering. `ProgramTimeline` consumes these records but has no day anchors, shared visible-day projection or natural time presentation.

Royal Garden capabilities disable dress code, story, FAQ, party and the separate generic couple-photo section. Their draft/editor models exist; Royal has no renderers for them. Cover photo is already supported independently by `coverBackgroundImage` and cinematic slides; `couplePhoto` is not permission to expose a duplicate cover editor.

Studio writes `contentJson`/`designJson` through the existing invitation API. Public data rehydrates via `publicInvitationToDraft` → `draftToTemplate` → localized template content. Preview uses a trusted channel in `LivePhoneSimulator`. The backend validates optional JSON presentation data and program limits. No new endpoint or relational migration is necessary for calendar, export or dress-code presentation.

RSVP is supplied as the existing `PublicRsvpForm` child. Authorization, guest reuse, seat policy, deadline and confirmation remain with that form/service. KHQR currently displays all QR images; it has no transaction confirmation. Private wishes must never be copied into public template content. Per-day RSVP is a separate backend workstream and is outside this presentation change.

The user's referenced calendar screenshot was not attached to this session; use the specified composition and existing royal blue/gold language. Browser evidence must be captured from the implemented UI.
