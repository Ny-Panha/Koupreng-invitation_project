import axios from "axios";
import { ApiError } from "./ApiError";
import { getStoredLang } from "./helpers";
import { clearStoredAuth, getAccessToken, isCookieAuthStorage } from "../storage/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
let csrfToken = null;
let currentActionContext = null;

function generateRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "req-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
}

export function generateActionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return "act-" + crypto.randomUUID().slice(0, 12);
  }
  return "act-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 8);
}

export function setActionContext(actionName, actionId = null) {
  currentActionContext = {
    actionName,
    actionId: actionId || generateActionId(),
  };
  return currentActionContext;
}

export function clearActionContext() {
  currentActionContext = null;
}

export async function runWithAction(actionName, fn) {
  const previous = currentActionContext;
  currentActionContext = {
    actionName,
    actionId: generateActionId(),
  };
  try {
    return await fn(currentActionContext.actionId);
  } finally {
    currentActionContext = previous;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.metadata = {
      startTime: typeof performance !== "undefined" ? performance.now() : Date.now(),
    };

    if (!config.headers["X-Request-Id"]) {
      config.headers["X-Request-Id"] = generateRequestId();
    }
    config.headers["X-Client-App"] = "frontend-user";
    if (typeof window !== "undefined" && window.location) {
      config.headers["X-Frontend-Route"] = window.location.pathname || "/";
    }

    if (currentActionContext) {
      config.headers["X-Action-Id"] = currentActionContext.actionId;
      if (!config.clientAction) {
        config.headers["X-Client-Action"] = currentActionContext.actionName;
      }
    }
    if (config.actionId) {
      config.headers["X-Action-Id"] = config.actionId;
      delete config.actionId;
    }
    if (config.clientAction) {
      config.headers["X-Client-Action"] = config.clientAction;
      delete config.clientAction;
    }

    const token = getAccessToken();
    const useCookieAuth = isCookieAuthStorage();

    config.headers["Accept-Language"] ||= getStoredLang();

    const skipAuth = config.skipAuth === true;

    if (config.skipAuth !== undefined) {
      delete config.skipAuth;
    }

    if (!skipAuth && !useCookieAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (useCookieAuth) {
      config.withCredentials = true;
      config.withXSRFToken = true;
      if (csrfToken) config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    const startTime = response.config?.metadata?.startTime;
    if (startTime != null) {
      const clientDurationMs = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - startTime
      );
      response.clientDurationMs = clientDurationMs;
    }

    const token = response.headers?.get?.("X-XSRF-TOKEN") || response.headers?.["x-xsrf-token"];
    if (isCookieAuthStorage() && typeof token === "string" && /^[A-Za-z0-9_-]{16,256}$/.test(token)) csrfToken = token;
    return response.data;
  },
  (error) => {
    const startTime = error.config?.metadata?.startTime;
    const clientDurationMs =
      startTime != null
        ? Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startTime)
        : 0;

    // Report client-observed failures if no HTTP response arrived
    if (!error.response && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("koupreng:api-error", {
          detail: {
            id: Date.now(),
            requestId: error.config?.headers?.["X-Request-Id"] || generateRequestId(),
            actionId: error.config?.headers?.["X-Action-Id"] || "",
            clientApp: "frontend-user",
            frontendRoute: typeof window !== "undefined" ? window.location?.pathname || "/" : "/",
            clientAction: error.config?.headers?.["X-Client-Action"] || "",
            method: error.config?.method?.toUpperCase() || "GET",
            path: error.config?.url || "",
            target: error.config?.url || "",
            status: 0,
            durationMs: clientDurationMs,
            clientDurationMs,
            slow: clientDurationMs >= 500,
            source: "CLIENT_OBSERVED",
            contractStatus: "UNMATCHED",
            outcome: "NETWORK_ERROR",
            errorCode: error.code || "ERR_NETWORK",
            errorMessage: error.message || "Network request failed",
            timestamp: new Date().toISOString(),
          },
        })
      );
    }

    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401 && !error.config?.authBootstrap && !error.config?.suppressAuthRedirect) {
      csrfToken = null;
      clearStoredAuth();
      if (typeof window !== "undefined" && window.location && !window.location.pathname.startsWith("/login")) {
        const next = `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
      }
    }

    const message = data?.message || error.response?.statusText || error.message || "Request failed";

    throw new ApiError(message, status, data);
  },
);

export const api = {
  get: (path, opts) => apiClient.get(path, opts),
  post: (path, body, opts) => apiClient.post(path, body, opts),
  put: (path, body, opts) => apiClient.put(path, body, opts),
  patch: (path, body, opts) => apiClient.patch(path, body, opts),
  delete: (path, opts) => apiClient.delete(path, opts),
};

export { apiClient };
export default api;
