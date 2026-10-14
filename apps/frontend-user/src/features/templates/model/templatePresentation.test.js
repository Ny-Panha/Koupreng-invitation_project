import { describe, it, expect } from "vitest";
import { templateIdentity, templateUsePath, templatePriceLabel } from "./templateIdentity";
import { localTemplateFor, presentTemplate } from "./templatePresentation";
import { TEMPLATES, KHMER_CELESTIAL_TEMPLATE } from "../data/templatesData";

describe("public template identity and truthful access", () => {
  it("preserves explicit identity through a numeric collision and the login query", () => {
    const template = { id: 2, code: "silk-heritage", slug: "silk-heritage" };
    expect(templateIdentity(template)).toBe("silk-heritage");
    expect(localTemplateFor(template).id).toBe("silk-heritage");
    expect(localTemplateFor({ id: 2, code: "new-custom-design" })).toBeUndefined();
    const login = new URL(templateUsePath("silk-heritage", false), "https://example.test");
    expect(login.pathname).toBe("/login");
    expect(login.searchParams.get("next")).toBe("/templates/browse?template=silk-heritage");
  });
  it("retains premium state without a price and labels local fallback as a demo", () => {
    expect(presentTemplate({ id: 4, code: "silk-heritage", premium: true }, "en")).toMatchObject({ isPremium: true, live: true });
    expect(presentTemplate(TEMPLATES[0], "en", false)).toMatchObject({ name: "Silk Heritage", live: false });
  });
  it.each([{}, { price: 0, currency: "USD" }, { price: -1, currency: "USD" }, { price: "bad", currency: "USD" }, { price: 12 }, { price: 12, currency: "invalid" }])("does not invent prices for %j", (template) => {
    expect(templatePriceLabel(template, "en")).toBeNull();
  });
  it("formats USD and KHR separately", () => {
    expect(templatePriceLabel({ price: 12, currency: "USD" }, "en")).toBe("$12.00");
    expect(templatePriceLabel({ price: 48000, currency: "KHR" }, "en")).toContain("KHR");
    expect(templatePriceLabel({ price: 48000, currency: "KHR" }, "en")).not.toContain("$");
  });
});

describe("static demo dates", () => {
  it("uses a valid, consistent flagship calendar date", () => {
    const tpl = KHMER_CELESTIAL_TEMPLATE;
    expect(tpl.targetDate).toBe(tpl.machineEventDate);
    expect(tpl.dateText).toBe(tpl.scheduleDate);
    expect(tpl.dateTextEn).toBe("Sunday, 20 December 2026");
    expect(tpl.dateText).not.toContain("៣២");
  });
  it.each(TEMPLATES)("aligns $id human date with its event date", (tpl) => {
    const date = new Date(`${tpl.targetDate.slice(0, 10)}T12:00:00Z`);
    const formatted = (part) => new Intl.DateTimeFormat("km-KH", { [part]: part === "day" || part === "year" ? "numeric" : "long", timeZone: "UTC", numberingSystem: "khmr" }).format(date);
    expect(tpl.dateText).toContain(formatted("weekday"));
    expect(tpl.dateText).toContain(formatted("day"));
    expect(tpl.dateText).toContain(formatted("month"));
    expect(tpl.dateText).toContain(formatted("year"));
  });
});
