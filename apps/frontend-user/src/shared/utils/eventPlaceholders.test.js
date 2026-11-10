import { describe, it, expect } from 'vitest';
import { getEventExamples, getFieldHelpers, getEventFieldLabels, EVENT_EXAMPLES } from './eventPlaceholders';

describe('eventPlaceholders', () => {
  it('provides wedding examples with Khmer ឧ. and English e.g. prefixes', () => {
    const kmWedding = getEventExamples('WEDDING', 'km');
    expect(kmWedding.title).toContain('ឧ. ពិធីមង្គលការ');
    expect(kmWedding.groomName).toContain('ឧ. លោក វីរៈ');
    expect(kmWedding.brideName).toContain('ឧ. កញ្ញា សុម៉ាលី');
    expect(kmWedding.venueName).toContain('ឧ. សណ្ឋាគារ');

    const enWedding = getEventExamples('WEDDING', 'en');
    expect(enWedding.title).toContain('e.g. Wedding Celebration');
    expect(enWedding.groomName).toContain('e.g. Mr. Virak');
    expect(enWedding.venueName).toContain('e.g. Sokha Hotel');
  });

  it('supports all core event types', () => {
    const types = ['WEDDING', 'ENGAGEMENT', 'BIRTHDAY', 'ANNIVERSARY', 'CORPORATE', 'OTHER'];
    for (const type of types) {
      const km = getEventExamples(type, 'km');
      const en = getEventExamples(type, 'en');
      expect(km.title).toBeTruthy();
      expect(en.title).toBeTruthy();
      expect(km.venueName).toBeTruthy();
      expect(en.venueName).toBeTruthy();
    }
  });

  it('falls back safely for unknown event types', () => {
    const fallback = getEventExamples('UNKNOWN_EVENT_TYPE', 'km');
    expect(fallback.title).toBe(EVENT_EXAMPLES.WEDDING.km.title);
  });

  it('provides field helper descriptions in both languages', () => {
    const kmHelpers = getFieldHelpers('km');
    expect(kmHelpers.title).toContain('ក្របសំបុត្រអញ្ជើញ');
    expect(kmHelpers.venueAddress).toContain('អាសយដ្ឋាន');

    const enHelpers = getFieldHelpers('en');
    expect(enHelpers.title).toContain('invitation cover');
    expect(enHelpers.venueAddress).toContain('address');
  });

  it('provides event-specific field labels for wedding, birthday, corporate, and anniversary', () => {
    const kmWeddingLabels = getEventFieldLabels('WEDDING', 'km');
    expect(kmWeddingLabels.groom).toBe('ឈ្មោះកូនកំលោះ');
    expect(kmWeddingLabels.bride).toBe('ឈ្មោះកូនក្រមុំ');
    expect(kmWeddingLabels.hideBride).toBe(false);
    expect(kmWeddingLabels.brideRequired).toBe(true);

    const kmBirthdayLabels = getEventFieldLabels('BIRTHDAY', 'km');
    expect(kmBirthdayLabels.groom).toBe('ឈ្មោះម្ចាស់ខួបកំណើត');
    expect(kmBirthdayLabels.hideBride).toBe(true);

    const enCorporateLabels = getEventFieldLabels('CORPORATE', 'en');
    expect(enCorporateLabels.groom).toBe('Organization / Company name');
    expect(enCorporateLabels.brideRequired).toBe(false);

    const kmAnniversaryLabels = getEventFieldLabels('ANNIVERSARY', 'km');
    expect(kmAnniversaryLabels.groom).toBe('ឈ្មោះស្វាមី');
    expect(kmAnniversaryLabels.bride).toBe('ឈ្មោះភរិយា');
  });
});
