import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EventWorkspace from './EventWorkspace';
import { invitationService } from '@/features/invitations/api/invitationApi';
import { useLanguageStore } from '@/stores/useLanguageStore';
vi.mock('@/features/auth/hooks/useAuth',()=>({useAuth:()=>({user:{id:7}})}));
vi.mock('@/features/invitations/api/invitationApi',()=>({invitationService:{get:vi.fn(),listMine:vi.fn(),access:vi.fn()}}));
const event={id:42,title:'Sensitive event title',status:'DRAFT'};
const owner={owner:true,permissions:[]};
beforeEach(()=>{vi.clearAllMocks();useLanguageStore.setState({lang:'en'});invitationService.get.mockResolvedValue(event);invitationService.listMine.mockResolvedValue([event]);invitationService.access.mockResolvedValue(owner);});
afterEach(cleanup);
function mount(){return render(<MemoryRouter initialEntries={['/app/events/42']}><Routes><Route path='/app/events/:eventId' element={<EventWorkspace/>}><Route index element={<p>Private overview</p>}/></Route></Routes></MemoryRouter>);}
it('C12-010 removes event identity and navigation after all access is revoked',async()=>{
  mount();await screen.findByText('Private overview');
  invitationService.access.mockResolvedValue({owner:false,permissions:[]});
  await act(async()=>window.dispatchEvent(new Event('koupreng:access-refresh')));
  expect(screen.queryByText('Private overview')).not.toBeInTheDocument();
  expect(screen.queryByRole('navigation',{name:'Event navigation'})).not.toBeInTheDocument();
  expect(screen.queryAllByText('Sensitive event title')).toHaveLength(0);
});
it('C12-010 rejects older initial owner access after a newer revocation reply',async()=>{
  let finishGet;
  invitationService.get.mockImplementationOnce(()=>new Promise(resolve=>{finishGet=resolve;}));
  mount();
  invitationService.access.mockResolvedValue({owner:false,permissions:[]});
  await act(async()=>window.dispatchEvent(new Event('koupreng:access-refresh')));
  await act(async()=>finishGet(event));
  expect(screen.queryByText('Private overview')).not.toBeInTheDocument();
  expect(screen.queryByRole('navigation',{name:'Event navigation'})).not.toBeInTheDocument();
});
