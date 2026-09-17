import { api } from "../../../shared/api/httpClient";

function unwrap(response) {
  return response?.data ?? response;
}

export const paymentsApi = {
  createPaymentOrder: (payload) => api.post("/v1/template-payments/orders", payload).then(unwrap),
  createStaticPaymentOrder: (payload) =>
    api.post("/v1/template-payments/static/create", payload).then(unwrap),
  getOrderStatus: (orderCode) =>
    api.get(`/v1/template-payments/${encodeURIComponent(orderCode)}`).then(unwrap),
  getTemplateOrder: (orderCode) =>
    api.get(`/v1/template-payments/${encodeURIComponent(orderCode)}`).then(unwrap),
  paidTemplates: () => api.get("/v1/me/templates/paid").then(unwrap),
  templateAccess: (templateId) =>
    api.get(`/v1/me/templates/${encodeURIComponent(templateId)}/access`).then(unwrap),
  listMyOrders: () => api.get("/v1/template-payments/mine").then(unwrap),
  claimPayment: (orderCode, payload = {}) =>
    api.post(`/v1/template-payments/${encodeURIComponent(orderCode)}/claim`, payload).then(unwrap),
  confirmInternalOrder: (payload) =>
    api.post("/v1/internal/template-payments/confirm", payload).then(unwrap),
  paymentHistory: () => api.get("/v1/me/payments").then(unwrap),
  payment: (orderCode) =>
    api.get(`/v1/me/payments/${encodeURIComponent(orderCode)}`).then(unwrap),
  paymentReceipt: (orderCode) =>
    api.get(`/v1/me/payments/${encodeURIComponent(orderCode)}/receipt`).then(unwrap),
};

export const paymentService = paymentsApi;
export default paymentsApi;
