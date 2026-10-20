import { describe, expect, it } from "vitest";
import { safeAuthRedirect } from "./safeRedirect";
describe("post-auth destinations", () => {
  it.each([null, "https://evil.test", "//evil.test", "/\\evil.test", "/%2fevil", "/admin/users", "/login", "/app/../admin", "/app\n/events"])("rejects unsafe or cross-app destination %s", value => {
    expect(safeAuthRedirect(value)).toBe("/app/events");
  });
  it.each(["/app/events/42/guests?search=Dara", "/dashboard/invitations/42/edit", "/templates/silk-heritage/checkout"])("preserves supported deep link %s", value => {
    expect(safeAuthRedirect(value)).toBe(value);
  });
});
