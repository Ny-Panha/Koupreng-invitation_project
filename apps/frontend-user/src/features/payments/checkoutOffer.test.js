import { describe, expect, it } from "vitest";
import { checkoutOffer } from "./checkoutOffer";
describe("PAY-003 authoritative checkout offers", () => {
  it("uses the approved offer and rejects an unapproved new premium template", () => {
    expect(checkoutOffer({ id: 2, price: 19, checkoutEligible: true, checkoutAmount: 0.01, checkoutCurrency: "USD" }, "2")).toMatchObject({ eligible: true, amount: "0.01" });
    expect(checkoutOffer({ id: 99, premium: true, checkoutEligible: false }, "99").eligible).toBe(false);
    expect(checkoutOffer({ id: 99, price: 19 }, "99").eligible).toBe(false);
    expect(checkoutOffer(null, "unknown").eligible).toBe(false);
  });
  it("requires an explicit server offer even for the historical Garden identity", () => {
    expect(checkoutOffer({ id: 2, code: "garden-royal-khmer-wedding" }, "2")).toMatchObject({ eligible: false, amount: "", currency: "" });
    expect(checkoutOffer({ id: 99, checkoutEligible: true, checkoutAmount: null, checkoutCurrency: "USD" }, "99").eligible).toBe(false);
  });
});
