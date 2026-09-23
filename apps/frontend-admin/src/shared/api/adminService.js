import { api } from "./adminHttpClient";

function unwrap(response) {
  return response?.data ?? response;
}

export const adminService = {
  users: () => api.get("/v1/admin/users").then(unwrap),
  createUser: (payload) => api.post("/v1/admin/users", payload).then(unwrap),
  user: (userId) => api.get(`/v1/admin/users/${userId}`).then(unwrap),
  userInvitations: (userId) => api.get(`/v1/admin/users/${userId}/invitations`).then(unwrap),
  activateUser: (userId) => api.patch(`/v1/admin/users/${userId}/activate`, {}).then(unwrap),
  deactivateUser: (userId) => api.patch(`/v1/admin/users/${userId}/deactivate`, {}).then(unwrap),
  updateUserRole: (userId, role) => api.patch(`/v1/admin/users/${userId}/role`, { role }).then(unwrap),

  templates: () => api.get("/v1/admin/templates").then(unwrap),
  template: (templateId) => api.get(`/v1/admin/templates/${templateId}`).then(unwrap),
  createTemplate: (payload) => api.post("/v1/admin/templates", payload).then(unwrap),
  updateTemplate: (templateId, payload) => api.put(`/v1/admin/templates/${templateId}`, payload).then(unwrap),
  activateTemplate: (templateId) => api.patch(`/v1/admin/templates/${templateId}/activate`, {}).then(unwrap),
  deactivateTemplate: (templateId) => api.patch(`/v1/admin/templates/${templateId}/deactivate`, {}).then(unwrap),
  updateTemplatePremium: (templateId, premium) =>
    api.patch(`/v1/admin/templates/${templateId}/premium`, { premium }).then(unwrap),
  deleteTemplate: (templateId) => api.delete(`/v1/admin/templates/${templateId}`).then(unwrap),

  invitations: () => api.get("/v1/admin/invitations").then(unwrap),
  invitation: (invitationId) => api.get(`/v1/admin/invitations/${invitationId}`).then(unwrap),
  moderateInvitation: (invitationId, payload) =>
    api.patch(`/v1/admin/invitations/${invitationId}/moderate`, payload).then(unwrap),
  activateInvitation: (invitationId) => api.patch(`/v1/admin/invitations/${invitationId}/activate`, {}).then(unwrap),
  deactivateInvitation: (invitationId) => api.patch(`/v1/admin/invitations/${invitationId}/deactivate`, {}).then(unwrap),

  report: (name) => api.get(`/v1/admin/reports/${name}`).then(unwrap),
  systemLogs: () => api.get("/v1/admin/system-logs").then(unwrap),

  payments: () => api.get("/v1/admin/payments").then(unwrap),
  payment: (orderCode) => api.get(`/v1/admin/payments/${encodeURIComponent(orderCode)}`).then(unwrap),
  confirmPayment: (payload) => {
    const code = payload?.orderCode;
    if (code) {
      return api
        .post(`/v1/admin/payments/${encodeURIComponent(code)}/confirm`, payload)
        .catch(() => api.post("/v1/admin/payments/confirm", payload))
        .then(unwrap);
    }
    return api.post("/v1/admin/payments/confirm", payload).then(unwrap);
  },

  packages: () => api.get("/v1/admin/packages").then(unwrap),
  createPackage: (payload) => api.post("/v1/admin/packages", payload).then(unwrap),
  updatePackage: (packageId, payload) => api.put(`/v1/admin/packages/${packageId}`, payload).then(unwrap),
  activatePackage: (packageId) => api.patch(`/v1/admin/packages/${packageId}/activate`, {}).then(unwrap),
  deactivatePackage: (packageId) => api.patch(`/v1/admin/packages/${packageId}/deactivate`, {}).then(unwrap),

  notifications: (params) => api.get("/v1/admin/notifications", { params }).then(unwrap),
  createNotification: (payload) => api.post("/v1/admin/notifications", payload).then(unwrap),
  updateNotificationStatus: (notificationId, payload) =>
    api.patch(`/v1/admin/notifications/${notificationId}/status`, payload).then(unwrap),
};

export const adminManagementService = adminService;
export default adminService;
