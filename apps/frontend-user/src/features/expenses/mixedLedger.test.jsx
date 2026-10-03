import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExpenseSummaryCards } from "./components/ExpenseSummaryCards";
import GiftStatsCards from "../gifts/components/GiftStatsCards";
afterEach(cleanup);
describe("BE-003 active mixed ledgers", () => {
  it("shows currency-specific expense budget, spent and remaining amounts", () => {
    const { container } = render(<ExpenseSummaryCards totalBudget={40010} totalSpent={30008} diff={10002} percent={75}
      byCurrency={{ USD: { totalBudget: 10, totalSpent: 8, diff: 2, percent: 80, isOver: false }, KHR: { totalBudget: 40000, totalSpent: 30000, diff: 10000, percent: 75, isOver: false } }} />);
    expect(container.textContent).toContain("USD 8"); expect(container.textContent).toContain("KHR 30,000");
    expect(container.textContent).not.toContain("$30,008");
  });
  it("shows gifts separately and does not combine currencies into dollars", () => {
    render(<GiftStatsCards gifts={[{ amount: 10, currency: "USD" }, { amount: 40000, currency: "KHR" }]} />);
    expect(screen.getAllByText(/USD 10/).length).toBeGreaterThan(0); expect(screen.getAllByText(/KHR 40,000/).length).toBeGreaterThan(0);
    expect(screen.queryByText("$40,010")).not.toBeInTheDocument();
  });
});
