import { describe, expect, it } from 'vitest';
import { editLocalizedField, projectLocale, translationReadiness, guestLocale } from './localizedContent';

describe('independent invitation content locales', () => {
  const legacy = { title: 'ពិធី', messageText: 'សូមអញ្ជើញ', groomName: 'ក', brideName: 'ខ', venueName: 'ទីតាំង', venueAddress: 'អាសយដ្ឋាន', eventType: 'WEDDING' };
  it('keeps Khmer intact through EN edits, save, reload and return', () => {
    let form = editLocalizedField(legacy, 'en', 'messageText', 'Welcome');
    form = JSON.parse(JSON.stringify(form));
    expect(form.messageText).toBe(legacy.messageText);
    expect(projectLocale(form, 'km').messageText).toBe(legacy.messageText);
    expect(projectLocale(form, 'en').messageText).toBe('Welcome');
    form = editLocalizedField(form, 'km', 'messageText', 'អរគុណ');
    expect(projectLocale(form, 'en').messageText).toBe('Welcome');
    expect(projectLocale(form, 'km').messageText).toBe('អរគុណ');
  });
  it('does not expose a draft translation from a query parameter', () => {
    const form = editLocalizedField(legacy, 'en', 'messageText', 'Draft');
    expect(guestLocale(form, 'en')).toBe('km');
    expect(translationReadiness(form).ready).toBe(false);
  });
  it('preserves deliberately empty optional wording', () => {
    const form = editLocalizedField({ ...legacy, apologyText: 'Old' }, 'km', 'apologyText', '');
    expect(projectLocale(JSON.parse(JSON.stringify(form)), 'km').apologyText).toBe('');
  });
  it('does not promote legacy English fields into the Khmer version', () => {
    const form = editLocalizedField({ ...legacy, languageMode: 'EN', messageText: 'Legacy English' }, 'km', 'title', 'New Khmer title');
    expect(projectLocale(form, 'km').messageText).toBe('');
    expect(projectLocale(form, 'en').messageText).toBe('Legacy English');
  });
  it('never duplicates canonical dates or guest tokens into localized values', () => {
    const form = editLocalizedField({ ...legacy, eventDate: '2027-01-01', token: 'private' }, 'en', 'title', 'Event');
    expect(form.localizedContentV1.km).not.toHaveProperty('token');
    expect(form.localizedContentV1.km).not.toHaveProperty('eventDate');
    expect(projectLocale(form, 'en').eventDate).toBe('2027-01-01');
  });
});
