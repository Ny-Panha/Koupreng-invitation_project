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
        { id: 3, estimatedCost: 30, actualCost: 25, currency: "USD" },
        { id: 4, budget: 70000, amount: 50000, currency: "KHR" },
      ],
      guests: [{ id: 10, guestName: "Dara", sideType: "GROOM" }],
      rsvps: [{ guestId: 10, responseStatus: "ATTENDING", attendeeCount: 3 }],
      checkIns: [{ guestId: 10, active: true }, { guestId: 11, active: false }],
    });

    expect(report.totalIncome).toEqual({ USD: 125, KHR: 200000 });
    expect(report.totalExpenses).toEqual({ USD: 25, KHR: 50000 });
    expect(report.plannedBudget).toEqual({ USD: 30, KHR: 70000 });
    expect(report.unpaidBalance).toEqual({ USD: 5, KHR: 20000 });
    expect(report.digitalIncome).toEqual({ USD: 125, KHR: 0 });
    expect(report.cashIncome).toEqual({ USD: 0, KHR: 200000 });
    expect(report.netBalance).toEqual({ USD: 100, KHR: 150000 });
    expect(report.incomeRows[0].side).toBe("ខាងកូនកំលោះ");
    expect(report.guestStats).toEqual({ invited: 1, attending: 3, gifted: 2, checkedIn: 1 });
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