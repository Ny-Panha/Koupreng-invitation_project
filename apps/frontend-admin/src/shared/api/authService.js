import { api } from "./adminHttpClient";

/**
 * Auth endpoints. The backend returns { accessToken, tokenType, expiresAt, user }.
 * Only users whose role is ADMIN are allowed to use this panel.
 */
export const authService = {
  login: (identifier, password) =>
    api.post("/auth/login", { identifier, password }, { skipAuth: true }),

  logout: () => api.post("/auth/logout"),
};

export default authService;
