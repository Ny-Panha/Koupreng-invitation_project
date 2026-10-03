import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SeatingFloorPlan } from "./components/SeatingFloorPlan";
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const tables = [{ id: 1, tableName: "Family table", capacity: 10, notes: '{"x":20,"y":30}' }];

describe("P2-NEW-007 and A11Y-004 seating edit preservation", () => {
  it("retains unsaved table positions while editing walkway orientation", () => {
    const { container } = render(<SeatingFloorPlan tables={tables} onSavePositions={vi.fn()} />);
    const canvas = container.querySelector(".sfp-canvas-wrapper");
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({ width: 100, height: 100, left: 0, top: 0 });
    const table = container.querySelector(".sfp-table-node");
    fireEvent.mouseDown(table, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 0 });
    fireEvent.mouseUp(window);
    expect(table.style.left).toBe("30%");
    fireEvent.click(container.querySelectorAll(".sfp-seg-btn")[1]);
    expect(table.style.left).toBe("30%");
    expect(container.querySelector(".sfp-badge-dirty")).toBeInTheDocument();
  });

  it("keeps unsaved status after the server rejects a position save", async () => {
    const save = vi.fn().mockResolvedValue(false);
    const { container } = render(<SeatingFloorPlan tables={tables} onSavePositions={save} />);
    const canvas = container.querySelector(".sfp-canvas-wrapper");
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({ width: 100, height: 100, left: 0, top: 0 });
    fireEvent.mouseDown(container.querySelector(".sfp-table-node"), { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 0 });
    fireEvent.mouseUp(window);
    expect(container.querySelector(".sfp-badge-dirty")).toBeInTheDocument();
    await act(() => fireEvent.click(container.querySelector(".sfp-btn--save-dirty")));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(container.querySelector(".sfp-badge-dirty")).toBeInTheDocument();
  });

  it("moves tables and venue elements with keyboard and numeric coordinates while preserving pointer editing", async () => {
    const save = vi.fn();
    const { container } = render(<SeatingFloorPlan tables={tables} onSavePositions={save} />);
    const table = screen.getByRole("button", { name: "Move table Family table" });
    table.focus(); fireEvent.keyDown(table, { key: "ArrowRight" });
    expect(table.style.left).toBe("21%");
    fireEvent.change(screen.getByLabelText("Position element"), { target: { value: "stage" } });
    fireEvent.change(screen.getByLabelText("X position (%)"), { target: { value: "70" } });
    expect(container.querySelector(".sfp-stage").style.left).toBe("70%");
    expect(table.style.left).toBe("21%");
    const entrance = screen.getByRole("button", { name: "Move entrance" });
    entrance.focus(); fireEvent.keyDown(entrance, { key: "ArrowUp" });
    expect(container.querySelector(".sfp-entrance").style.top).toBe("91%");
  });
});
