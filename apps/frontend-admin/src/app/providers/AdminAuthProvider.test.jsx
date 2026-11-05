import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./AdminAuthProvider";
import { authService } from "../../shared/api";

vi.mock("../../shared/api", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

function makeJwt(expSecondsFromNow) {
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = btoa(JSON.stringify({ exp, sub: "admin@koupreng.com" }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return ["header", payload, "sig"].join(".");
}

describe("AdminAuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("initializes as unauthenticated when storage is empty", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it("discards expired session token upon initialization", () => {
    const expiredToken = makeJwt(-3600); // 1 hour ago
    window.sessionStorage.setItem(
      "koupreng.admin.auth",
      JSON.stringify({
        accessToken: expiredToken,
        user: { role: "ADMIN", email: "admin@koupreng.com" },
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(window.sessionStorage.getItem("koupreng.admin.auth")).toBeNull();
  });

  it("handles malformed/invalid token safely by clearing it", () => {
    window.sessionStorage.setItem(
      "koupreng.admin.auth",
      JSON.stringify({
        accessToken: "not-a-valid-jwt-token",
        user: { role: "ADMIN" },
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("logs in ADMIN user, sets session and auth state", async () => {
    const validToken = makeJwt(3600);
    authService.login.mockResolvedValueOnce({
      accessToken: validToken,
      user: { id: 1, email: "admin@koupreng.com", role: "ADMIN" },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login("admin@koupreng.com", "securepass");
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.email).toBe("admin@koupreng.com");
    expect(result.current.accessToken).toBe(validToken);
  });

  it("throws and prevents session storage for non-admin role", async () => {
    authService.login.mockResolvedValueOnce({
      accessToken: makeJwt(3600),
      user: { id: 2, email: "user@koupreng.com", role: "USER" },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await expect(
      act(async () => {
        await result.current.login("user@koupreng.com", "pass");
      })
    ).rejects.toThrow(/មិនមែនជា Admin ទេ/);

    expect(result.current.isAuthenticated).toBe(false);
    expect(window.sessionStorage.getItem("koupreng.admin.auth")).toBeNull();
  });

  it("clears auth tokens and state immediately on logout", async () => {
    const validToken = makeJwt(3600);
    window.sessionStorage.setItem(
      "koupreng.admin.auth",
      JSON.stringify({
        accessToken: validToken,
        user: { role: "ADMIN" },
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(window.sessionStorage.getItem("koupreng.admin.auth")).toBeNull();
  });
});

