import { api } from "./httpClient";

function getLang() {
    try {
        const v = localStorage.getItem("koupreng.lang") || localStorage.getItem("koupreng.locale");
        return v === "en" ? "en" : "km";
    } catch {
        return "km";
    }
}

function unwrap(response) {
    return response?.data ?? response;
}

export const i18nService = {
    messages: (namespace, lang) => {
        const targetLang = lang || getLang();
        return api.get(`/v1/i18n/messages?namespace=${encodeURIComponent(namespace)}&lang=${encodeURIComponent(targetLang)}`, { skipAuth: true }).then(unwrap);
    },
};

export default i18nService;
