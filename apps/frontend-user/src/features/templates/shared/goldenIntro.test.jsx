import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_INTRO_ARTWORK, introArtwork, normalizeIntro } from './cinematicIntro';
import { publicInvitationToDraft, draftToInvitationPayload } from '../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../wedding-builder/utils/draftToTemplate';
import CinematicIntroEditor from '../../invitations/studio/CinematicIntroEditor';
import RoyalGardenIntro from '../layouts/RoyalGardenCinematic/components/RoyalGardenIntro';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('golden opening artwork contract', () => {
  it('inherits the bundled artwork only when the value is absent and retains legacy opening styles', () => {
    expect(introArtwork(normalizeIntro())).toBe(DEFAULT_INTRO_ARTWORK);
    const cleared = JSON.parse(JSON.stringify(normalizeIntro({ artworkSrc: '' })));
    expect(introArtwork(normalizeIntro(cleared))).toBe('');
    expect(introArtwork(normalizeIntro({ artworkSrc: undefined }))).toBe(DEFAULT_INTRO_ARTWORK);
    expect(normalizeIntro({ style: 'oval' }).style).toBe('oval'); expect(normalizeIntro({ style: 'minimal' }).style).toBe('minimal');
  });
  it.each(['', null, '/uploads/owned-opening.webp'])('keeps artwork %s through save, public adapter and template mapping without touching slides', artworkSrc => {
    const cinematicIntro = { ...normalizeIntro({ artworkSrc }), palette: 'emerald-gold', artworkScale: .85, artworkPosition: 'upper', animationPreset: 'shimmer', slides: [{ id: 'stable-slide', src: '/portrait.webp', alt: 'Portrait', x: 20, y: 80 }] };
    const payload = draftToInvitationPayload({ templateId: 'royal-garden-cinematic', couple: { groom: 'First partner', bride: 'Second partner' }, event: { date: '2027-12-05' }, cinematicIntro, gallery: [] });
    const draft = publicInvitationToDraft({ ...payload, templateCode: 'royal-garden-cinematic' });
    const rendered = draftToTemplate(draft).tpl.hostContent.cinematicIntro;
    expect(rendered).toMatchObject({ artworkSrc: artworkSrc || '', palette: 'emerald-gold', artworkScale: .85, artworkPosition: 'upper', slides: [{ id: 'stable-slide', src: '/portrait.webp', x: 20, y: 80 }] });
    expect(draft.gallery).toEqual([]);
  });
  it('fails closed for executable artwork and bounds configuration', () => {
    const intro = normalizeIntro({ artworkSrc: 'data:image/svg+xml,<svg onload=alert(1)>', artworkScale: 100, artworkPosition: 'outside', palette: '__proto__', animationPreset: 'script' });
    expect(introArtwork(intro)).toBe(''); expect(intro).toMatchObject({ artworkScale: 1.2, artworkPosition: 'center', palette: 'ivory-royal', animationPreset: 'gentle' });
  });
  it('renders a separate contain-overlay and retains real names/date without duplicated Save the Date text', () => {
    const { container } = render(<RoyalGardenIntro intro={normalizeIntro()} sequence={{ stage: 'PHOTO_SLIDESHOW', slide: 0 }} slides={[{ id: 'portrait', src: '/portrait.webp', alt: 'Our portrait', x: 50, y: 50 }]} content={{}} title="Our celebration" names="First & Second" date="5 December 2027" english onOpen={() => {}} />);
    expect(container.querySelector('.rg-save-date-overlay')).toHaveTextContent('First & Second');
    expect(container.querySelector('.rg-save-date-overlay')).toHaveTextContent('5 December 2027');
    expect(container.querySelector('.rg-save-date-overlay')).not.toHaveTextContent('Save the Date');
    expect(container.querySelector('.rg-intro-portrait')).toHaveAttribute('src', '/portrait.webp');
  });
  it('keeps owner cover media separate from the default foreground artwork', () => {
    const { container } = render(<RoyalGardenIntro intro={normalizeIntro()} sequence={{ stage: 'COVER', slide: 0 }} slides={[]} content={{ coverBackgroundImage: '/owner-cover.webp' }} title="Our celebration" names="First & Second" date="5 December 2027" english onOpen={() => {}} />);
    expect(container.querySelector('.rg-calligraphy-image')).toHaveAttribute('src', DEFAULT_INTRO_ARTWORK);
    expect(container.querySelector('.cover-bg-root img')).toHaveAttribute('src', '/owner-cover.webp');
    expect(container.querySelector('.rg-intro-portrait')).toBeNull();
  });
  it('hands the first portrait into the slideshow and retains the last only when leaving it', () => {
    const props = { intro: normalizeIntro(), slides: [{ id: 'first', src: '/first.webp' }, { id: 'last', src: '/last.webp' }], content: {}, title: 'Our celebration', names: 'First & Second', date: '2027-12-05', english: true, onOpen: () => {} };
    const { container, rerender } = render(<RoyalGardenIntro {...props} sequence={{ stage: 'TITLE_REVEAL', slide: 0 }} />);
    expect(container.querySelector('.rg-intro-portrait[data-active=true]')).toHaveAttribute('src', '/first.webp');
    rerender(<RoyalGardenIntro {...props} sequence={{ stage: 'INVITATION_REVEAL', slide: 0 }} />);
    expect(container.querySelector('.rg-intro-portrait[data-active=true]')).toHaveAttribute('src', '/last.webp');
  });
  it('preserves removal while a selected file is still reading', async () => {
    const readers = [];
    vi.stubGlobal('FileReader', class { readAsDataURL() { readers.push(this); } });
    function Editor() { const [value, set] = useState({}); return <><CinematicIntroEditor value={value} onChange={set} english /><output data-testid="value">{JSON.stringify(value)}</output></>; }
    render(<Editor />);
    fireEvent.change(screen.getByLabelText('Upload opening artwork'), { target: { files: [new File(['RIFF1234WEBPpayload'], 'owner.webp', { type: 'image/webp' })] } });
    await waitFor(() => expect(readers).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: 'Remove opening artwork' }));
    await act(async () => { readers[0].result = 'data:image/webp;base64,UkZJRg=='; readers[0].onload(); });
    expect(JSON.parse(screen.getByTestId('value').textContent).artworkSrc).toBe('');
    expect(screen.queryByRole('img', { name: 'Golden opening artwork preview' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Use default golden artwork' }));
    expect(screen.getByRole('img', { name: 'Golden opening artwork preview' })).toHaveAttribute('src', DEFAULT_INTRO_ARTWORK);
  });
});
