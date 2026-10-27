import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeIntro, introArtwork, DEFAULT_INTRO_ARTWORK } from '../../shared/cinematicIntro';
import { guestFrameText, motionBudget, ROYAL_ASSETS, royalGardenPresentation } from './model/royalGardenPresentation';
import RoyalGardenEntranceScene from './components/RoyalGardenEntranceScene';
import RoyalGardenCinematicLayout from './RoyalGardenCinematicLayout';
import CinematicOpeningProvider from '../../shared/Openings/CinematicOpeningProvider';
import { publicInvitationToDraft, draftToInvitationPayload } from '../../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../../wedding-builder/utils/draftToTemplate';

beforeEach(() => {
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Royal Garden V3 presentation and compatibility', () => {
  it('keeps existing openings ivory and opts the new arch into the royal information scene', () => {
    expect(royalGardenPresentation({}).information.enabled).toBe(false);
    expect(royalGardenPresentation({ cinematicIntro: { style: 'golden-calligraphy' } }).royal).toBe(false);
    expect(introArtwork(normalizeIntro())).toBe(DEFAULT_INTRO_ARTWORK);
    expect(introArtwork(normalizeIntro({ style: 'royal-arch' }))).toBe(ROYAL_ASSETS.calligraphy);
    expect(royalGardenPresentation({ cinematicIntro: { style: 'royal-arch' } }).information).toMatchObject({ enabled: true, fixed: true });
  });
  it.each(['', null, '/uploads/owner.webp'])('preserves explicit presentation values %s across both save/render pipelines', source => {
    const cinematicIntro = { style: 'royal-arch', artworkSrc: source, entranceFrame: source, coverX: 25, coverZoom: 1.25, titleMode: 'text', guestFrameEnabled: false, slides: [] };
    const informationScene = { backgroundAsset: source, fixedBackground: false, effects: { butterfly: true }, video: { fit: 'cover', followUpPhotos: true } };
    const payload = draftToInvitationPayload({ templateId: 'royal-garden-cinematic', couple: { groom: 'Owner', bride: 'Partner' }, event: { date: '2027-12-05' }, cinematicIntro, informationScene, gallery: [] });
    const draft = publicInvitationToDraft({ ...payload, templateCode: 'royal-garden-cinematic' });
    expect(draft.cinematicIntro).toEqual(cinematicIntro); expect(draft.informationScene).toEqual(informationScene);
    expect(draftToTemplate(draft).tpl.hostContent.informationScene).toEqual(informationScene);
    const settings = royalGardenPresentation(draft);
    expect(settings.information.background).toBe(source || ''); expect(settings.entrance.frame).toBe(source || '');
    expect(settings.video).toMatchObject({ fit: 'cover', followUpPhotos: true });
  });
  it('rejects unsafe assets, clamps motion and geometry, and keeps the video media contract separate', () => {
    const input = { cinematicIntro: { entranceFrame: 'javascript:alert(1)', entranceFrameScale: 100, coverX: -30 }, informationScene: { backgroundAsset: 'data:text/html,bad', panelOpacity: 0, motionPreset: 'huge', video: { fit: 'script', src: 'https://untrusted.invalid/private.mp4' } } };
    expect(normalizeIntro(input.cinematicIntro)).toMatchObject({ entranceFrame: '', entranceFrameScale: 1.1, coverX: 0 });
    const value = royalGardenPresentation(input);
    expect(value.information).toMatchObject({ background: '', panelOpacity: 0 });
    expect(value.video).toMatchObject({ fit: 'cover' }); expect(value.video).not.toHaveProperty('src');
    expect(value.motion.preset).toBe('subtle');
  });
  it.each(['', '/owner-song.mp3'])('keeps an owner music choice %s instead of inheriting the catalog song', musicUrl => {
    const draft = { templateCode: 'royal-garden-cinematic', couple: { groom: 'Owner', bride: 'Partner' }, musicUrl };
    expect(draftToTemplate(draft).tpl.musicUrl).toBe(musicUrl);
    expect(draftToTemplate({ ...draft, musicUrl: undefined, music: musicUrl ? { url: musicUrl } : null }).tpl.musicUrl).toBe(musicUrl);
  });
  it('only takes personalized text from authorized guest context, without retaining a prior guest', () => {
    expect(guestFrameText({ isPersonalizedGuest: true, guestName: 'Guest A' }, true)).toBe('Guest A');
    expect(guestFrameText({ guestName: 'Guest A' }, true)).toBe('You and your family');
    expect(guestFrameText({ isPersonalizedGuest: true, guestName: '' }, true)).toBe('You and your family');
  });
  it.each([{ reduced: true }, { saveData: true }])('suppresses decorative motion for %j', preference => {
    expect(motionBudget('cinematic', preference).particles).toBe(0);
  });
  it('bounds the mobile particle budget and honors off', () => {
    expect(motionBudget('cinematic', { mobile: true }).particles).toBe(16);
    expect(motionBudget('balanced').particles).toBe(12); expect(motionBudget('off').butterflies).toBe(0);
  });
});

