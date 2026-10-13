import { describe, expect, it } from "vitest";
import { getPaymentQrValue } from "./khqr";

describe("fixed PayWay link QR", () => {
  it("encodes exactly the backend link without inventing amount or reference parameters", () => {
    const paymentLink = "https://pay.ababank.com/oRF8/vx2dp884";
    expect(getPaymentQrValue({ paymentLink, amount: "0.01", orderCode: "EVT260529001" })).toBe(paymentLink);
  });
  it("supports the server checkout URL and rejects absent or unapproved destinations", () => {
    expect(getPaymentQrValue({ checkoutUrl: "https://link.payway.com.kh/ABAPAYMu523385B" }))
      .toBe("https://link.payway.com.kh/ABAPAYMu523385B");
    for (const paymentLink of [undefined, "javascript:alert(1)", "https://evil.example/pay", "000201fake"])
      expect(getPaymentQrValue({ paymentLink })).toBe("");
  });
});
