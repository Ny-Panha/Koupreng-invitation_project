import { describe, expect, it } from 'vitest';
import { KHMER_FLORAL_GOLD_TEMPLATE as template } from '../../data/khmerFloralGoldTemplate';
import { getTemplatePreset, templateFromCatalogItem } from '../../data/templatesData';
import { normalizeTemplateViewModel } from '../../model/templateModel';
import { getDedicatedTemplateComponent, templateRegistry } from '../../registry/templateRegistry';
import { isPublicCatalogTemplate, requiresTemplateAccess } from '../../model/catalogPolicy';
import { buildTemplateContent } from '../../experience/config/templateExperienceContent';
import { floralContent, floralInitials, floralLocales, floralPhotos, floralSections } from './floralModel';
import { resolveEvent, countdownParts, calendarMonth } from '../../shared/eventDateTime';
import { getTemplateFormFlow } from '../../../invitations/config/templateFormFlowConfig';

describe('Khmer Floral Gold integration', () => {
  it('resolves by trusted stable code and requires a real active catalog record', () => {
    expect(getDedicatedTemplateComponent({ id: 1, code: template.code })).toBe(templateRegistry.KHMER_FLORAL_GOLD);
    expect(isPublicCatalogTemplate(template)).toBe(false);
    expect(isPublicCatalogTemplate({ ...template, id: 81, status: 'ACTIVE' })).toBe(true);
    expect(requiresTemplateAccess(template)).toBe(false);
  });
  it('projects both complete demo languages without losing photographs', () => {
    const content = buildTemplateContent(template, template.code);
    expect(floralLocales(content, false)).toEqual(['km', 'en']);
    for (const locale of ['km', 'en']) {
      const vm = floralContent(content, locale);
      expect(vm.messageText).toBe(template.localizedContentV1[locale].messageText);
      expect(vm.groom).toBe(template.localizedContentV1[locale].groomName);
      expect(floralPhotos(vm, locale === 'en')).toHaveLength(4);
    }
  });
  it('does not prefill a new host with sample people, photos, venue or program', () => {
    const preset = getTemplatePreset(template);
    expect(preset.coverImage || '').toBe('');
    expect(preset.groomName || '').toBe('');
    expect(preset.schedule).toEqual([]);
    const content = buildTemplateContent({ ...template, hostContent: { couple: {}, gallery: [], venueName: '', sketchMapImage: '', eventDate: '' } }, template.code);
    const vm = floralContent(normalizeTemplateViewModel({}, content), 'km');
    expect(vm.groom).toBe('');
    expect(vm.sketchMapImage).toBe('');
    expect(floralInitials(vm)).toBe('');
    expect(floralPhotos(vm, false)).toEqual([]);
    expect(vm.invitationImage).toBe('');
    expect(vm.music).toBeFalsy();
    expect(templateFromCatalogItem({ id: 81, code: template.code, status: 'ACTIVE', description: '{}' }).music).toBeNull();
  });
  it('uses owner media, rejects executable URLs and respects hidden/order settings', () => {
    expect(floralPhotos({ photos: [{ src: 'javascript:alert(1)' }, { src: '/uploads/owner.webp' }] }, true)).toEqual([expect.objectContaining({ src: '/uploads/owner.webp' })]);
    expect(floralSections({ sectionOrder: ['gallery', 'venue', 'gallery'], enabledSections: { family: false }, showCountdown: false }).slice(0, 2)).toEqual(['gallery', 'map']);
    expect(floralSections({ enabledSections: { family: false }, showCountdown: false })).not.toContain('family');
    expect(floralSections({ showCountdown: false })).not.toContain('countdown');
  });
  it('uses the saved Phnom Penh wall time, leap calendar and stops countdown at zero', () => {
    const event = resolveEvent({ eventDate: '2028-02-29', eventTime: '17:00', eventTimezone: 'Asia/Phnom_Penh' });
    expect(new Date(event.instant).toISOString()).toBe('2028-02-29T10:00:00.000Z');
    expect(calendarMonth(event.date).filter(day => day === '2028-02-29')).toHaveLength(1);
    expect(countdownParts(event.instant, event.instant + 1000)).toMatchObject({ expired: true, d: '00', h: '00', m: '00', s: '00' });
  });
  it('withholds incomplete English and preserves a customized initials string', () => {
    expect(floralLocales({ ...template, localizedContentV1: { ...template.localizedContentV1, en: {} } }, true)).toEqual(['km']);
    expect(floralInitials({ monogramText: 'ដ ស' })).toBe('ដ ស');
    expect(getTemplateFormFlow(template).sectionOrder).toContain('couplePhoto');
    expect(floralSections({ saveTheDate: { enabled: false } })).not.toContain('countdown');
  });
});
