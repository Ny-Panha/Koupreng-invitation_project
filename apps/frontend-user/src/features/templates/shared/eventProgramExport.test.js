import { describe, expect, it } from 'vitest';
import { buildEventCalendar, buildProgramCalendar } from './eventCalendarExport';

// Independent content-line reader; it unfolds before splitting VEVENT records.
function readEvents(calendar) {
  expect(calendar.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  for (const line of calendar.trimEnd().split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  return calendar.replace(/\r\n[ \t]/g, '').split('BEGIN:VEVENT\r\n').slice(1).map(block => Object.fromEntries(block.split('END:VEVENT')[0].trimEnd().split('\r\n').map(line => {
    const colon = line.indexOf(':'); return [line.slice(0, colon), line.slice(colon + 1)];
  })));
}
const content = {
  calendarUid: 'wedding-one', title: 'Our wedding', eventDate: '2026-12-31', eventTime: '17:00', eventTimezone: 'Asia/Phnom_Penh', venueName: 'Garden',
  guestToken: 'PRIVATE-TOKEN', privateWishes: ['PRIVATE-WISH'], khqrDollar: { accountNumber: 'PRIVATE-ACCOUNT' }, preWeddingVideo: { url: 'https://private.invalid/SECRET.mp4' },
  programDays: [{ id: 'one', date: '2026-12-31' }, { id: 'two', date: '2027-01-01' }],
  schedule: [{ id: 'blessing', dayId: 'one', time: '17:00', endTime: '18:00', title: 'ពិធី'.repeat(50), titleEn: 'Blessing', description: 'Line one\r\nATTENDEE:bad,semicolon;back\\slash', location: 'Family home' },
    { id: 'reception', dayId: 'two', time: '11:00', title: 'ទទួលភ្ញៀវ', titleEn: 'Reception', locationEn: 'Garden hall' }],
};
describe('multi-ceremony iCalendar export', () => {
  it('writes valid separate UTC events across the year using only public event details', () => {
    const result = buildProgramCalendar(content, { now: Date.parse('2026-10-28T00:00:00Z') });
    expect(result).toMatchObject({ exported: 2, skipped: 0 });
    const events = readEvents(result.calendar); expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ DTSTART: '20261231T100000Z', DTEND: '20261231T110000Z', DTSTAMP: '20261028T000000Z', LOCATION: 'Family home' });
    expect(events[1]).toMatchObject({ DTSTART: '20270101T040000Z', DTEND: '20270101T060000Z', LOCATION: 'Garden' });
    expect(events[0].SUMMARY).toBe('ពិធី'.repeat(50)); expect(events[0].ATTENDEE).toBeUndefined();
    expect(events[0].DESCRIPTION).toBe('Line one\\nATTENDEE:bad\\,semicolon\\;back\\\\slash');
    expect(result.calendar).not.toMatch(/PRIVATE|SECRET|guestToken|khqrDollar/);
  });
  it('keeps UIDs stable across reorder, time, date and localized-title edits', () => {
    const before = readEvents(buildProgramCalendar(content).calendar).map(event => event.UID);
    const next = { ...content, schedule: [...content.schedule].reverse().map(row => ({ ...row, time: '12:00', endTime: '', title: 'Changed' })), programDays: [...content.programDays].reverse().map(day => ({ ...day, date: '2028-02-29' })) };
    expect(readEvents(buildProgramCalendar(next, { english: true }).calendar).map(event => event.UID).sort()).toEqual(before.sort());
    expect(new Set(before).size).toBe(2);
  });
  it('localizes authored titles, descriptions and locations without translating names', () => {
    const events = readEvents(buildProgramCalendar(content, { english: true }).calendar);
    expect(events[0].SUMMARY).toBe('Blessing'); expect(events[1].LOCATION).toBe('Garden hall');
  });
  it.each([{ time: '' }, { time: '៧:០០ ព្រឹក' }, { time: '24:00' }, { endTime: '16:00' }, { title: '', titleEn: '' }])('reports invalid optional rows rather than inventing times: %j', patch => {
    const result = buildProgramCalendar({ ...content, schedule: [{ ...content.schedule[0], ...patch }, content.schedule[1]] });
    expect(result).toMatchObject({ exported: 1, skipped: 1 }); expect(readEvents(result.calendar)).toHaveLength(1);
  });
  it('rejects a DST gap, uses the earlier repeated wall time and preserves midnight', () => {
    const fixture = (date, time) => ({ ...content, eventTimezone: 'America/New_York', programDays: [{ id: 'one', date }], schedule: [{ ...content.schedule[0], time, endTime: '' }] });
    expect(buildProgramCalendar(fixture('2027-03-14', '02:30'))).toMatchObject({ exported: 0, skipped: 1, calendar: '' });
    expect(readEvents(buildProgramCalendar(fixture('2027-11-07', '01:30')).calendar)[0].DTSTART).toBe('20271107T053000Z');
    expect(readEvents(buildProgramCalendar(fixture('2027-01-01', '00:00')).calendar)[0].DTSTART).toBe('20270101T050000Z');
  });
  it('exports no disabled days, rows or hidden program and retains single-event behavior', () => {
    expect(buildProgramCalendar({ ...content, enabledSections: { schedule: false } })).toMatchObject({ exported: 0, skipped: 0 });
    const result = buildProgramCalendar({ ...content, programDays: content.programDays.map(day => ({ ...day, enabled: day.id !== 'two' })), schedule: content.schedule.map(row => ({ ...row, enabled: false })) });
    expect(result.exported).toBe(0);
    expect(readEvents(buildEventCalendar(content))).toHaveLength(1);
  });
  it('never replaces an explicitly invalid ceremony date with the main celebration date', () => {
    const result = buildProgramCalendar({ ...content, programDays: [{ id: 'one', date: '2027-02-30' }], schedule: [content.schedule[0]] });
    expect(result).toMatchObject({ exported: 0, skipped: 1, calendar: '' });
  });
});
