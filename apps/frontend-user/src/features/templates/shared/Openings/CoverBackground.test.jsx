import { describe, it, expect, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import CoverBackground from "./CoverBackground";

// Mock reduced motion
vi.mock("@/shared/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
afterEach(cleanup);
beforeEach(() => vi.mocked(usePrefersReducedMotion).mockReturnValue(false));

describe("CoverBackground component", () => {
  it("falls back after failed uploads and stops rendering failed fallback images", () => {
    const { container } = render(<CoverBackground content={{ coverBackgroundImage: "/missing.jpg" }} templateDefault={{ type: "image", src: "/default.svg" }} />);
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toHaveAttribute("src", "/default.svg");
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
  });

  it("uses a poster after a failed video", () => {
    const { container } = render(<CoverBackground content={{ coverVideoUrl: "/failed.mp4", videoPoster: "/poster.webp" }} />);
    fireEvent.error(container.querySelector("video"));
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", "/poster.webp");
  });

  it("never treats a default video URL as an image under reduced motion", () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);
    const { container } = render(<CoverBackground templateDefault={{ type: "video", src: "/default.mp4", poster: "/poster.jpg" }} />);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("src", "/poster.jpg");
  });
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
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);

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
