import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Sparkles } from "lucide-react";
import { BentoCard } from "./BentoCard";

describe("Kokonut UI BentoCard", () => {
  it("renders card content, title, and action", () => {
    render(
      <BentoCard
        icon={Sparkles}
        badge="New"
        title="Floral Elegance"
        description="Traditional Khmer wedding motif."
        action={<button type="button">Select</button>}
      />
    );

    expect(screen.getByText("Floral Elegance")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select" })).toBeInTheDocument();
  });
});
