import { describe, expect, it } from 'vitest';
import { absoluteInstant, calendarMonth, countdownParts, formatEventDate, formatNumerals, resolveEvent, shiftMonth, wallTimeToInstant } from './eventDateTime';
import { buildEventCalendar } from './eventCalendarExport';
import { publicInvitationToDraft } from '../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';

describe('event timezone and countdown boundaries', () => {
  it.each([
    ['2026-12-05', '17:00', 'Asia/Phnom_Penh', '2026-12-05T10:00:00Z'],
    ['2027-01-01', '00:30', 'Asia/Tokyo', '2026-12-31T15:30:00Z'],
    ['2028-02-29', '12:00', 'Europe/London', '2028-02-29T12:00:00Z'],
    ['2027-07-01', '17:00', 'America/New_York', '2027-07-01T21:00:00Z'],
    ['2027-01-01', '17:00', 'America/New_York', '2027-01-01T22:00:00Z'],
    ['2027-04-01', '17:00', 'Asia/Kathmandu', '2027-04-01T11:15:00Z'],
    ['2027-11-07', '01:30', 'America/New_York', '2027-11-07T05:30:00Z'],
  ])('converts %s %s in %s independently of browser timezone', (date, time, zone, iso) => {
    expect(wallTimeToInstant(date, time, zone)).toBe(Date.parse(iso));
  });
  it.each([['2027-02-29', '07:00', 'UTC'], ['2027-03-14', '02:30', 'America/New_York'], ['2027-01-01', '', 'UTC'], ['2027-01-01', '24:00', 'UTC'], ['2027-01-01', '17:00', 'Invalid/Zone']])('rejects invalid or nonexistent %s %s %s', (d, t, z) => expect(wallTimeToInstant(d, t, z)).toBeNull());
  it('keeps the canonical event date authoritative over stale template targets', () => {
    expect(resolveEvent({ eventDate: '2027-01-01', eventTime: '', targetDate: '2030-01-01T00:00:00Z' })).toMatchObject({ date: '2027-01-01', allDay: true, instant: null });
    expect(resolveEvent({ targetDate: '2026-12-05T10:00:00Z' })).toMatchObject({ date: '2026-12-05', time: '17:00' });
  });
  it('preserves a deliberately cleared API event date/time over old customization JSON', () => {
    const draft = publicInvitationToDraft({ templateCode: 'silk-heritage', eventDate: '2027-01-01', eventTime: null, contentJson: JSON.stringify({ eventDate: '2030-01-01', eventTime: '17:00', event: { date: '2030-01-01', receptionTime: '18:00' } }) });
    expect(resolveEvent(draftToTemplate(draft).tpl.hostContent)).toMatchObject({ date: '2027-01-01', allDay: true, instant: null });
    const empty = publicInvitationToDraft({ templateCode: 'silk-heritage', eventDate: null, eventTime: null, contentJson: JSON.stringify({ eventDate: '2030-01-01', eventTime: '17:00' }) });
    expect(resolveEvent(draftToTemplate(empty).tpl.hostContent)).toMatchObject({ validDate: false, instant: null });
  });
  it.each([0, 500, 3600000, 86400000, 32 * 86400000, 366 * 86400000])('recomputes from the clock after a %dms delayed callback', delay => {
    const target = Date.parse('2028-01-01T00:00:00Z');
    const value = countdownParts(target, target - delay);
    expect(value.d).toBe(String(Math.floor(Math.ceil(delay / 1000) / 86400)).padStart(2, '0'));
    expect(value.expired).toBe(delay === 0);
  });
  it('returns zero for past/invalid targets without inventing a future event', () => {
    expect(countdownParts('bad')).toMatchObject({ d: '00', s: '00', valid: false });
    expect(countdownParts('2020-01-01T00:00:00Z')).toMatchObject({ d: '00', s: '00', expired: true });
    expect(absoluteInstant('2027-02-30T00:00:00Z')).toBeNull();
  });
});

