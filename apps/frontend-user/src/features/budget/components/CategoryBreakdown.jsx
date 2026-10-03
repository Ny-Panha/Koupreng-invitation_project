import { BUDGET_CATEGORIES } from "../budgetCategories";
import { budgetMoney } from "../currencyTotals";

export default function CategoryBreakdown({ items = [] }) {
  if (!items.length) return null;

  const categoryTotals = {};
  const totalByCurrency = {};

  items.forEach((item) => {
    const cat = item.category || "OTHER";
    const currency = item.currency || "USD";
    const amount = Number(item.actualCost ?? item.estimatedCost ?? 0);
    const key = `${currency}:${cat}`;
    categoryTotals[key] = (categoryTotals[key] || 0) + amount;
    totalByCurrency[currency] = (totalByCurrency[currency] || 0) + amount;
  });

  const categories = Object.keys(totalByCurrency).flatMap((currency) => BUDGET_CATEGORIES.map((cat) => {
    const totalSpending = totalByCurrency[currency];
    const amount = categoryTotals[`${currency}:${cat.value}`] || 0;
    const percentage = totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0;
    return {
      ...cat,
      currency,
      amount,
      percentage,
    };
  })).filter((c) => c.amount > 0);

  if (!categories.length) return null;

  return (
    <div style={{ background: "var(--brand-surface)", padding: "1.25rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--brand-border)" }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: "700" }}>
        ចំណាយតាមប្រភព / Spending by Category
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {categories.map((c) => (
          <div key={`${c.currency}:${c.value}`}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.25rem" }}>
              <span>{c.label}</span>
              <span>{budgetMoney(c.amount, c.currency)} ({c.percentage}% of {c.currency})</span>
            </div>
            <div style={{ background: "rgba(107, 107, 196, 0.1)", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${c.percentage}%`,
                  background: "var(--brand-primary)",
                  height: "100%",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
