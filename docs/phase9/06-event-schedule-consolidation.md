# Event information, schedule and venue

Event Information reuses the original event, family, invitation, closing and language editors. The application language, authored wording and invitation language remain distinct. Changing parent groups does not rebuild a field editor or overwrite text. Wording presets retain their explicit replacement confirmation.

Schedule & Venue contains the existing WeddingProgramEditor, SaveTheDateEditor and venue controls. Program days, row IDs/extensions, custom dates, timezone, calendar visibility, countdown preferences and calendar exports still use the Phase 8 contract. There is no second schedule/date model or migration. Canonical cleared event dates/times continue to take precedence over stale customization values.

Native disclosure headings provide program, date/calendar and venue entry points without nesting additional navigation trees. Invalid date presentation settings select the date section. Invalid Maps links now also select the venue section and use a bilingual error message. Existing Google Maps allowlisting, directions fallback and address validation remain authoritative; no paid map API or secret was introduced.

Event Essential retains its neutral event editor, including its wedding program specialization. Its optional video editor uses the same new media component and additive configuration. Other template-specific artwork/design controls are not invented for that neutral template.

The Phase 8 regression configuration passed 45 cases across Chromium, Firefox and WebKit, with four deliberately optional historical-reference captures skipped because their baseline origin was not supplied. These include program/date round trips, 401/409/503 and offline recovery, visibility retention, calendar/ICS, scoped axe and reflow. A separate live Phase 9 journey exercises actual HTTP/MySQL persistence and public calendar download.
