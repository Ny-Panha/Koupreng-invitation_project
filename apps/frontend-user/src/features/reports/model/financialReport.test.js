import { describe, expect, it } from "vitest";
import { asList, buildFinancialReport, normalizeCurrency } from "./financialReport";

describe("financial report model", () => {
  it("keeps USD and KHR income and expenses independent", () => {
    const report = buildFinancialReport({
      gifts: [
        { id: 1, name: "Dara", amount: 125, currency: "USD", method: "ABA" },
        { id: 2, name: "Sokha", amount: 200000, currencyCode: "KHR", method: "Cash" },
      ],
      expenses: [
        { id: 3, actualCost: 25, currency: "USD" },
        { id: 4, amount: 50000, currency: "KHR" },
      ],
      guests: [{ id: 10, guestName: "Dara", sideType: "GROOM" }],
      rsvps: [{ guestId: 10, responseStatus: "ATTENDING" }],
    });

    expect(report.totalIncome).toEqual({ USD: 125, KHR: 200000 });
    expect(report.totalExpenses).toEqual({ USD: 25, KHR: 50000 });
    expect(report.netBalance).toEqual({ USD: 100, KHR: 150000 });
    expect(report.incomeRows[0].side).toBe("ខាងកូនកំលោះ");
    expect(report.guestStats).toEqual({ invited: 1, attending: 1, gifted: 2 });
  });

  it("defaults legacy currency-less records to USD and only counts actual expense values", () => {
    const report = buildFinancialReport({
      gifts: [{ amount: "80" }],
      expenses: [{ estimatedCost: 300, actualCost: null }, { actualCost: "45" }],
    });

    expect(normalizeCurrency({})).toBe("USD");
    expect(report.totalIncome).toEqual({ USD: 80, KHR: 0 });
    expect(report.totalExpenses).toEqual({ USD: 45, KHR: 0 });
  });

  it("normalizes supported list response shapes", () => {
    expect(asList({ data: [{ id: 1 }] })).toEqual([{ id: 1 }]);
    expect(asList({ content: [{ id: 2 }] })).toEqual([{ id: 2 }]);
  });
});