import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { guestService } from "@/features/guests/api/guestApi";
import { invitationService } from "./api/invitationApi";
import { planningService } from "@/features/planning/api/planningApi";
import * as storage from "@/shared/storage";
import InvitationCheckInPage from "./InvitationCheckInPage";

vi.mock("@/features/guests/api/guestApi", () => ({ guestService: {
  listByInvitation: vi.fn(), checkInSummary: vi.fn(), checkInList: vi.fn(), scanCheckIn: vi.fn(), manualCheckIn: vi.fn(), createForInvitation: vi.fn(), undoCheckIn: vi.fn(),
} }));
vi.mock("./api/invitationApi", () => ({ invitationService: { get: vi.fn(), listMine: vi.fn() } }));
vi.mock("@/features/planning/api/planningApi", () => ({ planningService: { createGift: vi.fn() } }));
vi.mock("@/shared/storage", () => ({
  getActiveEventId: () => "foreign-draft", getDraft: vi.fn(), createHostRecordId: vi.fn((prefix) => prefix + "-local-1"),
  listManualGuests: vi.fn(), saveManualGuests: vi.fn(), listManualCheckIns: vi.fn(), saveManualCheckIns: vi.fn(), listWeddingGifts: vi.fn(), saveWeddingGifts: vi.fn(),
}));
vi.mock("../../shared/ui/toast", () => ({ toast: vi.fn() }));
vi.mock("./components/QrCameraScanner", () => ({ default: ({ onScan, disabled }) => <button disabled={disabled} onClick={() => onScan("known-token")}>Camera test scan</button> }));
const guest = { id: 2, guestName: "Known guest", token: "known-token" };
const result = { id: 101, guestId: 2, guestName: "Known guest", alreadyCheckedIn: false };
const originalConfirm = window.confirm;
function show(id = "10") {
  return render(<MemoryRouter initialEntries={[`/dashboard/invitations/${id}/check-in`]}><Routes><Route path="/dashboard/invitations/:invitationId/check-in" element={<InvitationCheckInPage />} /></Routes></MemoryRouter>);
}
async function ready() { await screen.findByRole("heading", { name: "Owned wedding" }); }
async function scanToken(container) {
  fireEvent.change(screen.getByPlaceholderText("Paste /i/slug?token=... or token"), { target: { value: "known-token" } });
  fireEvent.submit(container.querySelector("form.guest-form"));
}
async function walkIn(container) {
  fireEvent.click(screen.getByRole("button", { name: /\(Walk-in\)/ }));
  const form = container.querySelector(".checkin-modal form");
  fireEvent.change(form.querySelector("input"), { target: { value: "Walk guest" } });
  fireEvent.submit(form);
  return form;
}

