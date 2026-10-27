import { describe, it, expect } from "vitest";
import { getLocalizedTemplateFormFlow, getTemplateFormFlow } from "./templateFormFlowConfig";

describe("templateFormFlowConfig", () => {
  it.each(["khmer-celestial", "template-boilerplate"])("localizes %s editor labels independently of invitation content", template => {
    const en = getLocalizedTemplateFormFlow(template, "en");
    const km = getLocalizedTemplateFormFlow(template, "km");
    expect(en.sectionOrder).toEqual(km.sectionOrder);
    for (const [key, value] of Object.entries(en.labels)) {
      expect(value).not.toMatch(/[\u1780-\u17b3]/);
      if (!key.endsWith("En")) expect(km.labels[key]).toMatch(/[\u1780-\u17b3]/);
    }
    expect(getTemplateFormFlow(template).labels).not.toBe(en.labels);
  });
  it("defaults hasCoverBackgroundImage to true for unknown / boilerplate templates", () => {
    const config = getTemplateFormFlow("template-boilerplate");
    expect(config.hasCoverBackgroundImage).toBe(true);
    expect(config.hasBackgroundImage).toBe(false);
    expect(config.labels.coverBackgroundImage).toBe("ផ្ទៃខាងក្រោយគ្របមុខ (ពេលមិនទាន់បើក)");
    expect(config.labels.coverBackgroundImageEn).toBe("Cover background (closed state)");
  });

  it("defaults hasCoverBackgroundImage to true for standard templates", () => {
    const emeraldConfig = getTemplateFormFlow("emerald-luxe");
    expect(emeraldConfig.hasCoverBackgroundImage).toBe(true);
    expect(emeraldConfig.hasBackgroundImage).toBe(false);

    const digitalYesConfig = getTemplateFormFlow("the-digital-yes-wedding");
    expect(digitalYesConfig.hasCoverBackgroundImage).toBe(true);
  });

  it("configures khmer-celestial with custom flow and hasBackgroundImage: true", () => {
    const celestialConfig = getTemplateFormFlow("khmer-celestial");
    expect(celestialConfig.hasCoverBackgroundImage).toBe(true);
    expect(celestialConfig.hasBackgroundImage).toBe(true);
    expect(celestialConfig.hasCoverImage).toBe(false);
    expect(celestialConfig.hasGate).toBe(false);
  });
});
