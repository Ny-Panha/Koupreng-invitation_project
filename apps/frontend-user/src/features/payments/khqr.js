/**
 * Authentic ABA KHQR & PayWay helper for PANHA NY
 * Implements NBC Bakong EMVCo standard dynamic KHQR with fixed amount,
 * currency (USD / KHR), bill number, and 3-minute session expiration.
 */

// Fallback static ABA KHQR string of PANHA NY (Bakong / ABA Mobile format)
export const PANHA_NY_KHQR_STRING =
  "00020101021129450016abaakhppxxx@abaa01090098588160208ABA Bank40600006abaP2P011241CF604FF46E020900985881603090078303860404dual5204000053031165802KH5908PANHA NY6010Phnom Penh63040FF8";

// Authentic ABA Pay Deeplink (Used for button "Open in ABA Mobile")
export const ABA_STATIC_PAY_LINK = "https://pay.ababank.com/oRF8/vx2dp884";

/**
 * Standard CRC-16-CCITT (polynomial 0x1021, init 0xFFFF)
 */
export function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatTag(id, value) {
  const str = String(value ?? "");
  const len = String(str.length).padStart(2, "0");
  return `${id}${len}${str}`;
}

/**
 * Generates an authentic dynamic Bakong KHQR for PANHA NY
 * Automatically binds the exact amount (e.g. USD 0.01) so the customer
 * never has to type the amount or order remark manually in ABA Mobile.
 */
export function generatePanhaDynamicKhqr({
  amount = 0.01,
  currency = "USD",
  orderCode = "",
  createdAt = null,
  expiresAt = null,
} = {}) {
  const isKhr = currency?.toUpperCase() === "KHR";
  const currencyCode = isKhr ? "116" : "840";
  const numAmount = Number(amount != null ? amount : 0.01);
  const amountStr = isKhr
    ? String(Math.round(numAmount))
    : (Number.isNaN(numAmount) ? "0.01" : numAmount.toFixed(2));

  const nowTime = createdAt ? new Date(createdAt).getTime() : Date.now();
  const expTime = expiresAt ? new Date(expiresAt).getTime() : (nowTime + 180 * 1000);

  let raw = "";
  raw += formatTag("00", "01");
  raw += formatTag("01", "12"); // 12 = Dynamic (fixed amount)
  raw += "29450016abaakhppxxx@abaa01090098588160208ABA Bank";
  raw += "40600006abaP2P011241CF604FF46E020900985881603090078303860404dual";
  raw += formatTag("52", "0000");
  raw += formatTag("53", currencyCode);
  raw += formatTag("54", amountStr);
  raw += formatTag("58", "KH");
  raw += formatTag("59", "PANHA NY");
  raw += formatTag("60", "Phnom Penh");

  if (orderCode && String(orderCode).trim()) {
    const bill = formatTag("01", String(orderCode).trim().slice(0, 25));
    raw += formatTag("62", bill);
  }

  // Tag 99: Bakong Creation & Expiration Timestamps (Strict 3 minutes)
  const timestampPayload = "0013" + String(nowTime) + "0113" + String(expTime);
  raw += formatTag("99", timestampPayload);

  raw += "6304";
  const checksum = crc16(raw);
  return raw + checksum;
}

/**
 * Returns the scanning target value for the payment QR code.
 * ABA Mobile scanner strictly expects an EMVCo KHQR string (starting with 000201).
 */
export function getPaymentQrValue(order) {
  if (order?.qrString && order.qrString.startsWith("000201")) {
    return order.qrString;
  }
  if (order?.khqrString && order.khqrString.startsWith("000201")) {
    return order.khqrString;
  }
  try {
    return generatePanhaDynamicKhqr({
      amount: order?.amount ?? 0.01,
      currency: order?.currency || "USD",
      orderCode: order?.orderCode || "",
      createdAt: order?.createdAt,
      expiresAt: order?.expiresAt,
    });
  } catch {
    return PANHA_NY_KHQR_STRING;
  }
}

export default PANHA_NY_KHQR_STRING;


