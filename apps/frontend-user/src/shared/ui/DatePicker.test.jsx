import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DatePicker from "./DatePicker";
afterEach(cleanup);
describe("A11Y-003 date picker keyboard contract", () => {
  it("focuses the selected date, moves across month boundaries by keyboard and commits ISO date", () => {
    const change = vi.fn();
    const { container } = render(<DatePicker value="2026-10-31" onChange={change} />);
    fireEvent.click(container.querySelector(".dp-trigger"));
    const selected = screen.getByRole("gridcell", { selected: true });
    expect(document.activeElement).toBe(selected);
    fireEvent.keyDown(selected, { key: "ArrowRight" });
    expect(document.activeElement).toHaveAttribute("data-date", "2026-11-01");
    fireEvent.keyDown(document.activeElement, { key: "Enter" });
    expect(change).toHaveBeenCalledWith("2026-11-01");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(container.querySelector(".dp-trigger"));
  });

  it("names month navigation and closes on Escape without changing the value", () => {
    const change = vi.fn();
    const { container } = render(<DatePicker value="2026-10-02" onChange={change} />);
    fireEvent.click(container.querySelector(".dp-trigger"));
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement, { key: "Escape" });
    expect(change).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(container.querySelector(".dp-trigger"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
