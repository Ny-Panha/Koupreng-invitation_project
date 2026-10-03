import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportsApi } from "../reports/api/reportsApi";
import { budgetService } from "../budget/api/budgetApi";
import { loadServerDashboard, groupAmounts } from "./dashboardData";
vi.mock("../reports/api/reportsApi", () => ({ reportsApi: { invitationDashboard: vi.fn() } }));
vi.mock("../budget/api/budgetApi", () => ({ budgetService: { listItems: vi.fn() } }));
vi.mock("../planning/api/planningApi", () => ({ planningService: { listGifts: vi.fn().mockResolvedValue([]) } }));
vi.mock("../guests/api/guestApi", () => ({ guestService: { checkInSummary: vi.fn().mockResolvedValue({ totalCheckedIn: 120 }) } }));
vi.mock("../notifications/notificationService", () => ({ default: { listByInvitation: vi.fn().mockResolvedValue([]) } }));
beforeEach(() => { vi.clearAllMocks(); reportsApi.invitationDashboard.mockResolvedValue({ totalGuests: 200, totalInvited: 220, attending: 150 }); budgetService.listItems.mockResolvedValue([]); });
describe("BG-03 dashboard aggregate integration", () => {
  it("keeps authoritative aggregates for a 200-guest event without refetching raw attendance lists", async () => {
    const result = await loadServerDashboard(42); expect(result.dashboard.totalGuests).toBe(200); expect(result.dashboard.totalInvited).toBe(220); expect(result.checkInSummary.totalCheckedIn).toBe(120);
  });
  it("rejects a failed ledger load instead of treating it as a zero balance", async () => {
    budgetService.listItems.mockRejectedValue(new Error("Ledger unavailable")); await expect(loadServerDashboard(42)).rejects.toThrow("Ledger unavailable");
  });
  it("groups display amounts without mixing USD and KHR", () => { expect(groupAmounts([{ currency: "USD", amount: 10 }, { currency: "KHR", amount: 40000 }], "amount")).toEqual({ USD: 10, KHR: 40000 }); });
});
