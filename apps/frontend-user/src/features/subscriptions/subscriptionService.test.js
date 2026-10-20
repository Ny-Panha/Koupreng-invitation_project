import { beforeEach, expect, it, vi } from "vitest";
import { api } from "../../shared/api/httpClient";
import subscriptionService from "./subscriptionService";
vi.mock("../../shared/api/httpClient", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
it("preserves an explicitly absent current subscription", async () => {
  api.get.mockResolvedValue({ data: null });
  expect(await subscriptionService.current()).toBeNull();
});
it("sends payer evidence and package identity without browser-owned pricing", async () => {
  api.post.mockResolvedValue({ data: { orderCode: "SUB-1", active: false } });
  await subscriptionService.purchase(7, "Dara", "247");
  expect(api.post).toHaveBeenCalledWith("/v1/me/subscriptions/purchase", { packageId: 7, payerName: "Dara", payerAccountLast3: "247" });
});
