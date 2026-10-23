import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSeating } from "./hooks/useSeating";
import { seatingService } from "./seatingService";
vi.mock("./seatingService", () => ({ seatingService: { plan: vi.fn(), summary: vi.fn(), updateTable: vi.fn(), layout: vi.fn().mockResolvedValue({ eventId: 42, version: 0, data: null }), saveLayout: vi.fn() } }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: vi.fn().mockResolvedValue({ id: 42 }) } }));
vi.mock("../../shared/ui/toast", () => ({ toast: vi.fn() }));
afterEach(cleanup); beforeEach(() => { vi.clearAllMocks(); seatingService.plan.mockResolvedValue({ tables: [{ id: 1, tableName: "Family", capacity: 10, notes: "Keep this family note" }] }); seatingService.summary.mockResolvedValue({ totalTables: 20, totalCapacity: 200, assignedSeats: 120, remainingSeats: 80 }); });
describe("BG-08 server seating summary and position persistence", () => {
  it("uses the aggregate summary for the full event", async () => { const { result } = renderHook(() => useSeating(42)); await waitFor(() => expect(result.current.loading).toBe(false)); expect(result.current.summary).toMatchObject({ totalCapacity: 200, remainingSeats: 80 }); });
  it("returns failed-save acknowledgement and keeps existing note content", async () => {
    seatingService.saveLayout.mockRejectedValue(new Error("Save unavailable")); const { result } = renderHook(() => useSeating(42)); await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await expect(result.current.saveTablePositions({ 1: { x: 20, y: 30 } })).rejects.toThrow('Save unavailable'); }); expect(result.current.error).toBe("Save unavailable");
    expect(result.current.plan.tables[0].notes).toBe("Keep this family note"); expect(seatingService.updateTable).not.toHaveBeenCalled();
  });
});
