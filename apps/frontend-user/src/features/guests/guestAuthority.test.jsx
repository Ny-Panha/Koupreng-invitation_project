import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGuests } from "./hooks/useGuests";
import { useGuestMutations } from "./hooks/useGuestMutations";

const invitationService = vi.hoisted(() => ({ listMine: vi.fn() }));
const guestService = vi.hoisted(() => ({
  listByInvitation: vi.fn(),
  importForInvitation: vi.fn(),
  checkInList: vi.fn(),
}));
const rsvpService = vi.hoisted(() => ({ listByInvitation: vi.fn() }));
const planningStorage = vi.hoisted(() => ({
  getActiveEventId: vi.fn(() => "draft-1"),
  listManualGuests: vi.fn(() => [{ id: "local-1", name: "Local only", count: 1 }]),
  saveManualGuests: vi.fn(),
}));

vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService }));
vi.mock("@/features/guests/api/guestApi", () => ({ guestService }));
vi.mock("@/features/rsvp/api/rsvpApi", () => ({ rsvpService }));
vi.mock("@/shared/storage/weddingStorage", () => ({
  listDrafts: () => [{ id: "draft-1", backendInvitationId: 42, slug: "our-day" }],
}));
vi.mock("@/shared/storage/hostPlanningStorage", () => ({
  ...planningStorage,
  createHostRecordId: () => "manual-new",
}));

function routeWrapper(path = "/dashboard/invitations/42/guests") {
  return function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/dashboard/invitations/:invitationId/guests" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe("guest state authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    planningStorage.getActiveEventId.mockReturnValue("draft-1");
    planningStorage.listManualGuests.mockReturnValue([{ id: "local-1", name: "Local only", count: 1 }]);
    invitationService.listMine.mockResolvedValue([{ id: 42, slug: "our-day", status: "PUBLISHED" }]);
    guestService.listByInvitation.mockResolvedValue([{ id: 7, guestName: "Server guest", seatCount: 2 }]);
    guestService.checkInList.mockResolvedValue([]);
    rsvpService.listByInvitation.mockResolvedValue([
      { id: 9, guestId: 7, guestName: "Server guest", responseStatus: "ATTENDING", attendeeCount: 2 },
    ]);
  });

  it("uses the route invitation and excludes browser-only guest records", async () => {
    const { result } = renderHook(() => useGuests(), { wrapper: routeWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(invitationService.listMine).toHaveBeenCalledTimes(1);
    expect(guestService.listByInvitation).toHaveBeenCalledWith(42);
    expect(result.current.guests).toEqual([
      expect.objectContaining({ id: 7, name: "Server guest", source: "backend", rsvpStatus: "ATTENDING" }),
    ]);
    expect(result.current.guests.some((guest) => guest.id === "local-1")).toBe(false);
  });

  it("does not fall back to another invitation when the route is outside the user's list", async () => {
    const { result } = renderHook(() => useGuests(), {
      wrapper: routeWrapper("/dashboard/invitations/99/guests"),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(guestService.listByInvitation).not.toHaveBeenCalled();
    expect(result.current.guests).toEqual([]);
    expect(result.current.error).toMatch(/not found|permission/i);
  });

  it("still loads saved guests when the RSVP request fails", async () => {
    rsvpService.listByInvitation.mockRejectedValueOnce(new Error("RSVP unavailable"));
    const { result } = renderHook(() => useGuests(), { wrapper: routeWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.guests).toEqual([
      expect.objectContaining({ id: 7, name: "Server guest", source: "backend" }),
    ]);
    expect(result.current.error).toBe("RSVP unavailable");
  });

  it("preserves loaded guests when a later guest refresh fails", async () => {
    const { result } = renderHook(() => useGuests(), { wrapper: routeWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    guestService.listByInvitation.mockRejectedValueOnce(new Error("Guest list unavailable"));

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.guests).toEqual([
      expect.objectContaining({ id: 7, name: "Server guest", source: "backend" }),
    ]);
    expect(result.current.error).toBe("Guest list unavailable");
  });

  it("still loads saved guests when check-in data is unavailable", async () => {
    guestService.checkInList.mockRejectedValueOnce(new Error("Check-in unavailable"));
    const { result } = renderHook(() => useGuests(), { wrapper: routeWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.guests).toEqual([
      expect.objectContaining({ id: 7, name: "Server guest", source: "backend" }),
    ]);
    expect(result.current.error).toBe("Check-in unavailable");
  });

  it("clears the previous event's guests when another event fails to load", async () => {
    const { result } = renderHook(() => ({ state: useGuests(), navigate: useNavigate() }), {
      wrapper: routeWrapper(),
    });
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    expect(result.current.state.guests).toHaveLength(1);
    invitationService.listMine.mockResolvedValue([
      { id: 42, slug: "our-day", status: "PUBLISHED" },
      { id: 43, slug: "another-day", status: "PUBLISHED" },
    ]);
    guestService.listByInvitation.mockRejectedValueOnce(new Error("Guest list unavailable"));

    await act(async () => {
      result.current.navigate("/dashboard/invitations/43/guests");
    });
    await waitFor(() => {
      expect(result.current.state.backendInvitation?.id).toBe(43);
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.guests).toEqual([]);
    expect(result.current.state.error).toBe("Guest list unavailable");
  });

  it("does not persist a server-backed import locally when the API fails", async () => {
    guestService.importForInvitation.mockRejectedValueOnce(new Error("Import rejected"));
    const setManualGuests = vi.fn();
    const refreshData = vi.fn();
    const { result } = renderHook(
      () =>
        useGuestMutations({
          eventId: "draft-1",
          backendInvitation: { id: 42 },
          setManualGuests,
          backendGuests: [],
          setBackendGuests: vi.fn(),
          refreshData,
        }),
      { wrapper: routeWrapper() }
    );

    let success;
    await act(async () => {
      success = await result.current.importGuests([{ name: "Not persisted", count: 1 }]);
    });

    expect(success).toBe(false);
    expect(setManualGuests).not.toHaveBeenCalled();
    expect(planningStorage.saveManualGuests).not.toHaveBeenCalled();
    expect(refreshData).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Import rejected");
  });

  it("maps companion and guest fields into the invitation-scoped batch request", async () => {
    guestService.importForInvitation.mockResolvedValueOnce([]);
    const refreshData = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useGuestMutations({
          eventId: "draft-1",
          backendInvitation: { id: 42 },
          setManualGuests: vi.fn(),
          backendGuests: [],
          setBackendGuests: vi.fn(),
          refreshData,
        }),
      { wrapper: routeWrapper() }
    );

    let success;
    await act(async () => {
      success = await result.current.importGuests([{
        name: "Sok Dara",
        companionName: "Srey Mom",
        phone: "012345678",
        group: "Bride Side",
        category: "Family",
        count: 2,
        note: "VIP",
      }]);
    });

    expect(success).toBe(true);
    expect(guestService.importForInvitation).toHaveBeenCalledWith(42, [
      {
        guestName: "Sok Dara",
        companionName: "Srey Mom",
        phone: "012345678",
        guestGroup: "Bride Side",
        sideType: "Family",
        tableNumber: null,
        sendStatus: null,
        seatCount: 2,
        note: "VIP",
      },
    ]);
    expect(refreshData).toHaveBeenCalledTimes(1);
  });
});
