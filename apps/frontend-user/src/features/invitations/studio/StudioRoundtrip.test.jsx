import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, it, expect, vi } from 'vitest';
import InvitationForm from '../InvitationForm';
import { invitationService } from '../api/invitationApi';
import { registerDynamicTemplates } from '@/features/templates/data/templatesData';
vi.mock('../LivePhoneSimulator', () => ({ default: () => <div>Preview fixture</div> }));
vi.mock('@/features/templates/api/templateCatalogApi', () => ({ templateCatalogService: { list: vi.fn().mockResolvedValue([{ id: 4, code: 'khmer-celestial', status: 'ACTIVE' }]) } }));
vi.mock('../api/invitationApi', () => ({ invitationService: { update: vi.fn().mockResolvedValue({ id: 101 }), create: vi.fn() } }));
vi.mock('../api/mediaApi', () => ({ mediaService: { uploadGallery: vi.fn().mockResolvedValue([]) } }));
beforeEach(() => { localStorage.clear(); registerDynamicTemplates([{ id: 4, code: 'khmer-celestial', status: 'ACTIVE' }]); });
afterEach(cleanup);
it('N13-20 retries an ambiguous legacy create with the same request id and immutable first payload', async () => {
  invitationService.create.mockReset().mockRejectedValueOnce(Object.assign(new Error('Response lost'), { status: 503 }))
    .mockResolvedValue({ id: 500, updatedAt: 'revision-1' });
  invitationService.update.mockClear();
  const { container } = render(<MemoryRouter><InvitationForm invitation={{ id: 'wed-retry', title: 'First submission', templateCode: 'khmer-celestial', languageMode: 'EN', designJson: '{"photos":[]}', contentJson: '{"photos":[]}' }} /></MemoryRouter>);
  await act(async () => container.querySelector('.pe-save-main-btn').click());
  await waitFor(() => expect(invitationService.create).toHaveBeenCalledTimes(1));
  const first = invitationService.create.mock.calls[0][0];
  expect(first.clientRequestId).toMatch(/^[a-f0-9-]{36}$/i);
  fireEvent.change(container.querySelector('[name="title"]'), { target: { value: 'Edited after response loss' } });
  await act(async () => container.querySelector('.pe-save-main-btn').click());
  await waitFor(() => expect(invitationService.create).toHaveBeenCalledTimes(2));
  expect(invitationService.create.mock.calls[1][0]).toEqual(first);
  expect(invitationService.update.mock.calls.some(([id, payload]) => id === 500 && payload.title === 'Edited after response loss')).toBe(true);
});
    it('N13-08 preserves future nested design data and all gallery records through two real form saves', async () => {
        invitationService.update.mockClear();
        const photos = Array.from({ length: 11 }, (_, i) => ({ id: `authored-${i}`, url: `https://example.invalid/${i}.webp`, futurePhoto: { flag: false } }));
        const original = { id: 101, templateCode: 'khmer-celestial', title: 'Original', status: 'DRAFT', languageMode: 'EN',
            designJson: JSON.stringify({ layoutStyles: { futureDesign: { list: [null, false, 'រក្សា'] } }, photos }),
            contentJson: JSON.stringify({ layoutStyles: { futureContent: { count: 2 } }, gallery: photos.map(p => ({ id: p.id, preview: p.url, type: 'image', futureGallery: { value: null } })), photos,
                localizedContentV1: { version: 1, enabledLocales: ['km', 'en'], defaultLocale: 'en', km: { title: 'ដើម', futureText: ['ខ្មែរ'] }, en: { title: 'Original' }, futureLocale: { extra: true } } }) };
        const first = render(<MemoryRouter><InvitationForm invitation={original} /></MemoryRouter>);
        fireEvent.change(first.container.querySelector('[name="title"]'), { target: { value: 'Edited once' } });
        await act(async () => first.container.querySelector('.pe-save-main-btn').click());
        await waitFor(() => expect(invitationService.update).toHaveBeenCalled());
        const saved = invitationService.update.mock.calls.at(-1)[1];
        const design = JSON.parse(saved.designJson), content = JSON.parse(saved.contentJson);
        expect(design.layoutStyles.futureDesign).toEqual({ list: [null, false, 'រក្សា'] });
        expect(content.layoutStyles.futureContent).toEqual({ count: 2 });
        expect(design.photos).toHaveLength(11);
        expect(content.gallery).toHaveLength(11);
        expect(content.gallery[0].futureGallery).toEqual({ value: null });
        expect(content.localizedContentV1.km.futureText).toEqual(['ខ្មែរ']);
        expect(content.localizedContentV1.futureLocale).toEqual({ extra: true });
        first.unmount();
        invitationService.update.mockClear();
        const second = render(<MemoryRouter><InvitationForm invitation={{ ...original, ...saved }} /></MemoryRouter>);
        fireEvent.change(second.container.querySelector('[name="title"]'), { target: { value: 'Edited twice' } });
        await act(async () => second.container.querySelector('.pe-save-main-btn').click());
        await waitFor(() => expect(invitationService.update).toHaveBeenCalled());
        const again = invitationService.update.mock.calls.at(-1)[1];
        expect(JSON.parse(again.designJson).layoutStyles.futureDesign).toEqual(design.layoutStyles.futureDesign);
        expect(JSON.parse(again.contentJson).gallery).toEqual(content.gallery);
        expect(JSON.parse(again.contentJson).localizedContentV1.en.title).toBe('Edited twice');
    });
