# 11 — inline calendar month agenda and timezones

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The authoritative calendar remains `/app/events?view=calendar`; no separate calendar route or API was introduced. Monday-first indexing and the existing month/agenda view remain. Current component tests exercise leap day 2028-02-29 and Khmer weekday/month labels. The calendar now has row semantics, one date tab stop and Arrow/Home/End/PageUp/PageDown movement; Enter/Space select date details with native Manage/Resume actions.

Period filtering validates true calendar days, rejecting missing/rolled-over dates from Upcoming/Past. Calendar formatting remains based on local calendar dates; the countdown now uses the event time or local end of day rather than UTC midnight. The server contract does not supply a separately verified event timezone, so a cross-timezone/complete-DST certificate is not claimed. InitialDate support is retained and selected-date URL persistence was not an existing feature.

[Date cases](evidence/calendar-date-cases.json) distinguishes tested fidelity from incomplete malformed-API/DST breadth. Agenda is an existing aggregate list; there is no invented booking/reminder capability.

[Report index](README.md).
