import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/httpClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { getDraft, getDraftBySlug, saveDraft } from '@/shared/storage/weddingStorage';
import { registerDynamicTemplates } from '@/features/templates/data/templatesData';
import InvitationForm from '../InvitationForm';

vi.mock('@/features/templates/api/templateCatalogApi', () => ({
  templateCatalogService: { list: vi.fn().mockResolvedValue([{ id: 4, code: 'khmer-celestial', status: 'ACTIVE' }]) },
}));
vi.mock('../LivePhoneSimulator', () => ({ default: () => <div>Preview fixture</div> }));

const token = id => `e30.${btoa(JSON.stringify({ sub: String(id), exp: 4102268800 }))}.fixture`;
const login = id => useAuthStore.getState().login({ accessToken: token(id), user: { id, role: 'HOST' } });
let originalAdapter;
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  originalAdapter = apiClient.defaults.adapter;
  login(7); useLanguageStore.setState({ lang: 'en' });
  registerDynamicTemplates([{ id: 4, code: 'khmer-celestial', status: 'ACTIVE' }]);
});
afterEach(() => {
  cleanup(); apiClient.defaults.adapter = originalAdapter;
  useAuthStore.getState().invalidateSession();
});

it('N13-07 blocks ownerless legacy reads and adoption, preserving original bytes', () => {
  const raw = JSON.stringify({ 'wed-legacy': { id: 'wed-legacy', slug: 'legacy', title: 'Unclaimed private draft' } });
  localStorage.setItem('koupreng.wedding.drafts', raw);
  expect(getDraft('wed-legacy', 7)).toBeNull();
  expect(getDraftBySlug('legacy', 7)).toBeNull();
  expect(() => saveDraft({ id: 'wed-legacy', ownerUserId: 7, title: 'Adopted' })).toThrow(/owner|recover/i);
  expect(localStorage.getItem('koupreng.wedding.drafts')).toBe(raw);
});

it('N13-01 real Axios adapter never dispatches A Studio payload using B credentials', async () => {
  const writes = [];
  apiClient.defaults.adapter = async config => {
    if (config.method === 'put') writes.push({ auth: config.headers.Authorization, data: JSON.parse(config.data) });
    return { config, status: 200, headers: {}, data: { data: { id: 101, updatedAt: 'revision-2' } } };
  };
  const { container } = render(<MemoryRouter><InvitationForm invitation={{ id: 101, title: 'A private invitation', templateCode: 'khmer-celestial', contentJson: '{"photos":[]}' }} /></MemoryRouter>);
  act(() => {
    fireEvent.click(container.querySelector('.pe-save-main-btn'));
    login(8);
  });
  await act(async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); });
  expect(writes).toEqual([]);
  expect(localStorage.getItem('koupreng.wedding.drafts')).toBeNull();
});

it('N13-01 late first save cannot start media/reference writes after account switch', async () => {
  const writes = [];
  let finish;
  apiClient.defaults.adapter = async config => {
    if (config.method === 'put') {
      writes.push(config.headers.Authorization);
      if (writes.length === 1) await new Promise(resolve => { finish = resolve; });
    }
    return { config, status: 200, headers: {}, data: { data: { id: 101, updatedAt: 'revision-2' } } };
  };
  const { container } = render(<MemoryRouter><InvitationForm invitation={{ id: 101, title: 'A invitation', templateCode: 'khmer-celestial', designJson: '{"coverImage":"https://example.invalid/authored.webp","photos":[]}' }} /></MemoryRouter>);
  fireEvent.click(container.querySelector('.pe-save-main-btn'));
  await waitFor(() => expect(writes).toHaveLength(1));
  await act(async () => { login(8); finish(); });
  expect(writes).toEqual([`Bearer ${token(7)}`]);
  expect(localStorage.getItem('koupreng.wedding.drafts')).toBeNull();
});

it('N13-32 real delayed Axios save keeps typed text and flushes the newer snapshot', async () => {
  const writes = [];
  let finish;
  apiClient.defaults.adapter = async config => {
    if (config.method === 'put') {
      writes.push(JSON.parse(config.data));
      if (writes.length === 1) await new Promise(resolve => { finish = resolve; });
    }
    return { config, status: 200, headers: {}, data: { data: { id: 101, updatedAt: 'revision-2' } } };
  };
  const { container } = render(<MemoryRouter><InvitationForm invitation={{ id: 101, title: 'Before', templateCode: 'khmer-celestial', languageMode: 'EN', contentJson: '{"photos":[]}' }} /></MemoryRouter>);
  fireEvent.click(container.querySelector('.pe-save-main-btn'));
  await waitFor(() => expect(writes).toHaveLength(1));
  const title = container.querySelector('[name="title"]'); title.focus();
  fireEvent.change(title, { target: { value: 'Typed during save' } });
  await act(async () => finish());
  await waitFor(() => expect(container.querySelector('.studio-save-status')).toHaveAttribute('data-phase', 'saved'));
  expect(title).toHaveValue('Typed during save');
  expect(title).toHaveFocus();
  expect(writes.at(-1).title).toBe('Typed during save');
  expect(writes[0].title).toBe('Before');
});
