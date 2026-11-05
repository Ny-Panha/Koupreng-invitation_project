import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FadeContent } from "./FadeContent";

describe("React Bits FadeContent", () => {
  it("renders children cleanly", () => {
    render(
      <FadeContent>
        <h1>Ceremonial Grandeur</h1>
      </FadeContent>
    );

    expect(screen.getByRole("heading", { name: "Ceremonial Grandeur" })).toBeInTheDocument();
  });
});
