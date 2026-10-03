import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { seatingService } from "./seatingService";
import { useSeating } from "./hooks/useSeating";

vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: vi.fn() } }));
vi.mock("./seatingService", () => ({ seatingService: { plan: vi.fn(), updateTable: vi.fn() } }));
vi.mock("@/shared/ui/toast", () => ({ toast: vi.fn() }));
afterEach(() => vi.clearAllMocks());

describe("FE-012 seating note preservation", () => {
  it.each(["Keep family together", "{Unfinished human note", '{"x":5,"y":10,"notesText":"Keep family together","other":"preserve"}'])("preserves existing human notes and metadata when saving positions (%s)", async (notes) => {
    invitationService.get.mockResolvedValue({ id: 10 });
    seatingService.plan.mockResolvedValue({ tables: [{ id: 1, tableName: "Family", notes }], assignments: [] });
    seatingService.updateTable.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useSeating(10));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.saveTablePositions({ 1: { x: 20, y: 30 } }));
    const saved = JSON.parse(seatingService.updateTable.mock.calls[0][2].notes);
    expect(saved).toMatchObject({ x: 20, y: 30 });
    if (notes.startsWith('{"x"')) expect(saved).toMatchObject({ notesText: "Keep family together", other: "preserve" });
    else expect(saved.notesText).toBe(notes);
  });
});
