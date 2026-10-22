import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import DynamicTemplateRenderer from "./DynamicTemplateRenderer";
import { BLOCK_TYPES } from "./blockTypes";

// Mock CustomImageBlock to simulate a throwing component for isolation
vi.mock("./CustomImageBlock", () => ({
  default: ({ shouldThrow, caption }) => {
    if (shouldThrow) {
      throw new Error("Simulated component explosion");
    }
    return <div data-testid="custom-image">{caption || "Valid Image"}</div>;
  },
}));

describe("DynamicTemplateRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });


  it("renders empty main when sections array is empty or invalid", () => {
    const { container: emptyContainer } = render(
      <DynamicTemplateRenderer sections={[]} />
    );
    const mainEl = emptyContainer.querySelector("main");
    expect(mainEl).toBeInTheDocument();
    expect(mainEl.children.length).toBe(0);

    const { container: nullContainer } = render(
      <DynamicTemplateRenderer sections={null} />
    );
    expect(nullContainer.querySelector("main")).toBeInTheDocument();
  });

  it("renders blocks strictly in order", () => {
    const sections = [
      {
        id: "block-1",
        type: BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: "First Heading", body: "First Body" },
      },
      {
        id: "block-2",
        type: BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: "Second Heading", body: "Second Body" },
      },
      {
        id: "block-3",
        type: BLOCK_TYPES.CUSTOM_IMAGE,
        data: { caption: "Third Caption" },
      },
    ];

    render(<DynamicTemplateRenderer sections={sections} />);

    expect(screen.getByText("First Heading")).toBeInTheDocument();
    expect(screen.getByText("Second Heading")).toBeInTheDocument();
    expect(screen.getByText("Third Caption")).toBeInTheDocument();

    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent("First Heading");
    expect(headings[1]).toHaveTextContent("Second Heading");
  });

  it("unknown block type renders nothing and does not crash", () => {
    const sections = [
      {
        id: "unknown-1",
        type: "FUTURE_AI_HOLOGRAM_BLOCK",
        data: { futuristic: true },
      },
      {
        id: "valid-1",
        type: BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: "Still Standing" },
      },
    ];

    expect(() => {
      render(<DynamicTemplateRenderer sections={sections} />);
    }).not.toThrow();

    expect(screen.getByText("Still Standing")).toBeInTheDocument();
  });

  it("a throwing block does not kill sibling blocks", () => {
    const sections = [
      {
        id: "safe-before",
        type: BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: "Before Broken Block" },
      },
      {
        id: "broken-block",
        type: BLOCK_TYPES.CUSTOM_IMAGE,
        data: { shouldThrow: true },
      },
      {
        id: "safe-after",
        type: BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: "After Broken Block" },
      },
    ];

    expect(() => {
      render(<DynamicTemplateRenderer sections={sections} />);
    }).not.toThrow();

    expect(screen.getByText("Before Broken Block")).toBeInTheDocument();
    expect(screen.getByText("After Broken Block")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-image")).not.toBeInTheDocument();
  });

  it("renders composite JSON with CUSTOM_TEXT, HORIZONTAL_SCROLL_SHOWCASE, and LEGACY_TEMPLATE in order", () => {
    const sections = [
      {
        id: "section-1",
        type: BLOCK_TYPES.CUSTOM_TEXT,
        data: { heading: "Welcome to Our Wedding", body: "We invite you to celebrate with us." },
      },
      {
        id: "section-2",
        type: BLOCK_TYPES.HORIZONTAL_SCROLL_SHOWCASE,
        data: {
          heading: "Our Journey Moments",
          cards: [
            { id: "c1", title: "Day 1", img: "/day1.jpg" },
            { id: "c2", title: "Day 2", img: "/day2.jpg" },
            { id: "c3", title: "Day 3", img: "/day3.jpg" },
          ],
        },
      },
      {
        id: "section-3",
        type: BLOCK_TYPES.LEGACY_TEMPLATE,
        data: {
          templateId: "khmer-celestial",
        },
      },
    ];

    const content = {
      groomName: "សុខ វិបុល",
      brideName: "កែវ សុភា",
      invitationTitle: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
    };

    render(<DynamicTemplateRenderer sections={sections} content={content} />);

    // 1. CUSTOM_TEXT rendered
    expect(screen.getByText("Welcome to Our Wedding")).toBeInTheDocument();
    expect(screen.getByText("We invite you to celebrate with us.")).toBeInTheDocument();

    // 2. HORIZONTAL_SCROLL_SHOWCASE rendered with 3 cards
    expect(screen.getByText("Our Journey Moments")).toBeInTheDocument();
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 2")).toBeInTheDocument();
    expect(screen.getByText("Day 3")).toBeInTheDocument();

    // 3. LEGACY_TEMPLATE rendered in the same document
    expect(screen.getByText("សុខ វិបុល")).toBeInTheDocument();
  });
});

