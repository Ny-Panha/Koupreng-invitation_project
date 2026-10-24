import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useState } from 'react';
import { EventContext } from "../workspace/EventContext";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { invitationService } from "@/features/invitations/api/invitationApi";
import EventDetails from "./EventDetails";
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { update: vi.fn(), publish: vi.fn(), get: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); useLanguageStore.setState({ lang: 'en' }); });
it("saves birthday details, contact and schedule through the real request contract", async () => {
  useLanguageStore.setState({ lang: "en" });
  const event = { id: 42, userId: 7, status: "DRAFT", templateCode: "event-essential", templateId: 30,
    eventType: "BIRTHDAY", title: "Birthday", hostName: "Sokha", eventDate: "2026-12-25", eventTime: "17:30", venueName: "Home", visibility: "PRIVATE" };
  invitationService.update.mockImplementation(async (id, payload) => ({ ...payload, id: Number(id) }));
  const updateEvent = vi.fn();
  render(<MemoryRouter initialEntries={["/app/events/42/settings"]}><EventContext.Provider value={{ event, eventId: "42", updateEvent }}><Routes>
    <Route path="/app/events/42/settings" element={<EventDetails />} /><Route path="/app/events/42" element={<p>Saved event</p>} />
  </Routes></EventContext.Provider></MemoryRouter>);
  expect(screen.queryByLabelText("Groom name")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Invitation message/), { target: { value: "Join us at home" } });
  fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Sokha" } });
  fireEvent.click(screen.getByRole("button", { name: "Add activity" }));
  fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Birthday dinner" } });
  fireEvent.change(screen.getByLabelText("Time", { exact: true }), { target: { value: "18:00" } });
  fireEvent.click(screen.getByRole("button", { name: "Save details" }));
  await screen.findByText("Saved to event");
  await waitFor(() => expect(updateEvent).toHaveBeenCalledOnce());
  const [id, payload] = invitationService.update.mock.calls[0];
  expect(id).toBe("42");
  expect(payload).toMatchObject({ eventType: "BIRTHDAY", hostName: "Sokha", storyText: "Join us at home" });
  expect(payload).not.toHaveProperty("userId");
  expect(payload).not.toHaveProperty("status");
  expect(JSON.parse(payload.contentJson)).toMatchObject({ contact: { name: "Sokha" }, schedule: [{ title: "Birthday dinner", time: "18:00" }] });
});

const genericEvent = { id: 42, userId: 7, status: 'DRAFT', templateCode: 'event-essential', eventType: 'BIRTHDAY', title: 'Birthday', hostName: 'Sokha', eventDate: '2027-01-10', eventTime: '17:30', venueName: 'Home', venueAddress: 'Phnom Penh', visibility: 'PRIVATE', updatedAt: '2026-10-24T10:00:00Z' };
function StatefulEditor() {
  const [event,setEvent] = useState(genericEvent);
  return <EventContext.Provider value={{ event, eventId: '42', updateEvent: setEvent, isOwner: true }}><EventDetails /></EventContext.Provider>;
}
it('requires generic-event review, saves first and displays only the confirmed server link', async () => {
  invitationService.update.mockResolvedValue({ ...genericEvent, updatedAt: '2026-10-24T10:01:00Z' });
  invitationService.publish.mockResolvedValue({ ...genericEvent, status: 'PUBLISHED', slug: 'confirmed-birthday', updatedAt: '2026-10-24T10:02:00Z' });
  render(<MemoryRouter initialEntries={['/app/events/42/invitation?mode=guided']}><StatefulEditor /></MemoryRouter>);
  expect(screen.getByRole('navigation', { name: 'Creation steps' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Review publication', exact: true }));
  expect(invitationService.publish).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm publication' }));
  expect(await screen.findByRole('link', { name: 'View invitation' })).toHaveAttribute('href', expect.stringContaining('/i/confirmed-birthday'));
  expect(invitationService.update.mock.invocationCallOrder[0]).toBeLessThan(invitationService.publish.mock.invocationCallOrder[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Advanced editor' }));
  fireEvent.change(screen.getByLabelText(/Event title/), { target: { value: 'After publication' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
  await waitFor(() => expect(invitationService.update).toHaveBeenLastCalledWith('42', expect.objectContaining({ expectedUpdatedAt: '2026-10-24T10:02:00Z', title: 'After publication' })));
});
it('retains generic edits after a conflict and suspends repeat saves', async () => {
  invitationService.update.mockRejectedValue({ status: 409, message: 'Newer version' });
  render(<MemoryRouter><StatefulEditor /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/Event title/), { target: { value: 'Retained draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
  await screen.findByText(/Another editor saved a newer version/);
  expect(screen.getByLabelText(/Event title/)).toHaveValue('Retained draft');
  expect(screen.getByRole('button', { name: 'Save details' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Download private unsaved edits' })).toBeEnabled();
  expect(invitationService.publish).not.toHaveBeenCalled();
});
