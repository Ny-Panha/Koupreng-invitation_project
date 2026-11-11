import { useLanguageStore } from "@/stores/useLanguageStore";
import { budgetMoney, isMixedBudget } from "../currencyTotals";

export default function BudgetProgress({ budget }) {
  const isEn = useLanguageStore((state) => state.lang) === "en";
  if (!budget) return null;
  if (isMixedBudget(budget)) {
    return (
      <p role="status">
        {isEn
          ? "Budget comparison unavailable: USD and KHR amounts remain separate. The budget goal currency is not recorded; no exchange rate is applied."
          : "មិនអាចប្រៀបធៀបថវិកាបានទេ (Comparison unavailable)៖ ចំនួនទឹកប្រាក់ USD និង KHR ត្រូវរក្សាដាច់ដោយឡែកពីគ្នា។ មិនមានការអនុវត្តអត្រាប្តូរប្រាក់ទេ។"}
      </p>
    );
  }
  const money = (value) => budgetMoney(value, budget.currency || "USD");

  const total = Number(budget.totalBudget || 0);
  const actual = Number(budget.totalActual || budget.totalSpent || 0);
  const isOver = budget.overBudget || (total > 0 && actual > total);
  const percentage = total > 0 ? Math.min(Math.round((actual / total) * 100), 100) : 0;
  const overAmount = actual - total;

  return (
    <div
      style={{
        background: isOver ? "#fff5f5" : "var(--brand-surface)",
        border: `1px solid ${isOver ? "#feb2b2" : "var(--brand-border)"}`,
        padding: "1.25rem",
        borderRadius: "var(--radius-xl)",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: "0.9375rem", color: isOver ? "#c53030" : "var(--brand-text)" }}>
          {isOver
            ? isEn
              ? `⚠️ Over budget by ${money(overAmount)}`
              : `⚠️ លើសថវិកាចំនួន ${money(overAmount)}`
            : isEn
            ? "Budget Progress"
            : "វឌ្ឍនភាពថវិកា"}
        </strong>
        <span style={{ fontSize: "0.875rem", fontWeight: "700", color: isOver ? "#c53030" : "var(--brand-primary)" }}>
          {money(actual)} / {money(total)} ({percentage}%)
        </span>
      </div>

      <div style={{ background: "rgba(0, 0, 0, 0.06)", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
        <div
          style={{
            width: `${percentage}%`,
            background: isOver ? "#e53e3e" : "var(--brand-primary)",
            height: "100%",
            borderRadius: "999px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