describe('royal entrance and video recovery', () => {
  it('retains the real photo, live names and safe text if decorative assets fail', () => {
    const content = { coverBackgroundImage: '/owner.webp', isPersonalizedGuest: true, guestName: '<script>guest</script>', cinematicIntro: { style: 'royal-arch', titleMode: 'artwork' } };
    const { container } = render(<RoyalGardenEntranceScene content={content} intro={normalizeIntro(content.cinematicIntro)} presentation={royalGardenPresentation(content)} sequence={{ stage: 'COVER' }} title="Our day" names="Owner & Partner" date="5 December" english onOpen={vi.fn()} />);
    expect(container.querySelector('.cover-bg-media')).toHaveAttribute('src', '/owner.webp');
    expect(container.querySelector('.cover-bg-media')).not.toHaveAttribute('srcset');
    expect(container.querySelector('.rg-guest-frame')).toHaveTextContent('<script>guest</script>'); expect(container.querySelector('script')).toBeNull();
    fireEvent.error(container.querySelector('.rg-royal-arch img')); fireEvent.error(container.querySelector('.rg-entrance-lettering img'));
    expect(screen.getByRole('heading', { name: 'Our day' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open invitation' })).toBeEnabled();
    expect(container.querySelector('.rg-entrance-names')).toHaveTextContent('Owner & Partner');
  });
  it('uses the catalog portrait variant without changing the canonical source', () => {
    const content = { mainImage: ROYAL_ASSETS.demoPortrait, cinematicIntro: { style: 'royal-arch' } };
    const { container } = render(<RoyalGardenEntranceScene content={content} intro={normalizeIntro(content.cinematicIntro)} presentation={royalGardenPresentation(content)} sequence={{ stage: 'COVER' }} title="Our day" names="Owner & Partner" english onOpen={vi.fn()} />);
    expect(container.querySelector('.cover-bg-media')).toHaveAttribute('src', ROYAL_ASSETS.demoPortrait);
    expect(container.querySelector('.cover-bg-media')).toHaveAttribute('srcset', expect.stringContaining(ROYAL_ASSETS.demoPortraitSmall));
  });
  function show({ loadVideo, reduced = false, followUpPhotos = false, endBehavior = 'collapse', sound = 'muted' } = {}) {
    const content = { hasHostContent: true, groomName: 'Owner', brideName: 'Partner', languageMode: 'EN', musicUrl: '/music.mp3', cinematicIntro: { style: 'royal-arch', reducedMotion: reduced, slides: [{ id: 'one', src: '/owner.webp' }] }, informationScene: { video: { followUpPhotos, endBehavior, sound } } };
    return render(<MemoryRouter><CinematicOpeningProvider configuration={{ enabled: true, videoMediaId: 42 }} loadVideo={loadVideo} demoVideo={loadVideo ? undefined : { src: '/sample.mp4' }} english>
      <RoyalGardenCinematicLayout content={content} />
    </CinematicOpeningProvider></MemoryRouter>);
  }
  it.each(['skip', 'ended', 'error'])('enters content after %s, without a popup or competing audio', async path => {
    vi.useFakeTimers(); const { container } = show();
    fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    expect(container.querySelector('[data-stage=VIDEO_PREPARING]')).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(900));
    const stage = screen.getByRole('region', { name: 'Pre-wedding video' });
    expect(screen.queryByRole('dialog')).toBeNull(); expect(stage.querySelector('form')).toBeNull();
    expect(container.querySelector('[data-stage=PRE_WEDDING_VIDEO]')).toBeInTheDocument();
    expect(stage.closest('.rg-paper')).toBeInTheDocument();
    expect(container.querySelector('#rg-family')).toBeNull();
    expect(container.querySelector('[data-cinematic-content]')).not.toHaveAttribute('hidden');
    expect(stage.querySelector('.cinematic-film-frame .cinematic-film-footer')).toBeNull();
    expect(within(stage).getByRole('button', { name: 'Skip video' })).toBeEnabled();
    expect(stage.querySelector('video').muted).toBe(true);
    const song = container.querySelector('audio'); song.currentTime = 42;
    expect(container.querySelectorAll('audio')).toHaveLength(1);
    expect(HTMLMediaElement.prototype.pause.mock.contexts.filter(node => node.tagName === 'AUDIO')).toHaveLength(0);
    if (path === 'skip') fireEvent.click(within(stage).getByRole('button', { name: 'Skip video' }));
    else fireEvent[path](stage.querySelector('video'));
    expect(container.querySelector('[data-stage=VIDEO_EXITING]')).toBeInTheDocument();
    expect(container.querySelector('#rg-family')).toBeNull();
    await act(async () => vi.advanceTimersByTime(750));
    expect(container.querySelector('audio')).toBe(song); expect(song.currentTime).toBe(42);
    expect(screen.queryByRole('dialog')).toBeNull(); expect(container.querySelector('[data-stage=CONTENT]')).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(30000)); expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('can cancel before the delayed video opens', async () => {
    vi.useFakeTimers(); const { container } = show(); fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
    await act(async () => vi.advanceTimersByTime(30000));
    expect(screen.queryByRole('dialog')).toBeNull(); expect(container.querySelector('[data-stage=CONTENT]')).toBeInTheDocument();
  });
  it('keeps the same information shell and offers a fresh replay after completion when configured', async () => {
    vi.useFakeTimers(); const { container } = show({ endBehavior: 'poster', sound: 'on' });
    fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    await act(async () => vi.advanceTimersByTime(900));
    const background = container.querySelector('.rg-information-background');
    expect(container.querySelector('video').muted).toBe(true);
    fireEvent.ended(container.querySelector('video'));
    await act(async () => vi.advanceTimersByTime(750));
    expect(container.querySelector('.rg-information-background')).toBe(background);
    fireEvent.click(screen.getByRole('button', { name: 'Replay video' }));
    await act(async () => vi.advanceTimersByTime(1));
    expect(container.querySelector('video')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Skip video' }));
    await act(async () => vi.advanceTimersByTime(750));
    expect(container.querySelector('[data-stage=CONTENT]')).toBeInTheDocument();
  });
  it('uses the optional photo follow-up only when configured', async () => {
    vi.useFakeTimers(); const { container } = show({ followUpPhotos: true }); fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    await act(async () => vi.advanceTimersByTime(900)); fireEvent.ended(screen.getByRole('region', { name: 'Pre-wedding video' }).querySelector('video'));
    await act(async () => vi.advanceTimersByTime(750));
    expect(container.querySelector('[data-stage=PHOTO_SLIDESHOW]')).toBeInTheDocument();
  });
  it('does not request protected media when reduced motion bypasses the intro', () => {
    const loadVideo = vi.fn(); const { container } = show({ loadVideo, reduced: true }); fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    expect(loadVideo).not.toHaveBeenCalled(); expect(container.querySelector('[data-stage=CONTENT]')).toBeInTheDocument();
  });
  it('falls back when protected playback rejects access', async () => {
    vi.useFakeTimers(); const loadVideo = vi.fn().mockRejectedValue(new Error('403'));
    const { container } = show({ loadVideo }); fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    await act(async () => vi.advanceTimersByTime(900));
    await act(async () => vi.advanceTimersByTime(750));
    expect(loadVideo).toHaveBeenCalledTimes(1); expect(screen.queryByRole('dialog')).toBeNull(); expect(container.querySelector('[data-stage=CONTENT]')).toBeInTheDocument();
  });
  it('times out an unresolved protected request and aborts it on exit', async () => {
    vi.useFakeTimers(); let signal;
    const loadVideo = vi.fn(value => { signal = value; return new Promise(() => {}); });
    const { container } = show({ loadVideo }); fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    await act(async () => vi.advanceTimersByTime(900)); await act(async () => vi.advanceTimersByTime(15000));
    await act(async () => vi.advanceTimersByTime(750));
    expect(signal.aborted).toBe(true); expect(container.querySelector('[data-stage=CONTENT]')).toBeInTheDocument();
  });
  it('waits for a visible tab before starting a prepared film', async () => {
    vi.useFakeTimers(); const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    show(); fireEvent.click(screen.getByRole('button', { name: 'Open invitation' }));
    await act(async () => vi.advanceTimersByTime(900)); expect(HTMLMediaElement.prototype.play.mock.contexts.filter(node => node.tagName === 'VIDEO')).toHaveLength(0);
    hidden.mockReturnValue(false); act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(HTMLMediaElement.prototype.play.mock.contexts.filter(node => node.tagName === 'VIDEO')).toHaveLength(1);
  });
});
