import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSeating } from "./hooks/useSeating";
import { seatingService } from "./seatingService";
vi.mock("./seatingService", () => ({ seatingService: { plan: vi.fn(), summary: vi.fn(), updateTable: vi.fn() } }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: vi.fn().mockResolvedValue({ id: 42 }) } }));
vi.mock("../../shared/ui/toast", () => ({ toast: vi.fn() }));
afterEach(cleanup); beforeEach(() => { vi.clearAllMocks(); seatingService.plan.mockResolvedValue({ tables: [{ id: 1, tableName: "Family", capacity: 10, notes: "Keep this family note" }] }); seatingService.summary.mockResolvedValue({ totalTables: 20, totalCapacity: 200, assignedSeats: 120, remainingSeats: 80 }); });
describe("BG-08 server seating summary and position persistence", () => {
  it("uses the aggregate summary for the full event", async () => { const { result } = renderHook(() => useSeating(42)); await waitFor(() => expect(result.current.loading).toBe(false)); expect(result.current.summary).toMatchObject({ totalCapacity: 200, remainingSeats: 80 }); });
  it("returns failed-save acknowledgement and keeps existing note content", async () => {
    seatingService.updateTable.mockRejectedValue(new Error("Save unavailable")); const { result } = renderHook(() => useSeating(42)); await waitFor(() => expect(result.current.loading).toBe(false));
    let saved; await act(async () => { saved = await result.current.saveTablePositions({ 1: { x: 20, y: 30 } }); }); expect(saved).toBe(false); expect(result.current.error).toBe("Save unavailable");
    const notes = JSON.parse(seatingService.updateTable.mock.calls[0][2].notes); expect(notes.notesText).toBe("Keep this family note");
  });
});
