import { describe, it, expect } from "vitest";
import { getTemplateFormFlow } from "./templateFormFlowConfig";

describe("templateFormFlowConfig", () => {
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

  it("configures garden-royal-khmer-wedding with 2 fields: Cover and Full Background", () => {
    const gardenConfig = getTemplateFormFlow("garden-royal-khmer-wedding");
    expect(gardenConfig.hasCoverImage).toBe(true);
    expect(gardenConfig.hasCoverBackgroundImage).toBe(false);
    expect(gardenConfig.hasBackgroundImage).toBe(true);
  });
});
