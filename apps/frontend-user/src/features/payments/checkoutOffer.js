export function checkoutOffer(template) {
  if (!template) return { eligible: false, amount: "", currency: "", reason: "Template catalog is unavailable. Please retry." };
  if (typeof template.checkoutEligible === "boolean") {
    const amount = template.checkoutAmount;
    const numeric = ["string", "number"].includes(typeof amount) && /^\d+(\.\d+)?$/.test(String(amount));
    const valid = template.checkoutEligible && numeric && Number.isFinite(Number(amount)) && Number(amount) > 0 && ["USD", "KHR"].includes(template.checkoutCurrency);
    return { eligible: Boolean(valid), amount: valid ? String(template.checkoutAmount) : "", currency: valid ? template.checkoutCurrency : "",
      reason: valid ? "" : "Checkout is not available for this template yet. You can still preview it." };
  }
  return { eligible: false, amount: "", currency: "", reason: "A current checkout offer is unavailable. Refresh the catalog or contact support." };
}
