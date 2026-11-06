import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KhmerFloralGoldLayout from './KhmerFloralGoldLayout';
import { floralMonogramText, floralMusic } from './floralModel';
import { invitationStyles, MONOGRAM_FRAMES } from '../../shared/invitationStyles';
import { buildTemplateContent } from '../../experience/config/templateExperienceContent';
import { KHMER_FLORAL_GOLD_TEMPLATE } from '../../data/templatesData';
import { draftToInvitationPayload, publicInvitationToDraft } from '../../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../../wedding-builder/utils/draftToTemplate';
import { visibleProgramDays } from '../../shared/program';

const song = '/music/Noly%20Record%20-%20wedding-Song.mp3';
const base = { variant: 'khmer-floral-gold', languageMode: 'EN', title: 'Our wedding', groom: 'Bopha', bride: 'Vibol', groomEn: 'Bopha', brideEn: 'Vibol', music: song, invitationStyleV1: { motion: 'none' }, enabledSections: { family: false, invitation: false, couplePhoto: false, countdown: false, schedule: false, map: false, gallery: false, closing: false, rsvp: false } };
const layout = (content = base, props = {}) => <MemoryRouter><KhmerFloralGoldLayout content={content} {...props} /></MemoryRouter>;
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function () { this.dispatchEvent(new Event('pause')); });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Regal Scroll Gold canonical cover', () => {
  it('uses separate short names only on the cover, with full-name and locale fallbacks', () => {
    const content = { groom: 'សុវណ្ណវិសាល សិរីមង្គល', bride: 'សុភមង្គល បុប្ផារាជសិរី', invitationStyleV1: { groomShortName: 'វិសាល', brideShortName: 'សុភា', groomShortNameEn: 'Visal', brideShortNameEn: 'Sophea' } };
    expect(floralMonogramText(content,'short-names')).toBe('វិសាល\n&\nសុភា');
    expect(floralMonogramText({ ...content, languageMode: 'EN' },'short-names')).toBe('Visal\n&\nSophea');
    expect(floralMonogramText({ ...content, invitationStyleV1: {} },'short-names')).toBe(`${content.groom}\n&\n${content.bride}`);
    expect(floralMonogramText(content,'names')).toContain(content.groom);
  });
  it('groups the marketing agenda into two dated days while retaining owner-authored schedules', () => {
    const demo = buildTemplateContent(KHMER_FLORAL_GOLD_TEMPLATE, 'khmer-floral-gold');
    const days = visibleProgramDays(demo);
    expect(days).toHaveLength(2);
    expect(days.map(day => day.titleEn)).toEqual(['Day 1', 'Day 2']);
    expect(days[1].resolvedDate).toBe(demo.eventDate);
    expect(days[0].resolvedDate).not.toBe(days[1].resolvedDate);
    expect(days.flatMap(day => day.items)).toHaveLength(KHMER_FLORAL_GOLD_TEMPLATE.schedule.length);
    const owner = { programDays: [{ id: 'authored', titleEn: 'Our own celebration', date: '2027-03-12' }], schedule: [{ id: 'own-row', dayId: 'authored', time: '11:00', title: 'Owner ceremony', titleEn: 'Owner ceremony' }] };
    const published = buildTemplateContent({ ...KHMER_FLORAL_GOLD_TEMPLATE, hostContent: owner }, 'khmer-floral-gold');
    expect(published.programDays).toEqual(owner.programDays);
    expect(published.schedule).toHaveLength(owner.schedule.length);
    expect(published.schedule).toMatchObject(owner.schedule);
  });
  it('defaults only Floral to Regal and keeps explicit legacy choices', () => {
    expect(invitationStyles(base).monogram).toBe('regal-scroll-gold');
    expect(invitationStyles({ code: 'silk-heritage' }).monogram).toBe('ornate');
    for (const { id } of MONOGRAM_FRAMES) expect(invitationStyles({ ...base, invitationStyleV1: { monogram: id } }).monogram).toBe(id);
    const view = render(layout());
    expect(view.container.querySelector('.kfg-monogram-art')).toHaveAttribute('alt', '');
    expect(view.container.querySelector('.kfg-monogram-art')).toHaveAttribute('srcset', expect.stringContaining('480w'));
    expect(view.container.querySelector('.kfg-monogram')).toHaveTextContent('B V');
  });
  it('bounds saved frame controls and rejects unsafe colors', () => {
    expect(invitationStyles({ ...base, invitationStyleV1: { monogramSize: 10, monogramTextSize: 500, monogramOpacity: -1, monogramOffset: 300, monogramTextColor: 'url(bad)', monogramAlign: 'bad' } })).toMatchObject({ monogramSize: 1.15, monogramTextSize: 48, monogramOpacity: .5, monogramOffset: 12, monogramTextColor: '#876326', monogramAlign: 'center' });
  });
  it('keeps custom text, Khmer graphemes and complete couple names editable', () => {
    const names = { groom: 'សុវណ្ណ', bride: 'មាលា', monogramText: 'Custom' };
    expect(floralMonogramText(names, 'auto')).toBe('សុ មា');
    expect(floralMonogramText(names, 'text')).toBe('Custom');
    expect(floralMonogramText(names, 'names')).toBe('សុវណ្ណ\n&\nមាលា');
    const mapped = draftToTemplate({ templateId: 'khmer-floral-gold', monogramText: 'B & V', design: { monogramText: 'old' } });
    expect(buildTemplateContent(mapped.tpl, mapped.variant).monogramText).toBe('B & V');
  });
  it('uses the requested editable staircase names only in the marketing demo', () => {
    const names = KHMER_FLORAL_GOLD_TEMPLATE.monogramText.split('\n');
    expect(names).toEqual([expect.stringMatching(/\S/), '&', expect.stringMatching(/\S/)]);
    const view = render(layout({ ...base, monogramText: KHMER_FLORAL_GOLD_TEMPLATE.monogramText, invitationStyleV1: KHMER_FLORAL_GOLD_TEMPLATE.invitationStyleV1 }));
    expect([...view.container.querySelectorAll('.kfg-monogram-staircase > span')].map(node => node.textContent)).toEqual(names);
  });
  it.each(MONOGRAM_FRAMES)('round trips $id and all controls through the save/public adapters', ({ id }) => {
    const settings = { version: 1, monogram: id, monogramMode: 'names', monogramSize: 1.1, monogramTextSize: 24, monogramTextColor: '#765321', monogramAlign: 'right', monogramOpacity: .8, monogramOffset: 8, monogramTreatment: 'champagne' };
    const payload = draftToInvitationPayload({ templateId: 'khmer-floral-gold', invitationStyleV1: settings });
    const draft = publicInvitationToDraft({ ...payload, templateCode: 'khmer-floral-gold' });
    expect(draft.invitationStyleV1).toEqual(settings);
    const content = buildTemplateContent({ ...KHMER_FLORAL_GOLD_TEMPLATE, hostContent: { ...JSON.parse(payload.contentJson), ...draft } }, 'khmer-floral-gold');
    expect(invitationStyles(content)).toMatchObject(settings);
  });
  it('keeps uploaded logos inside Regal without rasterizing their accessible text', () => {
    const view = render(layout({ ...base, monogramText: 'B & V', invitationStyleV1: { monogramMode: 'image', monogramImage: '/uploads/logo.webp' } }));
    expect(view.container.querySelector('.kfg-monogram .kfg-monogram-logo')).toHaveAttribute('alt', 'B & V');
  });
});

