import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import HorizontalScrollSection from "./HorizontalScrollSection";
import * as reducedMotionHook from "@/shared/hooks/usePrefersReducedMotion";

describe("HorizontalScrollSection", () => {
  const sampleCards = [
    { id: "1", title: "First Moment", subtitle: "2024", img: "/moment1.jpg" },
    { id: "2", title: "Second Moment", subtitle: "2025", img: "/moment2.jpg" },
    { id: "3", title: "Third Moment", subtitle: "2026", img: "/moment3.jpg" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });


  const setupMatchMedia = (matches) => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  };

  it("renders all cards provided in props", () => {
    setupMatchMedia(false); // Mobile viewport
    vi.spyOn(reducedMotionHook, "usePrefersReducedMotion").mockReturnValue(false);

    render(
      <HorizontalScrollSection
        cards={sampleCards}
        heading="Our Journey"
      />
    );

    expect(screen.getByText("Our Journey")).toBeInTheDocument();
    expect(screen.getByText("First Moment")).toBeInTheDocument();
    expect(screen.getByText("Second Moment")).toBeInTheDocument();
    expect(screen.getByText("Third Moment")).toBeInTheDocument();
  });

  it("renders swipe-carousel fallback when viewport is < 1024px", () => {
    setupMatchMedia(false); // < 1024px viewport
    vi.spyOn(reducedMotionHook, "usePrefersReducedMotion").mockReturnValue(false);

    render(<HorizontalScrollSection cards={sampleCards} />);

    expect(screen.getByTestId("swipe-carousel")).toBeInTheDocument();
    expect(screen.queryByTestId("pinned-desktop")).not.toBeInTheDocument();
  });

  it("renders swipe-carousel fallback when reduced motion is true even on desktop", () => {
    setupMatchMedia(true); // Desktop viewport (>= 1024px)
    // User requested reduced motion
    vi.spyOn(reducedMotionHook, "usePrefersReducedMotion").mockReturnValue(true);

    render(<HorizontalScrollSection cards={sampleCards} />);

    expect(screen.getByTestId("swipe-carousel")).toBeInTheDocument();
    expect(screen.queryByTestId("pinned-desktop")).not.toBeInTheDocument();
  });

  it("renders pinned-desktop on desktop when reduced motion is false", () => {
    setupMatchMedia(true); // Desktop viewport (>= 1024px)
    vi.spyOn(reducedMotionHook, "usePrefersReducedMotion").mockReturnValue(false);

    render(<HorizontalScrollSection cards={sampleCards} />);

    expect(screen.getByTestId("pinned-desktop")).toBeInTheDocument();
    expect(screen.queryByTestId("swipe-carousel")).not.toBeInTheDocument();
  });
});
