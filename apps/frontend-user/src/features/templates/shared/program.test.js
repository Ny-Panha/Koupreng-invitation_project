import { describe, expect, it } from 'vitest';
import { legacyProgram, normalizeProgram, programDate, validProgramDate } from './program';
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
    const vm = buildTemplateContent({ id: 'garden-royal-khmer-wedding', hostContent: { schedule: [row], storyChapters: [] } });
    expect(vm.schedule[0]).toMatchObject(row);
    expect(vm.story).toEqual([]);
    expect(normalizeProgram({ wrong: [] })).toEqual([]);
  });
});
