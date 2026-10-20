import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({ cookie: true, state: { user: { id: 7 }, accessToken: null, initializeSession: vi.fn(), invalidateSession: vi.fn() } }));
vi.mock("@/stores/useAuthStore", () => ({ useAuthStore: Object.assign(selector => selector(fixture.state), { getState: () => fixture.state }) }));
vi.mock("@/shared/storage/authStorage", () => ({ isCookieAuthStorage: () => fixture.cookie }));
import AuthProvider from "./AuthProvider";
beforeEach(() => { vi.clearAllMocks(); fixture.cookie = true; fixture.state.accessToken = null; });
afterEach(() => { cleanup(); vi.useRealTimers(); });
it("shares logout only with tabs signed in as the same account", () => {
  render(<AuthProvider><p>App</p></AuthProvider>);
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: "koupreng.auth.logout", newValue: JSON.stringify({ userId: 8 }) })));
  expect(fixture.state.invalidateSession).not.toHaveBeenCalled();
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: "koupreng.auth.logout", newValue: JSON.stringify({ userId: 7 }) })));
  expect(fixture.state.invalidateSession).toHaveBeenCalledOnce();
});
it("invalidates a bearer session when its token expires", () => {
  vi.useFakeTimers();
  fixture.cookie = false;
  fixture.state.accessToken = "e30." + btoa(JSON.stringify({ exp: Date.now() / 1000 + 1 })) + ".fixture";
  render(<AuthProvider><p>App</p></AuthProvider>);
  act(() => vi.advanceTimersByTime(1001));
  expect(fixture.state.invalidateSession).toHaveBeenCalledOnce();
});
