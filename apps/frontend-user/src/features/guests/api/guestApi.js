import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";

export const guestService = {
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
};

export default guestService;
