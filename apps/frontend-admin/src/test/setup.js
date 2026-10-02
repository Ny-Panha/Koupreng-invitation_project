import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

function createMemoryStorage() {
  const values = new Map();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(String(key));
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
  };
}

const localStorageMock = createMemoryStorage();
const sessionStorageMock = createMemoryStorage();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: localStorageMock });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: sessionStorageMock });
Object.defineProperty(window, "localStorage", { configurable: true, value: localStorageMock });
Object.defineProperty(window, "sessionStorage", { configurable: true, value: sessionStorageMock });

afterEach(() => {
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.clear();
      window.sessionStorage?.clear();
    } catch {
      // Storage access blocked or unavailable
    }
  }
});

