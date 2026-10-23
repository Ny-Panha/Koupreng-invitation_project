import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { seatingService } from "./seatingService";
import { useSeating } from "./hooks/useSeating";

vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: vi.fn() } }));
vi.mock("./seatingService", () => ({ seatingService: { plan: vi.fn(), updateTable: vi.fn(), layout: vi.fn(), saveLayout: vi.fn() } }));
vi.mock("@/shared/ui/toast", () => ({ toast: vi.fn() }));
afterEach(() => vi.clearAllMocks());

describe("FE-012 seating note preservation", () => {
  it.each(["Keep family together", "{Unfinished human note", '{"x":5,"y":10,"notesText":"Keep family together","other":"preserve"}'])("preserves existing human notes and metadata when saving positions (%s)", async (notes) => {
    invitationService.get.mockResolvedValue({ id: 10 });
    seatingService.plan.mockResolvedValue({ tables: [{ id: 1, tableName: "Family", notes }], assignments: [] });
    seatingService.updateTable.mockResolvedValue({ id: 1 });
    seatingService.layout.mockResolvedValue({ eventId: 10, version: 0, data: null });
    seatingService.saveLayout.mockImplementation(async (id, request) => ({ eventId: id, version: 1, data: request.data }));
    const { result } = renderHook(() => useSeating(10));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.saveTablePositions({ 1: { x: 20, y: 30 } }));
    expect(seatingService.saveLayout.mock.calls[0][1].data.positions).toEqual({ 1: { x: 20, y: 30 } });
    expect(seatingService.updateTable).not.toHaveBeenCalled();
    expect(result.current.plan.tables[0].notes).toBe(notes);
  });
});
