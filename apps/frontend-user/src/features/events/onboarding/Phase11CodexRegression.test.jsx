import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api/httpClient';
import { invitationService } from '@/features/invitations/api/invitationApi';
import { mediaService } from '@/features/invitations/api/mediaApi';
import { templateCatalogService } from '@/features/templates/api/templateCatalogApi';
import subscriptionService from '@/features/subscriptions/subscriptionService';
import { paymentService } from '@/features/payments/paymentService';
import { useLanguageStore } from '@/stores/useLanguageStore';
import EventCreatePage from './EventCreatePage';
import EventPhotoUpload from './EventPhotoUpload';
import { EVENT_TYPES, eventFields } from './eventFields';
import { validateEventForm } from './eventCreation';
import { useAuthStore } from '@/stores/useAuthStore';

let currentUser = { id: 7 };
vi.mock('@/shared/api/httpClient', () => ({ api: { get: vi.fn() } }));
vi.mock('@/features/invitations/api/invitationApi', () => ({ invitationService: { create: vi.fn(), get: vi.fn() } }));
vi.mock('@/features/invitations/api/mediaApi', () => ({ mediaService: { uploadCover: vi.fn() } }));
vi.mock('@/features/templates/api/templateCatalogApi', () => ({ templateCatalogService: { list: vi.fn() } }));
vi.mock('@/features/subscriptions/subscriptionService', () => ({ default: { current: vi.fn() } }));
vi.mock('@/features/payments/paymentService', () => ({ paymentService: { templateAccess: vi.fn() } }));
vi.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: () => ({ user: currentUser }) }));
const template = { id: 30, name: 'Event Essential', code: 'event-essential', category: 'MINIMALIST', price: 0,
  supportedEventTypes: ['WEDDING','ENGAGEMENT','BIRTHDAY','ANNIVERSARY','CORPORATE','OTHER'], supportedLanguages: ['EN','KH','BOTH'] };
const draft = { type: 'WEDDING', templateId: 30, requestId: '11111111-1111-4111-8111-111111111111',
  form: { title: 'Fictional celebration', groomName: 'Dara', brideName: 'Soriya', eventDate: '2026-12-20', eventTime: '17:00', venueName: 'Fixture Hall' } };
