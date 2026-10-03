import { api } from "@/shared/api/httpClient";
import { templateCatalogService } from "./templateCatalogApi";

function unwrap(response) {
    return response?.data ?? response;
}

export const templateService = {
    listPublic: (options) => templateCatalogService.list(options),
    getPublic: (templateId) => api.get(`/v1/templates/${encodeURIComponent(templateId)}`, { skipAuth: true }).then(unwrap),
    getPublicBySlug: (slug) => api.get(`/v1/templates/slug/${encodeURIComponent(slug)}`, { skipAuth: true }).then(unwrap),
};

export default templateService;
