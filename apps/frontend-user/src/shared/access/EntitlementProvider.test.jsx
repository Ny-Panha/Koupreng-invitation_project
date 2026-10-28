import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EntitlementProvider from './EntitlementProvider';
import { useAccountEntitlements } from './entitlementContext';
import { accessDecision } from './accessDecision';
import subscriptionService from '@/features/subscriptions/subscriptionService';
import { refreshAccess } from '../feedback/feedback';

const auth = vi.hoisted(() => ({ user:{ id:1 },isAuthenticated:true }));
vi.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@/features/subscriptions/subscriptionService', () => ({ default:{ entitlements:vi.fn() } }));
function Probe() { const account = useAccountEntitlements(); return <p>{accessDecision({ account,feature:'SEATING',authenticated:auth.isAuthenticated }).reason}</p>; }
const mount = () => render(<EntitlementProvider><Probe /></EntitlementProvider>);
const paid = { packagePlan:{ id:3,code:'REVIEWED_PAID' },features:['SEATING'],quotas:{ guests:{ limit:null,used:400 } } };
beforeEach(() => { vi.clearAllMocks(); auth.user={ id:1 };auth.isAuthenticated=true; });
afterEach(cleanup);

it('only unlocks from a verified response, then refreshes expiry/downgrade after rejection', async () => {
  subscriptionService.entitlements.mockResolvedValueOnce(paid).mockResolvedValueOnce({ ...paid,features:[] });
  mount(); await screen.findByText('ALLOWED');
  act(refreshAccess); await screen.findByText('PACKAGE_FEATURE_REQUIRED');
  expect(subscriptionService.entitlements).toHaveBeenLastCalledWith({ suppressAuthRedirect:true });
});
it('clears previous benefits when identity changes and ignores an obsolete late response', async () => {
  let finish;
  subscriptionService.entitlements.mockImplementationOnce(() => new Promise(resolve => { finish=resolve; })).mockResolvedValueOnce({ ...paid,features:[] });
  const view=mount(); expect(screen.getByText('SUBSCRIPTION_UNVERIFIED')).toBeVisible();
  auth.user={ id:2 }; view.rerender(<EntitlementProvider><Probe /></EntitlementProvider>);
  await screen.findByText('PACKAGE_FEATURE_REQUIRED');
  await act(async () => finish(paid)); expect(screen.queryByText('ALLOWED')).not.toBeInTheDocument();
});
it('fails closed when refresh fails and on logout', async () => {
  subscriptionService.entitlements.mockResolvedValueOnce(paid).mockRejectedValueOnce(new Error('offline'));
  const view=mount(); await screen.findByText('ALLOWED');
  act(refreshAccess); await screen.findByText('SUBSCRIPTION_UNVERIFIED');
  auth.isAuthenticated=false; auth.user=null; view.rerender(<EntitlementProvider><Probe /></EntitlementProvider>);
  await waitFor(() => expect(screen.getByText('NOT_AUTHENTICATED')).toBeVisible());
});
