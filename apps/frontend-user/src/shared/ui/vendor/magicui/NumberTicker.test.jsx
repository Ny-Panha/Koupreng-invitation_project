import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NumberTicker } from "./NumberTicker";

describe("Magic UI NumberTicker", () => {
  it("renders with initial value element", () => {
    render(<NumberTicker value={100} prefix="+" suffix="%" />);
    const el = screen.getByText(/\+/);
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("magic-number-ticker");
  });
});
