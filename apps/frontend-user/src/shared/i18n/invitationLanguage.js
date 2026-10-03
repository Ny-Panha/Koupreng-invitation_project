export function normalizeInvitationLanguage(value) {
  const language = String(value || "").trim().toLowerCase();
  if (["kh", "km", "khmer", "km-kh"].includes(language)) return "kh";
  if (["en", "english", "en-us", "en-gb"].includes(language)) return "en";
  return language === "both" ? "both" : "en";
}
