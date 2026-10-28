import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventWorkspace from "./EventWorkspace";
import { useEventWorkspace } from "./EventContext";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useLanguageStore } from "@/stores/useLanguageStore";
import InvitationScopedRedirect from "@/app/routes/InvitationScopedRedirect";
import { useState } from 'react';

vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 7 } }) }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: vi.fn(), listMine: vi.fn(), access: vi.fn() } }));
const events = [{ id: 1, userId: 7, title: "Wedding A" }, { id: 2, userId: 7, title: "Birthday B" }];
function Module() { const { eventId } = useEventWorkspace(); return <p>Module {eventId}</p>; }
function DraftProbe() { const workspace=useEventWorkspace(); const [value,setValue]=useState(''); return <label>Authored draft<input value={value} disabled={!workspace.can('MANAGE_INVITATION')} onChange={event=>setValue(event.target.value)} /></label>; }
function show(path) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/app/events/:eventId" element={<EventWorkspace />}><Route path="guests" element={<Module />} /></Route>
    <Route path="/dashboard/guests" element={<InvitationScopedRedirect targetSubPath="guests" />} />
    <Route path="/app/events" element={<p>Choose your event</p>} />
  </Routes></MemoryRouter>);
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("matchMedia", vi.fn(query => ({ matches: true, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  useLanguageStore.setState({ lang: "en" }); invitationService.listMine.mockResolvedValue(events);
  invitationService.access.mockResolvedValue({ owner: true, permissions: [], ownerFeatures: [] });
});
describe("verified event workspace", () => {
  it('keeps an opened Studio draft read-only after revocation and ignores an older access response', async () => {
    invitationService.get.mockResolvedValue({ ...events[0],userId:99 });
    const designer={ owner:false,permissions:['VIEW_EVENT','EDIT_EVENT','MANAGE_INVITATION'],ownerFeatures:['QR_INVITATIONS'] };
    invitationService.access.mockResolvedValue(designer);
    render(<MemoryRouter initialEntries={['/app/events/1/invitation']}><Routes><Route path="/app/events/:eventId" element={<EventWorkspace />}><Route path="invitation" element={<DraftProbe />} /></Route></Routes></MemoryRouter>);
    const input=await screen.findByRole('textbox',{name:'Authored draft'}); fireEvent.change(input,{target:{value:'Keep my unsaved work'}});
    let oldResponse,newResponse;
    invitationService.access.mockImplementationOnce(()=>new Promise(resolve=>{oldResponse=resolve;})).mockImplementationOnce(()=>new Promise(resolve=>{newResponse=resolve;}));
    act(()=>{window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('koupreng:access-refresh'));});
    await act(async()=>newResponse({owner:false,permissions:['VIEW_EVENT'],ownerFeatures:[]}));
    expect(input).toBeDisabled();expect(input).toHaveValue('Keep my unsaved work');
    await act(async()=>oldResponse(designer));expect(input).toBeDisabled();expect(input).toHaveValue('Keep my unsaved work');
  });
  it("never mounts private guest tools for a viewer even on a direct URL", async () => {
    invitationService.get.mockResolvedValue({ ...events[0], userId: 99 });
    invitationService.access.mockResolvedValue({ owner: false, permissions: ['VIEW_EVENT', 'VIEW_REPORTS'] });
    show('/app/events/1/guests');
    expect(await screen.findByRole('alert')).toHaveTextContent('You do not have permission for this event section.');
    expect(screen.queryByText('Module 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Guests', exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Settings', exact: true })).not.toBeInTheDocument();
  });
  it("never mounts modules for an unauthorized explicit ID", async () => {
    invitationService.get.mockRejectedValue(new Error("Access denied"));
    show("/app/events/99/guests");
    expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
    expect(screen.queryByText(/Module/)).not.toBeInTheDocument();
    expect(invitationService.get).toHaveBeenCalledWith("99");
  });
  it("clears the previous module while switching and preserves the module URL", async () => {
    let resolveSecond;
    invitationService.get.mockImplementation(id => id === "1" ? Promise.resolve(events[0]) : new Promise(resolve => { resolveSecond = resolve; }));
    show("/app/events/1/guests");
    expect(await screen.findByText("Module 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Switch event"), { target: { value: "2" } });
    expect(screen.queryByText("Module 1")).not.toBeInTheDocument();
    await act(async () => resolveSecond(events[1]));
    expect(await screen.findByText("Module 2")).toBeInTheDocument();
    await waitFor(() => expect(invitationService.get).toHaveBeenCalledWith("2"));
  });
  it("ambiguous legacy routes ignore stored active events", async () => {
    localStorage.setItem("koupreng.host.activeEventId", "1");
    show("/dashboard/guests");
    expect(await screen.findByText("Choose your event")).toBeInTheDocument();
    expect(invitationService.get).not.toHaveBeenCalled();
  });
});
