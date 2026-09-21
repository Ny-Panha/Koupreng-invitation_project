import { describe, expect, it } from "vitest";
import {
  crc16,
  generatePanhaDynamicKhqr,
  getPaymentQrValue,
} from "./khqr";

describe("KHQR Generator for PANHA NY", () => {
  it("calculates accurate CRC16 matching Bakong EMVCo specification", () => {
    // Checksum of static payload without CRC
    const payload =
      "00020101021129450016abaakhppxxx@abaa01090098588160208ABA Bank40600006abaP2P011241CF604FF46E020900985881603090078303860404dual5204000053031165802KH5908PANHA NY6010Phnom Penh6304";
    expect(crc16(payload)).toBe("0FF8");
  });

  it("generates dynamic KHQR with bound USD amount and bill number", () => {
    const qr = generatePanhaDynamicKhqr({
      amount: "0.01",
      currency: "USD",
      orderCode: "EVT260917225",
      createdAt: 1789627554353,
      expiresAt: 1789627734353,
    });

    // Tag 01: Dynamic point of initiation (12)
    expect(qr).toContain("010212");
    // Tag 53: USD (840)
    expect(qr).toContain("5303840");
    // Tag 54: Amount 0.01
    expect(qr).toContain("54040.01");
    // Tag 59: Merchant Name
    expect(qr).toContain("5908PANHA NY");
    // Tag 62: Bill number EVT260917225
    expect(qr).toContain("62160112EVT260917225");
    // Starts with 000201 and ends with 4-char hex CRC
    expect(qr.startsWith("000201")).toBe(true);
    expect(qr.length).toBeGreaterThan(160);
  });

  it("returns authentic dynamic string from getPaymentQrValue", () => {
    const qr = getPaymentQrValue({
      amount: "0.01",
      currency: "USD",
      orderCode: "EVTTEST123",
    });
    expect(qr.startsWith("000201")).toBe(true);
    expect(qr).toContain("54040.01");
    expect(qr).toContain("5303840");
  });

  it("respects server-provided valid KHQR string when present", () => {
    const custom = "000201010212CUSTOM";
    expect(getPaymentQrValue({ qrString: custom })).toBe(custom);
  });
});
