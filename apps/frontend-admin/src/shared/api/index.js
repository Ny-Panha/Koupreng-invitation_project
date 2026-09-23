import { api } from "./adminHttpClient";

export const authService = {
  login: (identifier, password) => api.post("/auth/login", { identifier, password }, { skipAuth: true }),
  logout: () => api.post("/auth/logout"),
};

export { api };
export { default as adminService, adminService as adminManagementService } from "./adminService";