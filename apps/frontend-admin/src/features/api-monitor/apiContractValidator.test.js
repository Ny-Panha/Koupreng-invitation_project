import { describe, expect, it } from "vitest";
import { validateApiContract } from "./apiContractValidator";

describe("apiContractValidator", () => {
  it("matches versioned API endpoints with MATCHED status", () => {
    const result = validateApiContract("POST", "/api/v1/auth/login");
    expect(result.status).toBe("MATCHED");
    expect(result.tag).toBe("Authentication");
    expect(result.isLegacy).toBe(false);
  });

  it("identifies parameterized routes such as invitations by ID", () => {
    const result = validateApiContract("GET", "/api/v1/invitations/123");
    expect(result.status).toBe("MATCHED");
    expect(result.tag).toBe("Invitations");
  });

  it("flags legacy unversioned routes as COMPATIBILITY_ALIAS", () => {
    const result = validateApiContract("POST", "/api/auth/login");
    expect(result.status).toBe("COMPATIBILITY_ALIAS");
    expect(result.isLegacy).toBe(true);
  });

  it("handles health check and dev monitor system routes", () => {
    const healthResult = validateApiContract("GET", "/api/health");
    expect(healthResult.status).toBe("MATCHED");
    expect(healthResult.tag).toBe("System");

    const devResult = validateApiContract("GET", "/api/v1/admin/dev-monitor/stream");
    expect(devResult.status).toBe("MATCHED");
  });

  it("returns UNMATCHED for non-contract endpoints", () => {
    const result = validateApiContract("GET", "/api/v1/non-existent-route-xyz");
    expect(result.status).toBe("UNMATCHED");
    expect(result.tag).toBe("Untracked");
  });
});

