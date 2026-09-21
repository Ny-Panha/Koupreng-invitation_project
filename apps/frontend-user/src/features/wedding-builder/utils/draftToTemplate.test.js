import { describe, expect, it } from "vitest";
import { draftToTemplate } from "./draftToTemplate";
import {
  registerDynamicTemplates,
  getTemplateById,
} from "../../templates/data/templatesData";
import { getDedicatedTemplateComponent } from "../../templates/registry/templateRegistry";
import DigitalYesLayout from "../../templates/layouts/DigitalYes/DigitalYesLayout";
import EmeraldLuxeLayout from "../../templates/layouts/EmeraldLuxe/EmeraldLuxeLayout";
import { buildTemplateContent } from "../../templates/experience/config/templateExperienceContent";

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

  it("keeps hosted Khmer Celestial content real and omits missing optional data", () => {
    const { tpl, variant } = draftToTemplate({
      id: 99,
      templateId: "khmer-celestial",
      couple: { groom: "Dara", bride: "Sophea" },
      event: {
        date: "2026-12-20",
        ceremonyTime: "17:00",
        venueName: "Riverside Hall",
        venueAddress: "Phnom Penh",
      },
      enabledSections: { story: true, party: true, gift: true },
    });

    const content = buildTemplateContent(tpl, variant);
    expect(content.groom).toBe("Dara");
    expect(content.bride).toBe("Sophea");
    expect(content.venue.name).toBe("Riverside Hall");
    expect(content.targetDate).toContain("2026-12-20");
    expect(content.story).toEqual([]);
    expect(content.party).toEqual([]);
    expect(content.gift).toEqual([]);
    expect(content.gallery).toEqual([]);
    expect(content.message).toBe("");
    expect(content.coverImage).toBe("");
    expect(content.music).toBe("");
    expect(content.dressCode.colors).toEqual([]);

    const blankHosted = draftToTemplate({ id: 100, templateId: "khmer-celestial" });
    const blankContent = buildTemplateContent(blankHosted.tpl, blankHosted.variant);
    expect(blankContent.groom).toBe("");
    expect(blankContent.bride).toBe("");
    expect(blankContent.venue.name).toBe("");
    expect(blankContent.targetDate).toBe("");
    expect(blankContent.gallery).toEqual([]);
    expect(blankContent.message).toBe("");
    expect(blankContent.music).toBe("");

    const videoDisabled = draftToTemplate({
      id: 101,
      templateId: "khmer-celestial",
      openingVideoEnabled: false,
    });
    expect(videoDisabled.tpl.openingVideo).toBeNull();
    expect(videoDisabled.tpl.design.openingVideoEnabled).toBe(false);
  });

  it("does not backfill hosted story or wedding-party images from demo media", () => {
    const { tpl, variant } = draftToTemplate({
      id: 102,
      templateId: "khmer-celestial",
      storyChapters: [{ id: "chapter-1", title: "Our story", text: "Real host copy" }],
      party: [{ id: "party-1", name: "Dara", role: "Best person" }],
      enabledSections: { story: true, party: true },
    });

    const content = buildTemplateContent(tpl, variant);
    expect(content.story).toHaveLength(1);
    expect(content.story[0].image).toBe("");
    expect(content.party).toHaveLength(1);
    expect(content.party[0].image).toBe("");
  });
});