describe('Floral guest music', () => {
  it('keeps the welcome for seven seconds and groups Skip beside music', () => {
    vi.useFakeTimers();
    try {
      const view = render(layout({ ...base, invitationStyleV1: { motion: 'elegant' } }));
      fireEvent.click(view.container.querySelector('.kfg-open'));
      act(() => vi.advanceTimersByTime(800));
      expect(view.container.querySelector('.kfg-welcome-scene')).toBeInTheDocument();
      expect(view.container.querySelector('.kfg-skip-welcome').parentElement).toBe(view.container.querySelector('.kfg-music').parentElement);
      act(() => vi.advanceTimersByTime(6500));
      expect(view.container.querySelector('.kfg-welcome-scene')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(500));
      expect(view.container.querySelector('.kfg-content')).toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });
  it.each([{}, { musicUrl: '' }, { music: null }, { musicTrackId: 'none', music: song }, { enabledSections: { music: false }, music: song }])('keeps an owner silent without a selected song: %j', host => {
    const content = buildTemplateContent({ ...KHMER_FLORAL_GOLD_TEMPLATE, hostContent: host }, 'khmer-floral-gold');
    expect(floralMusic(content)).toBe('');
  });
  it('uses authorized demo music and gives owner songs priority, including objects', () => {
    expect(floralMusic(buildTemplateContent(KHMER_FLORAL_GOLD_TEMPLATE, 'khmer-floral-gold'))).toBe(song);
    expect(floralMusic({ music: { url: '/owner.mp3' } })).toBe('/owner.mp3');
    const content = buildTemplateContent({ ...KHMER_FLORAL_GOLD_TEMPLATE, hostContent: { musicUrl: '/owner.mp3' } }, 'khmer-floral-gold');
    expect(floralMusic(content)).toBe('/owner.mp3');
  });
  it.each([{ musicUrl: song }, { music: { url: song } }, { musicTrackId: 'none', musicUrl: '', music: { url: '/old-upload.mp3' } }, {}])('retains owner music through the complete draft/template/content pipeline: %j', selected => {
    const mapped = draftToTemplate({ templateId: 'khmer-floral-gold', ...selected });
    const content = buildTemplateContent(mapped.tpl, mapped.variant);
    expect(floralMusic(content)).toBe(selected.musicTrackId === 'none' || !Object.keys(selected).length ? '' : song);
  });
  it('starts silently, plays on opening, and keeps one audio node through scenes/language', async () => {
    const view = render(layout());
    const audio = view.container.querySelector('audio');
    expect(audio).toHaveAttribute('preload', 'none');
    expect(audio.loop).toBe(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    fireEvent.click(view.container.querySelector('.kfg-open'));
    await waitFor(() => expect(view.container.querySelector('.kfg-music')).toHaveAttribute('aria-pressed', 'true'));
    expect(audio.volume).toBe(.5);
    fireEvent.change(view.container.querySelector('.kfg-language select'), { target: { value: 'km' } });
    expect(view.container.querySelectorAll('audio')).toHaveLength(1);
    expect(view.container.querySelector('audio')).toBe(audio);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    fireEvent.click(view.container.querySelector('.kfg-music'));
    expect(view.container.querySelector('.kfg-music')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(view.container.querySelector('.kfg-music'));
    await waitFor(() => expect(view.container.querySelector('.kfg-music')).toHaveAttribute('aria-pressed', 'true'));
    view.unmount();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
  it('recovers from a blocked play and reflects native pause/error state', async () => {
    HTMLMediaElement.prototype.play.mockRejectedValueOnce(new DOMException('Blocked', 'NotAllowedError'));
    const view = render(layout());
    fireEvent.click(view.container.querySelector('.kfg-open'));
    await screen.findByText('Music could not play. Use the music button to try again.');
    expect(view.container.querySelector('.kfg-content')).toBeInTheDocument();
    fireEvent.click(view.container.querySelector('.kfg-music'));
    await waitFor(() => expect(view.container.querySelector('.kfg-music')).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.pause(view.container.querySelector('audio'));
    expect(view.container.querySelector('.kfg-music')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.error(view.container.querySelector('audio'));
    expect(view.container.querySelector('.kfg-music')).toHaveAttribute('data-music-status', 'error');
  });
  it('ignores a pending play completion after the owner changes source', async () => {
    let resolve;
    HTMLMediaElement.prototype.play.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const view = render(layout());
    fireEvent.click(view.container.querySelector('.kfg-open'));
    view.rerender(layout({ ...base, music: '/new.mp3' }));
    await act(async () => { resolve(); });
    expect(view.container.querySelector('.kfg-music')).toHaveAttribute('aria-pressed', 'false');
  });
});
