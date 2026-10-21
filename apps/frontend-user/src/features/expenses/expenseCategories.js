// Values are persisted by the existing API; translate only their visible labels.
export const EXPENSE_CATEGORIES = [
  { value: "Food & Catering", key: "catFood" },
  { value: "Decor & Flowers", key: "catDecor" },
  { value: "Attire & Makeup", key: "catClothing" },
  { value: "Venue & Transport", key: "catTransport" },
  { value: "Other", key: "catOther" },
];

export function expenseCategoryLabel(value, t) {
  const category = EXPENSE_CATEGORIES.find(category => category.value === value);
  return category && t ? t(category.key) : value;
}
