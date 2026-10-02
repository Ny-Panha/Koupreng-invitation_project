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

// Happy DOM's Web Animations implementation rejects `finished` when React
// unmounts Framer Motion nodes. Unit tests do not exercise animation timing,
// so force Motion onto its deterministic JavaScript fallback.
if (typeof Element !== "undefined") {
  delete Element.prototype.animate;
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

class BlockedXMLHttpRequest {
  constructor() {
    this.readyState = 0;
    this.response = null;
    this.responseText = "";
    this.responseURL = "";
    this.status = 0;
    this.statusText = "";
    this.timeout = 0;
    this.upload = { addEventListener() {} };
    this.withCredentials = false;
    this.onloadend = null;
    this.onerror = null;
    this.onabort = null;
    this.ontimeout = null;
  }

  open(method, url) {
    this.method = method;
    this.responseURL = String(url);
    this.readyState = 1;
  }

  setRequestHeader() {}

  addEventListener() {}

  getAllResponseHeaders() {
    return "";
  }

  send() {
    queueMicrotask(() => {
      this.readyState = 4;
      this.onerror?.(new BlockedNetworkError(this.responseURL));
    });
  }

  abort() {
    this.onabort?.();
  }
}

Object.defineProperty(globalThis, "fetch", {
  value: blockedFetch,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "XMLHttpRequest", {
  value: BlockedXMLHttpRequest,
  writable: true,
  configurable: true,
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, "fetch", {
    value: blockedFetch,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "XMLHttpRequest", {
    value: BlockedXMLHttpRequest,
    writable: true,
    configurable: true,
  });
}


