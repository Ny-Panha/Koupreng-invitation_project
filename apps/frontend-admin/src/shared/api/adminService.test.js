import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./adminHttpClient", () => ({ api: { post: vi.fn() } }));

import { api } from "./adminHttpClient";
import { adminService } from "./adminService";

describe("payment confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the canonical typed endpoint for both item types", async () => {
    for (const itemType of ["TEMPLATE", "SUBSCRIPTION"]) {
      const payload = { orderCode: "ORDER1", amount: 19, confirmedBy: "admin", itemType };
      api.post.mockResolvedValueOnce({ data: { status: "PAID" } });

      await expect(adminService.confirmPayment(payload)).resolves.toEqual({ status: "PAID" });

      expect(api.post).toHaveBeenLastCalledWith("/v1/admin/payments/confirm", payload);
    }
  });

  it("does not retry a rejected confirmation through a different endpoint", async () => {
    const error = new Error("Amount mismatch");
    api.post.mockRejectedValueOnce(error);

    await expect(adminService.confirmPayment({ orderCode: "ORDER1" })).rejects.toBe(error);

    expect(api.post).toHaveBeenCalledTimes(1);
  });
});
