import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TemplateExperience from "../../experience/TemplateExperience";
import { buildTemplateContent } from "../../experience/config/templateExperienceContent";
import { KHMER_CELESTIAL_TEMPLATE } from "../../data/templatesData";
import { CelestialHeading } from "./components/CelestialSection";
import { KHMER_CELESTIAL_ASSETS } from "./khmerCelestialAssets";

const testDirectory = dirname(fileURLToPath(import.meta.url));

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
    document.documentElement.style.overflow = "";
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
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" })).toHaveFocus();
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    expect(play).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId("real-rsvp")).toHaveLength(1);
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");

    const wheelEvent = new WheelEvent("wheel", { cancelable: true });
    const touchMoveEvent = new Event("touchmove", { cancelable: true });
    window.dispatchEvent(wheelEvent);
    window.dispatchEvent(touchMoveEvent);
    expect(wheelEvent.defaultPrevented).toBe(false);
    expect(touchMoveEvent.defaultPrevented).toBe(false);
  });

  it("keeps an accessible static SVG garden when reduced motion is enabled", () => {
    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={content} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    const garden = document.querySelector(".kc-opening__garden");
    expect(garden).toHaveClass("is-reduced");
    expect(garden.querySelectorAll("svg").length).toBeGreaterThan(5);
    expect(garden.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(5);
    expect(garden.querySelectorAll("video")).toHaveLength(0);
  });

  it("uses SVG garden motion for the opening and click transition", async () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={content} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    await waitFor(() => expect(document.querySelectorAll(".kc-opening__garden .kc-butterfly").length).toBeGreaterThan(0));
    expect(document.querySelector(".kc-opening__garden video")).not.toBeInTheDocument();
    expect(document.querySelector(".kc-opening__garden .kc-butterfly__wing--left")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    expect(document.querySelector(".kc-opening__transition")).toBeInTheDocument();
    expect(document.querySelectorAll(".kc-opening__transition .kc-petal").length).toBeGreaterThan(0);
  });

  it("renders the supplied ornamental asset with accessible preview guest text in reduced motion", () => {
    const previewContent = buildTemplateContent(KHMER_CELESTIAL_TEMPLATE, "khmer-celestial");
    previewContent.openingStyle = "celestial-cover";
    previewContent.gateStyle = "celestial-cover";

    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ ...KHMER_CELESTIAL_TEMPLATE, openingStyle: "celestial-cover", gateStyle: "celestial-cover" }}
          content={previewContent}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    const banner = document.querySelector(".kc-opening__guest-banner");
    const bannerImage = banner.querySelector(".kc-opening__guest-banner-image");
    const guestLabel = document.querySelector(".kc-opening__guest-label");
    expect(previewContent.guestName).toBe("លោក រ៉ាន់ ណារ៉ាត់ ព្រមទាំងគ្រួសារ");
    expect(within(banner).getByText("រ៉ាន់", { exact: false })).toHaveClass("kc-opening__guest-name");
    expect(banner).not.toContainElement(guestLabel);
    expect(guestLabel.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bannerImage).toHaveAttribute("src", KHMER_CELESTIAL_ASSETS.guestNameBanner);
    expect(bannerImage).toHaveAttribute("alt", "");
    expect(banner).toBeVisible();
    expect(banner).toHaveStyle({ opacity: "1", filter: "blur(0px)" });
    expect(existsSync(resolve(testDirectory, "../../../../../public/invitations/khmer-celestial/guest-name-banner1.webp"))).toBe(true);
  });

  it("renders the actual personalized guest in the banner instead of the preview sample", () => {
    const personalizedContent = {
      ...content,
      guestName: "លោក សុខ ដារ៉ា",
      isPersonalizedGuest: true,
    };

    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }}
          content={personalizedContent}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    const banner = document.querySelector(".kc-opening__guest-banner");
    expect(within(banner).getByText("លោក សុខ ដារ៉ា")).toBeInTheDocument();
    expect(within(banner).queryByText("លោក រ៉ាន់ ណារ៉ាត់ ព្រមទាំងគ្រួសារ")).not.toBeInTheDocument();
  });

  it("renders the ceremonial WEBP Open Invitation button with accessible label and asset path", () => {
    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={content} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("kc-opening__cta-button");

    const image = button.querySelector(".kc-opening__cta-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", KHMER_CELESTIAL_ASSETS.openButton);
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("loading", "eager");

    expect(existsSync(resolve(testDirectory, "../../../../../public/invitations/khmer-celestial/butto_invitation.webp"))).toBe(true);
  });

  it("falls back to Open invitation accessible label when no custom text is provided", () => {
    const defaultContent = {
      ...content,
      opening: {},
    };

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={defaultContent} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: "Open invitation" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("kc-opening__cta-button");
  });

  it("keeps hosted generic invitations free of the preview guest identity", () => {
    const genericContent = buildTemplateContent({
      ...KHMER_CELESTIAL_TEMPLATE,
      opening: {
        ...KHMER_CELESTIAL_TEMPLATE.opening,
        genericGuestText: "ភ្ញៀវកិត្តិយស",
      },
      hostContent: { guest: null },
    }, "khmer-celestial");

    expect(genericContent.isPersonalizedGuest).toBe(false);
    expect(genericContent.guestName).toBe("ភ្ញៀវកិត្តិយស");
    expect(genericContent.guestName).not.toContain("រ៉ាន់ ណារ៉ាត់");
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

  it("does not render the story section as it is removed from Khmer Celestial", () => {
    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial", hostContent: {} }}
          content={{
            ...content,
            coverImage: "",
            story: [{ id: "real-story", title: "Our story", text: "Real host copy", image: "" }],
            enabledSections: { ...content.enabledSections, story: true, music: false },
            music: "",
          }}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    expect(document.querySelector(".kc-story")).not.toBeInTheDocument();
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

  it("keeps the visible preview date separate from an invalid machine date", () => {
    const invalidDateContent = {
      ...content,
      dateText: "ថ្ងៃព្រហស្បតិ៍ ទី៣២ ខែធ្នូ ឆ្នាំ២០២៦",
      targetDate: "not-a-date",
      machineEventDate: "not-a-date",
      enabledSections: { ...content.enabledSections, countdown: true, music: false },
      music: "",
    };

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={invalidDateContent} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    expect(screen.getAllByText("ថ្ងៃព្រហស្បតិ៍ ទី៣២ ខែធ្នូ ឆ្នាំ២០២៦")).toHaveLength(3);
    expect(screen.getAllByText("00")).toHaveLength(4);
    expect(screen.queryByRole("link", { name: /Add to calendar/i })).not.toBeInTheDocument();
  });

  it("keeps map and gift integrations available when those optional sections are enabled", () => {
    const integratedContent = {
      ...content,
      enabledSections: { ...content.enabledSections, map: true, gift: true, music: false },
      music: "",
      venue: {
        name: "Himawari Hotel Apartments",
        address: "Phnom Penh",
        mapLink: "https://maps.example.test/wedding",
        image: "/venue.jpg",
      },
      gift: [{
        id: "aba",
        bank: "ABA Bank",
        account: "Koeung Vireak",
        number: "000 111 222",
        qrValue: "ABA|000111222",
      }],
    };

    render(
      <MemoryRouter>
        <TemplateExperience tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }} content={integratedContent} showBreadcrumb={false} showActions={false} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    expect(screen.getByRole("link", { name: /បើកផែនទី/ })).toHaveAttribute("href", "https://maps.example.test/wedding");
    expect(screen.getByText("ABA Bank")).toBeInTheDocument();
    expect(document.querySelector(".kc-gift")).toBeInTheDocument();
  });

  it("builds the flagship preview from the supplied Khmer sample fixture", () => {
    const previewContent = buildTemplateContent(KHMER_CELESTIAL_TEMPLATE, "khmer-celestial");

    expect(previewContent.title).toBe("សិរីសួស្តីអាពាហ៍ពិពាហ៍");
    expect(previewContent.groom).toBe("កឿង វីរៈ");
    expect(previewContent.bride).toBe("ឡុង សុម៉ាលី");
    expect(previewContent.dateText).toBe("ថ្ងៃព្រហស្បតិ៍ ទី៣២ ខែធ្នូ ឆ្នាំ២០២៦");
    expect(previewContent.machineEventDate).toBe("2026-12-20T17:00:00+07:00");
    expect(previewContent.schedule).toHaveLength(9);
    expect(previewContent.apologyTitle).toBe("លិខិតសូមអភ័យទោស");
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
    expect(screen.getAllByAltText("ស្លាកឈ្មោះ វិរៈ និង សុភ័ក្រ្តា")).toHaveLength(3);
    expect(document.querySelector(".kc-opening__brand")).toHaveAttribute(
      "src",
      "/invitations/khmer-celestial/koupreng-gold-mark.webp"
    );
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
    expect(document.querySelector(".kc-opening__botanical")).toHaveAttribute(
      "src",
      "/invitations/khmer-celestial/botanical-frame.jpg"
    );
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

  it("does not render gold calligraphy logo when showBrandMark is false and renders couple names instead", () => {
    const customContent = {
      ...content,
      groom: "រឿង វីរៈ",
      bride: "ឡុង សុម៉ាលី",
      showBrandMark: false,
    };

    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }}
          content={customContent}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    expect(
      document.querySelector('img[src="/invitations/khmer-celestial/koupreng-gold-mark.webp"]')
    ).toBeNull();
    expect(screen.getAllByText("រឿង វីរៈ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ឡុង សុម៉ាលី").length).toBeGreaterThan(0);
  });

  it("renders custom brandMark when provided by user", () => {
    const customLogoContent = {
      ...content,
      groom: "សុខ",
      bride: "ចិន្តា",
      showBrandMark: true,
      brandMark: "/uploads/custom-wedding-logo.png",
    };

    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }}
          content={customLogoContent}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    expect(
      document.querySelector('img[src="/uploads/custom-wedding-logo.png"]')
    ).toBeInTheDocument();
  });

  it("renders CinematicVideoOpening when openingStyle or gateStyle is cinematic-video", () => {
    const cinematicContent = {
      ...content,
      gateStyle: "cinematic-video",
      openingStyle: "cinematic-video",
      videoUrl: "/invitations/khmer-celestial/burgundy-bokeh.mp4",
    };

    render(
      <MemoryRouter>
        <TemplateExperience
          tpl={{ id: "khmer-celestial", name: "Khmer Celestial" }}
          content={cinematicContent}
          showBreadcrumb={false}
          showActions={false}
        />
      </MemoryRouter>
    );

    expect(document.querySelector(".kc-opening--cinematic")).toBeInTheDocument();
    expect(screen.getByText("វីដេអូបើកឆាកអាពាហ៍ពិពាហ៍")).toBeInTheDocument();
    expect(document.querySelector(".cinematic-video-overlay video")).toHaveAttribute(
      "src",
      "/invitations/khmer-celestial/burgundy-bokeh.mp4"
    );
  });
});

