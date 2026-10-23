import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RoyalGardenCinematicLayout from "./RoyalGardenCinematicLayout";
import { ROYAL_GARDEN_CINEMATIC_TEMPLATE } from "../../data/templatesData";

const content = {
  groom: "កូនប្រុស-សាកល្បង",
  bride: "កូនស្រី-សាកល្បង",
  guestName: "គ្រួសារភ្ញៀវ",
  venueName: "ទីតាំងសាកល្បង",
  targetDate: "2026-12-05T17:00:00+07:00",
  schedule: [{ id: "one", time: "០៧:០០", title: "ហែជំនូនសាកល្បង" }],
  gallery: [],
  gift: [],
  music: "",
};
const show = (props = {}) => render(<MemoryRouter><RoyalGardenCinematicLayout preview {...props} content={{ ...content, ...props.content }}/></MemoryRouter>);
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Royal Garden Cinematic layout", () => {
  it("has a stable template identity and original manifest-compatible cover", () => {
    expect(ROYAL_GARDEN_CINEMATIC_TEMPLATE.code).toBe("royal-garden-cinematic");
    expect(ROYAL_GARDEN_CINEMATIC_TEMPLATE.coverBackgroundImage).toContain("/templates/royal-garden/garden.svg");
  });
  it("renders editable names, schedule and host-provided RSVP", () => {
    const { container } = render(<MemoryRouter><RoyalGardenCinematicLayout preview content={content}><button>បញ្ជាក់វត្តមានពិត</button></RoyalGardenCinematicLayout></MemoryRouter>);
    expect(container.textContent).toContain(content.groom);
    expect(container.textContent).toContain(content.bride);
    expect(screen.getByText("ហែជំនូនសាកល្បង")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "បញ្ជាក់វត្តមានពិត" })).toBeInTheDocument();
  });
  it("shows a cover gate then opens to the user invitation", () => {
    const { container } = render(<MemoryRouter><RoyalGardenCinematicLayout content={content} preview={false}/></MemoryRouter>);
    expect(container.querySelector('[data-stage="cover"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /សូមបើកធៀបការ/ }));
    expect(container.querySelector('[data-stage="body"]')).toBeInTheDocument();
  });
  it("does not fake a gift QR or a successful RSVP when not configured", () => {
    const { container } = show({ content: { gift: [], qrGiftUrl: "", bankAccountNumber: "" } });
    expect(container.querySelector(".rg-qr-list")).toBeNull();
    expect(container.textContent).toContain("RSVP");
    expect(container.textContent).not.toContain("Payment confirmed");
  });
  it("honors disabled sections and displays uploaded gallery images", () => {
    const { container } = show({ content: { enabledSections: { gift: false, schedule: false }, gallery: ["/images/wedding/couple-hero-meadow.webp"] } });
    expect(container.querySelector("#rg-gift")).toBeNull();
    expect(container.querySelector("#rg-schedule")).toBeNull();
    expect(container.querySelectorAll(".rg-gallery img")).toHaveLength(1);
    fireEvent.click(container.querySelector(".rg-gallery button"));
    expect(screen.getByRole("dialog", { name: "Photo gallery" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close photo" }));
    expect(screen.queryByRole("dialog", { name: "Photo gallery" })).toBeNull();
  });
  it("ignores a forged preview message without a trusted channel", () => {
    const { container } = show();
    act(() => window.dispatchEvent(new MessageEvent("message", {
      origin: window.location.origin, source: window,
      data: { type: "LIVE_PREVIEW_SYNC", sessionId: "forged-preview-session", data: { groomName: "Attacker text" } },
    })));
    expect(container.textContent).toContain(content.groom);
    expect(container.textContent).not.toContain("Attacker text");
  });
});
