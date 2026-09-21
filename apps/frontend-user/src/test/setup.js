import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key) {
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  key(index) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

const mockLocalStorage = new MemoryStorage();
const mockSessionStorage = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
  configurable: true,
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  mockLocalStorage.clear();
  mockSessionStorage.clear();
});

/**
 * Network guard.
 *
 * Unit tests must never reach the real internet — an outbound request makes the
 * suite slow, non-deterministic and noisy (ECONNRESET / AbortError) in CI. Any
 * code path that genuinely needs a response should mock `fetch` (or the service
 * module) itself; that assignment simply replaces this stub for the test.
 *
 * happy-dom's own iframe/asset loading is disabled separately via
 * `environmentOptions.happyDOM.settings` in vitest.config.js.
 */
class BlockedNetworkError extends Error {
  constructor(url) {
    super(`[test-setup] Blocked real network request to: ${url}`);
    this.name = "BlockedNetworkError";
  }
}

function describeRequest(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  if (input && typeof input.url === "string") return input.url;
  return String(input);
}

const blockedFetch = (input) => Promise.reject(new BlockedNetworkError(describeRequest(input)));

Object.defineProperty(globalThis, "fetch", {
  value: blockedFetch,
  writable: true,
  configurable: true,
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, "fetch", {
    value: blockedFetch,
    writable: true,
    configurable: true,
  });
}


