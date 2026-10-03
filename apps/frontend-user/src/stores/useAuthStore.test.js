import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookie: true, stored: null, read: vi.fn(), write: vi.fn(), clear: vi.fn(), me: vi.fn(), logout: vi.fn() }));
vi.mock("../shared/storage/authStorage", () => ({
  isCookieAuthStorage: () => mocks.cookie,
  readStoredAuth: () => mocks.stored,
  writeStoredAuth: mocks.write,
  clearStoredAuth: mocks.clear,
}));
vi.mock("../features/auth/api/authApi", () => ({ default: { me: mocks.me, logout: mocks.logout } }));
const user = { id: 10, fullName: "Test owner", role: "USER", status: "ACTIVE" };
const token = () => "e30." + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + ".test";
const load = async () => (await import("./useAuthStore")).useAuthStore;

describe("FE-001 session restoration", () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); mocks.cookie = true; mocks.stored = null; mocks.logout.mockResolvedValue({ message: "Logged out" }); });
  afterEach(() => vi.resetModules());

  it("does not authenticate cached cookie metadata before server validation", async () => {
    mocks.stored = { storage: "cookie", user };
    const store = await load();
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().authStatus).toBe("checking");
    mocks.me.mockResolvedValue(user);
    await store.getState().initializeSession();
    expect(store.getState()).toMatchObject({ isAuthenticated: true, user, accessToken: null, authStatus: "authenticated" });
    expect(mocks.write).toHaveBeenCalledWith(expect.objectContaining({ user }));
  });

  it("restores a valid cookie session even when no local metadata exists, with a single in-flight request", async () => {
    const store = await load();
    let finish;
    mocks.me.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const first = store.getState().initializeSession();
    const second = store.getState().initializeSession();
    expect(first).toBe(second);
    expect(mocks.me).toHaveBeenCalledOnce();
    finish(user); await first;
    expect(store.getState().isAuthenticated).toBe(true);
  });

  it.each([401, 403])("rejects an expired or invalid cookie (%s) and clears unverified metadata", async (status) => {
    mocks.stored = { storage: "cookie", user };
    mocks.me.mockRejectedValue({ status, message: "Invalid session" });
    const store = await load();
    await store.getState().initializeSession();
    expect(store.getState()).toMatchObject({ isAuthenticated: false, user: null, authStatus: "anonymous" });
    expect(mocks.clear).toHaveBeenCalled();
  });

  it("retains a retry state on server outage instead of treating it as an authenticated or expired session", async () => {
    mocks.me.mockRejectedValue({ status: 503, message: "Unavailable" });
    const store = await load();
    await store.getState().initializeSession();
    expect(store.getState()).toMatchObject({ isAuthenticated: false, authStatus: "error" });
    mocks.me.mockResolvedValue(user);
    await store.getState().initializeSession(true);
    expect(store.getState().isAuthenticated).toBe(true);
  });

  it("does not let a late bootstrap response restore a session after logout", async () => {
    const store = await load();
    let finish;
    mocks.me.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const request = store.getState().initializeSession();
    await store.getState().logout();
    finish(user); await request;
    expect(store.getState()).toMatchObject({ isAuthenticated: false, user: null, authStatus: "anonymous" });
  });

  it("preserves valid bearer restoration without a cookie bootstrap request", async () => {
    mocks.cookie = false; const accessToken = token(); mocks.stored = { accessToken, user };
    const store = await load();
    await store.getState().initializeSession();
    expect(store.getState()).toMatchObject({ isAuthenticated: true, accessToken, user });
    expect(mocks.me).not.toHaveBeenCalled();
  });

  it("revokes the original bearer on logout even after clearing local storage", async () => {
    mocks.cookie = false; const accessToken = token(); mocks.stored = { accessToken, user };
    const store = await load();
    await store.getState().logout();
    expect(mocks.logout).toHaveBeenCalledWith(expect.objectContaining({ headers: { Authorization: `Bearer ${accessToken}` } }));
    expect(store.getState().isAuthenticated).toBe(false);
  });
});
