import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  listMine: vi.fn(),
  listGifts: vi.fn(),
  getBudget: vi.fn(),
  listGuests: vi.fn(),
  listRsvps: vi.fn(),
  checkInList: vi.fn(),
  listDrafts: vi.fn(),
  getActiveEventId: vi.fn(),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 7 } }) }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { listMine: services.listMine } }));
vi.mock("@/features/gifts/api/giftsApi", () => ({ giftsApi: { listGifts: services.listGifts } }));
vi.mock("@/features/budget/api/budgetApi", () => ({ budgetService: { getBudget: services.getBudget } }));
vi.mock("@/features/guests/api/guestApi", () => ({ guestService: { listByInvitation: services.listGuests, checkInList: services.checkInList } }));
vi.mock("@/features/rsvp/api/rsvpApi", () => ({ listRsvps: vi.fn(() => []), rsvpService: { listByInvitation: services.listRsvps } }));
vi.mock("@/shared/storage/weddingStorage", () => ({ listDrafts: services.listDrafts }));
vi.mock("@/shared/storage/hostPlanningStorage", () => ({
  getActiveEventId: services.getActiveEventId,
  listBudgetExpenses: vi.fn(() => []),
  listManualCheckIns: vi.fn(() => []),
  listManualGuests: vi.fn(() => []),
  listWeddingGifts: vi.fn(() => []),
}));

import { useActiveEventReport } from "./useActiveEventReport";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useActiveEventReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "setInterval").mockReturnValue(1);
    vi.spyOn(window, "clearInterval").mockImplementation(() => {});
    services.listDrafts.mockReturnValue([{ id: "local-51", backendInvitationId: 51, slug: "owned-event" }]);
    services.getActiveEventId.mockReturnValue("local-51");
    services.listMine.mockResolvedValue([
      { id: 51, title: "Owned Event", slug: "owned-event", status: "PUBLISHED" },
      { id: 99, title: "Another User Event", slug: "other-event", status: "PUBLISHED" },
    ]);
    services.listGifts.mockResolvedValue([{ id: 1, amount: 10 }]);
    services.getBudget.mockResolvedValue({ items: [{ id: 2, estimatedCost: 20 }] });
    services.listGuests.mockResolvedValue([{ id: 3, guestName: "Owned Guest" }]);
    services.listRsvps.mockResolvedValue([{ guestId: 3, responseStatus: "ATTENDING", attendeeCount: 2 }]);
    services.checkInList.mockResolvedValue([{ id: 4, active: true }]);
  });

  it("loads report details only for the signed-in user's active invitation", async () => {
    const { result } = renderHook(() => useActiveEventReport());
    await act(async () => { await result.current.reload(); });
    expect(result.current.loading).toBe(false);

    expect(result.current.sourceData.invitation.id).toBe(51);
    expect(result.current.sourceData.guests).toEqual([{ id: 3, guestName: "Owned Guest" }]);
    expect(services.listGuests).toHaveBeenCalledWith(51);
    expect(services.checkInList).toHaveBeenCalledWith(51);
    expect(services.listGifts).not.toHaveBeenCalledWith(99);
  });

  it("does not fetch details when the user has no active or owned event", async () => {
    services.listDrafts.mockReturnValue([]);
    services.getActiveEventId.mockReturnValue("foreign-event");
    services.listMine.mockResolvedValue([]);
    const { result } = renderHook(() => useActiveEventReport());
    await act(async () => { await result.current.reload(); });
    expect(result.current.loading).toBe(false);

    expect(result.current.sourceData).toBeNull();
    expect(services.listGuests).not.toHaveBeenCalled();
    expect(services.listGifts).not.toHaveBeenCalled();
  });
});