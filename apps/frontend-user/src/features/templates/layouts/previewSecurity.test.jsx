import { act, cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DefaultTemplate from "./DefaultTemplate/DefaultTemplateLayout";
import BlissEditorial from "./BlissEditorialLayout";
import WithJoyPortal from "./WithJoyPortalLayout";
import TemplateBoilerplate from "./TemplateBoilerplate/TemplateBoilerplateLayout";
import EmeraldLuxe from "./EmeraldLuxe/EmeraldLuxeLayout";
import DigitalYes from "./DigitalYes/DigitalYesLayout";
import KhmerCelestial from "./KhmerCelestial/KhmerCelestialLayout";

const content = { groom: "Original host", bride: "Original bride", music: "", enabledSections: { rsvp: false, music: false }, gallery: [], schedule: [], story: [], party: [], gift: [], faq: [] };

describe("FE-010 published dedicated layouts", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    window.history.replaceState(null, "", "/w/published");
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); window.history.replaceState(null, "", "/"); });

  it.each([
    ["default", DefaultTemplate], ["editorial", BlissEditorial], ["portal", WithJoyPortal],
    ["boilerplate", TemplateBoilerplate], ["emerald", EmeraldLuxe], ["digital", DigitalYes], ["celestial", KhmerCelestial],
  ])("does not let a published %s invitation accept injected host or payment details", (_name, Layout) => {
    const { container } = render(<MemoryRouter><Layout tpl={{ ...content, id: _name }} content={content} preview /></MemoryRouter>);
    expect(container.textContent).toContain("Original host");
    act(() => window.dispatchEvent(new MessageEvent("message", {
      origin: window.location.origin, source: window,
      data: { type: "LIVE_PREVIEW_SYNC", sessionId: "forged-preview-session-1234567890", data: { groom: "Attacker host", groomName: "Attacker host", bankAccountNumber: "Attacker account" } },
    })));
    expect(container.textContent).toContain("Original host");
    expect(container.textContent).not.toContain("Attacker host");
    expect(container.textContent).not.toContain("Attacker account");
  });
});
