import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearTemplateIntent,
  findMatchingTemplate,
  getTemplateIntent,
  saveTemplateIntent,
} from "./templateIntent";

describe("templateIntent persistence and matching", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterEach(() => {
    sessionStorage.clear();
  });

  it("saves and retrieves template intent safely", () => {
    saveTemplateIntent("khmer-celestial");
    expect(getTemplateIntent()).toBe("khmer-celestial");
  });

  it("returns null when no intent is stored or storage is cleared", () => {
    expect(getTemplateIntent()).toBeNull();
    saveTemplateIntent("silk-heritage");
    expect(getTemplateIntent()).toBe("silk-heritage");
    clearTemplateIntent();
    expect(getTemplateIntent()).toBeNull();
  });

  it("ignores corrupted JSON in sessionStorage", () => {
    sessionStorage.setItem("koupreng.template_intent", "{invalid json");
    expect(getTemplateIntent()).toBeNull();
  });

  it("finds matching template by code, slug, or ID case-insensitively", () => {
    const list = [
      { id: 1, code: "event-essential", slug: "event-essential", name: "Event Essential" },
      { id: 2, code: "silk-heritage", slug: "silk-heritage", name: "Silk Heritage" },
      { id: "3", code: "khmer-celestial", slug: "khmer-celestial", name: "Khmer Celestial" },
    ];

    expect(findMatchingTemplate(list, "khmer-celestial")).toMatchObject({ id: "3", code: "khmer-celestial" });
    expect(findMatchingTemplate(list, "KHMER-CELESTIAL")).toMatchObject({ id: "3", code: "khmer-celestial" });
    expect(findMatchingTemplate(list, "2")).toMatchObject({ id: 2, code: "silk-heritage" });
    expect(findMatchingTemplate(list, 1)).toMatchObject({ id: 1, code: "event-essential" });
    expect(findMatchingTemplate(list, "unknown")).toBeNull();
  });

  it("finds matching template nested in recommendation object ({ template: ... })", () => {
    const recommendations = [
      { template: { id: 2, code: "silk-heritage", slug: "silk-heritage" }, styleMatch: true },
      { template: { id: 5, code: "khmer-celestial", slug: "khmer-celestial" }, styleMatch: false },
    ];

    const match = findMatchingTemplate(recommendations, "silk-heritage");
    expect(match).not.toBeNull();
    expect(match.template.code).toBe("silk-heritage");
  });
});

