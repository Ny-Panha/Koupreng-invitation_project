import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ToastContainer from "./ToastContainer";

describe("FE-011 toast lifecycle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it("removes both exact event listeners and pending timers on unmount", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ToastContainer />);
    act(() => window.dispatchEvent(new CustomEvent("toast", { detail: "Legacy message" })));
    expect(screen.getByText("Legacy message")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    for (const type of ["toast", "koupreng:toast"]) {
      expect(remove).toHaveBeenCalledWith(type, add.mock.calls.find(([event]) => event === type)[1]);
    }
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not schedule duplicate legacy notifications after remount", () => {
    const first = render(<ToastContainer />); first.unmount();
    render(<ToastContainer />);
    act(() => window.dispatchEvent(new CustomEvent("toast", { detail: "One message" })));
    expect(screen.getAllByText("One message")).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByText("One message")).not.toBeInTheDocument();
  });
});
