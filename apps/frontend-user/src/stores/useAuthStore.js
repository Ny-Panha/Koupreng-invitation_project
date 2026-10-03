import { create } from "zustand";
import authService from "../features/auth/api/authApi";
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredAuth,
  isCookieAuthStorage,
} from "../shared/storage/authStorage";

/**
 * useAuthStore — Zustand store for authentication state.
 * Pattern: create((set, get) => ({...})) per pmndrs/zustand docs.
 *
 * Reads initial state from the storage selected by VITE_AUTH_STORAGE.
 * Components use this via the useAuth() hook for backward compatibility.
 */

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const storedAuth = readStoredAuth();
const cookieAuth = isCookieAuthStorage();
const initialAuth = !cookieAuth && storedAuth?.accessToken && !isTokenExpired(storedAuth.accessToken)
  ? storedAuth
  : null;

if (storedAuth && !initialAuth && !cookieAuth) {
  clearStoredAuth();
}

let sessionGeneration = 0;
let bootstrapRequest = null;
const validUser = (user) => user && typeof user === "object" && !Array.isArray(user)
  && user.id != null && typeof user.role === "string" && user.role.length > 0;

export const useAuthStore = create((set, get) => ({
  user: initialAuth?.user || null,
  accessToken: initialAuth?.accessToken || null,
  isAuthenticated: Boolean(initialAuth?.accessToken && initialAuth?.user && !isTokenExpired(initialAuth?.accessToken)),
  authStatus: cookieAuth ? "checking" : initialAuth ? "authenticated" : "anonymous",
  sessionError: "",

  initializeSession: (force = false) => {
    if (!cookieAuth) return Promise.resolve();
    if (bootstrapRequest && !force) return bootstrapRequest;
    if (!force && get().authStatus !== "checking") return Promise.resolve();
    const generation = ++sessionGeneration;
    set({ authStatus: "checking", sessionError: "", isAuthenticated: false });
    const request = authService.me({ authBootstrap: true })
      .then((user) => {
        if (generation !== sessionGeneration) return;
        if (!validUser(user)) throw new Error("Invalid session response");
        writeStoredAuth({ user });
        set({ user, accessToken: null, isAuthenticated: true, authStatus: "authenticated", sessionError: "" });
      })
      .catch((error) => {
        if (generation !== sessionGeneration) return;
        clearStoredAuth();
        const expired = [401, 403].includes(error?.status);
        set({ user: null, accessToken: null, isAuthenticated: false,
          authStatus: expired ? "anonymous" : "error",
          sessionError: expired ? "" : "Could not verify your session. Please try again." });
      })
      .finally(() => { if (bootstrapRequest === request) bootstrapRequest = null; });
    bootstrapRequest = request;
    return request;
  },

  login: (authData) => {
    if (!validUser(authData?.user)) throw new Error("Invalid authentication response");
    sessionGeneration += 1;
    const nextState = {
      accessToken: cookieAuth ? null : authData.accessToken,
      tokenType: authData.tokenType || "Bearer",
      expiresAt: authData.expiresAt,
      user: authData.user,
    };
    writeStoredAuth(nextState);
    set({
      user: authData.user,
      accessToken: cookieAuth ? null : authData.accessToken,
      isAuthenticated: true,
      authStatus: "authenticated",
      sessionError: "",
    });
  },

  updateUser: (user) => {
    if (!validUser(user) || !get().isAuthenticated) throw new Error("Invalid profile response");
    const current = readStoredAuth() || {};
    writeStoredAuth({ ...current, user });
    set({ user });
  },

  logout: async () => {
    const accessToken = get().accessToken;
    sessionGeneration += 1;
    clearStoredAuth();
    set({ user: null, accessToken: null, isAuthenticated: false, authStatus: "anonymous", sessionError: "" });
    try {
      await authService.logout({ suppressAuthRedirect: true,
        ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}) });
    } catch {
      // Ignore network/logout errors; clear the local session regardless.
    }
  },
}));