describe('localized Gregorian calendar', () => {
  it.each([['2028-02-29', 29, 2], ['2027-02-01', 28, 1], ['2026-12-05', 31, 2], ['2027-01-01', 31, 5]])('aligns %s with correct month length', (date, length, leading) => {
    const cells = calendarMonth(date);
    expect(cells.filter(Boolean)).toHaveLength(length);
    expect(cells.indexOf(date.slice(0, 7) + '-01')).toBe(leading);
    expect(cells).toContain(date); expect(cells.length % 7).toBe(0);
  });
  it('navigates year boundaries and formats Khmer without changing authored text', () => {
    expect(shiftMonth('2027-01-01', -1)).toBe('2026-12-01');
    expect(shiftMonth('2027-12-01', 1)).toBe('2028-01-01');
    expect(formatNumerals('0123456789', 'khmer')).toBe('០១២៣៤៥៦៧៨៩');
    expect(formatEventDate('2026-12-05', false)).toContain('២០២៦');
    expect(formatEventDate('2026-12-05', false, 'khmer', { weekday: 'long' })).toBe('ថ្ងៃសៅរ៍ ទី៥ ខែធ្នូ ឆ្នាំ២០២៦');
    expect(formatEventDate('2026-12-05', false, 'latin', { day: undefined })).toBe('ខែធ្នូ ឆ្នាំ2026');
    expect(formatEventDate('bad')).toBe(''); expect(calendarMonth('bad')).toEqual([]);
  });
});

// Independent reader verifies the emitted format (not a snapshot of the writer).
function parseCalendar(text) {
  expect(text.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  for (const line of text.trimEnd().split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  const lines = text.replace(/\r\n[ \t]/g, '').split('\r\n');
  expect(lines[0]).toBe('BEGIN:VCALENDAR'); expect(lines).toContain('VERSION:2.0');
  expect(lines).toContain('BEGIN:VEVENT'); expect(lines).toContain('END:VEVENT');
  return Object.fromEntries(lines.filter(line => line.includes(':')).map(line => { const i = line.indexOf(':'); return [line.slice(0, i), line.slice(i + 1)]; }));
}
describe('safe UTF-8 iCalendar export', () => {
  const content = { title: 'ពិធីមង្គលការ'.repeat(25) + ', Family; love\\together\nNew line', eventDate: '2026-12-05', eventTime: '17:00', eventTimezone: 'Asia/Phnom_Penh', venueName: 'Garden', calendarUid: 'stable-event', inviteToken: 'PRIVATE-SECRET', guest: { name: 'PRIVATE-GUEST' }, saveTheDate: { subtitle: 'Hello\r\nATTENDEE:injected' } };
  it('parses one event with escaped text, stable identity, UTC times and no private fields', () => {
    const text = buildEventCalendar(content, Date.parse('2026-10-25T00:00:00Z'));
    const event = parseCalendar(text);
    expect(event.UID).toBe('stable-event@calendar.koupreng');
    expect(event.DTSTART).toBe('20261205T100000Z'); expect(event.DTEND).toBe('20261205T120000Z');
    expect(event.DESCRIPTION).toBe('Hello\\nATTENDEE:injected'); expect(event.ATTENDEE).toBeUndefined();
    expect(event.SUMMARY).toContain('\\, Family\\;'); expect(event.SUMMARY).toContain('ពិធីមង្គលការ'.repeat(25));
    expect(text).not.toMatch(/PRIVATE/);
    expect(parseCalendar(buildEventCalendar(content)).UID).toBe(event.UID);
  });
  it('uses explicit end times and rejects an earlier end', () => {
    expect(parseCalendar(buildEventCalendar({ ...content, eventEndTime: '20:00' })).DTEND).toBe('20261205T130000Z');
    expect(() => buildEventCalendar({ ...content, eventEndTime: '16:00' })).toThrow(/end/);
  });
  it('exports missing time as all day with exclusive next-day end across leap/year boundaries', () => {
    const event = parseCalendar(buildEventCalendar({ ...content, eventDate: '2028-02-29', eventTime: '' }));
    expect(event['DTSTART;VALUE=DATE']).toBe('20280229'); expect(event['DTEND;VALUE=DATE']).toBe('20280301');
    expect(parseCalendar(buildEventCalendar({ ...content, eventDate: '2027-12-31', eventTime: '' }))['DTEND;VALUE=DATE']).toBe('20280101');
  });
  it('rejects invalid events and a DST gap', () => {
    expect(() => buildEventCalendar({})).toThrow();
    expect(() => buildEventCalendar({ ...content, eventDate: '2027-03-14', eventTime: '02:30', eventTimezone: 'America/New_York' })).toThrow();
  });
});
