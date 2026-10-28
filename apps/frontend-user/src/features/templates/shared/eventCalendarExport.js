import { CALENDAR_FALLBACK_MINUTES, resolveEvent, wallTimeToInstant } from './eventDateTime';
import { visibleProgramDays, validProgramDate } from './program';

const escapeText = value => String(value || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,').split('').filter(char => char.charCodeAt(0) >= 32 || char === '\t').join('');
const stamp = instant => new Date(instant).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
function fold(line) {
  let result = '', current = '', bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) { result += `${current}\r\n`; current = ' '; bytes = 1; }
    current += char; bytes += size;
  }
  return result + current;
}
function hash(value) {
  let n = 2166136261;
  for (const char of value) n = Math.imul(n ^ char.codePointAt(0), 16777619);
  return (n >>> 0).toString(16);
}

// Explicit allowlist: never serialize the invitation object, URLs or guest data.
export function buildEventCalendar(content, now = Date.now()) {
  const event = resolveEvent(content);
  if (!event.validDate || (!event.allDay && event.instant === null)) throw new Error('A valid event date, time and timezone are required.');
  const title = content.title || content.eventTitle || 'Celebration';
  const location = [content.venueName || content.venue?.name, content.venueAddress || content.venue?.address].filter(Boolean).join(', ');
  const uid = /^[a-zA-Z0-9-]{1,80}$/.test(content.calendarUid || '') ? content.calendarUid : hash(`${title}|${event.date}|${location}`);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Koupreng//Invitation Calendar//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${uid}@calendar.koupreng`, `DTSTAMP:${stamp(now)}`];
  if (event.allDay) {
    const nextDay = new Date(`${event.date}T00:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${nextDay.toISOString().slice(0, 10).replace(/-/g, '')}`);
  } else {
    const end = content.eventEndTime ? wallTimeToInstant(content.eventEndDate || event.date, content.eventEndTime, event.timezone) : event.instant + CALENDAR_FALLBACK_MINUTES * 60000;
    if (end === null || end <= event.instant) throw new Error('Event end must be after the start.');
    lines.push(`DTSTART:${stamp(event.instant)}`, `DTEND:${stamp(end)}`);
  }
  lines.push(`SUMMARY:${escapeText(title)}`, `LOCATION:${escapeText(location)}`, `DESCRIPTION:${escapeText(content.saveTheDate?.subtitle)}`, 'END:VEVENT', 'END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

// Ceremony exports are opt-in and timed only. Free-form legacy times cannot be
// guessed. Report excluded rows to the guest instead of inventing an instant.
export function buildProgramCalendar(content, { english = false, now = Date.now() } = {}) {
  const event = resolveEvent(content);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Koupreng//Invitation Calendar//EN', 'CALSCALE:GREGORIAN'];
  const identity = /^[a-zA-Z0-9-]{1,80}$/.test(content.calendarUid || '') ? content.calendarUid : hash(`${content.slug || ''}|${content.title || ''}|${event.date}|${content.venueName || ''}`);
  let exported = 0, skipped = 0;
  for (const day of visibleProgramDays(content)) for (const row of day.items) {
    const date = day.resolvedDate;
    const start = validProgramDate(date) ? wallTimeToInstant(date, row.time, event.timezone) : null;
    const end = start === null ? null : row.endTime ? wallTimeToInstant(date, row.endTime, event.timezone) : start + CALENDAR_FALLBACK_MINUTES * 60000;
    const title = (english ? row.titleEn : row.titleKm) || row.title;
    if (start === null || end === null || end <= start || !title?.trim()) { skipped++; continue; }
    // Only public, bounded event text. No URLs, guest details, QR or JSON blobs.
    const location = (english ? row.locationEn : '') || row.location || content.venueName || content.venue?.name;
    const description = (english ? row.descriptionEn : row.descriptionKm) || row.description;
    lines.push('BEGIN:VEVENT', `UID:${identity}-${hash(`${day.id}|${row.id}`)}@calendar.koupreng`, `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escapeText(String(title).slice(0, 500))}`);
    if (location) lines.push(`LOCATION:${escapeText(String(location).slice(0, 1000))}`);
    if (description) lines.push(`DESCRIPTION:${escapeText(String(description).slice(0, 5000))}`);
    lines.push('END:VEVENT'); exported++;
  }
  lines.push('END:VCALENDAR');
  return { calendar: exported ? `${lines.map(fold).join('\r\n')}\r\n` : '', exported, skipped };
}
