import { KEEP_TEMPLATE_CODE } from "../templates/data/templatesData";

export function checkoutOffer(template, requestedId) {
  if (!template) return { eligible: false, amount: "", currency: "", reason: "Template catalog is unavailable. Please retry." };
  if (typeof template.checkoutEligible === "boolean") {
    const valid = template.checkoutEligible && Number(template.checkoutAmount) > 0 && ["USD", "KHR"].includes(template.checkoutCurrency);
    return { eligible: Boolean(valid), amount: valid ? String(template.checkoutAmount) : "", currency: valid ? template.checkoutCurrency : "",
      reason: valid ? "" : "Checkout is not available for this template yet. You can still preview it." };
  }
  const legacyGarden = template.code === KEEP_TEMPLATE_CODE || template.slug === KEEP_TEMPLATE_CODE
    || (String(template.id) === "2" && [KEEP_TEMPLATE_CODE, "2"].includes(String(requestedId)));
  return legacyGarden ? { eligible: true, amount: "0.01", currency: "USD", reason: "" }
    : { eligible: false, amount: "", currency: "", reason: "Checkout is not available for this template yet. You can still preview it." };
}
