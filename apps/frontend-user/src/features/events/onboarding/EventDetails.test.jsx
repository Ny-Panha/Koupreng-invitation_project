import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { EventContext } from "../workspace/EventContext";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { invitationService } from "@/features/invitations/api/invitationApi";
import EventDetails from "./EventDetails";
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { update: vi.fn() } }));
afterEach(cleanup);
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
