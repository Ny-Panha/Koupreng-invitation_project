import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/httpClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import EventCreatePage from './EventCreatePage';
vi.mock('@/features/templates/api/templateCatalogApi',()=>({templateCatalogService:{list:vi.fn().mockResolvedValue([])}}));
vi.mock('@/features/subscriptions/subscriptionService',()=>({default:{current:vi.fn().mockResolvedValue(null)}}));
vi.mock('@/features/payments/paymentService',()=>({paymentService:{templateAccess:vi.fn()}}));
const token=id=>`e30.${btoa(JSON.stringify({sub:String(id),exp:4102268800}))}.fixture`;
let adapter;
beforeEach(()=>{adapter=apiClient.defaults.adapter;sessionStorage.clear();useLanguageStore.setState({lang:'en'});useAuthStore.getState().login({accessToken:token(7),user:{id:7,role:'HOST'}});});
afterEach(()=>{cleanup();apiClient.defaults.adapter=adapter;useAuthStore.setState({user:null,accessToken:null,isAuthenticated:false,authStatus:'anonymous'});});
it('N11-04 real deferred Axios dispatch never sends A draft with B credentials',async()=>{
  const created=[];
  apiClient.defaults.adapter=async config=>{
    if(config.method==='post' && config.url==='/v1/invitations') created.push({title:JSON.parse(config.data).title,account:config.headers.Authorization===`Bearer ${token(8)}`?'B':'A'});
    return {config,status:200,statusText:'OK',headers:{},data:{data:config.url.includes('recommendations')?[]:{id:501,userId:7}}};
  };
  sessionStorage.setItem('koupreng.onboarding.7',JSON.stringify({type:'WEDDING',form:{title:'Fictional A private draft'}}));
  render(<MemoryRouter><EventCreatePage/></MemoryRouter>);
  act(()=>{
    fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
    useAuthStore.getState().login({accessToken:token(8),user:{id:8,role:'HOST'}});
  });
  await waitFor(()=>expect(screen.getByLabelText(/Event title/)).toHaveValue(''));
  await act(async()=>{for(let i=0;i<15;i++)await Promise.resolve();});
  expect(created).toEqual([]);
});
