import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AnimatedNumber from "./AnimatedNumber";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AnimatedNumber", () => {
  it("shows the authoritative value immediately unless animation is requested", () => {
    const { rerender } = render(<AnimatedNumber value={1250} prefix="$" />);
    expect(screen.getByText("$1,250")).toBeInTheDocument();
    rerender(<AnimatedNumber value={1251} prefix="$" />);
    expect(screen.getByText("$1,251")).toBeInTheDocument();
  });

  it("cancels its frame and snaps to the final value when motion preference changes", () => {
    let matches = false;
    let notify;
    vi.stubGlobal("matchMedia", () => ({
      get matches() { return matches; },
      addEventListener: (_event, callback) => { notify = callback; },
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 17));
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);
    render(<AnimatedNumber value={100} animate />);
    expect(screen.getByText("0")).toBeInTheDocument();
    act(() => { matches = true; notify(); });
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(cancel).toHaveBeenCalledWith(17);
  });
});
