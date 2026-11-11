import { useLanguageStore } from "@/stores/useLanguageStore";
import { budgetMoney, currencyAmounts, isMixedBudget } from "../currencyTotals";

export default function BudgetSummaryCards({ budget }) {
  const isEn = useLanguageStore((state) => state.lang) === "en";
  const mixed = isMixedBudget(budget);
  const money = (value) => budgetMoney(value, budget?.currency || "USD");

  const cards = [
    {
      label: isEn ? "Total budget" : "ថវិកាសរុប",
      value: mixed
        ? `${budget?.totalBudget ?? (isEn ? "Unavailable" : "មិនមាន")} (${isEn ? "currency unspecified" : "មិនបានបញ្ជាក់រូបិយប័ណ្ណ"})`
        : money(budget?.totalBudget),
      note: isEn ? "Target budget" : "គោលដៅថវិកា",
    },
    {
      label: isEn ? "Estimated" : "ការប៉ាន់ប្រមាណ",
      value: mixed ? currencyAmounts(budget?.estimatedByCurrency) : money(budget?.totalEstimated),
      note: isEn ? "Estimated spending" : "ចំណាយគ្រោងទុក",
    },
    {
      label: isEn ? "Actual" : "ចំណាយជាក់ស្តែង",
      value: mixed ? currencyAmounts(budget?.actualByCurrency) : money(budget?.totalActual),
      note: isEn ? "Actual spending" : "ចំណាយបានទូទាត់",
    },
    {
      label: mixed
        ? isEn ? "Budget comparison" : "ការប្រៀបធៀបថវិកា"
        : budget?.overBudget
        ? isEn ? "Over budget" : "លើសថវិកា"
        : isEn ? "Remaining" : "នៅសល់",
      value: mixed ? (isEn ? "Comparison unavailable" : "មិនអាចប្រៀបធៀបបាន") : money(budget?.remainingBudget),
      note: mixed
        ? isEn ? "Mixed currency" : "រូបិយប័ណ្ណចម្រុះ"
        : budget?.overBudget
        ? isEn ? "Exceeded target" : "លើសពីគោលដៅ"
        : isEn ? "Available funds" : "ថវិកាអាចប្រើបាន",
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
