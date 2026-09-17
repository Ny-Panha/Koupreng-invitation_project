import { api } from "../../shared/api/httpClient";

function unwrap(response) {
    return response?.data ?? response;
}

export const subscriptionService = {
    packages: () => api.get("/v1/packages").then(unwrap),
    current: () => api.get("/v1/me/subscriptions/current").then(unwrap),
    history: () => api.get("/v1/me/subscriptions").then(unwrap),
    purchase: (packageId, payerName, payerAccountLast3) => api.post(
        "/v1/me/subscriptions/purchase",
        { packageId, payerName, payerAccountLast3 },
    ).then(unwrap),
    order: (orderCode) => api.get(`/v1/me/subscriptions/orders/${encodeURIComponent(orderCode)}`).then(unwrap),
};

export default subscriptionService;
