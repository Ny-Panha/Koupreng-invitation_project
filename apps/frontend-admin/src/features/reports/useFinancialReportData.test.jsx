import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const adminService = vi.hoisted(() => ({
  invitations: vi.fn(),
  invitation: vi.fn(),
  invitationGifts: vi.fn(),
  invitationBudgetItems: vi.fn(),
  invitationRsvpSummary: vi.fn(),
}));

vi.mock("../../shared/api/adminService", () => ({ default: adminService }));

import { useFinancialReportData } from "./useFinancialReportData";

afterEach(cleanup);

describe("useFinancialReportData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.invitations.mockResolvedValue([{ id: 42, title: "Wedding" }]);
    adminService.invitation.mockResolvedValue({ id: 42, groomName: "Dara", brideName: "Sophea" });
    adminService.invitationGifts.mockResolvedValue([{ id: 1, amount: 25, currency: "USD" }]);
    adminService.invitationBudgetItems.mockResolvedValue([{ id: 2, actualCost: 50000, currency: "KHR" }]);
    adminService.invitationRsvpSummary.mockResolvedValue({ totalGuests: 4, attending: 3 });
  });

  it("loads selected invitation records and refreshes them when the page regains focus", async () => {
    const { result } = renderHook(() => useFinancialReportData(60000));

    await waitFor(() => expect(result.current.reportData?.gifts).toHaveLength(1));
    expect(result.current.invitationId).toBe("42");
    expect(result.current.reportData.expenses[0].currency).toBe("KHR");
    expect(result.current.reportData.rsvpSummary.attending).toBe(3);

    adminService.invitationGifts.mockResolvedValue([
      { id: 1, amount: 25, currency: "USD" },
      { id: 3, amount: 75, currency: "KHR" },
    ]);
    act(() => window.dispatchEvent(new Event("focus")));

    await waitFor(() => expect(result.current.reportData.gifts).toHaveLength(2));
    expect(adminService.invitationGifts).toHaveBeenCalledWith("42");
  });

  it("clears the previous event report while the newly selected event loads", async () => {
    adminService.invitations.mockResolvedValue([
      { id: 42, title: "Wedding" },
      { id: 77, title: "Birthday" },
    ]);
    let resolveBirthday;
    adminService.invitation.mockImplementation((id) => id === "77"
      ? new Promise((resolve) => { resolveBirthday = resolve; })
      : Promise.resolve({ id: 42, title: "Wedding" }));

    const { result } = renderHook(() => useFinancialReportData(60000));
    await waitFor(() => expect(result.current.reportData?.invitation?.id).toBe(42));

    act(() => result.current.setInvitationId("77"));

    expect(result.current.reportData).toBeNull();
    await waitFor(() => expect(adminService.invitation).toHaveBeenCalledWith("77"));
    await act(async () => {
      resolveBirthday({ id: 77, title: "Birthday", eventType: "BIRTHDAY" });
    });
    await waitFor(() => expect(result.current.reportData?.invitation?.id).toBe(77));
  });

  it("refreshes the event choices on focus without changing the current selection", async () => {
    adminService.invitations
      .mockResolvedValueOnce([{ id: 42, title: "Wedding" }])
      .mockResolvedValueOnce([{ id: 42, title: "Wedding" }, { id: 77, title: "Birthday" }]);

    const { result } = renderHook(() => useFinancialReportData(60000));
    await waitFor(() => expect(result.current.reportData?.invitation?.id).toBe(42));

    act(() => window.dispatchEvent(new Event("focus")));

    await waitFor(() => expect(adminService.invitations).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.invitations).toHaveLength(2));
    expect(result.current.invitationId).toBe("42");
  });
});