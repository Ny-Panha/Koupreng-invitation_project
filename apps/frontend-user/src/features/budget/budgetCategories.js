export const BUDGET_CATEGORIES = [
  { value: "DECORATION", label: "Decoration / តុបតែង", labelKm: "តុបតែង និងផ្កា", labelEn: "Decoration & Flowers" },
  { value: "FOOD", label: "Food / អាហារ", labelKm: "ម្ហូបអាហារ និងភេសជ្ជៈ", labelEn: "Food & Catering" },
  { value: "PHOTOGRAPHER", label: "Photographer / ថតរូប", labelKm: "ថតរូប និងវីដេអូ", labelEn: "Photography & Video" },
  { value: "MUSIC_BAND", label: "Music band / តន្ត្រី", labelKm: "តន្ត្រី និងភ្លេងការ", labelEn: "Music & Band" },
  { value: "VENUE", label: "Venue / ទីតាំង", labelKm: "ទីតាំងកម្មវិធី", labelEn: "Venue & Location" },
  { value: "CLOTHES", label: "Clothes / សម្លៀកបំពាក់", labelKm: "សម្លៀកបំពាក់", labelEn: "Attire & Outfits" },
  { value: "MAKEUP", label: "Makeup / តុបតែងមុខ", labelKm: "ផាត់មុខ និងធ្វើសក់", labelEn: "Hair & Makeup" },
  { value: "TRANSPORTATION", label: "Transportation / ដឹកជញ្ជូន", labelKm: "សេវាដឹកជញ្ជូន", labelEn: "Transportation" },
  { value: "OTHER", label: "Other / ផ្សេងៗ", labelKm: "ផ្សេងៗ", labelEn: "Other" },
];

export function budgetCategoryLabel(category, isEn = false) {
  const found = BUDGET_CATEGORIES.find((c) => c.value === category || c.label === category);
  if (!found) return category || (isEn ? "Other" : "ផ្សេងៗ");
  return isEn ? found.labelEn : found.labelKm;
}
