import { afterEach, describe, expect, it } from "vitest";
import { templateUsePath } from "./templateIdentity";
import { getTemplateIntent, saveTemplateIntent } from "./templateIntent";

afterEach(() => sessionStorage.clear());
describe("deliberate template choice URLs", () => {
  it("keeps link rendering pure and never overwrites a selected design", () => {
    saveTemplateIntent("khmer-celestial");
    templateUsePath("silk-heritage", false);
    templateUsePath("emerald-canva-luxe-wedding", true);
    expect(getTemplateIntent()).toBe("khmer-celestial");
  });
  it("uses a single canonical parameter while retaining safe query and fragment", () => {
    const path = templateUsePath("KHMER-CELESTIAL", true, "/app/events/new?template=old&templateId=2&from=gallery#details");
    expect(path).toBe("/app/events/new?from=gallery&template=khmer-celestial#details");
  });
  it.each(["https://evil.test/app/events/new", "//evil.test/app/events/new", "/admin/users", "/app/events/42"])("rejects unsupported target %s", target => {
    expect(templateUsePath("khmer-celestial", true, target)).toBe("/app/events/new?template=khmer-celestial");
  });
  it.each(["bad&admin=true", "../other", "a#b", "a?b", "<script>", "a".repeat(101)])("does not turn malformed identity into query instructions: %s", value => {
    expect(templateUsePath(value, true)).toBe("/app/events/new");
  });
  it("encodes one safe creation destination for login", () => {
    const login = new URL(templateUsePath("khmer-celestial", false), "https://example.test");
    expect(login.searchParams.get("next")).toBe("/app/events/new?template=khmer-celestial");
    expect([...login.searchParams.keys()]).toEqual(["next"]);
  });
});
