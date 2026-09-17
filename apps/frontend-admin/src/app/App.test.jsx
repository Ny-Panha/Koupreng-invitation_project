import { describe, expect, it } from "vitest";

import { ADMIN_ROUTE_PATHS } from "./routes";

describe("the authoritative admin router", () => {
  it("keeps the complete active route contract", () => {
    expect(ADMIN_ROUTE_PATHS).toEqual({
      login: "/login", dashboard: "/dashboard", users: "/users",
      userDetail: "/users/:userId", templates: "/templates",
      templateNew: "/templates/new", templateEdit: "/templates/:templateId",
      payments: "/payments", packages: "/packages", notifications: "/notifications",
      systemLogs: "/system-logs", reports: "/reports",
    });
  });
});
