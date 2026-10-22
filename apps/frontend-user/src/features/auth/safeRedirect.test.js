import { describe, expect, it } from "vitest";
import { resolveAuthDestination, safeAuthRedirect } from "./safeRedirect";
describe("post-auth destinations", () => {
  it.each([null, "https://evil.test", "//evil.test", "/\\evil.test", "/%2fevil", "/admin/users", "/login", "/app/../admin", "/app\n/events"])("rejects unsafe or cross-app destination %s", value => {
    expect(safeAuthRedirect(value)).toBe("/app/events");
  });
  it.each(["/app/events/42/guests?search=Dara", "/dashboard/invitations/42/edit", "/templates/silk-heritage/checkout"])("preserves supported deep link %s", value => {
    expect(safeAuthRedirect(value)).toBe(value);
  });
});

describe("allowlisted template continuation", () => {
  it("retains the full chosen destination across login and registration links", () => {
    const params = new URLSearchParams({ next: "/app/events/new?template=khmer-celestial&from=gallery#details" });
    expect(resolveAuthDestination(params)).toBe("/app/events/new?template=khmer-celestial&from=gallery#details");
  });
  it("accepts a new explicit legacy template parameter without overwriting an event deep link", () => {
    expect(resolveAuthDestination(new URLSearchParams({ templateId: "4" }))).toBe("/app/events/new?template=4");
    expect(resolveAuthDestination(new URLSearchParams({ next: "/app/events/42/guests", template: "khmer-celestial" }))).toBe("/app/events/42/guests");
  });
  it("does not allow external redirects or malformed query identity", () => {
    expect(resolveAuthDestination(new URLSearchParams({ next: "https://evil.test?template=khmer-celestial" }))).toBe("/app/events");
    expect(resolveAuthDestination(new URLSearchParams({ template: "x&admin=true" }))).toBe("/app/events");
  });
});
