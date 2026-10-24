import { describe, expect, it } from 'vitest';
import { normalizeProgram, programDate, validProgramDate } from './program';
import { buildTemplateContent } from '../experience/config/templateExperienceContent';

describe('program calendar and serialization contract', () => {
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
