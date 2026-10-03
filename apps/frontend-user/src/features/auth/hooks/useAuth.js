import { useAuthStore, isTokenExpired } from "../../../stores/useAuthStore";
import { isCookieAuthStorage } from "@/shared/storage/authStorage";

/**
 * useAuth — hook that returns { user, isAuthenticated, login, logout }.
 * Now backed by Zustand store instead of React Context.
 * Same API shape so all existing components work unchanged.
 */
export function useAuth() {
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const login = useAuthStore((s) => s.login);
    const logout = useAuthStore((s) => s.logout);
    const validated = useAuthStore((s) => s.isAuthenticated);
    const authStatus = useAuthStore((s) => s.authStatus);
    const sessionError = useAuthStore((s) => s.sessionError);
    const initializeSession = useAuthStore((s) => s.initializeSession);
    const updateUser = useAuthStore((s) => s.updateUser);

    const isExpired = isTokenExpired(accessToken);
    const isAuthenticated = Boolean(validated && user && (isCookieAuthStorage() || (accessToken && !isExpired)));

    return { user, isAuthenticated, login, logout, updateUser, authStatus, isLoading: authStatus === "checking", sessionError, retrySession: () => initializeSession(true) };
}
