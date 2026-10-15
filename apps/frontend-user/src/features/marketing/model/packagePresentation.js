// An absent amount/currency is an unavailable offer, never a synthesized price.
export function packagePrice(plan, language) {
  const amount = plan?.price;
  if (!(typeof amount === "number" || (typeof amount === "string" && /^\d+(\.\d+)?$/.test(amount.trim())))) return null;
  if (!Number.isFinite(Number(amount)) || Number(amount) < 0 || !/^[A-Z]{3}$/.test(plan?.currency || "")) return null;
  try {
    return new Intl.NumberFormat(language === "en" ? "en-US" : "km-KH", { style: "currency", currency: plan.currency }).format(Number(amount));
  } catch { return null; }
}

export function packageLimit(value, language) {
  return Number.isInteger(value) && value >= 0
    ? new Intl.NumberFormat(language === "en" ? "en-US" : "km-KH").format(value)
    : language === "en" ? "Not specified" : "មិនបានបញ្ជាក់";
}
