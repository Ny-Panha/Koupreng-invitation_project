import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import FeedbackHost from './FeedbackHost';
import { feedback } from './feedback';
import ToastContainer from '../ui/ToastContainer';
import ConfirmDialog from '../ui/ConfirmDialog';
import subscriptionService from '@/features/subscriptions/subscriptionService';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { ApiError } from '../api/ApiError';

vi.mock('@/features/subscriptions/subscriptionService', () => ({ default: { publicPackages: vi.fn(), entitlements: vi.fn() } }));
const owner = { eventId: '101', access: { owner: true, permissions: ['MANAGE_INVITATION'], ownerFeatures: [] } };
const pro = { id: 2, code: 'PRO', packageName: 'Configured Pro', purchasable: true, price: 12.34, currency: 'USD', durationDays: 30, billingInterval: 'CUSTOM', eligibleFeatures: ['PREMIUM_TEMPLATES','QR_CHECK_IN'], maxGuests: 100, maxInvitations: 20 };
const premium = { ...pro, id: 3, code: 'PREMIUM', packageName: 'Configured Premium', price: 48000, currency: 'KHR', eligibleFeatures: [...pro.eligibleFeatures,'PRE_WEDDING_VIDEO'] };
const mount = () => render(<MemoryRouter initialEntries={['/app/events/101/invitation']}><label>Draft<input defaultValue="Unsaved owner text" /></label><FeedbackHost /><ToastContainer /></MemoryRouter>);
beforeEach(() => {
  useLanguageStore.setState({ lang: 'en' });
  vi.clearAllMocks();
  subscriptionService.publicPackages.mockResolvedValue([pro,premium]);
  subscriptionService.entitlements.mockResolvedValue({ packagePlan: { id: 10, packageName: 'Configured Free' }, source: 'CONFIGURED_FREE_PACKAGE', features: [], quotas: { guests:{limit:20,used:5},invitations:{limit:1,used:1} } });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('confirms through the existing modal stack, defaults to cancel, and preserves unsaved values', async () => {
  mount(); const draft = screen.getByRole('textbox', { name:'Draft' }); draft.focus();
  let pending;
  act(() => { pending = feedback.confirm({ title:'Replace invitation wording?', message:'Review this change.', destructive:true }); });
  expect(screen.getByRole('button', { name:'Cancel' })).toHaveFocus();
  fireEvent.keyDown(document, { key:'Escape' });
  expect(await pending).toBe(false); expect(draft).toHaveValue('Unsaved owner text'); expect(draft).toHaveFocus();
  act(() => { pending = feedback.confirm({ title:'Confirm wording' }); });
  fireEvent.click(screen.getByRole('button', { name:'Confirm', exact:true }));
  expect(await pending).toBe(true);
});

it('guards a destructive confirmation against a second submission while its operation runs', async () => {
  let finish; const operation = vi.fn(() => new Promise(resolve => { finish = resolve; }));
  render(<ConfirmDialog isOpen title="Delete fixture" onClose={vi.fn()} onConfirm={operation} isDestructive />);
  const button = screen.getByRole('button', { name:'Confirm', exact:true });
  fireEvent.click(button); fireEvent.click(button); expect(operation).toHaveBeenCalledOnce();
  await act(async () => finish());
});

it('keeps critical errors visible, announces severity, deduplicates and cleans timers', () => {
  vi.useFakeTimers(); const view = mount();
  act(() => { feedback.error({ id:'save-failure', title:'Not saved', description:'Your draft remains here.' }); feedback.error({ id:'save-failure', description:'Your draft remains here.' }); feedback.success('Server confirmed'); });
  expect(screen.getAllByText('Your draft remains here.')).toHaveLength(1);
  expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByText('Your draft remains here.')).toBeVisible(); expect(screen.queryByText('Server confirmed')).not.toBeInTheDocument();
  view.unmount(); expect(vi.getTimerCount()).toBe(0);
});

it('uses actual server capabilities and currency, excluding Pro from Premium-only video', async () => {
  mount(); act(() => { void feedback.upgrade({ feature:'PRE_WEDDING_VIDEO', event:owner }); });
  await screen.findByRole('heading', { name:'Configured Premium' });
  expect(screen.queryByRole('heading', { name:'Configured Pro' })).not.toBeInTheDocument();
  expect(screen.getByText(/KHR/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name:'Choose package' })).toHaveAttribute('href', '/app/packages?returnTo=%2Fapp%2Fevents%2F101%2Finvitation&feature=PRE_WEDDING_VIDEO&package=PREMIUM');
  expect(screen.getByText(/Pending payments do not unlock/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name:'Not now' }));
  expect(screen.getByRole('textbox', { name:'Draft' })).toHaveValue('Unsaved owner text');
});

it('gives permission help for a generic 403 and never fetches upgrade offers', async () => {
  mount(); act(() => { feedback.explain(new ApiError('Access denied',403,{code:'AUTH_FORBIDDEN'}), { event:owner, feature:'SEATING' }); });
  expect(screen.getByRole('dialog', { name:'Event permission required' })).toBeVisible();
  expect(screen.getByText(/Buying a package does not grant event permission/)).toBeVisible();
  expect(subscriptionService.publicPackages).not.toHaveBeenCalled();
  expect(screen.queryByRole('link', { name:'Choose package' })).not.toBeInTheDocument();
});

it('tells an authorized collaborator to contact the owner rather than upgrading their own plan', () => {
  mount(); act(() => { void feedback.upgrade({ feature:'PRE_WEDDING_VIDEO', event: { eventId:'101', access:{ owner:false,permissions:['MANAGE_INVITATION'],ownerFeatures:[] } } }); });
  expect(screen.getByText(/upgrading your own account cannot unlock/)).toBeVisible();
  expect(subscriptionService.entitlements).not.toHaveBeenCalled();
  expect(screen.queryByRole('link', { name:'Choose package' })).not.toBeInTheDocument();
});

it('offers an individual template purchase only when the backend explicitly supports it', async () => {
  mount(); act(() => { void feedback.upgrade({ feature:'PREMIUM_TEMPLATES',event:owner,template:{ code:'fixture-paid',checkoutEligible:true,checkoutAmount:3,checkoutCurrency:'USD' } }); });
  const purchase = await screen.findByRole('link', { name:/Purchase this template/ });
  expect(purchase).toHaveAttribute('href','/templates/fixture-paid/checkout');
});

it('keeps unavailable catalogs retryable without inventing plans or prices', async () => {
  subscriptionService.publicPackages.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([]);
  mount(); act(() => { void feedback.upgrade({ feature:'SEATING', event:owner }); });
  await screen.findByText(/No purchase recommendation is available/);
  expect(screen.queryByRole('link', { name:'Choose package' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name:'Try again' }));
  await screen.findByText(/No eligible purchasable public package/);
  expect(screen.queryByRole('link', { name:'Compare packages' })).not.toBeInTheDocument();
});

it('deduplicates repeated feature dialogs and makes their late responses harmless after closing', async () => {
  let resolve; subscriptionService.publicPackages.mockImplementation(() => new Promise(done => { resolve = done; }));
  mount(); act(() => { void feedback.upgrade({ feature:'SEATING',event:owner }); void feedback.upgrade({ feature:'SEATING',event:owner }); });
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name:'Not now' }));
  await act(async () => resolve([pro]));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
