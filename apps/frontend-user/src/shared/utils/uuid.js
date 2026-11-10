export function generateSecureUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to getRandomValues if crypto.randomUUID throws unexpectedly
    }
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // RFC 4122 section 4.4:
    // Set version 4: bits 12-15 of time_hi_and_version to 0100 (0x40)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant: bits 6-7 of clock_seq_hi_and_reserved to 10 (0x80)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  throw new Error("Cryptographically secure random values are unavailable in this environment.");
}

/**
 * Drop-in safe replacement for crypto.randomUUID().
 */
export function safeRandomUUID() {
  return generateSecureUuid();
}
