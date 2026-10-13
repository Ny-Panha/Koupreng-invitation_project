import { api } from "@/shared/api/httpClient";

export const authService = {
    login: (identifier, password) => 
        api.post("/auth/login", { identifier, password }, { skipAuth: true, clientAction: "LOGIN_SUBMIT" }),

    register: (userData) => 
        api.post("/auth/register", userData, { skipAuth: true, clientAction: "REGISTER_SUBMIT" }),

    loginWithGoogle: (idToken) => 
        api.post("/auth/google", { idToken }, { skipAuth: true, clientAction: "OAUTH_GOOGLE" }),

    loginWithTelegram: (loginData) => 
        api.post("/auth/telegram", loginData, { skipAuth: true, clientAction: "OAUTH_TELEGRAM" }),

    linkGoogle: (idToken) => api.post("/auth/link/google", { idToken }, { clientAction: "LINK_GOOGLE" }),
    linkTelegram: (loginData) => api.post("/auth/link/telegram", loginData, { clientAction: "LINK_TELEGRAM" }),

    logout: (options) =>
        api.post("/auth/logout", undefined, { clientAction: "LOGOUT", ...options }),

    me: (options) =>
        api.get("/auth/me", { clientAction: "FETCH_ME", ...options }),

    changePassword: (currentPassword, newPassword) =>
        api.post("/auth/change-password", { currentPassword, newPassword }, { clientAction: "CHANGE_PASSWORD" }),

    forgotPassword: (email) =>
        api.post("/auth/forgot-password", { email }, { skipAuth: true, clientAction: "FORGOT_PASSWORD" }),

    resetPassword: (token, newPassword) =>
        api.post("/auth/reset-password", { token, newPassword }, { skipAuth: true, clientAction: "RESET_PASSWORD" }),
};

export default authService;
