import { afterEach, describe, expect, it } from "vitest";
import { FEATURED_TEMPLATE_CODES, isPublicCatalogTemplate, matchesTemplateSearch, templateCategory } from "./catalogPolicy";
import { getAllTemplates, getTemplateById, registerDynamicTemplates, resolveNumericTemplateId } from "../data/templatesData";
import { getDedicatedTemplateComponent, templateRegistry } from "../registry/templateRegistry";

const royal = { id: 614, code: "royal-garden-cinematic", name: "Royal Garden Cinematic", status: "ACTIVE", category: "TRADITIONAL", premium: true, price: 0, currency: "USD", supportedEventTypes: ["WEDDING"], supportedLanguages: ["KH", "EN", "BOTH"] };
afterEach(() => registerDynamicTemplates([]));
describe("authoritative catalog selection", () => {
  it("registers ACTIVE Royal with its allocated ID and dedicated renderer", () => {
    registerDynamicTemplates([royal]);
    expect(getAllTemplates()).toHaveLength(1);
    expect(resolveNumericTemplateId(royal.code)).toBe(614);
    expect(getDedicatedTemplateComponent(getTemplateById(614))).toBe(templateRegistry[royal.code]);
    expect(FEATURED_TEMPLATE_CODES).toContain(royal.code);
    expect(getTemplateById(614)).toMatchObject({ premium: true, price: 0, currency: "USD" });
  });
  it("keeps empty, draft, inactive and unallocated catalogs unselectable while allowing code previews", () => {
    for (const status of ["INACTIVE", "DRAFT", undefined]) {
      registerDynamicTemplates([{ ...royal, status }]);
      expect(getAllTemplates()).toEqual([]);
      expect(getTemplateById(614)).toBeNull();
      expect(resolveNumericTemplateId(royal.code)).toBeNull();
    }
    registerDynamicTemplates([]);
    expect(getAllTemplates()).toEqual([]);
    expect(resolveNumericTemplateId("emerald-canva-luxe-wedding")).toBeNull();
    expect(getTemplateById(royal.code)).toBeTruthy();
    expect(isPublicCatalogTemplate({ ...royal, id: royal.code })).toBe(false);
  });
  it("keeps backend business fields authoritative over description configuration", () => {
    registerDynamicTemplates([{ ...royal, description: JSON.stringify({ premium: false, price: 0.01, status: "INACTIVE", supportedEventTypes: ["BIRTHDAY"], supportedLanguages: ["XX"] }) }]);
    expect(getTemplateById(614)).toMatchObject({ premium: true, price: 0, status: "ACTIVE", supportedEventTypes: ["WEDDING"], supportedLanguages: ["KH", "EN", "BOTH"] });
  });
  it("searches stable code and style regardless of numeric IDs and aliases traditional categories", () => {
    expect(matchesTemplateSearch({ ...royal, name: "ព្រះរាជសួន", style: "Blue and gold Khmer" }, "garden-cinematic")).toBe(true);
    expect(matchesTemplateSearch({ ...royal, style: "Blue and gold Khmer" }, " BLUE AND GOLD ")).toBe(true);
    expect(templateCategory(royal)).toBe("TRADITIONAL");
    expect(templateCategory({ category: "ancient" })).toBe("TRADITIONAL");
  });
  it("rejects retired template codes even if active with valid backend ID", () => {
    expect(isPublicCatalogTemplate({ id: 2, backendId: 2, code: "garden-royal-khmer-wedding", status: "ACTIVE" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: 13, backendId: 13, code: "khmer-royal-lotus", status: "ACTIVE" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: 2, backendId: 2, slug: "garden-royal-khmer-wedding", status: "ACTIVE" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: 13, backendId: 13, slug: "khmer-royal-lotus", status: "ACTIVE" })).toBe(false);
  });
});

