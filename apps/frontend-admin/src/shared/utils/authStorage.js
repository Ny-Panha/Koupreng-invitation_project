/**
 * Persists the admin auth session in sessionStorage.
 * Mirrors the shape used by the user app (koupreng.auth).
 */
const STORAGE_KEY = "koupreng.admin.auth";

function getStorage() {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage || window.sessionStorage || null;
    } catch {
        return null;
    }
}

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const { exp } = JSON.parse(json);
        if (!exp) return false;
        return Date.now() >= exp * 1000;
    } catch {
        return true;
    }
}

export function readAuth() {
    const storage = getStorage();
    if (!storage) return null;
    try {
        let raw = storage.getItem(STORAGE_KEY);
        if (!raw && typeof window !== "undefined" && window.sessionStorage) {
            raw = window.sessionStorage.getItem(STORAGE_KEY);
        }
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken && isTokenExpired(parsed.accessToken)) {
            clearAuth();
            return null;
        }
        return parsed?.accessToken ? parsed : null;
    } catch {
        return null;
    }
}

export function writeAuth(authData) {
    const storage = getStorage();
    if (!storage) return;
    try {
        const str = JSON.stringify(authData);
        storage.setItem(STORAGE_KEY, str);
        if (typeof window !== "undefined" && window.sessionStorage) {
            window.sessionStorage.setItem(STORAGE_KEY, str);
        }
    } catch {
        // ignore storage write errors
    }
}

export function clearAuth() {
    try {
        if (typeof window !== "undefined") {
            if (window.localStorage) window.localStorage.removeItem(STORAGE_KEY);
            if (window.sessionStorage) window.sessionStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // ignore
    }
}

export function getAccessToken() {
    return readAuth()?.accessToken || null;
}
