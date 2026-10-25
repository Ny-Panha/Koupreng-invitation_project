# Countdown, calendar and export

`eventDateTime.js` separates calendar dates, local wall times and absolute instants. The configured IANA timezone defaults to `Asia/Phnom_Penh`; it is not a fixed UTC+7 calculation. Surrounding timezone offsets are sampled and candidates round-trip through `Intl.DateTimeFormat`. DST gaps are rejected; repeated times choose the earlier occurrence, disclosed in the editor. [ECMA-402](https://tc39.es/ecma402/#sec-intl.datetimeformat) defines the underlying timezone formatting API.

The shared countdown recomputes from `Date.now()`. Hidden tabs suspend intervals; visibility/pageshow resumes immediately. Cleanup removes timers/listeners. Past targets stay at zero and display a localized “celebration has begun” message; no completed status is persisted. Each timer owns its updates, including the extracted legacy Celestial clock. Timers use `aria-live="off"`; the static event date/time supplies context.

The Gregorian calendar uses UTC date-part arithmetic, correct leap/month/year boundaries, seven semantic table columns and a nonselectable event-date marker. Optional genuine month buttons and return-to-event navigation use accessible names. Khmer weekdays, month names and numerals are deterministic.

ICS exports follow [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545): CRLF, UTF-8 folding at 75 octets without splitting code points, escaped text, stable public UID, DTSTAMP, start/end, title, location and optional authored subtitle. Timed events use UTC instants. Missing end time uses the editor's explicitly disclosed **two-hour fallback**. Date-only events end at the exclusive following date. Invalid/earlier ends are rejected. A property allowlist excludes guest objects, invitation URLs and access tokens.

Automated tests inspect boundaries, escaping and folding. Four downloaded files are additionally parsed by independent `icalendar 7.3.0` tooling, with UTC start/end checks and a SQL comparison of the genuine published fixture. This parser is verification tooling in the ignored cache, not an application dependency. See [parser/SQL evidence](evidence/calendar-and-live-persistence.json).
