import { api } from "../../../shared/api/httpClient";

function unwrap(response) {
    return response?.data ?? response;
}

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

export const seatingApi = {
    summary: (invitationId) => api.get(`/v1/invitations/${invitationId}/seating/summary`).then(unwrap),
    plan: (invitationId) => api.get(`/v1/invitations/${invitationId}/seating`).then(unwrap),
    createTable: (invitationId, payload) => api.post(`/v1/invitations/${invitationId}/seating/tables`, payload).then(unwrap),
    updateTable: (invitationId, tableId, payload) => api.put(`/v1/invitations/${invitationId}/seating/tables/${tableId}`, payload).then(unwrap),
    deleteTable: (invitationId, tableId) => api.delete(`/v1/invitations/${invitationId}/seating/tables/${tableId}`).then(unwrap),
    assign: (invitationId, payload) => api.post(`/v1/invitations/${invitationId}/seating/assignments`, payload).then(unwrap),
    unassign: (invitationId, assignmentId) => api.delete(`/v1/invitations/${invitationId}/seating/assignments/${assignmentId}`).then(unwrap),
    exportCsv: (invitationId) => downloadCsv(`/v1/invitations/${invitationId}/seating/export`, `seating-plan-${invitationId}.csv`),
};

export const seatingService = seatingApi;
export default seatingApi;
