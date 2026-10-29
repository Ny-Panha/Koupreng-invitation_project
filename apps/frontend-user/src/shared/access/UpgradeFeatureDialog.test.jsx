import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpgradeFeatureDialog from './UpgradeFeatureDialog';
import subscriptionService from '@/features/subscriptions/subscriptionService';
import { useLanguageStore } from '@/stores/useLanguageStore';

vi.mock('@/features/subscriptions/subscriptionService',()=>({default:{publicPackages:vi.fn(),entitlements:vi.fn()}}));
const feature='ILLUSTRATED_VENUE_MAP';
const request={feature,decision:{reason:'PACKAGE_FEATURE_REQUIRED',feature},returnTo:'/app/events/101/invitation#venue'};
const plan={id:2,code:'PRO',packageName:'Pro',purchasable:true,price:20,currency:'USD',durationDays:365,billingInterval:'YEARLY',eligibleFeatures:[feature,'SEATING']};
const mount=(value=request)=>render(<MemoryRouter><UpgradeFeatureDialog request={value} onClose={vi.fn()}/></MemoryRouter>);
beforeEach(()=>{vi.clearAllMocks();useLanguageStore.setState({lang:'en'});subscriptionService.entitlements.mockResolvedValue({packagePlan:{id:1,packageName:'Free'},features:[],quotas:{}});});
afterEach(cleanup);

it('shows verified benefits without inferring extra tools from a Premium name, and preserves the return context',async()=>{
  subscriptionService.publicPackages.mockResolvedValue([plan,{...plan,id:3,code:'PREMIUM',packageName:'Premium',price:50,eligibleFeatures:[feature]}]);
  mount();
  const premium=(await screen.findByRole('heading',{name:'Premium',exact:true})).closest('article');
  expect(within(premium).getByText('Illustrated venue map')).toBeVisible();
  expect(within(premium).queryByText('Pre-wedding video')).not.toBeInTheDocument();
  expect(within(premium).queryByText('Couple monogram')).not.toBeInTheDocument();
  const pro=screen.getByRole('heading',{name:'Pro',exact:true}).closest('article');
  expect(within(pro).getByText('Seating')).toBeVisible();
  expect(pro).toHaveTextContent('$20.00');expect(pro).toHaveTextContent('365 days · Yearly');
  const link=within(pro).getByRole('link',{name:'Choose package'});
  const url=new URL(link.getAttribute('href'),'https://example.test');
  expect(url.searchParams.get('returnTo')).toBe(request.returnTo);expect(url.searchParams.get('feature')).toBe(feature);expect(url.searchParams.get('package')).toBe('PRO');
});

it('offers retry without recommendations or prices when the account cannot be verified',async()=>{
  subscriptionService.publicPackages.mockResolvedValue([plan]);subscriptionService.entitlements.mockRejectedValue(new Error('offline'));
  mount();await screen.findByRole('button',{name:'Try again'});
  expect(screen.queryByText('$20.00')).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Choose package'})).not.toBeInTheDocument();
});

it('does not market account upgrades as a way to unlock a collaborator’s shared event',()=>{
  mount({...request,event:{access:{owner:false}}});
  expect(screen.getByText(/upgrading your own account cannot unlock this shared event/)).toBeVisible();
  expect(subscriptionService.publicPackages).not.toHaveBeenCalled();
  expect(screen.queryByRole('link',{name:'Choose package'})).not.toBeInTheDocument();
});
