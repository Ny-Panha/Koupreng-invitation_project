import { describe, expect, it } from 'vitest';
import { introSlides, nextIntroState, normalizeIntro, normalizeIntroUpload, safeIntroMedia } from './cinematicIntro';
import { publicInvitationToDraft, draftToInvitationPayload } from '../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';
import { buildTemplateContent } from '../experience/config/templateExperienceContent';
import { formatEventDate } from './eventDateTime';
import { templateCapabilities } from '../registry/templateCapabilities';

describe('cinematic introduction contract', () => {
  it('recognizes actual image bytes when WebKit provides no MIME and rejects disguised HTML', async () => {
    const file = new File(['RIFF1234WEBPpayload'], 'portrait.webp', { type: 'application/octet-stream' });
    expect((await normalizeIntroUpload(file)).type).toBe('image/webp');
    await expect(normalizeIntroUpload(new File(['<html>not an image</html>'], 'portrait.jpg', { type: 'image/jpeg' }))).rejects.toThrow('JPEG');
  });
  it('keeps explicit clearing separate from inherited gallery order', () => {
    expect(normalizeIntro({ heading: '', subtitle: '', slides: [] })).toMatchObject({ heading: '', subtitle: '', slides: [] });
    expect(introSlides(normalizeIntro({ slides: [] }), [{ src: '/photo.webp' }])).toEqual([]);
    expect(introSlides(normalizeIntro(), [{ src: '/photo.webp' }])).toHaveLength(1);
  });
  it('bounds presentation controls and preserves slide order and focal points', () => {
    expect(normalizeIntro({ duration: 99, overlay: -1, slides: [{ id: 'b', src: '/b.webp', x: 180, y: 20 }, { id: 'a', src: '/a.webp' }] })).toMatchObject({ duration: 12, overlay: 0, slides: [{ id: 'b', x: 100, y: 20 }, { id: 'a', x: 50, y: 50 }] });
  });
  it.each(['javascript:alert(1)', '//evil.invalid/photo', '/\\evil.invalid/photo', 'data:text/html,hello', 'https://user:password@invalid.test/photo'])('rejects unsafe media %s', value => expect(safeIntroMedia(value)).toBe(''));
  it('advances all stages, runs every slide and handles no images', () => {
    let state = { stage: 'COVER', slide: 0 };
    const stages = [];
    for (let i = 0; i < 7; i++) { state = nextIntroState(state, 2); stages.push(state.stage); }
    expect(stages).toEqual(['ORNAMENT_REVEAL','TITLE_REVEAL','PHOTO_SLIDESHOW','PHOTO_SLIDESHOW','INVITATION_REVEAL','CONTENT','CONTENT']);
    expect(nextIntroState({ stage: 'TITLE_REVEAL', slide: 0 }, 0).stage).toBe('INVITATION_REVEAL');
  });
  it('round-trips through the save payload, public adapter and real renderer content', () => {
    const cinematicIntro = { version: 1, enabled: true, heading: '', music: false, slides: [{ id: 'second', src: '/second.webp', x: 20, y: 80 }, { id: 'first', src: '/first.webp', x: 50, y: 50 }], duration: 3.5 };
    const payload = draftToInvitationPayload({ templateId: 'royal-garden-cinematic', couple: { groom: 'Owner', bride: 'Partner' }, event: { date: '2028-02-29', receptionTime: '17:00' }, cinematicIntro, gallery: [] });
    const draft = publicInvitationToDraft({ ...payload, templateCode: 'royal-garden-cinematic' });
    const mapped = draftToTemplate(draft);
    const rendered = buildTemplateContent(mapped.tpl, mapped.variant);
    expect(rendered.cinematicIntro).toEqual(cinematicIntro);
    expect(rendered.gallery).toEqual([]);
    expect(rendered.groom).toBe('Owner');
    expect(templateCapabilities(mapped.tpl)).toMatchObject({ cinematicIntro: true, appearance: true, story: false });
  });
  it('can format separate Khmer month and weekday without duplicated years', () => {
    expect(formatEventDate('2026-12-25', false, 'khmer', { day: undefined, year: undefined })).toBe('ខែធ្នូ');
    expect(formatEventDate('2026-12-25', false, 'khmer', { weekday: 'long', day: undefined, month: undefined, year: undefined })).toBe('ថ្ងៃសុក្រ');
  });
});
