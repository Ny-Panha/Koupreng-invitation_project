export function budgetMoney(value, currency = "USD") {
  if (value == null || !Number.isFinite(Number(value))) return "Unavailable";
  return `${currency} ${Number(value).toLocaleString(undefined, { maximumFractionDigits: currency === "KHR" ? 0 : 2 })}`;
}
export function isMixedBudget(budget) {
  return budget?.totalsComparable === false || new Set((budget?.items || []).map((item) => item.currency || "USD")).size > 1;
}
export function currencyAmounts(values = {}) {
  return Object.entries(values).map(([currency, amount]) => budgetMoney(amount, currency)).join(" · ") || "Unavailable";
}
