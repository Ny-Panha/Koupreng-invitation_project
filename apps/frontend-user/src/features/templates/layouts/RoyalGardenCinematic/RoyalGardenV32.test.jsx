import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RoyalGardenWeddingCalendar from './components/RoyalGardenWeddingCalendar';
import RoyalGardenCinematicLayout from './RoyalGardenCinematicLayout';
import RoyalGardenDressCode from './components/RoyalGardenDressCode';
import RoyalGardenGifts from './components/RoyalGardenGifts';
import { royalGiftItems } from './model/royalGardenGuestPresentation';
import { visibleProgramDays, groupProgram, serializeProgramDays } from '../../shared/program';
import { eventToday, formatEventTime } from '../../shared/eventDateTime';
import { draftToInvitationPayload, publicInvitationToDraft } from '../../../wedding-builder/utils/invitationDraftAdapter';
import { draftToTemplate } from '../../../wedding-builder/utils/draftToTemplate';
import { buildTemplateContent } from '../../experience/config/templateExperienceContent';
import { editLocalizedField, projectLocale } from '../../shared/localizedContent';
import { templateCapabilities } from '../../registry/templateCapabilities';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const content = {
  eventDate: '2026-12-31', eventTime: '17:00', eventTimezone: 'Asia/Phnom_Penh', calendarUid: 'stable-wedding',
  saveTheDate: { showCalendar: true, showCountdown: true, calendarNavigation: true, showAddToCalendar: false },
  programDays: [{ id: 'day-one', title: 'ពិធីគ្រួសារ', titleEn: 'Family day', date: '2026-12-31', extension: { retained: true } }, { id: 'day-two', title: 'ពិធីមង្គលការ', titleEn: 'Wedding day', date: '2027-01-01' }],
  schedule: [{ id: 'blessing', dayId: 'day-one', time: '17:00', title: 'សូត្រមន្ត', titleEn: 'Blessing', iconKey: 'blessing', extension: 'keep' }, { id: 'reception', dayId: 'day-two', time: '11:00', title: 'ទទួលភ្ញៀវ', titleEn: 'Reception', locationEn: 'Garden hall', location: 'សួន' }],
};
function calendar(value = content, props = {}) { return render(<RoyalGardenWeddingCalendar content={value} days={visibleProgramDays(value)} english {...props} />); }

