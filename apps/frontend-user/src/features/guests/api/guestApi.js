import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";
import { downloadCsv } from "@/shared/api/downloadCsv";

export const guestService = {
  page: (id, params) => api.get(`/v1/invitations/${id}/guests/page`, { params }).then(unwrap),
  overview: id => api.get(`/v1/invitations/${id}/guests/overview`).then(unwrap),
  exportSelection: async (id, guestIds) => {
    const blob = await api.post(`/v1/invitations/${id}/guests/export-selection`, { guestIds }, { responseType: 'blob' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    try { link.href = url; link.download = `selected-guests-${id}.csv`; document.body.appendChild(link); link.click(); }
    finally { link.remove(); URL.revokeObjectURL(url); }
  },
  checkInRoster: (id, params = {}) => api.get(`/v1/invitations/${id}/check-in/roster`, { params }).then(unwrap),
  inspectImport: (invitationId, file) => {
    const form = new FormData(); form.append('file', file);
    return api.post(`/v1/invitations/${invitationId}/guests/import-batch/inspect`, form).then(unwrap);
  },
  previewBatch: (invitationId, payload) => api.post(`/v1/invitations/${invitationId}/guests/import-batch/preview`, payload).then(unwrap),
  commitBatch: (invitationId, payload) => api.post(`/v1/invitations/${invitationId}/guests/import-batch`, payload).then(unwrap),
  grouped: (invitationId) => api.get(`/v1/invitations/${invitationId}/guests/grouped`).then(unwrap),
  sendList: (invitationId) => api.get(`/v1/invitations/${invitationId}/guests/send-list`).then(unwrap),
  exportCsv: (invitationId) => downloadCsv(`/v1/invitations/${invitationId}/guests/export`, `guests-${invitationId}.csv`),
  previewFile: (invitationId, file) => {
    const form = new FormData(); form.append("file", file);
    return api.post(`/v1/invitations/${invitationId}/guests/import-file/preview`, form).then(unwrap);
  },
  importFile: (invitationId, file) => {
    const form = new FormData(); form.append("file", file);
    return api.post(`/v1/invitations/${invitationId}/guests/import-file`, form).then(unwrap);
  },
  listByInvitation: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve([]);
    }
    return api.get(`/v1/invitations/${invitationId}/guests`).then(unwrap);
  },
  getByInvitation: (invitationId, guestId) =>
    api.get(`/v1/invitations/${invitationId}/guests/${guestId}`).then(unwrap),
  create: (invitationId, guest) =>
    api.post(`/v1/invitations/${invitationId}/guests`, guest).then(unwrap),
  createForInvitation: (invitationId, guest) =>
    api.post(`/v1/invitations/${invitationId}/guests`, guest).then(unwrap),
  updateForInvitation: (invitationId, guestId, guest) =>
    api.put(`/v1/invitations/${invitationId}/guests/${guestId}`, guest).then(unwrap),
  removeFromInvitation: (invitationId, guestId) =>
    api.delete(`/v1/invitations/${invitationId}/guests/${guestId}`).then(unwrap),
  searchByInvitation: (invitationId, keyword) =>
    api.get(`/v1/invitations/${invitationId}/guests/search?keyword=${encodeURIComponent(keyword || "")}`).then(unwrap),
  importForInvitation: (invitationId, guests) =>
    api.post(`/v1/invitations/${invitationId}/guests/import`, { guests }).then(unwrap),
  checkInSummary: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve(null);
    }
    return api.get(`/v1/invitations/${invitationId}/check-in/summary`).then(unwrap);
  },
  checkInList: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve([]);
    }
    return api.get(`/v1/invitations/${invitationId}/check-in/list`).then(unwrap);
  },
  scanCheckIn: (invitationId, token, note) =>
    api.post(`/v1/invitations/${invitationId}/check-in/scan`, { token, note }).then(unwrap),
  manualCheckIn: (invitationId, guestId, note) =>
    api.post(`/v1/invitations/${invitationId}/guests/${guestId}/check-in`, { note }).then(unwrap),
  undoCheckIn: (invitationId, guestId) =>
    api.delete(`/v1/invitations/${invitationId}/guests/${guestId}/check-in`).then(unwrap),
};

export default guestService;
