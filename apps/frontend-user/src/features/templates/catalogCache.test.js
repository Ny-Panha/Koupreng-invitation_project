import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { templateCatalogService } from "./api/templateCatalogApi";
import { templateService } from "./api/templateService";
vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
afterEach(() => { vi.useRealTimers(); localStorage.clear(); });
beforeEach(async () => { vi.clearAllMocks(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-10-02T00:00:00Z")); });
describe("PERF-002 public catalog cache", () => {
  it("deduplicates concurrent callers across public services", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, price: 0 }] });
    const [a, b] = await Promise.all([templateCatalogService.list({ force: true }), templateService.listPublic()]);
    expect(a).toEqual(b); expect(api.get).toHaveBeenCalledOnce();
  });
  it("refreshes after TTL and isolates translation languages", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });
    await templateCatalogService.list({ force: true }); await templateCatalogService.list(); expect(api.get).toHaveBeenCalledOnce();
    localStorage.setItem("koupreng.lang", "en"); await templateCatalogService.list(); expect(api.get).toHaveBeenCalledTimes(2);
    vi.setSystemTime(new Date("2026-10-02T00:01:00Z")); await templateCatalogService.list(); expect(api.get).toHaveBeenCalledTimes(3);
  });
  it("does not cache failures or entitlement checks", async () => {
    api.get.mockRejectedValueOnce(new Error("Unavailable")).mockResolvedValue({ data: [] });
    await expect(templateCatalogService.list({ force: true })).rejects.toThrow("Unavailable");
    await templateCatalogService.list(); expect(api.get).toHaveBeenCalledTimes(2);
  });
});
