import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScrollReveal } from "./ScrollReveal";
import * as reducedMotionHook from "../hooks/usePrefersReducedMotion";

describe("ScrollReveal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children with motion container when reduced motion is false", () => {
    vi.spyOn(reducedMotionHook, "usePrefersReducedMotion").mockReturnValue(false);

    const { container } = render(
      <ScrollReveal className="test-reveal">
        <span>Animated content</span>
      </ScrollReveal>
    );

    expect(screen.getByText("Animated content")).toBeInTheDocument();
    const el = container.querySelector(".test-reveal");
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveAttribute("data-reduced-motion");
  });

  it("renders static container without motion when prefers-reduced-motion is active", () => {
    vi.spyOn(reducedMotionHook, "usePrefersReducedMotion").mockReturnValue(true);

    const { container } = render(
      <ScrollReveal className="test-reveal" as="section">
        <span>Static content for reduced motion</span>
      </ScrollReveal>
    );

    expect(screen.getByText("Static content for reduced motion")).toBeInTheDocument();
    const el = container.querySelector("section.test-reveal");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-reduced-motion", "true");
  });
});
