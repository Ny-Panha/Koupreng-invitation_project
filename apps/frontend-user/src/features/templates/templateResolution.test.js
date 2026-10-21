import { afterEach, describe, expect, it } from "vitest";
import { getTemplateById, registerDynamicTemplates, resolveNumericTemplateId } from "./data/templatesData";
import { getDedicatedTemplateComponent, templateRegistry, resolveTemplateRenderer } from "./registry/templateRegistry";
import { getTemplateFormFlow } from "../invitations/config/templateFormFlowConfig";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";

const catalog = [
  { id: 4, code: "khmer-celestial", name: "Khmer Celestial", description: '{"presetId":"KHMER_CELESTIAL"}' },
  { id: 2, code: "garden-royal-khmer-wedding", name: "Garden Royal" },
  { id: 5, code: "silk-heritage", name: "Silk Heritage", description: '{"presetId":"SILK_HERITAGE"}' },
];
afterEach(() => registerDynamicTemplates([]));

describe("exact template identity across catalog and renderers", () => {
  it("never substitutes a template for an invalid or absent identity", () => {
    expect(getTemplateById("missing-template")).toBeNull();
    expect(getTemplateById(null)).toBeNull();
    expect(getTemplateById(4)).toBeNull();
    registerDynamicTemplates(catalog);
    expect(getTemplateById("missing-template")).toBeNull();
    expect(getTemplateById(99999)).toBeNull();
  });
  it("resolves actual database IDs before historical numeric aliases", () => {
    registerDynamicTemplates(catalog);
    const celestial = getTemplateById(4);
    expect(celestial.code).toBe("khmer-celestial");
    expect(getDedicatedTemplateComponent(celestial)).toBe(templateRegistry["khmer-celestial"]);
    expect(getTemplateFormFlow(celestial).hasCoverImage).toBe(false);
    expect(resolveNumericTemplateId("khmer-celestial")).toBe(4);
  });
  it("does not save a historical ID for a stable code absent from the catalog", () => {
    registerDynamicTemplates([catalog[0]]);
    expect(resolveNumericTemplateId("garden-royal-khmer-wedding")).toBeNull();
    expect(resolveNumericTemplateId("silk-heritage")).toBeNull();
  });
  it("keeps Garden Royal on its own shared renderer despite numeric ID 2", () => {
    registerDynamicTemplates(catalog);
    const garden = getTemplateById(2);
    expect(garden.code).toBe("garden-royal-khmer-wedding");
    expect(getDedicatedTemplateComponent(garden)).toBeNull();
    expect(garden.presetId).not.toBe("EMERALD_GREEN");
  });
  it("preserves Silk Heritage despite its database ID colliding with golden", () => {
    registerDynamicTemplates(catalog);
    expect(getDedicatedTemplateComponent(getTemplateById(5))).toBe(templateRegistry["silk-heritage"]);
  });
  it("retains explicitly configured admin Garden presets on the shared engine", () => {
    registerDynamicTemplates([{ id: 45, code: "custom-garden", description: '{"presetId":"GARDEN_ROYAL"}' }]);
    const template=getTemplateById(45);
    expect(resolveTemplateRenderer(template).available).toBe(true);
    expect(getDedicatedTemplateComponent(template)).toBeNull();
    expect(template.variant).toBe("garden-royal-khmer-wedding");
  });
  it("does not infer the renderer of an unregistered stable code from its database ID", () => {
    registerDynamicTemplates([{ id: 4, code: "unregistered-wedding", name: "Khmer Celestial" }]);
    expect(getDedicatedTemplateComponent(getTemplateById(4))).toBeNull();
    expect(getTemplateById(4).mainImage).not.toBe(getTemplateById("bliss-editorial-wedding").mainImage);
  });
  it("uses catalog mapping consistently for draft and public rendering", () => {
    registerDynamicTemplates(catalog);
    const numeric = draftToTemplate({ templateId: 4, title: "Owner title" });
    const code = draftToTemplate({ templateId: "khmer-celestial", title: "Owner title" });
    expect(numeric.tpl.code).toBe(code.tpl.code);
    expect(getDedicatedTemplateComponent(numeric.tpl)).toBe(getDedicatedTemplateComponent(code.tpl));
    expect(draftToTemplate({ templateId: "missing-template" })).toBeNull();
  });
});
