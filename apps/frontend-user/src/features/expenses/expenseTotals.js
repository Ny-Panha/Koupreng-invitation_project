export function expenseTotals(expenses = []) {
  const byCurrency = expenses.reduce((totals, item) => {
    const currency = item.currency || "USD";
    const group = totals[currency] ||= { totalBudget: 0, totalSpent: 0 };
    group.totalBudget += Number(item.budget) || 0;
    group.totalSpent += Number(item.amount) || 0;
    return totals;
  }, {});
  Object.values(byCurrency).forEach((group) => Object.assign(group, {
    isOver: group.totalSpent > group.totalBudget && group.totalBudget > 0,
    diff: Math.abs(group.totalBudget - group.totalSpent),
    percent: group.totalBudget > 0 ? Math.min(100, Math.round(group.totalSpent / group.totalBudget * 100)) : 0,
  }));
  const keys = Object.keys(byCurrency);
  return { byCurrency, currencyCode: keys.length === 1 ? keys[0] : undefined,
    ...(keys.length === 1 ? byCurrency[keys[0]] : { totalBudget: null, totalSpent: null, diff: null, percent: null, isOver: false }) };
}
