import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RsvpOwnerActions from "./components/RsvpOwnerActions";
import { rsvpService } from "./api/rsvpApi";
vi.mock("./api/rsvpApi", () => ({ rsvpService: { update: vi.fn(), remove: vi.fn() } }));
afterEach(cleanup); beforeEach(() => vi.clearAllMocks());
const record = { id: 3, responseStatus: "ATTENDING", attendeeCount: 2, message: "Best wishes" };
describe("BG-04 owner RSVP management", () => {
  it("saves status/count/message only after server acknowledgement", async () => {
    rsvpService.update.mockResolvedValue({ ...record, attendeeCount: 0 }); const saved = vi.fn();
    render(<RsvpOwnerActions invitationId="42" record={record} onSaved={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit RSVP" }));
    fireEvent.change(screen.getByLabelText("Attendee count"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Save RSVP" }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(rsvpService.update).toHaveBeenCalledWith("42", 3, { responseStatus: "ATTENDING", attendeeCount: 0, message: "Best wishes" });
  });
  it("retains edited response on a failed update", async () => {
    rsvpService.update.mockRejectedValue(new Error("permission denied")); const saved = vi.fn();
    render(<RsvpOwnerActions invitationId="42" record={record} onSaved={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit RSVP" }));
    fireEvent.change(screen.getByLabelText("Wish message"), { target: { value: "Retained text" } });
    fireEvent.click(screen.getByRole("button", { name: "Save RSVP" }));
    await screen.findByRole("alert"); expect(screen.getByLabelText("Wish message")).toHaveValue("Retained text"); expect(saved).not.toHaveBeenCalled();
  });
  it("requires explicit response deletion and keeps failed deletion open", async () => {
    rsvpService.remove.mockRejectedValue(new Error("server unavailable")); const saved = vi.fn();
    render(<RsvpOwnerActions invitationId="42" record={record} onSaved={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete RSVP" })); expect(rsvpService.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm deletion" })); await screen.findByRole("alert"); expect(saved).not.toHaveBeenCalled();
  });
  it("deletes the selected response after confirmation and refreshes authoritative data", async () => {
    rsvpService.remove.mockResolvedValue(null); const saved = vi.fn();
    render(<RsvpOwnerActions invitationId="42" record={record} onSaved={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete RSVP" })); fireEvent.click(screen.getByRole("button", { name: "Confirm deletion" }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce()); expect(rsvpService.remove).toHaveBeenCalledWith("42", 3); expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("distinguishes a saved deletion from a failed refresh and retries only the refresh", async () => {
    rsvpService.remove.mockResolvedValue(null); const saved = vi.fn().mockRejectedValueOnce(new Error("Refresh unavailable")).mockResolvedValueOnce(undefined);
    render(<RsvpOwnerActions invitationId="42" record={record} onSaved={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete RSVP" })); fireEvent.click(screen.getByRole("button", { name: "Confirm deletion" }));
    await screen.findByText(/change was saved/); expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry RSVP refresh" })); await screen.findByText("RSVP list refreshed.");
    expect(rsvpService.remove).toHaveBeenCalledOnce(); expect(saved).toHaveBeenCalledTimes(2);
  });
});
