import { api } from "../../shared/api";

function unwrap(response) {
  return response?.data ?? response;
}

export const dashboardService = {
  summary: () => api.get("/v1/admin/dashboard/summary").then(unwrap),
  analyticsOverview: () => api.get("/v1/admin/analytics/overview").then(unwrap),
  analyticsRevenue: () => api.get("/v1/admin/analytics/revenue").then(unwrap),
  analyticsTemplates: () => api.get("/v1/admin/analytics/templates").then(unwrap),
  analyticsDelivery: () => api.get("/v1/admin/analytics/delivery").then(unwrap),
  analyticsRsvp: () => api.get("/v1/admin/analytics/rsvp").then(unwrap),
  analyticsCheckIn: () => api.get("/v1/admin/analytics/check-in").then(unwrap),
  systemHealth: () => api.get("/v1/admin/system-health").then(unwrap),
  alerts: () => api.get("/v1/admin/alerts").then(unwrap),
  recentAuditLogs: () => api.get("/v1/admin/audit-logs/recent").then(unwrap),
};

export default dashboardService;
