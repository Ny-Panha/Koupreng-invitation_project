import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import CoverBackground from "./CoverBackground";

// Mock reduced motion
vi.mock("@/shared/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

describe("CoverBackground component", () => {
  it("renders default template image when no user cover is provided", () => {
    const { container } = render(
      <CoverBackground
        content={{}}
        templateDefault={{
          src: "/templates/default-cover.jpg",
          type: "image",
          poster: "/templates/default-cover.jpg",
        }}
      />
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/templates/default-cover.jpg");
    // No scrim on default template artwork
    expect(container.querySelector(".cover-bg-scrim")).not.toBeInTheDocument();
  });

  it("renders custom user uploaded image and applies smart scrim overlay", () => {
    const { container } = render(
      <CoverBackground
        content={{ coverBackgroundImage: "/uploads/my-wedding-photo.jpg" }}
        templateDefault={{
          src: "/templates/default-cover.jpg",
          type: "image",
        }}
      />
    );

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/uploads/my-wedding-photo.jpg");
    // Smart scrim MUST be present for user uploaded photo
    expect(container.querySelector(".cover-bg-scrim")).toBeInTheDocument();
  });

  it("prioritizes coverBackgroundImage over coverVideoUrl", () => {
    const { container } = render(
      <CoverBackground
        content={{
          coverBackgroundImage: "/uploads/photo.jpg",
          coverVideoUrl: "/videos/bokeh.mp4",
        }}
      />
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "/uploads/photo.jpg");
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("renders video when video URL is present and no image is uploaded", () => {
    const { container } = render(
      <CoverBackground
        content={{
          coverVideoUrl: "/videos/prewedding.mp4",
          videoPoster: "/videos/poster.jpg",
        }}
      />
    );

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "/videos/prewedding.mp4");
    expect(video).toHaveAttribute("poster", "/videos/poster.jpg");
  });

  it("falls back to poster image when user prefers reduced motion", () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValueOnce(true);

    const { container } = render(
      <CoverBackground
        content={{
          coverVideoUrl: "/videos/prewedding.mp4",
          videoPoster: "/videos/poster.jpg",
        }}
      />
    );

    // Video should NOT be rendered
    expect(container.querySelector("video")).not.toBeInTheDocument();
    // Poster image should be rendered instead
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/videos/poster.jpg");
  });
});
