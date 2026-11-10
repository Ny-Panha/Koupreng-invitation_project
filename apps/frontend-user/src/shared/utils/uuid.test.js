import { describe, it, expect, afterEach } from "vitest";
import { generateSecureUuid, safeRandomUUID } from "./uuid";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("generateSecureUuid utility", () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  it("produces valid RFC 4122 UUIDv4 in standard environment with crypto.randomUUID", () => {
    const id = generateSecureUuid();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it("handles LAN HTTP / Safari non-secure context where crypto.randomUUID is undefined", () => {
    // Emulate iPhone Safari over HTTP LAN (192.168.x.x) where randomUUID is missing but getRandomValues exists
    const mockGetRandomValues = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (i * 17 + 42) & 0xff;
      }
      return arr;
    };

    Object.defineProperty(globalThis, "crypto", {
      value: {
        getRandomValues: mockGetRandomValues,
        randomUUID: undefined, // Simulates insecure context in WebKit/Chromium
      },
      writable: true,
      configurable: true,
    });

    const id = generateSecureUuid();
    expect(id).toBeDefined();
    expect(id).toMatch(UUID_V4_REGEX);
    // Specifically test version 4 and variant bits
    const parts = id.split("-");
    expect(parts[2].startsWith("4")).toBe(true);
    expect(["8", "9", "a", "b"].includes(parts[3][0].toLowerCase())).toBe(true);
  });

  it("safeRandomUUID aliases generateSecureUuid correctly", () => {
    const id = safeRandomUUID();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it("throws clear error when no cryptographic randomness is available at all", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => generateSecureUuid()).toThrow("Cryptographically secure random values are unavailable");
  });
});
