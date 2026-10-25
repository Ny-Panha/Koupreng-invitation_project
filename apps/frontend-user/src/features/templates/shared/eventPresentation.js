// Additive fields shared by editor, preview and public adapters.
export function eventPresentationFields(source = {}) {
  return Object.fromEntries(['programDays', 'showSchedule', 'saveTheDate', 'eventTimezone', 'eventEndDate', 'eventEndTime', 'calendarUid']
    .filter(key => source[key] !== undefined).map(key => [key, source[key]]));
}
