import { describe, expect, it } from "vitest";
import { draftToTemplate } from "./draftToTemplate";
import {
  registerDynamicTemplates,
  getTemplateById,
} from "../../templates/data/templatesData";
import { getDedicatedTemplateComponent } from "../../templates/registry/templateRegistry";
import DigitalYesLayout from "../../templates/layouts/DigitalYes/DigitalYesLayout";
import EmeraldLuxeLayout from "../../templates/layouts/EmeraldLuxe/EmeraldLuxeLayout";

describe("draftToTemplate and Dynamic Template Synchronization", () => {
  it("Scenario A: Built-in 7 resolves to The Digital Yes without fallback", () => {
    const tpl7 = getTemplateById("7");
    expect(tpl7).toBeDefined();
    expect(tpl7.id).toBe("the-digital-yes-wedding");
    const layout = getDedicatedTemplateComponent(tpl7);
    expect(layout).toBe(DigitalYesLayout);
  });

  it("Scenario B: Built-in 2 resolves to Emerald Luxe", () => {
    const tpl2 = getTemplateById("2");
    expect(tpl2).toBeDefined();
    const layout = getDedicatedTemplateComponent(tpl2);
    expect(layout).toBe(EmeraldLuxeLayout);
  });

  it("Scenario C: Dynamic Admin template preserves presetId, colors, and openingStyle", () => {
    registerDynamicTemplates([
      {
        id: 26,
        name: "Emerald Royal Luxe VIP",
        description: JSON.stringify({
          presetId: "EMERALD_GREEN",
          openingStyle: "curtain",
          primaryColor: "#0F4C3A",
          secondaryColor: "#D4AF37",
          coverImage: "https://example.com/emerald-card.jpg",
          dressColors: ["#0F4C3A", "#D4AF37"],
        }),
      },
    ]);

    const tpl26 = getTemplateById("26");
    expect(tpl26).toBeDefined();
    expect(tpl26.presetId).toBe("EMERALD_GREEN");
    expect(tpl26.openingStyle).toBe("curtain");
    expect(tpl26.frontColor).toBe("#0F4C3A");

    const layout = getDedicatedTemplateComponent(tpl26);
    expect(layout).toBe(EmeraldLuxeLayout);

    const draft = { templateId: "26" };
    const { tpl } = draftToTemplate(draft);
    expect(tpl.presetId).toBe("EMERALD_GREEN");
    expect(tpl.design.openingStyle).toBe("curtain");
    expect(tpl.design.frontColor).toBe("#0F4C3A");
    expect(tpl.design.bottomColor).toBe("#D4AF37");
  });

  it("Scenario D & E: draftToTemplate precedence: User edits > Template config > Fallbacks", () => {
    // User explicitly customized frontColor and openingStyle
    const userDraft = {
      templateId: "26",
      frontColor: "#223344",
      openingStyle: "envelope-3d",
    };

    const { tpl } = draftToTemplate(userDraft);
    // User edit takes highest precedence
    expect(tpl.design.frontColor).toBe("#223344");
    expect(tpl.design.openingStyle).toBe("envelope-3d");
    // Non-overridden property still inherits from template config
    expect(tpl.design.bottomColor).toBe("#D4AF37");
  });

  it("Scenario F: inherits base template design config (level-2 precedence)", () => {
    registerDynamicTemplates([
      {
        id: 31,
        name: "Ornament Inheritance Check",
        description: JSON.stringify({
          presetId: "EMERALD_GREEN",
          openingStyle: "curtain",
          primaryColor: "#0F4C3A",
          secondaryColor: "#D4AF37",
          ornamentTheme: "art-deco",
          accentColor: "#FFD700",
        }),
      },
    ]);

    const base = getTemplateById("31");
    expect(base.design.ornamentTheme).toBe("art-deco");

    // Draft touches only the title — nothing under `design`.
    const { tpl } = draftToTemplate({ templateId: "31", title: "Custom Title" });

    // Level 2: template config survives instead of being dropped.
    expect(tpl.design.ornamentTheme).toBe("art-deco");
    expect(tpl.design.accentColor).toBe("#FFD700");
    expect(tpl.design.frontColor).toBe("#0F4C3A");
    // Level 1: the explicit draft edit still wins.
    expect(tpl.title).toBe("Custom Title");
  });

  it("Scenario G: draft.design overrides inherited base template design", () => {
    registerDynamicTemplates([
      {
        id: 32,
        name: "Ornament Override Check",
        description: JSON.stringify({
          presetId: "EMERALD_GREEN",
          openingStyle: "curtain",
          primaryColor: "#0F4C3A",
          secondaryColor: "#D4AF37",
          ornamentTheme: "art-deco",
        }),
      },
    ]);

    const { tpl } = draftToTemplate({
      templateId: "32",
      design: { ornamentTheme: "royal-floral" },
    });

    expect(tpl.design.ornamentTheme).toBe("royal-floral");
  });
});
