import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DATE_STYLES, PROGRAM_STYLES, invitationStyles } from './invitationStyles';
import DatePresentation from './DatePresentation';
import { EventCalendar } from './SaveTheDate';
import ProgramTimeline from './ProgramTimeline';
import { draftToInvitationPayload, publicInvitationToDraft } from '../../wedding-builder/utils/invitationDraftAdapter';
import { buildTemplateContent } from '../experience/config/templateExperienceContent';
import { KHMER_FLORAL_GOLD_TEMPLATE, KHMER_CELESTIAL_TEMPLATE, TEMPLATES } from '../data/templatesData';
import { templateCapabilities } from '../registry/templateCapabilities';

const event = { templateId: 'khmer-floral-gold', eventDate: '2028-02-29', eventTime: '17:00', eventTimezone: 'Asia/Phnom_Penh', schedule: [{ id: 'vows', time: '17:00', title: 'Owner ceremony', titleEn: 'Owner ceremony' }] };
function roundTrip(settings) {
  const payload = draftToInvitationPayload({ ...event, invitationStyleV1: { version: 1, ...settings } }, 81);
  const reopened = publicInvitationToDraft({ ...payload, templateCode: event.templateId });
  return buildTemplateContent({ ...KHMER_FLORAL_GOLD_TEMPLATE, hostContent: { ...JSON.parse(payload.contentJson), ...reopened } }, event.templateId);
}
describe('canonical presentation styles', () => {
  it('retains phone presentation, bilingual wording and separate short cover names through save and public projection', () => {
    const settings = { monogramMode: 'short-names', groomShortName: 'វិសាល', brideShortName: 'សុភា', groomShortNameEn: 'Visal', brideShortNameEn: 'Sophea', openButtonPadding: 5, openButtonTextSize: 15, guestTextSize: 18, openButtonLabelKm: 'សូមអញ្ជើញ', openButtonLabelEn: 'Join us', genericGuestNameEn: 'Our dear friends', familyHeadingEn: 'With joy', familyIntroEn: 'Please celebrate with our families.', welcomeSeconds: 9, petalCount: 15, butterflyCount: 10, sideFlorals: false, sceneBranches: false, sceneBackground: false };
    expect(invitationStyles(roundTrip(settings))).toMatchObject(settings);
    expect(invitationStyles({ invitationStyleV1: { guestTextSize: 200, openButtonPadding: -50, welcomeSeconds: 100, petalCount: -20, butterflyCount: 1000 } })).toMatchObject({ guestTextSize: 20, openButtonPadding: 4, welcomeSeconds: 10, petalCount: 0, butterflyCount: 15 });
  });
  it.each(DATE_STYLES)('round trips and renders date style $id using the saved leap date', ({ id }) => {
    const content = roundTrip({ date: id });
    expect(content.invitationStyleV1.date).toBe(id);
    expect(content.eventDate).toBe(event.eventDate);
    const html = renderToStaticMarkup(<DatePresentation content={content} english calendar={<EventCalendar date={event.eventDate} english numerals="latin" />} />);
    expect(html).toContain(`data-date-style="${id}"`);
    expect(html).toContain('2028-02-29');
  });
  it.each(PROGRAM_STYLES)('round trips and renders program style $id with owner items', ({ id }) => {
    const content = roundTrip({ program: id });
    const html = renderToStaticMarkup(<ProgramTimeline content={content} english />);
    expect(content.invitationStyleV1.program).toBe(id);
    expect(html).toContain(`data-program-style="${id}"`);
    expect(html).toContain('Owner ceremony');
  });
  it('bounds untrusted presentation settings and rejects executable artwork URLs', () => {
    expect(invitationStyles({ invitationStyleV1: { date: 'unknown', program: '__proto__', backgroundX: 300, backgroundBlur: -8, headingSize: 999, headingImage: 'javascript:alert(1)', monogramImage: '//bad.example/x' } })).toMatchObject({ date: 'traditional', program: 'classic', backgroundX: 100, backgroundBlur: 0, headingSize: 40, headingImage: '', monogramImage: '' });
  });
  it('retains cover choices and deliberate media removals through persisted/public projection', () => {
    const content = roundTrip({ guestFrame: 'royal', monogram: 'diamond', headingMode: 'image', headingImage: '', monogramMode: 'image', monogramImage: '', gallery: 'filmstrip', motion: 'none', map: 'compact', florals: false });
    expect(invitationStyles(content)).toMatchObject({ guestFrame: 'royal', monogram: 'diamond', headingImage: '', monogramImage: '', gallery: 'filmstrip', motion: 'none', map: 'compact', florals: false });
  });
  it('adapts Celestial demo content while keeping Floral artwork and independent source objects', () => {
    expect(KHMER_FLORAL_GOLD_TEMPLATE.groom).toBe(KHMER_CELESTIAL_TEMPLATE.groom);
    expect(KHMER_FLORAL_GOLD_TEMPLATE.eventDate).toBe(KHMER_CELESTIAL_TEMPLATE.machineEventDate.slice(0, 10));
    expect(KHMER_FLORAL_GOLD_TEMPLATE.family).toEqual(KHMER_CELESTIAL_TEMPLATE.family);
    expect(KHMER_FLORAL_GOLD_TEMPLATE.family).not.toBe(KHMER_CELESTIAL_TEMPLATE.family);
    expect(KHMER_FLORAL_GOLD_TEMPLATE.backgroundImage).toContain('khmer-floral-gold');
    expect(KHMER_FLORAL_GOLD_TEMPLATE.music).toBe('/music/Noly%20Record%20-%20wedding-Song.mp3');
  });
  it.each(TEMPLATES)('exposes style capabilities separately from template price: $id', template => {
    const caps = templateCapabilities(template);
    expect(caps.programStyles).toBe(true);
    expect(caps.dateStyles).toBe(template.code === 'royal-garden-cinematic' ? undefined : true);
    if (template.code === 'khmer-floral-gold') expect(caps).toMatchObject({ coverStyles: true, preWeddingVideo: true, monogram: false, illustratedMap: false });
  });
});
