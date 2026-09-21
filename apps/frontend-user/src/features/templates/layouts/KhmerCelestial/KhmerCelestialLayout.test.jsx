import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TemplateExperience from "../../experience/TemplateExperience";
import { CelestialHeading } from "./components/CelestialSection";

const content = {
  variant: "khmer-celestial",
  enabledSections: {
    countdown: false,
    story: false,
    schedule: false,
    map: false,
    gallery: false,
    party: false,
    dressCode: false,
    gift: false,
    faq: false,
    rsvp: true,
    music: true,
  },
  languageMode: "both",
  groom: "វិរៈ",
  bride: "សុភ័ក្រ្តា",
  groomEn: "Vireak",
  brideEn: "Sophea",
  title: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
  dateText: "ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦",
  targetDate: "2026-12-20T17:00:00+07:00",
  coverImage: "/celestial-cover.jpg",
  guestName: "លោកអ្នក និងក្រុមគ្រួសារ",
  message: "សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការរបស់យើងខ្ញុំ។",
  couple: {},
  venue: {},
  gallery: [],
  story: [],
  schedule: [],
  party: [],
  gift: [],
  faq: [],
  dressCode: { colors: [] },
  wish: {},
  opening: { openButtonText: "បើកសំបុត្រអញ្ជើញ" },
  music: "/wedding.mp3",
};

describe("KhmerCelestialLayout integration", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback) { this.callback = callback; }
      observe(element) { this.callback([{ isIntersecting: true, target: element }]); }
      unobserve() {}
      disconnect() {}
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback();
      return 1;
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("opens from a user gesture, starts configured music, and preserves the real RSVP child", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={content} showBreadcrumb={false} showActions={false}>
          <form data-testid="real-rsvp">Real RSVP</form>
        </TemplateExperience>
      </MemoryRouter>
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" })).toHaveFocus();
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId("real-rsvp")).toHaveLength(1);
    expect(document.body.style.overflow).toBe("");
  });

  it("removes disabled optional sections without leaving empty renderers", () => {
    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={content} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    expect(document.querySelector(".kc-gallery")).not.toBeInTheDocument();
    expect(document.querySelector(".kc-story")).not.toBeInTheDocument();
    expect(document.querySelector(".kc-gift")).not.toBeInTheDocument();
    expect(document.querySelector(".kc-countdown")).not.toBeInTheDocument();
  });

  it("defaults to ថ្ងៃដែលរង់ចាំ.mp3 when custom music is not provided", () => {
    const noCustomMusicContent = {
      ...content,
      music: undefined,
      enabledSections: { ...content.enabledSections, music: true },
    };

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={noCustomMusicContent} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    const audio = document.querySelector("audio");
    expect(audio).toBeInTheDocument();
    expect(decodeURIComponent(audio.getAttribute("src"))).toContain("ថ្ងៃដែលរង់ចាំ.mp3");
  });

  it("does not inject demo music into a hosted invitation", () => {
    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial", hostContent: {} }}
          content={{ ...content, music: "", enabledSections: { ...content.enabledSections, music: true } }}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    expect(document.querySelector("audio")).not.toBeInTheDocument();
    expect(document.querySelector(".kc-music-fab")).not.toBeInTheDocument();
  });

  it("handles an expired event date safely without producing negative countdown values", () => {
    const expiredContent = {
      ...content,
      targetDate: "2020-01-01T00:00:00+07:00",
      enabledSections: { ...content.enabledSections, countdown: true, music: false },
      music: "",
    };

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={expiredContent} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    expect(screen.getByText("The celebration has begun")).toBeInTheDocument();
    expect(screen.getAllByText("00")).toHaveLength(4);
    expect(document.querySelector("audio")).not.toBeInTheDocument();
  });

  it("uses the optimized branded opening film and respects an explicit video opt-out", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { unmount } = render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }}
          content={{ ...content, design: { openingVideoEnabled: true } }}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    expect(document.querySelector(".kc-opening video")).toHaveAttribute(
      "src",
      "/invitations/khmer-celestial/burgundy-bokeh.mp4"
    );
    expect(screen.getAllByAltText("Koupreng")).toHaveLength(2);
    unmount();

    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }}
          content={{ ...content, design: { openingVideoEnabled: false } }}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    expect(document.querySelector(".kc-opening video")).not.toBeInTheDocument();
    expect(document.querySelector(".kc-opening__media")).toHaveAttribute("src", content.coverImage);
  });

  it("provides visible lightbox navigation, keyboard dismissal, and focus restoration", async () => {
    const galleryContent = {
      ...content,
      enabledSections: { ...content.enabledSections, gallery: true, music: false },
      music: "",
      gallery: ["/gallery-one.jpg", "/gallery-two.jpg"],
    };

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={galleryContent} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    const firstImage = screen.getByRole("button", { name: "មើលរូបភាពទី 1" });
    fireEvent.click(firstImage);
    const dialog = screen.getByRole("dialog", { name: "រូបភាព" });
    expect(dialog).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "មើលរូបភាពបន្ទាប់" }));
    expect(within(dialog).getByAltText("អនុស្សាវរីយ៍អាពាហ៍ពិពាហ៍ ទី 2")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "រូបភាព" })).not.toBeInTheDocument());
    expect(firstImage).toHaveFocus();
  });

  it("keeps English-only section labels connected to a real heading", () => {
    render(
      <CelestialHeading
        id="english-only-heading"
        khmer="ចំណងជើង"
        english="Our story"
        languageMode="en"
      />
    );

    expect(screen.getByRole("heading", { name: "Our story" })).toHaveAttribute("id", "english-only-heading");
    expect(screen.queryByText("ចំណងជើង")).not.toBeInTheDocument();
  });
});
