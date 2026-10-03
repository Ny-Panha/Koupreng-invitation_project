import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import BudgetSummaryCards from "./components/BudgetSummaryCards";
import BudgetProgress from "./components/BudgetProgress";
import CategoryBreakdown from "./components/CategoryBreakdown";
afterEach(cleanup);
const mixed = { totalBudget: 1000, totalEstimated: null, totalActual: null, remainingBudget: null,
  totalsComparable: false, currency: null, estimatedByCurrency: { USD: 10, KHR: 40000 }, actualByCurrency: { USD: 8, KHR: 30000 } };
describe("BE-003 mixed-currency budget display", () => {
  it("shows separate currency totals and unavailable comparison instead of zero remaining", () => {
    const { container } = render(<><BudgetSummaryCards budget={mixed} /><BudgetProgress budget={mixed} /></>);
    expect(screen.getByText(/USD 8/)).toBeInTheDocument();
    expect(screen.getByText(/KHR 30,000/)).toBeInTheDocument();
    expect(screen.getAllByText(/comparison unavailable/i).length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("$0");
  });
  it("keeps category totals and percentages within each currency", () => {
    const { container } = render(<CategoryBreakdown items={[{ category: "VENUE", currency: "USD", actualCost: 10 },
      { category: "VENUE", currency: "KHR", actualCost: 40000 }]} />);
    expect(container.textContent).toContain("USD 10");
    expect(container.textContent).toContain("KHR 40,000");
    expect(container.textContent).not.toContain("40,010");
  });
});
