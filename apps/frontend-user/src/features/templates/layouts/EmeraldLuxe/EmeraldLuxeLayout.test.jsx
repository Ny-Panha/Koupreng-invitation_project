import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import EmeraldLuxeLayout from "./EmeraldLuxeLayout";

describe("EmeraldLuxeLayout Universal Cover Contract", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders closed curtain gate with default styling when no custom cover is set", () => {
    const { container } = render(
      <MemoryRouter>
        <EmeraldLuxeLayout
          tpl={{ id: "emerald-canva-luxe-wedding", groom: "សុវណ្ណ", bride: "មាលា" }}
          preview={false}
        />
      </MemoryRouter>
    );

    const curtain = container.querySelector(".el-curtain-overlay");
    expect(curtain).toBeInTheDocument();
    expect(curtain).not.toHaveClass("has-custom-bg");
    expect(screen.getByText(/សុវណ្ណ & មាលា/)).toBeInTheDocument();
  });

  it("renders custom cover background when coverBackgroundImage is set", () => {
    const customImg = "https://images.unsplash.com/photo-custom-cover.jpg";
    const { container } = render(
      <MemoryRouter>
        <EmeraldLuxeLayout
          tpl={{
            id: "emerald-canva-luxe-wedding",
            groom: "សុវណ្ណ",
            bride: "មាលា",
            coverBackgroundImage: customImg,
          }}
          preview={false}
        />
      </MemoryRouter>
    );

    const curtain = container.querySelector(".el-curtain-overlay");
    expect(curtain).toBeInTheDocument();
    expect(curtain).toHaveClass("has-custom-bg");

    const img = container.querySelector(`img[src="${customImg}"]`);
    expect(img).toBeInTheDocument();
    expect(container.querySelector(".cover-bg-scrim")).toBeInTheDocument();
  });

  it("dynamically updates cover background via LIVE_PREVIEW_SYNC without crashing", async () => {
    const sessionId = "test-cover-preview-1234567890123456";
    const { container } = render(
      <MemoryRouter>
        <EmeraldLuxeLayout
          tpl={{ id: "emerald-canva-luxe-wedding", groom: "សុវណ្ណ", bride: "មាលា" }}
          preview
          previewStartClosed
          previewChannel={{ source: window, origin: window.location.origin, sessionId }}
        />
      </MemoryRouter>
    );

    const updatedCover = "https://images.unsplash.com/photo-live-sync.jpg";

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: window,
          origin: window.location.origin,
          data: {
            type: "LIVE_PREVIEW_SYNC",
            sessionId,
            data: {
              coverBackgroundImage: updatedCover,
              groom: "ចាន់ថា",
            },
          },
        })
      );
    });

    const img = container.querySelector(`img[src="${updatedCover}"]`);
    expect(img).toBeInTheDocument();
    expect(container.querySelector(".el-curtain-overlay")).toHaveClass("has-custom-bg");
  });
});
