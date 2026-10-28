import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { templateCatalogService } from "./api/templateCatalogApi";
import { templateService } from "./api/templateService";
vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
afterEach(() => { vi.useRealTimers(); localStorage.clear(); });
beforeEach(async () => { vi.clearAllMocks(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-10-02T00:00:00Z")); });
describe("PERF-002 public catalog cache", () => {
  it("includes ACTIVE Premium Royal and rejects unpublished and unallocated inventory", async () => {
    const royal = { id: 614, code: "royal-garden-cinematic", status: "ACTIVE", premium: true, price: 0, currency: "USD" };
    api.get.mockResolvedValue({ data: [royal, { ...royal, id: 615, status: "INACTIVE" }, { ...royal, id: "royal-garden-cinematic" }] });
    expect(await templateCatalogService.list({ force: true })).toEqual([{ ...royal, isPremium: true }]);
  });
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
  it("rejects an HTML/malformed response instead of treating it as live empty inventory", async () => {
    api.get.mockResolvedValueOnce("<!doctype html><html></html>").mockResolvedValueOnce({ data: [] });
    await expect(templateCatalogService.list({ force: true })).rejects.toThrow("Invalid template catalog response");
    await expect(templateCatalogService.list()).resolves.toEqual([]);
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
