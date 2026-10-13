/**
 * Single HTTP client for the admin app.
 * Wraps axios with JSON handling, base URL, and JWT bearer auth.
 */
import axios from "axios";
import { getAccessToken, clearAuth } from "../utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

function generateRequestId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "req-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

apiClient.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        if (!config.headers["X-Request-Id"]) {
            config.headers["X-Request-Id"] = generateRequestId();
        }
        config.headers["X-Client-App"] = "frontend-admin";
        if (typeof window !== "undefined" && window.location) {
            config.headers["X-Frontend-Route"] = window.location.pathname || "/";
        }
        if (config.clientAction) {
            config.headers["X-Client-Action"] = config.clientAction;
            delete config.clientAction;
        }

        const skipAuth = config.skipAuth || config.auth === false;
        
        if (config.skipAuth !== undefined) {
            delete config.skipAuth;
        }
        if (config.auth !== undefined) {
            delete config.auth;
        }

        if (!skipAuth) {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        
        if (status === 401) {
            clearAuth();
            if (typeof window !== "undefined" && window.location && !window.location.pathname.startsWith("/login")) {
                const current = window.location.pathname;
                window.location.href = `/login?next=${encodeURIComponent(current)}`;
            }
        }

        const message = data?.message || data?.error || error.message || "Request failed";
        throw new ApiError(message, status, data);
    }
);

export const api = {
    get: (path, opts) => apiClient.get(path, opts),
    post: (path, body, opts) => apiClient.post(path, body, opts),
    put: (path, body, opts) => apiClient.put(path, body, opts),
    patch: (path, body, opts) => apiClient.patch(path, body, opts),
    delete: (path, opts) => apiClient.delete(path, opts),
};

export default api;
