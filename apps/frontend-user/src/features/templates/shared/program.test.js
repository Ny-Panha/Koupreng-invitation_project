import { describe, expect, it } from 'vitest';
import { groupProgram, legacyProgram, normalizeProgram, programDate, serializeProgramDays, validProgramDate } from './program';
import { buildTemplateContent } from '../experience/config/templateExperienceContent';

describe('program calendar and serialization contract', () => {
  it('retains legacy agenda day dates, period labels and ceremony wording', () => {
    const rows = legacyProgram([{ title: 'ថ្ងៃទី ១', date: '2028-02-29', period: 'MORNING', items: [{ name: 'ពិធី', time: '៧:០០ ព្រឹក' }] },
      { title: 'ថ្ងៃទី ២', date: '2028-03-02', items: [{ title: 'Reception', time: '17:30' }] }]);
    expect(rows[0]).toMatchObject({ day: 1, date: '2028-02-29', period: 'MORNING', title: 'ពិធី', time: '៧:០០ ព្រឹក' });
    expect(rows[1]).toMatchObject({ day: 2, date: '2028-03-02', title: 'Reception' });
  });
  it('links only empty dates and handles leap/month/year boundaries without UTC conversion', () => {
    expect(programDate({ day: 2 }, '2028-02-28')).toBe('2028-02-29');
    expect(programDate({ day: 2 }, '2027-12-31')).toBe('2028-01-01');
    expect(programDate({ day: 2, date: '2028-04-12' }, '2028-05-01')).toBe('2028-04-12');
    expect(validProgramDate('2027-02-29')).toBe(false);
    expect(programDate({}, 'bad')).toBe('');
  });
  it('preserves legacy wording and independent day, period, end time and extension fields', () => {
    const row = { day: 2, date: '2028-02-29', time: '៥:០០ ល្ងាច', endTime: '20:00', period: 'EVENING', title: 'ពិធី', note: 'keep' };
    expect(normalizeProgram([null, row])[0]).toMatchObject(row);
    const vm = buildTemplateContent({ id: 'royal-khmer-wedding', hostContent: { schedule: [row], storyChapters: [] } });
    expect(vm.schedule[0]).toMatchObject(row);
    expect(vm.story).toEqual([]);
    expect(normalizeProgram({ wrong: [] })).toEqual([]);
  });
  it('adapts long legacy day headings to bounded stable identifiers and supports day three', () => {
    const value = [{ id: 'legacy', dayTitle: 'ពិធីមង្គលការ'.repeat(20), time: '៧:០០', title: 'ពិធី', customField: { keep: true } }];
    const days = groupProgram(value, '2027-12-31');
    expect(days[0].id.length).toBeLessThanOrEqual(100);
    expect(groupProgram(value, '2028-01-01')[0].id).toBe(days[0].id);
    expect(serializeProgramDays(days).schedule[0].customField).toEqual({ keep: true });
    expect(programDate({ day: 3 }, '2027-12-31')).toBe('2028-01-02');
    expect(validProgramDate('2011-12-30')).toBe(true);
  });
  it('rehydrates old day objects without regenerating existing IDs or reviving explicitly cleared rows', () => {
    const old = [{ date: '2028-02-29', title: 'Old day', extension: 'keep', items: [{ id: 'old-ceremony', time: '07:00', title: 'Old ceremony' }] }];
    const days = groupProgram(undefined, '', old);
    expect(days[0]).toMatchObject({ id: 'legacy-day-1', resolvedDate: '2028-02-29', extension: 'keep' });
    expect(serializeProgramDays(days).schedule[0]).toMatchObject({ id: 'old-ceremony', dayId: 'legacy-day-1' });
    expect(groupProgram([], '', old)[0].items).toEqual([]);
    expect(groupProgram([{ id: 'row', day: 2, title: 'Second' }], '2027-12-31', [{ id: 'one' }, { id: 'two' }])[1].items[0].id).toBe('row');
  });
});