describe("FE-004/005/006/007 durable check-in desk", () => {
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
    vi.clearAllMocks();
    invitationService.get.mockResolvedValue({ id: 10, title: "Owned wedding" });
    guestService.listByInvitation.mockResolvedValue([guest]);
    guestService.checkInSummary.mockResolvedValue({ totalGuests: 1, checkedIn: 0, remaining: 1 });
    guestService.checkInList.mockResolvedValue([]);
    guestService.scanCheckIn.mockResolvedValue(result);
    guestService.manualCheckIn.mockResolvedValue(result);
    guestService.createForInvitation.mockResolvedValue({ id: 9, guestName: "Walk guest" });
    guestService.undoCheckIn.mockResolvedValue({ message: "Attendance removed" });
    planningService.createGift.mockResolvedValue({ id: 45 });
    storage.getDraft.mockImplementation((id) => id === "wed-local" ? { id, title: "Owned wedding" } : null);
    storage.listManualGuests.mockReturnValue([guest]); storage.listManualCheckIns.mockReturnValue([]); storage.listWeddingGifts.mockReturnValue([]);
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); window.confirm = originalConfirm; });

  it.each(["token", "camera", "manual"])("keeps a rejected server %s check-in rejected, even if local data matches", async (method) => {
    guestService.scanCheckIn.mockRejectedValue(new Error("Attendance was not saved"));
    guestService.manualCheckIn.mockRejectedValue(new Error("Attendance was not saved"));
    const { container } = show(); await ready();
    if (method === "token") await scanToken(container);
    else if (method === "camera") fireEvent.click(screen.getByRole("button", { name: "Camera test scan" }));
    else fireEvent.click(container.querySelector(".checkin-guest-list button") || screen.getAllByRole("button", { name: /^Check in$/ })[1]);
    expect(await screen.findByText("Attendance was not saved")).toBeInTheDocument();
    expect(storage.saveManualCheckIns).not.toHaveBeenCalled();
    expect(container.querySelector(".checkin-celebration-modal")).not.toBeInTheDocument();
  });

  it("does not replace failed server loading with another event's guests", async () => {
    invitationService.get.mockRejectedValue(new Error("Invitation denied"));
    const { container } = show();
    expect(await screen.findByText("Invitation denied")).toBeInTheDocument();
    expect(storage.listManualGuests).not.toHaveBeenCalled();
    expect(container.querySelector(".checkin-kpi-value")).toBeNull();
  });

  it("creates a server walk-in before recording attendance with the returned guest ID", async () => {
    const { container } = show(); await ready(); await walkIn(container);
    await waitFor(() => expect(guestService.createForInvitation).toHaveBeenCalledWith("10", expect.objectContaining({ guestName: "Walk guest" })));
    expect(guestService.manualCheckIn).toHaveBeenCalledWith("10", 9, expect.any(String));
    expect(storage.saveManualGuests).not.toHaveBeenCalled();
    expect(storage.saveManualCheckIns).not.toHaveBeenCalled();
  });

  it("retries attendance after partial walk-in failure without creating a duplicate guest", async () => {
    guestService.manualCheckIn.mockRejectedValueOnce(new Error("Guest saved; attendance failed"));
    const { container } = show(); await ready(); const form = await walkIn(container);
    expect(await screen.findByText(/Guest saved; attendance failed/)).toBeInTheDocument();
    fireEvent.submit(form);
    await waitFor(() => expect(guestService.manualCheckIn).toHaveBeenCalledTimes(2));
    expect(guestService.createForInvitation).toHaveBeenCalledOnce();
  });

  it("writes a desk gift to the server ledger in the shared schema and requested currency", async () => {
    const { container } = show(); await ready();
    fireEvent.change(container.querySelector("form.guest-form input[type=number]"), { target: { value: "5000" } });
    fireEvent.click(container.querySelectorAll("form.guest-form .checkin-currency-btn")[1]);
    await scanToken(container);
    await waitFor(() => expect(planningService.createGift).toHaveBeenCalledWith("10", expect.objectContaining({ name: "Known guest", amount: 5000, currency: "KHR", method: "Cash", date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) })));
    expect(storage.saveWeddingGifts).not.toHaveBeenCalled();
  });

  it("keeps failed gift capture available for retry and does not write a local substitute", async () => {
    planningService.createGift.mockRejectedValue(new Error("Gift was not saved"));
    const { container } = show(); await ready();
    fireEvent.change(container.querySelector("form.guest-form input[type=number]"), { target: { value: "20" } });
    await scanToken(container);
    expect(await screen.findByText(/Gift was not saved/)).toBeInTheDocument();
    expect(storage.saveWeddingGifts).not.toHaveBeenCalled();
    expect(container.querySelector(".checkin-gift-input[value='20']")).toBeInTheDocument();
  });

  it("preserves deliberate local-draft attendance without contacting server endpoints", async () => {
    const { container } = show("wed-local"); await ready(); await scanToken(container);
    await waitFor(() => expect(storage.saveManualCheckIns).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ guestId: 2 })]), "wed-local", { throwOnError: true }));
    expect(guestService.scanCheckIn).not.toHaveBeenCalled();
    expect(invitationService.get).not.toHaveBeenCalled();
  });

  it("undoes server attendance by guest ID and retains the guest and gifts", async () => {
    guestService.checkInList.mockResolvedValueOnce([result]).mockResolvedValue([]);
    const { container } = show(); await ready();
    fireEvent.click(container.querySelectorAll(".checkin-guest-table")[1].querySelector("button"));
    await waitFor(() => expect(guestService.undoCheckIn).toHaveBeenCalledWith("10", 2));
    expect(storage.saveManualCheckIns).not.toHaveBeenCalled();
    expect(storage.saveManualGuests).not.toHaveBeenCalled();
    expect(storage.saveWeddingGifts).not.toHaveBeenCalled();
  });

  it("keeps attendance intact when server undo fails", async () => {
    guestService.checkInList.mockResolvedValue([result]);
    guestService.undoCheckIn.mockRejectedValue(new Error("Undo denied"));
    const { container } = show(); await ready();
    fireEvent.click(container.querySelectorAll(".checkin-guest-table")[1].querySelector("button"));
    expect(await screen.findByText("Undo denied")).toBeInTheDocument();
    expect(container.querySelectorAll(".checkin-guest-table")[1]).toHaveTextContent("Known guest");
    expect(storage.saveManualCheckIns).not.toHaveBeenCalled();
  });

  it("does not report local draft attendance as saved when browser storage rejects the write", async () => {
    storage.saveManualCheckIns.mockImplementationOnce(() => { throw new Error("Local storage full; not saved"); });
    const { container } = show("wed-local"); await ready(); await scanToken(container);
    expect(await screen.findByText("Local storage full; not saved")).toBeInTheDocument();
    expect(container.querySelectorAll(".checkin-guest-table")[1]).not.toHaveTextContent("Known guest");
  });
});
