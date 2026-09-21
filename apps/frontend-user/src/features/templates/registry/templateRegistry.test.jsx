import { describe, expect, it } from "vitest";
import {
  templateRegistry,
  getDedicatedTemplateComponent,
  DefaultTemplateLayout,
} from "./templateRegistry";
import DigitalYesLayout from "../layouts/DigitalYes/DigitalYesLayout";
import RoyalKhmerLayout from "../layouts/RoyalKhmer/RoyalKhmerLayout";
import EmeraldLuxeLayout from "../layouts/EmeraldLuxe/EmeraldLuxeLayout";
import KhmerCelestialLayout from "../layouts/KhmerCelestial/KhmerCelestialLayout";

describe("templateRegistry (1 Template = 1 Dedicated UI)", () => {
  it("maps Khmer Celestial by slug and admin preset", () => {
    expect(templateRegistry["khmer-celestial"]).toBe(KhmerCelestialLayout);
    expect(templateRegistry.KHMER_CELESTIAL).toBe(KhmerCelestialLayout);
    expect(getDedicatedTemplateComponent({ slug: "khmer-celestial" })).toBe(KhmerCelestialLayout);
    expect(getDedicatedTemplateComponent({ presetId: "KHMER_CELESTIAL" })).toBe(KhmerCelestialLayout);
  });

  it("maps The Digital Yes wedding template (slug and ID 7)", () => {
    expect(templateRegistry["the-digital-yes-wedding"]).toBe(DigitalYesLayout);
    expect(templateRegistry["7"]).toBe(DigitalYesLayout);
    expect(getDedicatedTemplateComponent({ id: "7" })).toBe(DigitalYesLayout);
    expect(getDedicatedTemplateComponent({ slug: "the-digital-yes-wedding" })).toBe(DigitalYesLayout);
  });

  it("maps Royal Khmer wedding template (slug and ID 1)", () => {
    expect(templateRegistry["royal-khmer-wedding"]).toBe(RoyalKhmerLayout);
    expect(templateRegistry["1"]).toBe(RoyalKhmerLayout);
    expect(getDedicatedTemplateComponent({ id: "1" })).toBe(RoyalKhmerLayout);
    expect(getDedicatedTemplateComponent({ slug: "royal-khmer-wedding" })).toBe(RoyalKhmerLayout);
  });

  it("maps Emerald Luxe wedding template (slug and ID 2)", () => {
    expect(templateRegistry["emerald-canva-luxe-wedding"]).toBe(EmeraldLuxeLayout);
    expect(templateRegistry["2"]).toBe(EmeraldLuxeLayout);
    expect(getDedicatedTemplateComponent({ id: "2" })).toBe(EmeraldLuxeLayout);
    expect(getDedicatedTemplateComponent({ slug: "emerald-canva-luxe-wedding" })).toBe(EmeraldLuxeLayout);
  });

  it("safely handles unknown template IDs without crashing", () => {
    const unknownTpl = { id: "unknown-wedding-template-999", slug: "unknown-wedding-template-999" };
    expect(getDedicatedTemplateComponent(unknownTpl)).toBeNull();
    expect(getDedicatedTemplateComponent(unknownTpl, null, true)).toBe(DefaultTemplateLayout);
  });

  it("provides DefaultTemplateLayout as fallback", () => {
    expect(DefaultTemplateLayout).toBeDefined();
    expect(typeof DefaultTemplateLayout).toBe("function");
  });

  it("resolves dynamic admin template by presetId without falling back to Garden Royal Khmer", () => {
    const adminTpl = {
      id: "26",
      name: "Emerald Custom VIP",
      presetId: "EMERALD_GREEN",
      primaryColor: "#0F4C3A",
      openingStyle: "curtain",
    };
    const component = getDedicatedTemplateComponent(adminTpl);
    expect(component).toBe(EmeraldLuxeLayout);
  });

  it("resolves other presetIds correctly (RUBY_RED, GOLD_LUXURY)", () => {
    expect(getDedicatedTemplateComponent({ presetId: "RUBY_RED" })).toBe(RoyalKhmerLayout);
    expect(getDedicatedTemplateComponent({ presetId: "GOLD_LUXURY" })).toBe(DigitalYesLayout);
  });
});
