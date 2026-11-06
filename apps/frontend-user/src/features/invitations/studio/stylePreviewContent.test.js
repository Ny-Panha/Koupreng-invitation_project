import { describe, expect, it } from 'vitest';
import { stylePreviewContent } from './stylePreviewContent';

describe('Studio preview examples', () => {
  it('shows representative empty date/program previews without editing the saved form', () => {
    const form = Object.freeze({ eventDate: '', schedule: Object.freeze([]) });
    const preview = stylePreviewContent(form, true);
    expect(preview.dateIsSample).toBe(true);
    expect(preview.programIsSample).toBe(true);
    expect(preview.program.schedule).toHaveLength(2);
    expect(preview.program.schedule[0].title).toBe('Family blessing');
    expect(form).toEqual({ eventDate: '', schedule: [] });
  });
  it('retains every saved ceremony, date, and disabled-row preference', () => {
    const form = { eventDate: '2027-02-20', schedule: Array.from({ length: 9 }, (_, i) => ({ id: `ceremony-${i}`, enabled: i !== 1 })) };
    const preview = stylePreviewContent(form, false);
    expect(preview.date).toBe(form);
    expect(preview.program).toBe(form);
    expect(preview.program.schedule).toHaveLength(9);
    expect(preview.programIsSample).toBe(false);
  });
});
