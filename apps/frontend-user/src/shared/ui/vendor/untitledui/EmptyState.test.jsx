import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Search } from "lucide-react";
import { EmptyState } from "./EmptyState";

describe("Untitled UI EmptyState", () => {
  it("renders headline and description", () => {
    render(
      <EmptyState
        icon={Search}
        headline="No templates found"
        description="Try adjusting your search or filter."
      />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No templates found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search or filter.")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(
      <EmptyState
        headline="Empty"
        primaryAction={<button type="button">Reset</button>}
        secondaryAction={<button type="button">Cancel</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});