describe('Royal Garden interactive wedding calendar', () => {
  it('marks the real main date, selects the correct ceremony and crosses the year', () => {
    const go = vi.fn(); calendar(content, { onProgramDay: go });
    expect(screen.getByRole('button', { name: /31 December 2026, main celebration, wedding ceremonies/ })).toHaveAttribute('data-main', 'true');
    const summary = screen.getByRole('region', { name: 'Selected day' });
    expect(summary).toHaveTextContent('Family day'); expect(summary).toHaveTextContent('Blessing'); expect(summary).not.toHaveTextContent('Reception');
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('heading', { name: 'January 2027' })).toBeVisible();
    const second = screen.getByRole('button', { name: /1 January 2027, wedding ceremonies/ });
    expect(second).toHaveAttribute('data-ceremony', 'true'); expect(second).not.toHaveAttribute('data-main'); fireEvent.click(second);
    expect(summary).toHaveTextContent('Wedding day'); expect(summary).toHaveTextContent('Reception'); expect(summary).not.toHaveTextContent('Blessing');
    fireEvent.click(within(summary).getByRole('button', { name: 'View this day’s programme' })); expect(go).toHaveBeenCalledWith('day-two');
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' })); expect(screen.getByRole('heading', { name: 'December 2026' })).toBeVisible();
  });
  it.each([['2028-02-29', 29, 2], ['2027-02-01', 28, 1], ['2027-04-01', 30, 4]])('renders the real length and offset of %s', (date, length, offset) => {
    const { container } = calendar({ ...content, eventDate: date, programDays: [], schedule: [] });
    expect(container.querySelectorAll('td button')).toHaveLength(length);
    const first = container.querySelector('td button').closest('td'); expect([...first.parentElement.children].indexOf(first)).toBe(offset);
  });
  it('supports configured Khmer and Latin numerals without changing machine dates', () => {
    const { container, rerender } = calendar({ ...content, saveTheDate: { ...content.saveTheDate, numerals: 'khmer' } }, { english: false });
    expect(container.querySelector('[data-date="2026-12-31"] time')).toHaveTextContent('៣១');
    expect(container.querySelector('[data-date="2026-12-31"] time')).toHaveAttribute('dateTime', '2026-12-31');
    rerender(<RoyalGardenWeddingCalendar content={{ ...content, saveTheDate: { ...content.saveTheDate, numerals: 'latin' } }} days={visibleProgramDays(content)} />);
    expect(container.querySelector('[data-date="2026-12-31"] time')).toHaveTextContent('31');
  });
  it('resets browsing and selection after a Studio date edit', () => {
    const { rerender } = calendar(); fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    const next = { ...content, eventDate: '2028-02-29', programDays: [], schedule: [] };
    rerender(<RoyalGardenWeddingCalendar content={next} days={[]} english />);
    expect(screen.getByRole('heading', { name: 'February 2028' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Selected day' })).toHaveTextContent('29 February 2028');
  });
  it('does not invent a date, calendar or countdown for missing/invalid event data', () => {
    const { container } = calendar({ eventDate: '2027-02-30', eventTime: '17:00', saveTheDate: { showCalendar: true } });
    expect(screen.getByText('The date will be announced soon.')).toBeVisible(); expect(screen.queryByRole('timer')).not.toBeInTheDocument(); expect(container.querySelector('table')).toBeNull();
  });
  it('shows a celebration state for a past event and preserves midnight', () => {
    calendar({ ...content, eventDate: '2020-01-01', eventTime: '00:00' });
    expect(screen.getByText('The celebration has begun.')).toBeVisible(); expect(screen.getByText('12:00 AM')).toBeVisible();
    expect(screen.queryByText(/Asia\//)).not.toBeInTheDocument();
  });
  it('keeps today and civil dates in the event timezone for guests abroad', () => {
    expect(eventToday('Asia/Phnom_Penh', Date.parse('2026-12-31T18:00:00Z'))).toBe('2027-01-01');
    expect(eventToday('America/Los_Angeles', Date.parse('2026-12-31T18:00:00Z'))).toBe('2026-12-31');
    expect(formatEventTime('17:00', false)).toBe('៥:០០ ល្ងាច');
  });
  it('excludes disabled days and rows and keeps no-ceremony selection accessible', () => {
    const data = { ...content, programDays: content.programDays.map(day => ({ ...day, enabled: day.id !== 'day-two' })) };
    calendar(data); fireEvent.click(screen.getByRole('button', { name: /^30 December 2026$/ }));
    expect(screen.getByRole('region', { name: 'Selected day' })).toHaveTextContent('No ceremonies scheduled');
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: /^1 January 2027$/ })).not.toHaveAttribute('data-ceremony');
  });
});

describe('Royal Garden data parity and compatibility', () => {
  const draft = { ...content, templateId: 'royal-garden-cinematic', couple: { groom: 'Owner', bride: 'Partner' }, event: { date: '2000-01-01', receptionTime: '09:00' }, showDressCode: true, dressCode: { name: 'Formal', style: 'Traditional', description: 'Owner instructions' }, dressColors: [{ hex: '#c7984d', name: 'Gold' }], enabledSections: { dressCode: true }, sectionOrder: ['dressCode', 'schedule', 'countdown'], faq: [{ id: 'q', q: 'Parking?', a: 'Saved answer' }], party: [{ id: 'p', name: 'Member' }], storyChapters: [{ id: 's', text: 'Saved story' }] };
  it('round-trips the canonical date, program, calendar, dress code, hidden data and ordering', () => {
    const payload = draftToInvitationPayload(draft); expect(payload.eventDate).toBe(content.eventDate); expect(payload.eventTime).toBe(content.eventTime);
    const restored = publicInvitationToDraft({ ...payload, templateCode: 'royal-garden-cinematic' });
    const tpl = draftToTemplate(restored).tpl;
    expect(tpl.hostContent.programDays).toEqual(draft.programDays); expect(tpl.hostContent.schedule).toMatchObject(draft.schedule);
    for (const key of ['dressCode', 'dressColors', 'saveTheDate', 'sectionOrder', 'faq', 'storyChapters', 'party']) expect(tpl.hostContent[key]).toEqual(draft[key]);
    expect(buildTemplateContent(tpl).enabledSections.dressCode).toBe(true);
  });
  it('preserves explicit clearing over old design values and stale nested event fields', () => {
    const payload = draftToInvitationPayload({ ...draft, eventDate: '', eventTime: '', dressCode: null, dressColors: [], enabledSections: { dressCode: false } });
    expect(payload.eventDate).toBeNull(); expect(payload.eventTime).toBeNull();
    const restored = publicInvitationToDraft({ ...payload, designJson: JSON.stringify({ dressCode: { name: 'OLD' } }), templateCode: 'royal-garden-cinematic' });
    expect(restored.dressCode).toBeNull(); expect(restored.eventDate).toBe(''); expect(restored.eventTime).toBe('');
    expect(draftToTemplate(restored).tpl.hostContent.dressColors).toEqual([]);
  });
  it('retains IDs and unknown extensions through reordering and date fallback', () => {
    const days = groupProgram(content.schedule, '2026-12-31', content.programDays);
    const saved = serializeProgramDays([days[1], days[0]]); expect(saved.programDays.map(day => day.id)).toEqual(['day-two', 'day-one']);
    expect(saved.programDays[1].extension).toEqual({ retained: true }); expect(saved.schedule[1]).toMatchObject({ id: 'blessing', extension: 'keep' });
    expect(visibleProgramDays({ eventDate: '2027-12-31', schedule: [{ id: 'legacy', title: 'Legacy', time: '07:00', day: 3 }] })[0].resolvedDate).toBe('2028-01-02');
    expect(visibleProgramDays({ ...content, showSchedule: false })).toEqual([]);
    expect(visibleProgramDays({ ...content, schedule: content.schedule.map(row => ({ ...row, enabled: false })) })).toEqual([]);
  });
  it('keeps English dress-code style edits separate from Khmer wording', () => {
    const translated = editLocalizedField(draft, 'en', 'dressCode', { name: 'English name', style: 'English style', description: 'English instructions' });
    expect(projectLocale(translated, 'km').dressCode).toEqual(draft.dressCode);
    expect(projectLocale(JSON.parse(JSON.stringify(translated)), 'en').dressCode.style).toBe('English style');
  });
  it('enables only implemented Royal capabilities while retaining other template behavior', () => {
    expect(templateCapabilities({ code: 'royal-garden-cinematic' })).toMatchObject({ dressCode: true, story: false, faq: false, party: false, couplePhoto: false });
    expect(templateCapabilities({ code: 'khmer-celestial' })).toMatchObject({ dressCode: true, faq: true, party: true });
  });
  it('renders swatches safely and handles missing notes or invalid colors', () => {
    const { container } = render(<RoyalGardenDressCode content={{ dressColors: ['#c7984d', { hex: 'url(javascript:bad)' }, null] }} english />);
    expect(screen.getByRole('list', { name: 'Suggested clothing colors' }).children).toHaveLength(1);
    expect(container.querySelector('.rg-dress-swatch')).toHaveStyle({ backgroundColor: '#c7984d' });
  });
  it('offers separate currencies and recipient details without a payment-confirmed state', () => {
    const items = royalGiftItems({ khqrDollar: { qrUrl: '/usd.png', accountName: 'USD recipient', bankName: 'Owner bank' }, khqrRiel: { qrUrl: '/khr.png', accountName: 'KHR recipient' } });
    render(<RoyalGardenGifts items={items} english />); expect(screen.getByText('USD recipient')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'KHR', exact: true })); expect(screen.getByText('KHR recipient')).toBeVisible();
    expect(screen.getByRole('img', { name: 'KHR gift QR' })).toHaveAttribute('src', '/khr.png'); expect(screen.queryByText(/payment confirmed/i)).not.toBeInTheDocument();
    expect(royalGiftItems({ gift: [{ qrImage: 'javascript:alert(1)' }] })).toEqual([]);
    expect(royalGiftItems({ gift: [{ qrImage: '/stale-usd.png' }], khqrDollar: null, khqrRiel: null }, true)).toEqual([]);
  });
  it('retains gift currencies and explicitly empty dress guidance through the actual content adapter', () => {
    const data = { ...draft, dressCode: { name: '', description: '', colors: [{ hex: '#ffffff' }] }, dressColors: [], khqrDollar: { qrUrl: '/usd.png', accountName: 'USD owner' }, khqrRiel: { qrUrl: '/khr.png' } };
    const tpl = draftToTemplate(data).tpl, model = buildTemplateContent(tpl);
    expect(model.dressCode).toMatchObject({ name: '', description: '', colors: [] });
    expect(royalGiftItems(model).map(gift => gift.currency)).toEqual(['USD', 'KHR']);
  });
  it('renders canonical English closing letters even when legacy English aliases are empty', () => {
    const tpl = draftToTemplate({ ...draft, thankYouTitle: 'Owner thanks', thankYouText: 'Our saved thanks', apologyTitle: 'Owner apology', apologyText: 'Our saved apology' }).tpl;
    const model = buildTemplateContent(tpl);
    render(<MemoryRouter initialEntries={['/?lang=en']}><RoyalGardenCinematicLayout content={{ ...model, cinematicIntro: { enabled: false } }} preview /></MemoryRouter>);
    expect(screen.getByText('Our saved thanks')).toBeInTheDocument(); expect(screen.getByText('Our saved apology')).toBeInTheDocument();
  });
  it('keeps unpublished English translations unavailable to public guests', () => {
    const { container } = render(<MemoryRouter initialEntries={['/?lang=en']}><RoyalGardenCinematicLayout content={{ hasHostContent: true, cinematicIntro: { enabled: false }, localizedContentV1: { version: 1, km: { title: 'ពិធី' }, en: {}, enabledLocales: ['km'] } }} /></MemoryRouter>);
    expect(container.querySelector('.tpl-royal-garden')).toHaveAttribute('lang', 'km'); expect(screen.getByRole('option', { name: 'English' })).toBeDisabled();
  });
  it('keeps optional dress code and empty sections off in old invitations', () => {
    const { container } = render(<MemoryRouter><RoyalGardenCinematicLayout preview content={{ hasHostContent: true, cinematicIntro: { enabled: false }, schedule: [], photos: [], dressCode: { name: 'Saved but disabled' }, enabledSections: { dressCode: false, venue: false } }} /></MemoryRouter>);
    expect(container.querySelector('#rg-dressCode')).toBeNull(); expect(container.querySelector('#rg-schedule')).toBeNull(); expect(container.querySelector('#rg-gallery')).toBeNull();
    expect(screen.queryByRole('button', { name: 'កម្មវិធី' })).not.toBeInTheDocument();
  });
});
