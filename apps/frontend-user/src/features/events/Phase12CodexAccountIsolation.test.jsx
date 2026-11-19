import { useLayoutEffect } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useEvents } from './hooks/useEvents';
import { eventsApi } from './api/eventsApi';
import { persistWeddingDraft } from '../wedding-builder/utils/draftPublishApi';
import { getDraft } from '@/shared/storage/weddingStorage';

const session = vi.hoisted(() => ({ user: { id: 1 } }));
vi.mock('../auth/hooks/useAuth', () => ({ useAuth: () => session }));
vi.mock('./api/eventsApi', () => ({ eventsApi: { listMine: vi.fn(), remove: vi.fn() } }));
vi.mock('../wedding-builder/utils/draftPublishApi', () => ({ persistWeddingDraft: vi.fn() }));
beforeEach(() => { localStorage.clear(); session.user = { id: 1 }; vi.clearAllMocks(); });
afterEach(cleanup);

it('C12-001 hides prior account records and delete modal in the first committed frame', async () => {
  const frames=[];
  function Probe() {
    const events=useEvents();
    useLayoutEffect(() => { frames.push({ user:session.user.id, titles:events.drafts.map(x=>x.title), deleting:events.draftToDelete?.title }); });
    return <>{events.drafts.map(x=><button key={x.id} onClick={()=>events.handleDeleteClick(x)}>{x.title}</button>)}</>;
  }
  eventsApi.listMine.mockResolvedValueOnce([{id:101,title:'Private A'}]).mockImplementationOnce(()=>new Promise(()=>{}));
  const view=render(<Probe/>);
  await screen.findByText('Private A');
  await act(async()=>screen.getByText('Private A').click());
  session.user={id:2}; view.rerender(<Probe/>);
  expect(frames.filter(x=>x.user===2)).not.toContainEqual(expect.objectContaining({titles:['Private A']}));
  expect(frames.filter(x=>x.user===2).every(x=>!x.deleting)).toBe(true);
});

it('C12-001 ignores an account A response that arrives after B has loaded', async () => {
  let finishA;
  eventsApi.listMine.mockImplementationOnce(()=>new Promise(resolve=>{finishA=resolve;})).mockResolvedValueOnce([{id:202,title:'B event'}]);
  function Probe(){const {drafts}=useEvents(); return <>{drafts.map(x=><p key={x.id}>{x.title}</p>)}</>;}
  const view=render(<Probe/>); session.user={id:2}; view.rerender(<Probe/>);
  await screen.findByText('B event');
  await act(async()=>finishA([{id:101,title:'Private A'}]));
  expect(screen.queryByText('Private A')).not.toBeInTheDocument();
});

it('C12-001 does not apply a completed draft synchronization to a later account', async () => {
  let finish;
  eventsApi.listMine.mockResolvedValue([]);
  persistWeddingDraft.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  let events;
  function Probe(){events=useEvents();return null;}
  const view=render(<Probe/>);
  let pending;
  await act(async()=>{pending=events.syncDraft({id:'wed-private',ownerUserId:1,title:'Private A'});});
  session.user={id:2};view.rerender(<Probe/>);
  await act(async()=>{finish({response:{id:99},patch:{backendInvitationId:99}});await pending;});
  expect(events.drafts).toEqual([]);
  expect(getDraft('wed-private',1).backendInvitationId).toBeUndefined();
});

it('C12-012 never displays or automatically claims a legacy draft with no owner proof', async () => {
  localStorage.setItem('koupreng.wedding.drafts',JSON.stringify({legacy:{id:'wed-unclaimed',title:'Unclaimed private draft',syncStatus:'LOCAL_ONLY'}}));
  eventsApi.listMine.mockResolvedValue([]);
  let events;
  function Probe(){events=useEvents();return null;}
  render(<Probe/>); await act(async()=>{});
  expect(events.drafts).toEqual([]);
  expect(persistWeddingDraft).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem('koupreng.wedding.drafts')).legacy.title).toBe('Unclaimed private draft');
});
