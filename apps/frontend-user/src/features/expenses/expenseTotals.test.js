import { describe, expect, it } from "vitest";
import { expenseTotals } from "./expenseTotals";
describe("BE-003 currency-specific expense arithmetic", () => {
  it("keeps mixed legacy totals unavailable and compares budgets within their currencies", () => {
    const result = expenseTotals([{ currency: "USD", budget: 10, amount: 8 }, { currency: "KHR", budget: 40000, amount: 50000 }]);
    expect(result.totalSpent).toBeNull(); expect(result.totalBudget).toBeNull(); expect(result.byCurrency.USD).toMatchObject({ diff: 2, isOver: false, percent: 80 });
    expect(result.byCurrency.KHR).toMatchObject({ diff: 10000, isOver: true, percent: 100 });
  });
  it("retains single-currency arithmetic and the currency for KHR display", () => { expect(expenseTotals([{ currency: "KHR", budget: 40000, amount: 30000 }])).toMatchObject({ currencyCode: "KHR", totalBudget: 40000, totalSpent: 30000, diff: 10000, percent: 75 }); });
});
