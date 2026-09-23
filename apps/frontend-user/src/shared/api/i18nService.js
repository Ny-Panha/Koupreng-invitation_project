import { api } from "./httpClient";

function unwrap(response) {
  return response?.data ?? response;
}

export const i18nService = {
  messages: (namespace, lang) =>
    api.get("/v1/i18n/messages", {
      params: { namespace, lang },
      skipAuth: true,
    }).then(unwrap),
};

export default i18nService;