const defer = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { promise, resolve, reject }; };
const fill = (name,value) => fireEvent.change(document.querySelector(`[name="${name}"]`),{target:{value}});
const photo = () => fireEvent.change(document.getElementById('event-photo-input'), { target: { files: [new File(['fixture'], 'cover.jpg', {type:'image/jpeg'})] } });
function tree() { return <MemoryRouter initialEntries={['/app/events/new']}><Routes>
  <Route path="/app/events/new" element={<EventCreatePage/>}/>
  <Route path="/app/events/:id" element={<p>Saved workspace</p>}/>
  <Route path="/app/events/:id/invitation" element={<p>Guided studio</p>}/>
</Routes></MemoryRouter>; }
async function ready() { const view=render(tree()); await screen.findByRole('button',{name: /^(?:Select|Selected) Event Essential$/}); return view; }
beforeEach(() => {
  vi.clearAllMocks(); currentUser={id:7}; sessionStorage.clear(); useLanguageStore.setState({lang:'en'});
  sessionStorage.setItem('koupreng.onboarding.7',JSON.stringify(draft));
  URL.createObjectURL=vi.fn(()=>'blob:fixture'); URL.revokeObjectURL=vi.fn();
  api.get.mockResolvedValue({data:[{template,styleMatch:true}]}); templateCatalogService.list.mockResolvedValue([template]);
  subscriptionService.current.mockResolvedValue(null); paymentService.templateAccess.mockResolvedValue({hasAccess:false});
  invitationService.create.mockResolvedValue({id:501,userId:7,visibility:'PRIVATE'});
  invitationService.get.mockResolvedValue({id:501,userId:7,visibility:'PRIVATE'}); mediaService.uploadCover.mockResolvedValue({id:1});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('Phase 11 independent authority, recovery and negative contracts',()=>{
  it.each(EVENT_TYPES.flatMap(([type])=>['en','km'].map(lang=>[type,lang])))('N11-01/14 actual %s enum creates PRIVATE with %s UI',async(type,lang)=>{
    useLanguageStore.setState({lang});sessionStorage.setItem('koupreng.onboarding.7',JSON.stringify({...draft,type,form:{...draft.form,hostName:'Fixture host',partnerName:'Fixture partner'}}));
    render(tree());await waitFor(()=>expect(document.querySelector('.event-template-card')).toBeInTheDocument());photo();
    fireEvent.submit(document.querySelector('form'));await waitFor(()=>expect(invitationService.create).toHaveBeenCalledOnce());
    expect(invitationService.create.mock.calls[0][0]).toMatchObject({eventType:type,visibility:'PRIVATE'});
    if(!['WEDDING','ENGAGEMENT','ANNIVERSARY'].includes(type)) expect(invitationService.create.mock.calls[0][0].partnerName).toBe('');
  });
  it('N11-02 type changes retain common details and clear inapplicable names',async()=>{
    await ready();fireEvent.click(screen.getByRole('button',{name:'Birthday',exact:true}));
    expect(screen.getByLabelText(/Event title/)).toHaveValue(draft.form.title);
    fireEvent.click(screen.getByRole('button',{name:'Wedding',exact:true}));
    expect(screen.getByLabelText(/Bride name/)).toHaveValue('');
    expect(screen.getByLabelText(/Event date/)).toHaveValue(draft.form.eventDate);
  });
  it('N11-03 never writes A private data into B storage even transiently',async()=>{
    const view=await ready(); const writes=[]; const original=sessionStorage.setItem;
    vi.spyOn(sessionStorage,'setItem').mockImplementation(function(key,value){writes.push([key,value]);return original.call(this,key,value);});
    currentUser={id:8};view.rerender(tree());
    await waitFor(()=>expect(screen.getByLabelText(/Event title/)).toHaveValue(''));
    expect(writes.filter(([key,value])=>key==='koupreng.onboarding.8' && value.includes('Fictional celebration'))).toEqual([]);
  });
  it('N11-04 late A create cannot upload or navigate after B mounts',async()=>{
    const pending=defer();invitationService.create.mockReturnValue(pending.promise);const view=await ready();photo();
    fireEvent.click(screen.getByRole('button',{name:'Create event'}));expect(invitationService.create).toHaveBeenCalledOnce();
    currentUser={id:8};view.rerender(tree());await act(async()=>pending.resolve({id:501,userId:7,visibility:'PRIVATE'}));
    expect(mediaService.uploadCover).not.toHaveBeenCalled();expect(screen.queryByText('Guided studio')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('koupreng.onboarding.8')).not.toContain('501');
  });
  it('N11-25 late A upload cannot navigate or clear B draft',async()=>{
    const pending=defer();mediaService.uploadCover.mockReturnValue(pending.promise);const view=await ready();photo();
    fireEvent.click(screen.getByRole('button',{name:'Create event'}));await waitFor(()=>expect(mediaService.uploadCover).toHaveBeenCalledOnce());
    currentUser={id:8};view.rerender(tree());await act(async()=>pending.resolve({id:1}));
    expect(screen.queryByText('Guided studio')).not.toBeInTheDocument();expect(screen.getByLabelText(/Event title/)).toHaveValue('');
  });
  it('N11-10 late premium grant from A never unlocks B',async()=>{
    const paid={...template,id:99,name:'Fixture Premium',price:10,premium:true};const pending=defer();
    api.get.mockResolvedValue({data:[{template:paid,styleMatch:true},{template,styleMatch:true}]});
    paymentService.templateAccess.mockReturnValueOnce(pending.promise).mockResolvedValue({hasAccess:false});
    const view=await ready();currentUser={id:8};view.rerender(tree());await act(async()=>pending.resolve({hasAccess:true}));
    await waitFor(()=>expect(screen.queryByRole('button',{name: /^(?:Select|Selected) Fixture Premium$/})).not.toBeInTheDocument());
  });
  it('N11-09 restored event ID is owner-checked before any media write',async()=>{
    sessionStorage.setItem('koupreng.onboarding.7',JSON.stringify({...draft,pendingEventId:501}));
    invitationService.get.mockResolvedValue({id:501,userId:8,visibility:'PRIVATE'});await ready();photo();
    fireEvent.click(screen.getByRole('button',{name:'Retry photo upload'}));
    await waitFor(()=>expect(invitationService.get).toHaveBeenCalledWith(501, expect.objectContaining({ signal: expect.any(AbortSignal) })));
    expect(mediaService.uploadCover).not.toHaveBeenCalled();expect(invitationService.create).not.toHaveBeenCalled();
    expect(screen.queryByText('Guided studio')).not.toBeInTheDocument();
  });
  it('N11-08 ambiguous POST retry keeps the exact client request identity',async()=>{
    invitationService.create.mockRejectedValueOnce(new Error('Network response lost'));await ready();photo();
    fireEvent.click(screen.getByRole('button',{name:'Create event'}));await screen.findByText('Network response lost');
    fireEvent.click(screen.getByRole('button',{name:'Create event'}));await screen.findByText('Guided studio');
    expect(invitationService.create.mock.calls[0][0].clientRequestId).toBe(invitationService.create.mock.calls[1][0].clientRequestId);
  });
  it('N11-24 explicit 400 permits correcting the request without losing details',async()=>{
    invitationService.create.mockRejectedValueOnce(Object.assign(new Error('Fixture validation rejected'),{status:400}));await ready();photo();
    fireEvent.click(screen.getByRole('button',{name:'Create event'}));await screen.findByText('Fixture validation rejected');
    fill('title','Corrected fixture');fireEvent.click(screen.getByRole('button',{name:'Create event'}));await screen.findByText('Guided studio');
    expect(invitationService.create.mock.calls[1][0].title).toBe('Corrected fixture');
  });
  it('N11-04 same-account bearer renewal invalidates late create work',async()=>{
    const old=useAuthStore.getState().accessToken;const pending=defer();invitationService.create.mockReturnValue(pending.promise);
    await ready();photo();fireEvent.click(screen.getByRole('button',{name:'Create event'}));
    act(()=>useAuthStore.setState({accessToken:'fictional-renewal'}));await act(async()=>pending.resolve({id:501,userId:7}));
    expect(mediaService.uploadCover).not.toHaveBeenCalled();expect(screen.queryByText('Guided studio')).not.toBeInTheDocument();
    act(()=>useAuthStore.setState({accessToken:old}));
  });
  it.each([null,{}, {id:0}, {id:'local-draft'}, {id:501,userId:8}])('N11-16 invalid acknowledgment %j never uploads or navigates',async(response)=>{
    invitationService.create.mockResolvedValue(response);await ready();photo();fireEvent.click(screen.getByRole('button',{name:'Create event'}));
    await waitFor(()=>expect(screen.getByRole('button',{name:'Create event'})).toBeEnabled());
    expect(mediaService.uploadCover).not.toHaveBeenCalled();expect(screen.queryByText('Guided studio')).not.toBeInTheDocument();
  });
  it('N11-12 storage denied discloses unavailable recovery rather than saved success',async()=>{
    vi.spyOn(sessionStorage,'setItem').mockImplementation(()=>{throw new Error('Fixture storage denied');});await ready();
    expect(screen.getByText(/refresh recovery is unavailable/)).toBeInTheDocument();expect(invitationService.create).not.toHaveBeenCalled();
  });
  it('N11-03 absent identity writes no undefined draft key',()=>{
    currentUser=null;render(tree());expect(sessionStorage.getItem('koupreng.onboarding.undefined')).toBeNull();
  });
  it('N11-10 rejected access can retry while verified free templates stay selectable',async()=>{
    const paid={...template,id:99,name:'Fixture Premium',price:10,premium:true};api.get.mockResolvedValue({data:[{template:paid,styleMatch:true},{template,styleMatch:true}]});
    paymentService.templateAccess.mockRejectedValueOnce(new Error('Fixture unavailable')).mockResolvedValue({hasAccess:true});
    await ready();fireEvent.click(screen.getByRole('button',{name:'Change design'}));fireEvent.click(await screen.findByRole('button',{name:'Access unavailable. Retry access'}));
    expect(await screen.findByRole('button',{name: /^(?:Select|Selected) Fixture Premium$/})).toBeEnabled();
  });
  it('N11-05 overlapping draft/create submits produce one PRIVATE POST',async()=>{
    const pending=defer();invitationService.create.mockReturnValue(pending.promise);await ready();photo();
    fireEvent.click(screen.getByRole('button',{name:'Save draft'}));fireEvent.submit(document.querySelector('form'));
    expect(invitationService.create).toHaveBeenCalledOnce();expect(invitationService.create.mock.calls[0][0].visibility).toBe('PRIVATE');
    await act(async()=>pending.resolve({id:501,userId:7,visibility:'PRIVATE'}));
  });
  it('N11-26 focal/message overlays preserve unknown authored JSON',async()=>{
    sessionStorage.setItem('koupreng.onboarding.7',JSON.stringify({...draft,form:{...draft.form,storyText:'Welcome',designJson:'{"future":{"keep":true}}',contentJson:'{"future":{"keep":true}}'}}));
    await ready();photo();fireEvent.click(screen.getByRole('button',{name:'Top',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:'Create event'}));await screen.findByText('Guided studio');
    const payload=invitationService.create.mock.calls[0][0];expect(JSON.parse(payload.designJson)).toEqual({future:{keep:true},coverFocalPoint:'top'});
    expect(JSON.parse(payload.contentJson).future).toEqual({keep:true});
  });
  it.each(['null','[]','{"form":null}','{"form":"bad"}'])('N11-12 structurally corrupt storage %s recovers without crashing',async(value)=>{
    sessionStorage.setItem('koupreng.onboarding.7',value);await ready();expect(screen.getByLabelText(/Event title/)).toHaveValue('');
  });
  it('N11-15 empty image is rejected before object URL allocation',()=>{
    const changed=vi.fn();render(<EventPhotoUpload en onFileChange={changed} onRemove={()=>{}}/>);
    fireEvent.change(document.getElementById('event-photo-input'),{target:{files:[new File([],'empty.jpg',{type:'image/jpeg'})]}});
    expect(changed).not.toHaveBeenCalled();expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it('N11-20 revokes each preview once on replace/remove without retaining File bytes',async()=>{
    URL.createObjectURL.mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
    const view=await ready();photo();photo();
    expect(URL.revokeObjectURL.mock.calls).toEqual([['blob:first']]);
    fireEvent.click(screen.getByRole('button',{name:'Remove',exact:true}));
    expect(URL.revokeObjectURL.mock.calls).toEqual([['blob:first'],['blob:second']]);
    expect(sessionStorage.getItem('koupreng.onboarding.7')).not.toContain('blob:');view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });
  it.each([[5*1024*1024,true],[5*1024*1024+1,false]])('N11-15 exact photo boundary %s accepted=%s', (size,accepted)=>{
    const changed=vi.fn();render(<EventPhotoUpload en onFileChange={changed} onRemove={()=>{}}/>);
    fireEvent.change(document.getElementById('event-photo-input'),{target:{files:[new File([new Uint8Array(size)],'fixture.png',{type:'image/png'})]}});
    expect(changed).toHaveBeenCalledTimes(accepted?1:0);
  });
  it.each([['fixture.exe','image/png'],['fixture.heic','image/heic'],['fixture.svg','image/svg+xml']])('N11-15 unsupported %s rejected before preview', (name,type)=>{
    const changed=vi.fn();render(<EventPhotoUpload en onFileChange={changed} onRemove={()=>{}}/>);
    fireEvent.change(document.getElementById('event-photo-input'),{target:{files:[new File(['fixture'],name,{type})]}});expect(changed).not.toHaveBeenCalled();
  });
  it('N11-14 calendar/time/url and long Khmer validation preserve input',()=>{
    const form={...draft.form,eventDate:'2026-02-30',eventTime:'25:00',googleMapUrl:'javascript:alert(1)',title:'ក'.repeat(256)};
    expect(Object.keys(validateEventForm(form,'WEDDING'))).toEqual(expect.arrayContaining(['title','eventDate','eventTime','googleMapUrl']));
    expect(form.title).toHaveLength(256);expect(eventFields('CORPORATE').some(([key])=>key==='groomName')).toBe(false);
  });
  it.each(['http://maps.google.com/?q=fixture','https://example.test/maps','https://fixture@maps.google.com/?q=fixture'])('N11-14 rejects directions URL rejected by backend: %s',url=>{
    expect(validateEventForm({...draft.form,googleMapUrl:url},'WEDDING')).toHaveProperty('googleMapUrl');
  });
});
