import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";

async function downloadCsv(path, filename) {
  const blob = await api.get(path, { responseType: "blob" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const reportsApi = {
  dashboardSummary: () => api.get("/v1/dashboard/summary").then(unwrap),
  invitationDashboard: (invitationId) => api.get(`/v1/invitations/${invitationId}/dashboard`).then(unwrap),
  /** GET /v1/invitations/:id/reports?type=...&from=...&to=... */
  getReport: (invitationId, params = {}) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve(null);
    }
    if (params.from || params.to) return Promise.reject(new Error("Date filtering is unavailable for this server report."));
    const kind = params.type === "RSVP" ? "rsvp" : "guests";
    const endpoint = `/v1/invitations/${invitationId}/reports/${kind}`;
    return api.get(endpoint).then(unwrap);
  },

  /** Export report data as CSV file */
  exportCsv: (invitationId, reportType = "GUEST") => {
    const filename = `report-${reportType.toLowerCase()}-${invitationId}.csv`;
    const kind = reportType === "RSVP" ? "rsvp" : "guests";
    return downloadCsv(`/v1/invitations/${invitationId}/reports/${kind}/export`, filename);
  },
};

export default reportsApi;
