import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useState } from 'react';
import FeedbackHost from "@/shared/feedback/FeedbackHost";
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
function StatefulEditor({ initialEvent = genericEvent }) {
  const [event,setEvent] = useState(initialEvent);
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
  await waitFor(() => expect(invitationService.update).toHaveBeenLastCalledWith('42', expect.objectContaining({ expectedUpdatedAt: '2026-10-24T10:02:00Z', title: 'After publication' }), { suppressAuthRedirect: true }));
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

it('edits a multi-day wedding on Event Essential through the same save queue', async () => {
  const wedding = { ...genericEvent, eventType: 'WEDDING', groomName: 'Dara', brideName: 'Sophea' };
  invitationService.update.mockImplementation(async (id, payload) => ({ ...wedding, ...payload, id: Number(id) }));
  render(<MemoryRouter><StatefulEditor initialEvent={wedding} /></MemoryRouter>);
  for (let day = 1; day <= 3; day++) fireEvent.click(screen.getByRole('button', { name: 'Add program day' }));
  expect(screen.getByRole('group', { name: 'Day 3', exact: true })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save details', exact: true }));
  await screen.findByText('Saved to event');
  const content = JSON.parse(invitationService.update.mock.calls[0][1].contentJson);
  expect(content.programDays).toHaveLength(3);
  expect(new Set(content.programDays.map(day => day.id)).size).toBe(3);
  expect(content.schedule).toEqual([]);
});

it('enables a neutral event calendar without stale section flags hiding it', async () => {
  invitationService.update.mockImplementation(async (id, payload) => ({ ...genericEvent, ...payload, id: Number(id) }));
  render(<MemoryRouter><StatefulEditor initialEvent={{ ...genericEvent, enabledSections: JSON.stringify({ countdown: false, gallery: false }) }} /></MemoryRouter>);
  expect(screen.getByLabelText('Show Save the Date section')).not.toBeChecked();
  fireEvent.click(screen.getByLabelText('Show Save the Date section'));
  fireEvent.click(screen.getByLabelText('Show calendar'));
  fireEvent.click(screen.getByRole('button', { name: 'Save details', exact: true }));
  await screen.findByText('Saved to event');
  const payload = invitationService.update.mock.calls[0][1];
  expect(JSON.parse(payload.contentJson).saveTheDate).toMatchObject({ enabled: true, showCalendar: true });
  expect(JSON.parse(payload.enabledSections)).toMatchObject({ countdown: true, gallery: false });
});

it('edits a neutral English version without changing Khmer content or forcing wedding roles', async () => {
  invitationService.update.mockImplementation(async (id, payload) => ({ ...genericEvent, ...payload, id: Number(id) }));
  render(<MemoryRouter><StatefulEditor initialEvent={{ ...genericEvent, languageMode: 'KH', storyText: 'Khmer message' }} /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Edit English', exact: true }));
  for (const [key, value] of Object.entries({ title: 'English birthday', hostName: 'English host', venueName: 'English venue', venueAddress: 'English address', messageText: 'English message' })) fireEvent.change(screen.getByLabelText(`English ${({ title: 'Event title', hostName: 'Host name', venueName: 'Venue name', venueAddress: 'Venue address', messageText: 'Invitation message' })[key]}`, { exact: true }), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Edit Khmer', exact: true }));
  expect(document.getElementById('event-title')).toHaveValue('Birthday');
  fireEvent.click(screen.getByRole('button', { name: 'Save details', exact: true }));
  await screen.findByText('Saved to event');
  const payload = invitationService.update.mock.calls[0][1];
  const content = JSON.parse(payload.contentJson);
  expect(content.localizedContentV1.en.title).toBe('English birthday');
  expect(content.localizedContentV1.km.title).toBe('Birthday');
  expect(content.messageText).toBe('Khmer message');
  expect(payload.groomName).toBe(''); expect(payload.brideName).toBe('');
});

it('wires PublishReview visibility, password input, previewUrl, and server save in EventDetails', async () => {
  const draftEvent = { ...genericEvent, slug: 'birthday-42', visibility: 'PRIVATE', updatedAt: '2026-10-24T10:00:00Z' };
  invitationService.update.mockResolvedValue({ ...draftEvent, visibility: 'PASSWORD_PROTECTED', updatedAt: '2026-10-24T10:05:00Z' });
  invitationService.publish.mockResolvedValue({ ...draftEvent, visibility: 'PASSWORD_PROTECTED', status: 'PUBLISHED', slug: 'birthday-42', updatedAt: '2026-10-24T10:06:00Z' });

  render(<MemoryRouter><FeedbackHost /><StatefulEditor initialEvent={draftEvent} /></MemoryRouter>);

  fireEvent.click(screen.getByRole('button', { name: 'Review publication', exact: true }));
  const dialog = screen.getByRole('dialog', { name: 'Review publication' });
  expect(dialog).toHaveTextContent(/\/i\/birthday-42/);

  fireEvent.click(screen.getByLabelText(/Public link/i));
  expect(screen.getByText(/Visibility: PUBLIC/i)).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/Password protected/i));
  const confirmBtn = screen.getByRole('button', { name: 'Confirm publication' });
  expect(confirmBtn).toBeDisabled();

  const pwInput = screen.getByLabelText(/Invitation access password/i);
  fireEvent.change(pwInput, { target: { value: 'party-2027' } });
  expect(confirmBtn).toBeEnabled();

  await act(async () => {
    fireEvent.click(confirmBtn);
  });

  const confirmChangeBtn = await screen.findByRole('button', { name: /Confirm|Continue|OK/i });
  await act(async () => {
    fireEvent.click(confirmChangeBtn);
  });

  await waitFor(() => expect(invitationService.update).toHaveBeenCalledWith(
    '42',
    expect.objectContaining({
      expectedUpdatedAt: '2026-10-24T10:00:00Z',
      visibility: 'PASSWORD_PROTECTED',
      accessPassword: 'party-2027',
    }),
    { suppressAuthRedirect: true }
  ));
  await waitFor(() => expect(invitationService.publish).toHaveBeenCalledWith('42'));
  expect(await screen.findByRole('link', { name: 'View invitation' })).toHaveAttribute('href', expect.stringContaining('/i/birthday-42'));

  // Password cleared from state without flipping dirty flag; reopening PublishReview shows server-configured hint
  expect(screen.getByText('Saved to event')).toBeInTheDocument();
  expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Visibility & password/i }));
  expect(screen.getByRole('dialog', { name: 'Review publication' })).toBeInTheDocument();
  expect(document.getElementById('publish-review-password')).toHaveValue('');
  expect(screen.getByText(/A password is already configured on the server/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

  // Subsequent unrelated save omits accessPassword from PUT payload
  fireEvent.click(screen.getByRole('button', { name: 'Advanced editor' }));
  fireEvent.change(screen.getByLabelText(/Event title/i), { target: { value: 'Updated Birthday Title' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
  await screen.findByText('Saved to event');
  expect(invitationService.update.mock.calls.at(-1)[1]).not.toHaveProperty('accessPassword');
});

it('recovers from Publish requirements missing: accessPassword, focuses #publish-review-password, and clears stale password on visibility switch', async () => {
  const protectedDraft = { ...genericEvent, visibility: 'PASSWORD_PROTECTED', slug: 'protected-42', updatedAt: '2026-10-24T10:00:00Z' };
  invitationService.update.mockResolvedValue({ ...protectedDraft, updatedAt: '2026-10-24T10:01:00Z' });
  invitationService.publish.mockRejectedValueOnce(new Error('Publish requirements missing: accessPassword'));

  render(<MemoryRouter><FeedbackHost /><StatefulEditor initialEvent={protectedDraft} /></MemoryRouter>);

  fireEvent.click(screen.getByRole('button', { name: 'Review publication', exact: true }));
  expect(screen.getByText(/password is already configured on the server/i)).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Confirm publication' }));
  });

  await waitFor(() => {
    expect(screen.queryByText(/password is already configured on the server/i)).not.toBeInTheDocument();
  });
  const dialog = screen.getByRole('dialog', { name: 'Review publication' });
  expect(dialog).toBeInTheDocument();
  expect(dialog).toHaveTextContent(/No access password is saved on the server yet/i);
  expect(document.activeElement?.id).toBe('publish-review-password');

  // Complete field keeps PublishReview open and focuses password input
  const completeBtns = screen.getAllByRole('button', { name: 'Complete field' });
  fireEvent.click(completeBtns[completeBtns.length - 1]);
  expect(screen.getByRole('dialog', { name: 'Review publication' })).toBeInTheDocument();
  expect(document.activeElement?.id).toBe('publish-review-password');

  // Switching visibility away from PASSWORD_PROTECTED clears stale typed password
  fireEvent.change(document.getElementById('publish-review-password'), { target: { value: 'stale-pass' } });
  expect(document.getElementById('publish-review-password')).toHaveValue('stale-pass');
  fireEvent.click(screen.getByLabelText(/Private/i));
  fireEvent.click(screen.getByLabelText(/Password protected/i));
  expect(document.getElementById('publish-review-password')).toHaveValue('');
});

it('allows published events in EventDetails to update access settings via PublishReview without re-publishing', async () => {
  const publishedEvent = { ...genericEvent, status: 'PUBLISHED', slug: 'live-42', visibility: 'PUBLIC', updatedAt: '2026-10-24T11:00:00Z' };
  invitationService.update.mockResolvedValue({ ...publishedEvent, visibility: 'PRIVATE', updatedAt: '2026-10-24T11:05:00Z' });

  render(<MemoryRouter initialEntries={['/app/events/42/settings?mode=guided']}><FeedbackHost /><StatefulEditor initialEvent={publishedEvent} /></MemoryRouter>);

  fireEvent.click(screen.getByRole('button', { name: /Publish & share/i }));
  fireEvent.click(await screen.findByRole('button', { name: /Visibility & password/i }));

  expect(screen.getByRole('dialog', { name: 'Review publication' })).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(/Private/i));

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save access settings' }));
  });

  const confirmChangeBtn = await screen.findByRole('button', { name: /Confirm|Continue|OK/i });
  await act(async () => {
    fireEvent.click(confirmChangeBtn);
  });

  await waitFor(() => expect(invitationService.update).toHaveBeenCalledWith(
    '42',
    expect.objectContaining({ expectedUpdatedAt: '2026-10-24T11:00:00Z', visibility: 'PRIVATE' }),
    { suppressAuthRedirect: true }
  ));
  expect(invitationService.publish).not.toHaveBeenCalled();
});
