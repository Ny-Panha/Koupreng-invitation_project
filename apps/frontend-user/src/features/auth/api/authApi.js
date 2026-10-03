import { api } from "@/shared/api/httpClient";

export const authService = {
    login: (identifier, password) => 
        api.post("/auth/login", { identifier, password }, { skipAuth: true }),

    register: (userData) => 
        api.post("/auth/register", userData, { skipAuth: true }),

    loginWithGoogle: (idToken) => 
        api.post("/auth/google", { idToken }, { skipAuth: true }),

    loginWithTelegram: (loginData) => 
        api.post("/auth/telegram", loginData, { skipAuth: true }),

    linkGoogle: (idToken) => api.post("/auth/link/google", { idToken }),
    linkTelegram: (loginData) => api.post("/auth/link/telegram", loginData),

    logout: (options) =>
        api.post("/auth/logout", undefined, options),

    me: (options) =>
        api.get("/auth/me", options),

    changePassword: (currentPassword, newPassword) =>
        api.post("/auth/change-password", { currentPassword, newPassword }),

    forgotPassword: (email) =>
        api.post("/auth/forgot-password", { email }, { skipAuth: true }),

    resetPassword: (token, newPassword) =>
        api.post("/auth/reset-password", { token, newPassword }, { skipAuth: true }),
};

export default authService;
