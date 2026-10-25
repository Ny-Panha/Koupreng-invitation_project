# Program and event contract

`contentJson.schedule` remains a flat array. Existing row properties, IDs, legacy time wording, period, end time and extension properties are retained. `agendaDays` is still accepted by the existing legacy adapter. No stored record is migrated on read.

New additive content fields:

```json
{
  "programDays": [{"id":"stable-day-id","day":1,"date":"","title":"","titleEn":"","enabled":true}],
  "schedule": [{"id":"stable-row-id","dayId":"stable-day-id","day":1,"date":"","time":"07:00","endTime":"","title":"","titleEn":"","description":"","descriptionEn":"","enabled":true}],
  "showSchedule": true,
  "eventTimezone": "Asia/Phnom_Penh",
  "eventEndDate": "",
  "eventEndTime": "",
  "calendarUid": "public-random-uuid",
  "saveTheDate": {"enabled":true,"showCountdown":true,"showCalendar":true,"showAddToCalendar":true}
}
```

Arrays define display order. Empty day dates follow the canonical event date plus day position; explicit dates stay independent. A deterministic bounded identifier groups legacy rows when editing; subsequent day and row identities persist. Empty days are stored in metadata. Row dates/day headings are also carried in the flat array for older renderers. Unknown day, row and original root content properties survive editing and serialization. Hiding a section/day/row does not delete its content.

The API's `eventDate` and `eventTime` remain authoritative, including deliberately cleared values. Content copies are kept synchronized for JSON clients. `eventTimezone` defines the wall-clock interpretation; presentation settings do not store a second countdown target. The existing `countdown` section key and `showCountdown` flag identify the whole date section for backward compatibility; `saveTheDate.showCountdown` independently controls the timer inside it.

Limits: 30 days, 200 ceremonies, ID/time text up to 100 characters, day headings 300, ceremony headings/location 500 and descriptions 5,000. Program times may retain legacy Khmer wording. Canonical event times use 24-hour machine values. Dates use Gregorian years 1000–9999. The backend checks metadata shape, references, dates, flags, text bounds, timezone, nonexistent local times and end ordering. The existing API envelope, ownership, entitlements and expected revision contract are unchanged.
