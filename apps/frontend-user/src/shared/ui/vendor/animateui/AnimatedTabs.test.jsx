import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimatedTabs } from "./AnimatedTabs";

describe("Animate UI AnimatedTabs", () => {
  const tabs = [
    { id: "all", label: "All Designs" },
    { id: "luxury", label: "Luxury" },
    { id: "modern", label: "Modern" },
  ];

  it("renders tabs with correct roles and selection", () => {
    const handleChange = vi.fn();
    render(<AnimatedTabs tabs={tabs} activeTab="all" onChange={handleChange} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const activeTab = screen.getByRole("tab", { name: "All Designs" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    const inactiveTab = screen.getByRole("tab", { name: "Luxury" });
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");

    fireEvent.click(inactiveTab);
    expect(handleChange).toHaveBeenCalledWith("luxury");
  });
});
