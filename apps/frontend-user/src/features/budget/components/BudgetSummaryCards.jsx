import { budgetMoney, currencyAmounts, isMixedBudget } from "../currencyTotals";

export default function BudgetSummaryCards({ budget }) {
  const mixed = isMixedBudget(budget);
  const money = (value) => budgetMoney(value, budget?.currency || "USD");
  const cards = [
    { label: "Total budget", value: mixed ? `${budget?.totalBudget ?? "Unavailable"} (currency unspecified)` : money(budget?.totalBudget), note: "ថវិកាសរុប" },
    { label: "Estimated", value: mixed ? currencyAmounts(budget?.estimatedByCurrency) : money(budget?.totalEstimated), note: "ការប៉ាន់ប្រមាណ" },
    { label: "Actual", value: mixed ? currencyAmounts(budget?.actualByCurrency) : money(budget?.totalActual), note: "ចំណាយពិតប្រាកដ" },
    {
      label: mixed ? "Budget comparison" : budget?.overBudget ? "Over budget" : "Remaining",
      value: mixed ? "Comparison unavailable" : money(budget?.remainingBudget),
      note: budget?.overBudget ? "លើសថវិកា" : "នៅសល់",
      danger: !mixed && budget?.overBudget,
    },
  ];

  return (
    <section className="budget-summary-grid">
      {cards.map((card) => (
        <article key={card.label} className={`budget-summary-card${card.danger ? " is-danger" : ""}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.note}</small>
        </article>
      ))}
    </section>
  );
}
