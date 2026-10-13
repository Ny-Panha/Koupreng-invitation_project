// A URL QR opens the configured fixed PayWay checkout. It is not a custom KHQR.
// The bank controls its own link, amount entry and reference retention.
export function getPaymentQrValue(order) {
  const value = order?.paymentLink || order?.checkoutUrl;
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["pay.ababank.com", "link.payway.com.kh"].includes(url.hostname)
      ? url.href : "";
  } catch {
    return "";
  }
}


