# Program icons and numeral semantics

The existing Phase 8 multi-day program remains canonical. Rows retain IDs, day association, dates, times, location, ordering and existing Khmer/English text. `iconKey` adds a bounded decorative choice: calendar, gathering, blessing, offering, meal or reception. The editor exposes these options per row. Backend validation rejects unknown choices; older rows receive the established fallback.

`CeremonyIcon`, `ProgramTimeline` and `ProgramDetails` use the installed Lucide dependency and existing Khmer numeral/date/time helpers. No new sacred figure, deity or unreviewed religious illustration was introduced. Icons are decorative; readable ceremony text conveys the information. English projects title/description/location from the existing English row fields; numbers and calendar events still use shared canonical dates/times.

Unit/contract tests cover the program fields and numeral adapters; the cross-template browser matrix renders a program in both languages. Existing Phase 8 browser regression and backend program/ICS suites are reported separately. These checks do not constitute human iconographic approval or a physical screen-reader test.
