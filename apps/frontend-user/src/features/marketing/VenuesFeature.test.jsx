import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import VenuesFeature from "./VenuesFeature";

describe("VenuesFeature", () => {
  it("renders venues list and opens venue detail dialog via portal", () => {
    render(
      <MemoryRouter>
        <VenuesFeature />
      </MemoryRouter>
    );

    // Check heading exists
    expect(screen.getByText(/ទីកន្លែងមង្គល/i)).toBeInTheDocument();

    // Find first "View Detail" button
    const buttons = screen.getAllByRole("button", { name: /មើលព័ត៌មានលម្អិត|view detail/i });
    expect(buttons.length).toBeGreaterThan(0);

    // Click to open modal
    fireEvent.click(buttons[0]);

    // Check modal dialog opened
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    // Close via close button or Escape
    fireEvent.keyDown(window, { key: "Escape" });
  });
});
