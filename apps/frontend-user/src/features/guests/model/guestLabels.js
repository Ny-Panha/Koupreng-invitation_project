import { DEFAULT_CATEGORIES, DEFAULT_GROUPS } from "./guestConstants";

// Translate built-in choices at presentation time. Keep saved values and custom names intact.
export function guestOptionLabel(value, lang) {
  const option = [...DEFAULT_GROUPS, ...DEFAULT_CATEGORIES].find(item => item.name === value || item.note === value);
  return option ? (lang === "en" ? option.name : option.note) : value;
}
